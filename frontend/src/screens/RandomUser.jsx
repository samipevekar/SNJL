// screens/RandomUserScreen.js
import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchRandomUsers } from "../store/slices/RandomDataSlice";
import Icon from "react-native-vector-icons/MaterialIcons"; // For icons
import Header from "../components/Header"; // Adjust the import path to your Header component
import { theme } from "../theme/themes";

const { width } = Dimensions.get("window"); // Get screen width for responsiveness

const RandomUserScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.mode);
  const { users, loading, error } = useSelector((state) => state.randomUsers);

  useEffect(() => {
    dispatch(fetchRandomUsers());
  }, [dispatch]);

  // Format follower count (e.g., 32400 -> "32.4K")
  const formatFollowers = (followers) => {
    if (!followers) return "0";
    if (followers >= 1000) {
      return `${(followers / 1000).toFixed(1)}K`;
    }
    return `${followers}`;
  };

  // Format profile view count (e.g., 21000 -> "21K")
  const formatProfileViewCount = (count) => {
    if (!count) return "0";
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return `${count}`;
  };

  const renderUserItem = ({ item }) => {
    // Check if profileImage is valid and starts with https
    const hasValidProfileImage =
      item?.profileImage && item?.profileImage.startsWith("https");

    return (
      <View style={[styles.userCard ,{backgroundColor: theme === 'light' ? '#FFFFFF' : '#000000'},{borderBottomColor: theme === 'light' ? '#000000' : '#FFFFFF',}]}>
        <View style={[styles.userInfo]}>
          <View style={[styles.profileDetails]}>
            <View style={{ marginLeft: 10 }}>
              <View style={styles.profileBorder}>
                {hasValidProfileImage ? (
                  <Image
                    source={{ uri: item?.profileImage || "" }}
                    style={styles.profileImage}
                  />
                ) : (
                  <Icon
                    name="account-circle"
                    size={55} // Reduced size to fit within border
                    color={theme === 'light' ? '#000000' : '#FFFFFF' }
                    style={styles.avatarIcon}
                  />
                )}
              </View>
            </View>

            <View style={{ paddingTop: 5 }}>
              <View style={{ flex:1,flexDirection:"row" ,alignItems:"center"}}>
              <Text style={[styles.name, { color: theme === 'light' ? '#000000' : '#FFFFFF' }]}>{item.name || "Unknown User"}</Text>
              <View style={{width:8 ,height:8, borderRadius:4, backgroundColor:"#34A853", marginLeft:5}}></View>
              
              <View
                style={[
                  styles.viewCountContainer,
                  { marginLeft: 10,  },
                ]}
              >
                
                <Text style={[styles.viewCount,{ color: theme === 'light' ? '#000000' : '#FFFFFF' }]}>
                  {formatProfileViewCount(item?.profileViewCount?.length>0 ? item?.profileViewCount : 8)}
                </Text>
                <Icon
                  name="visibility"
                  size={width * 0.038}
                  color={theme === 'light' ? '#000000' : '#FFFFFF' }
                  style={styles.viewIcon}
                />
              </View>
              
              </View>

              <View style={styles.roleContainer}>
                <Icon
                  name="engineering" // Icon for role (you can replace with a more suitable icon)
                  size={width * 0.04}
                  
                  style={[styles.roleIcon,{ color: theme === 'light' ? '#000000' : '#FFFFFF' }]}
                />
                <Text style={[styles.role,{ color: theme === 'light' ? '#000000' : '#FFFFFF' }]}>{item.role || "Unknown Role"}</Text>
              </View>
              <View style={styles.textContainer}>
                {item.mutualFriendCount > 0 ? (
                  <View style={styles.followedByContainer}>
                    <Icon
                      name="group"
                      size={width * 0.035}
                     color={theme === 'light' ? '#000000' : '#FFFFFF' }
                      style={[styles.followedByIcon,{ color: theme === 'light' ? '#000000' : '#FFFFFF' }]}
                    />
                    <Text style={[styles.followedBy,{ color: theme === 'light' ? '#000000' : '#FFFFFF' }]}>
                      Followed by... ({item.mutualFriendCount} mutual friends)
                    </Text>
                  </View>
                ) : (
                  <View style={styles.followedByContainer}>
                    <Icon
                      name="group"
                      size={width * 0.035}
                      color={theme? '#000000' : '#FFFFFF' }
                      style={styles.followedByIcon}
                    />
                    <Text style={[styles.followedBy,{ color: theme === 'light' ? '#000000' : '#FFFFFF' }]}>No friends</Text>
                  </View>
                )}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.followButton}>
                  <Text style={styles.followButtonText}>Follow</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.viewProfileButton}
                  onPress={() =>
                    navigation.navigate("ViewProfile", { user: item })
                  }
                >
                  <Text style={styles.viewProfileButtonText}>
                    View Full Profile
                  </Text>
                </TouchableOpacity>
              </View>
              
            </View>
            <View>
              
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  if (error) {
    return <Text style={styles.errorText}>Error: {error}</Text>;
  }

  return (
    <View style={[styles.container, ]}>
      <Header />
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#f5f5f5",
  },
  list: {
    // paddingHorizontal: width * 0.03, // Responsive padding
    // paddingVertical: width * 0.02,
  },
  userCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: width * 0.04, // Responsive padding
    paddingHorizontal: width * 0.03,
    borderBottomWidth: 1,
    
    // backgroundColor: "#fff",
    // marginBottom: width * 0.01,
  },
  userInfo: {
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
  },
  profileDetails: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  profileBorder: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 5,
    borderColor: "#34A853", // Green border
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", // Ensures the image/icon stays within the border
  },
  profileImage: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
  },
  avatarIcon: {
    width: 55,
    height: 55,
    borderRadius: 22.5, // Half of the reduced size
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: width * 0.04, // Responsive font size
    fontWeight: "bold",
    color: "#00FF00", // Green as in the image
    marginBottom: width * 0.01,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: width * 0.01,
  },
  roleIcon: {
    marginRight: width * 0.01,
  },
  role: {
    fontSize: width * 0.035,
    color: "#00FF00", // Green as in the image
  },
  followedByContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: width * 0.01,
  },
  followedByIcon: {
    marginRight: width * 0.01,
  },
  followedBy: {
    fontSize: width * 0.03,
    color: "#666",
  },
  viewCountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewIcon: {
    marginLeft: width * 0.01,
  },
  viewCount: {
    fontSize: width * 0.03,
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  followButton: {
    backgroundColor: "#FFFFFF", // White background
    borderWidth: 1,
    borderColor: "#34A853", // Green border
    paddingVertical: width * 0.015, // Responsive padding
    paddingHorizontal: width * 0.04,
    borderRadius: 5,
    marginRight: width * 0.02,
  },
  followButtonText: {
    color: "#34A853", // Green text
    fontWeight: "bold",
    fontSize: width * 0.035,
  },
  viewProfileButton: {
     // Blue button
 backgroundColor: "#FFFFFF", // White background
    borderWidth: 1,
    borderColor: "#34A853", // Green border
    paddingVertical: width * 0.015, // Responsive padding
    paddingHorizontal: width * 0.04,
    borderRadius: 5,
    marginRight: width * 0.02,
  },
  viewProfileButtonText: {
    color: "#34A853", // Green text
    fontWeight: "bold",
    fontSize: width * 0.035,
  },
  loadingText: {
    textAlign: "center",
    marginTop: width * 0.05,
    fontSize: width * 0.04,
    color: "#666",
  },
  errorText: {
    textAlign: "center",
    marginTop: width * 0.05,
    fontSize: width * 0.04,
    color: "red",
  },
});

export default RandomUserScreen;