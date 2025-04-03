import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Button } from "react-native";
import { getToken, removeToken } from "../storage/AuthStorage";
import { useNavigation } from "@react-navigation/native";
import { getUserData } from "../storage/userData";
import Footer from "../components/Footer";
import Header from "../components/Header";

// import image1 from '../../images/image1.png';
// import image2 from '../../images/image2.png';
// import image3 from '../../images/image3.png';
// import image4 from '../../images/image4.png';
// import image5 from '../../images/image5.png';
// import image6 from '../../images/image6.png';
// import image7 from '../../images/image7.jpg';
// import image8 from '../../images/image8.jpg';



const { width } = Dimensions.get('window');
const scale = width / 375;

const Home = () => {
  const theme = useSelector((state) => state.theme.mode);
  const navigation = useNavigation();

  const handleLogout = async () => {
    await removeToken();
    navigation.replace("UserRegister");
  };

  // Sample posts data
  const posts = [
    {
      id: '1',
      type: 'post',
      username: 'Saksham Jaiswal',
      handle: '@sakshamjaiswal',
      time: '1hr',
      content: 'searching for full stack developer ',
      image: null,
      likes: 15,
      comments: 15,
      shares: 5,
    },
    {
      id: '2',
      type: 'post',
      username: 'Aarav Sharma',
      handle: '@aaravsharma',
      time: '2hr',
      content: 'searching for Mern stack developer ',
      image: null,
      likes: 20,
      comments: 10,
      shares: 3,
    },
    {
      id: '3',
      type: 'post',
      username: 'Priya Singh',
      handle: '@priyasingh',
      time: '3hr',
      content: 'Loving this new book I started reading ',
      image: null,
      likes: 12,
      comments: 8,
      shares: 2,
    },
    {
      id: '4',
      type: 'post',
      username: 'Rohan Gupta',
      handle: '@rohangupta',
      time: '4hr',
      content: 'Exploring the city with friends! ',
      image: null,
      likes: 25,
      comments: 18,
      shares: 7,
    },
    {
      id: '5',
      type: 'post',
      username: 'Neha Patel',
      handle: '@nehapatel',
      time: '5hr',
      content: 'Baking some delicious cookies today ',
      image: null,
      likes: 30,
      comments: 22,
      shares: 10,
    },
    {
      id: '6',
      type: 'post',
      username: 'Vikram Malhotra',
      handle: '@vikrammalhotra',
      time: '6hr',
      content: 'Evening stroll in the park r',
      image: null,
      likes: 18,
      comments: 14,
      shares: 4,
    },
    {
      id: '7',
      type: 'post',
      username: 'Ananya Reddy',
      handle: '@ananyareddy',
      time: '7hr',
      content: 'searching for ui uX developer e',
      image: null,
      likes: 22,
      comments: 16,
      shares: 6,
    },
    {
      id: '8',
      type: 'post',
      username: 'Karan Mehta',
      handle: '@karanmehta',
      time: '8hr',
      content: 'Morning coffee vibes',
      image: null,
      likes: 28,
      comments: 20,
      shares: 8,
    },
    {
      id: '9',
      type: 'post',
      username: 'Shalini Kapoor',
      handle: '@shalinikapoor',
      time: '9hr',
      content: 'Watching the sunset with a good playlist ',
      image: null,
      likes: 35,
      comments: 25,
      shares: 12,
    },
    {
      id: '10',
      type: 'post',
      username: 'Arjun Desai',
      handle: '@arjundesai',
      time: '10hr',
      content: 'Hiking in the mountains today! ',
      image: null,
      likes: 40,
      comments: 30,
      shares: 15,
    },
  ];

  // Sample recommended friends data
  const recommendedFriends = [
    {
      id: 'friend1',
      name: 'Fast Forward',
      mutualFriends: 1,
      image: 'https://example.com/fastforward.jpg',
    },
    {
      id: 'friend2',
      name: 'Monika',
      mutualFriends: 1,
      image: 'https://example.com/monika.jpg',
    },
    {
      id: 'friend3',
      name: 'Amit Kumar',
      mutualFriends: 2,
      image: 'https://example.com/amitkumar.jpg',
    },
    {
      id: 'friend4',
      name: 'Sneha Sharma',
      mutualFriends: 3,
      image: 'https://example.com/snehasharma.jpg',
    },
    {
      id: 'friend5',
      name: 'Rahul Verma',
      mutualFriends: 0,
      image: 'https://example.com/rahulverma.jpg',
    },
    {
      id: 'friend6',
      name: 'Pooja Singh',
      mutualFriends: 1,
      image: 'https://example.com/poojasingh.jpg',
    },
  ];

  // Combine posts and friend recommendation into a single feed
  const feedData = [...posts];
  // Insert friend recommendation after the 3rd post (index 3)
  feedData.splice(3, 0, { id: 'friend-recommendation', type: 'recommendation' });

  // Render each post item
  const renderPostItem = ({ item }) => (
   

    <View
      style={[
        styles.postContainer,
        { backgroundColor: theme === 'light' ? '#fff' : '#333' },
      ]}
    >
    
      {/* User Info */}
      
      <View style={styles.userInfo}>
        <View style={styles.profilePic} />
        <View style={styles.userDetails}>
          <Text
            style={[
              styles.username,
              { color: theme === 'light' ? '#000' : '#fff' },
            ]}
          >
            {item.username}
          </Text>
          <Text
            style={[
              styles.handle,
              { color: theme === 'light' ? '#666' : '#bbb' },
            ]}
          >
            {item.handle} • {item.time}
          </Text>
        </View>
        <TouchableOpacity style={styles.followButton}>
          <Text style={styles.followButtonText}>FOLLOW</Text>
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <Text
        style={[
          styles.postContent,
          { color: theme === 'light' ? '#000' : '#fff' },
        ]}
      >
        {item.content}
      </Text>
      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      {/* Interaction Buttons */}
      <View style={styles.interactionBar}>
        <TouchableOpacity style={styles.interactionButton}>
          <Icon
            name="favorite-border"
            size={20 * scale}
            color={theme === 'light' ? '#000' : '#fff'}
          />
          <Text
            style={[
              styles.interactionText,
              { color: theme === 'light' ? '#000' : '#fff' },
            ]}
          >
            {item.likes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.interactionButton}>
          <Icon
            name="chat-bubble-outline"
            size={20 * scale}
            color={theme === 'light' ? '#000' : '#fff'}
          />
          <Text
            style={[
              styles.interactionText,
              { color: theme === 'light' ? '#000' : '#fff' },
            ]}
          >
            {item.comments}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.interactionButton}>
          <Icon
            name="share"
            size={20 * scale}
            color={theme === 'light' ? '#000' : '#fff'}
          />
          <Text
            style={[
              styles.interactionText,
              { color: theme === 'light' ? '#000' : '#fff' },
            ]}
          >
            {item.shares}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render each friend recommendation item
  const renderFriendItem = ({ item }) => (
    <View
      style={[
        styles.friendCard,
        { backgroundColor: theme === 'light' ? '#fff' : '#444' },
      ]}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.friendProfilePic}
        resizeMode="cover"
      />
      <Text
        style={[
          styles.friendName,
          { color: theme === 'light' ? '#000' : '#fff' },
        ]}
      >
        {item.name}
      </Text>
      <Text
        style={[
          styles.mutualFriends,
          { color: theme === 'light' ? '#666' : '#bbb' },
        ]}
      >
        {item.mutualFriends} mutual friend{item.mutualFriends !== 1 ? 's' : ''}
      </Text>
      <TouchableOpacity style={styles.addFriendButton}>
        <Text style={styles.addFriendButtonText}>Follow</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.removeButton}>
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  // Render each item in the feed (post or friend recommendation)
  const renderItem = ({ item }) => {
    if (item.type === 'recommendation') {
      return (
        <View style={styles.friendRecommendationContainer}>
          <View style={styles.friendRecommendationHeader}>
            <Text
              style={[
                styles.friendRecommendationTitle,
                { color: theme === 'light' ? '#000' : '#fff' },
              ]}
            >
              Recommendations
            </Text>
            {/* <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity> */}
          </View>
          <FlatList
            data={recommendedFriends}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.friendList}
          />
        </View>
      );
    }
    return renderPostItem({ item });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme === 'light' ? '#fff' : '#000' },
      ]}
    >
      <Header></Header>
      <FlatList
        data={feedData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
      <Footer style={{ position: "absolute", bottom: 0 }} />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  // Friend Recommendation Styles
  friendRecommendationContainer: {
    paddingVertical: 8 * scale,
    paddingHorizontal: 16 * scale,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  friendRecommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8 * scale,
  },
  friendRecommendationTitle: {
    fontSize: 14 * scale,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 12 * scale,
    color: '#1DA1F2',
  },
  friendList: {
    flexGrow: 0,
  },
  friendCard: {
    width: 100 * scale, // Reduced width
    padding: 8 * scale, // Reduced padding
    borderRadius: 8 * scale, // Slightly smaller border radius
    marginRight: 8 * scale, // Reduced margin
    alignItems: 'center',
    elevation: 1, // Reduced elevation for a subtler shadow
  },
  friendProfilePic: {
    width: 50 * scale, // Reduced size
    height: 50 * scale, // Reduced size
    borderRadius: 8 * scale, // Slightly smaller border radius
    marginBottom: 4 * scale, // Reduced margin
  },
  friendName: {
    fontSize: 12 * scale, // Reduced font size
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mutualFriends: {
    fontSize: 10 * scale, // Reduced font size
    textAlign: 'center',
    marginBottom: 4 * scale, // Reduced margin
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34A853',
    paddingVertical: 4 * scale, // Reduced padding
    paddingHorizontal: 8 * scale, // Reduced padding
    borderRadius: 4 * scale, // Slightly smaller border radius
    marginBottom: 4 * scale, // Reduced margin
  },
  addFriendButtonText: {
    color: '#fff',
    fontSize: 10 * scale, // Reduced font size
    fontWeight: 'bold',
    marginLeft: 4 * scale, // Reduced margin
  },
  removeButton: {
    backgroundColor: '#ddd',
    paddingVertical: 4 * scale, // Reduced padding
    paddingHorizontal: 8 * scale, // Reduced padding
    borderRadius: 4 * scale, // Slightly smaller border radius
  },
  removeButtonText: {
    color: '#000',
    fontSize: 10 * scale, // Reduced font size
    fontWeight: 'bold',
  },
  // Post Styles
  postContainer: {
    padding: 16 * scale,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10 * scale,
  },
  profilePic: {
    width: 40 * scale,
    height: 40 * scale,
    borderRadius: 20 * scale,
    backgroundColor: '#ccc',
  },
  userDetails: {
    flex: 1,
    marginLeft: 10 * scale,
  },
  username: {
    fontSize: 16 * scale,
    fontWeight: 'bold',
  },
  handle: {
    fontSize: 14 * scale,
  },
  followButton: {
    paddingVertical: 5 * scale,
    paddingHorizontal: 10 * scale,
    backgroundColor: '#34A853',
    borderRadius: 5 * scale,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 12 * scale,
    fontWeight: 'bold',
  },
  postContent: {
    fontSize: 14 * scale,
    marginBottom: 10 * scale,
  },
  postImage: {
    width: '100%',
    height: 200 * scale,
    borderRadius: 10 * scale,
    marginBottom: 10 * scale,
  },
  interactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactionText: {
    marginLeft: 5 * scale,
    fontSize: 14 * scale,
  },
});

export default Home;