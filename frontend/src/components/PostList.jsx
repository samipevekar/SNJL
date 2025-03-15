import React, { useState, useCallback, useEffect } from "react";
import {
  FlatList,
  Dimensions,
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import PostHeader from "./PostHeader"; // Assuming this is in the same directory
import { fetchSavedPosts, toggleLikePost, toggleSavePost } from "../store/slices/postSlice";

const { width } = Dimensions.get("window");
const scale = width / 375;

const formatCount = (count) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1).replace(".0", "")}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(".0", "")}K`;
  }
  return count.toString();
};

const PostList = ({ posts, theme, user }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const userId = user._id;
  const userModel = user.role;
  const savedPosts = useSelector((state) => state.posts.savedPosts);
  const [expandedPosts, setExpandedPosts] = useState({});

  

  
  const handleToggleLike = (postId, currentLikes, isLiked) => {
    console.log("currentLikes",currentLikes)
    console.log("istuehai",isLiked)
    if (!userId) {
      console.log("User not authenticated");
      return;
    }
    dispatch(
      toggleLikePost({
        postId,
        optimisticLikes: isLiked
          ? currentLikes.filter((id) => id.userId !== userId)
          : [...currentLikes, { userId, userModel: user.role || 'User', _id: null }],
      })
    );
  };


  const handleToggleSave = (postId) => {
    console.log("saveid",postId)
    if (!userId) {
      
      console.log("User not authenticated");
      return;
    }
    dispatch(toggleSavePost(postId));
  };
  const handleCommentPress = (postId) => {
    navigation.navigate("CommentScreen", { postId });
  };

  const toggleExpanded = useCallback((postId) => {
    setExpandedPosts((prev) => {
      const newExpanded = { ...prev };
      newExpanded[postId] = !newExpanded[postId];
      return newExpanded;
    });
  }, []);

  const renderPostItem = useCallback(
    ({ item }) => {
      const maxLength = 50;
      const isExpanded = !!expandedPosts[item._id];
      const likesArray = Array.isArray(item.likes) ? item.likes : [];
      console.log("likesArrayhhh",likesArray)
      const isLiked = likesArray.some(like => like.userId === userId);
      const likesCount = likesArray.length || 0;
      const formattedLikesCount = formatCount(likesCount);
      const commentsArray = Array.isArray(item.comments) ? item.comments : [];
      const commentCount = commentsArray.length || 0;
      const formattedCommentCount = formatCount(commentCount);
      const isSaved = savedPosts.includes(item._id);
      const postImageUri =
        item.media &&
        item.media.length > 0 &&
        typeof item.media[0].url === "string" &&
        item.media[0].url.startsWith("http")
          ? item.media[0].url
          : null;

      return (
        <View style={[styles.postItem, { marginHorizontal: 16 * scale }]}>
          <PostHeader userData={user} theme={theme} posts={posts} />
          {item.caption && (
            <View
              style={[
                styles.postContentContainer,
                {
                  backgroundColor: theme === "light" ? "#e0e0e0" : "#2a2a2a",
                  borderRadius: 12 * scale,
                  padding: 12 * scale,
                  marginBottom: 12 * scale,
                  shadowColor: theme === "light" ? "#000" : "#333",
                  shadowOffset: { width: 0, height: 2 * scale },
                  shadowOpacity: 0.2,
                  shadowRadius: 4 * scale,
                  elevation: 3,
                },
              ]}
            >
              <Text
                style={{
                  color: theme === "light" ? "#000000" : "#FFFFFF",
                  fontSize: 12 * scale,
                  lineHeight: 15 * scale,
                }}
              >
                {isExpanded
                  ? item.caption
                  : item.caption.slice(0, maxLength) +
                    (item.caption.length > maxLength ? "..." : "")}
              </Text>
              {item.caption.length > maxLength && (
                <TouchableOpacity onPress={() => toggleExpanded(item._id)}>
                  <Text style={{ color: "#34A853", fontSize: 12 * scale, marginTop: 5 }}>
                    {isExpanded ? "Show Less" : "Show More"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {postImageUri && (
            <View style={styles.postImageContainer}>
              <Image
                source={{ uri: postImageUri }}
                style={[
                  styles.postImage,
                  {
                    width: "100%",
                    height: width * 0.6,
                    borderRadius: 12 * scale,
                    marginBottom: 12 * scale,
                  },
                ]}
                resizeMode="cover"
              />
            </View>
          )}
          <View style={styles.postActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleToggleLike(item._id, likesArray, isLiked)}
            >
              <Icon
                name={isLiked ? "favorite" : "favorite-border"}
                size={21 * scale}
                color={isLiked ? "#34A853" : theme === "light" ? "#34A853" : "#4CAF50"}
              />
              <Text style={[styles.actionText, { color: theme === "light" ? "#000000" : "#FFFFFF" }]}>
                {formattedLikesCount}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleCommentPress(item._id)}
            >
              <Icon
                name="chat-bubble-outline"
                size={21 * scale}
                color={theme === "light" ? "#34A853" : "#4CAF50"}
              />
              <Text style={[styles.actionText, { color: theme === "light" ? "#000000" : "#FFFFFF" }]}>
                {formattedCommentCount}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleToggleSave(item._id)}
            >
              <Icon
                name={isSaved ? "bookmark" : "bookmark-border"}
                size={21 * scale}
                color={theme === "light" ? "#34A853" : "#4CAF50"}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon
                name="share"
                size={21 * scale}
                color={theme === "light" ? "#34A853" : "#4CAF50"}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              width: "100%",
              height: 1,
              backgroundColor: theme === "light" ? "#000000" : "#FFFFFF",
              marginTop: 5,
            }}
          />
        </View>
      );
    },
    [theme, user, savedPosts, expandedPosts, toggleExpanded, userId]
  );

  // If no posts, render "No posts" message
  if (!posts || posts.length === 0) {
    return (
      <View style={styles.noPostsContainer}>
        <Icon
          name="photo-camera"
          size={60 * scale}
          color={theme === "light" ? "#000000" : "#FFFFFF"}
        />
        <Text
          style={[
            styles.noPostsText,
            { color: theme === "light" ? "#000000" : "#FFFFFF" },
          ]}
        >
          No posts
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={renderPostItem}
      keyExtractor={(item) => item._id.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingVertical: 16 * scale,
        backgroundColor: theme === "light" ? "#fff" : "#000",
      }}
      ListHeaderComponent={<View style={{ height: 16 * scale }} />}
      ListFooterComponent={<View style={{ height: 16 * scale }} />}
      initialNumToRender={5}
      maxToRenderPerBatch={10}
      windowSize={21}
      extraData={{ expandedPosts, savedPosts, userId }}
    />
  );
};

const styles = StyleSheet.create({
  postItem: {
    marginTop: 10 * scale,
    backgroundColor: "transparent",
  },
  postContentContainer: {
    width: "100%",
  },
  postImageContainer: {
    position: "relative",
  },
  postImage: {
    width: "100%",
    borderRadius: 12 * scale,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8 * scale,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8 * scale,
  },
  actionText: {
    fontSize: 15 * scale,
    marginLeft: 4 * scale,
  },
  noPostsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: width * 0.8, // Adjust height to fit nicely in the profile
    backgroundColor: "transparent",
  },
  noPostsText: {
    fontSize: 24 * scale,
    fontWeight: "600",
    marginTop: 10 * scale,
  },
});

export default PostList;