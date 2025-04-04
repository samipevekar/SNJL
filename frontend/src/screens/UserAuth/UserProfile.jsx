import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
  FlatList,
} from "react-native";

import { useDispatch, useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import Header from "../../components/Header";
import { theme } from "../../theme/themes";
import { SafeAreaView } from "react-native-safe-area-context";
import PostList from "../../components/PostList";
import ReviewItem from "../../components/ReviewItem";
import MockUserProfile from "../../components/MockUserProfile";
import { getUserData } from "../../storage/userData";
import { fetchSavedPosts, fetchUserPosts } from "../../store/slices/postSlice";
import PostReviewTab from "../../components/PostReviewTab";
import Footer from "../../components/Footer";

const { width, height } = Dimensions.get("window");

const scale = width / 375; // Base design width (iPhone 375)
const HEADER_HEIGHT = 50 * scale; // Estimated height of Header component; adjust based on actual height
const CONTENT_MARGIN = 16 * scale; // Consistent margin for responsiveness

export default function UserProfile({ navigation }) {
  const [searchVisible, setSearchVisible] = useState(false);
  const inputAnim = useRef(new Animated.Value(0)).current;


  const theme = useSelector((state) => state.theme.mode);
  const [activeTab, setActiveTab] = useState("posts");
  const [isSticky, setIsSticky] = useState(false);
  const scrollRef = useRef(null);
  const tabAnim = useRef(new Animated.Value(0)).current;
  const panAnim = useRef(new Animated.Value(0)).current;
  const contentHeight = 400 * scale; // Height of profile content (header, bio, details)
  const [userData ,setUserData] = useState({});
  console.log("userDtaa" ,userData)
 

  const dispatch = useDispatch()
  const post = useSelector((state) => state.posts);
  const postData  = post.posts 
  // console.log("post",postData)

  
const toggleSearch = () => {
    setSearchVisible(!searchVisible);
    Animated.timing(inputAnim, {
      toValue: searchVisible ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const avatarUri = typeof userData?.profileImage === "string" && userData?.profileImage.startsWith("http")
      ? userData.profileImage
      : null;


  const handleTabChange = (tab) => {
    Animated.timing(tabAnim, {
      toValue: tab === "posts" ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setActiveTab(tab));
  };

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setIsSticky(scrollY >= contentHeight);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Allow swipe if the direction matches the allowed transition
        if (activeTab === "posts" && gestureState.dx < 0) {
          // Allow left swipe to move to Reviews
          return (
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
            Math.abs(gestureState.dx) > 5
          );
        } else if (activeTab === "reviews" && gestureState.dx > 0) {
          // Allow right swipe to move to Posts
          return (
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) &&
            Math.abs(gestureState.dx) > 5
          );
        }
        // Prevent swipe in the opposite direction
        return false;
      },
      onPanResponderMove: (evt, gestureState) => {
        console.log("Gesture dx:", gestureState.dx);
        const newValue = gestureState.dx / width;
        const clampedValue = Math.max(-1, Math.min(1, newValue));
        panAnim.setValue(clampedValue);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const threshold = 0.3;
        if (activeTab === "posts" && gestureState.dx < -width * threshold) {
          // Slide from Posts to Reviews (left swipe)
          Animated.spring(tabAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }).start(() => setActiveTab("reviews"));
        } else if (
          activeTab === "reviews" &&
          gestureState.dx > width * threshold
        ) {
          // Slide from Reviews to Posts (right swipe)
          Animated.spring(tabAnim, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }).start(() => setActiveTab("posts"));
        } else {
          // Snap back to current tab if swipe is in wrong direction or below threshold
          Animated.spring(tabAnim, {
            toValue: activeTab === "posts" ? 0 : 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }
        panAnim.setValue(0);
      },
    })
  ).current;

  const tabBackgroundPosition = tabAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width / 2], // Move background from Posts to Reviews
  });

  const contentTranslateX = Animated.add(tabAnim, panAnim).interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width], // Slide Posts left, Reviews in from right
    extrapolate: "clamp",
  });


  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getUserData();
        setUserData(user);
        // console.log("usenvb",user)
        if (user?._id) {
          dispatch(fetchUserPosts(user._id));
        }
      } catch (err) {
        console.error("Error loading user data:", err);
      }
    };
    loadData();
  }, [dispatch]);


  useEffect(() => {
    dispatch(fetchSavedPosts());
  }, [dispatch]);
  return (


    <>
    <View
      style={[
        styles.outerContainer,
        { backgroundColor: theme === "light" ? "#fff" : "#000" },
      ]}
    >
     <Header searchVisible={searchVisible} inputAnim={inputAnim} toggleSearch={toggleSearch} />
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={[styles.contentContainer]}>
          <View style={[styles.profileHeader, ]}>
            <View style={[styles.profileImageContainer]}>
            {avatarUri? (
              <Image
                source={{uri:avatarUri}}
                style={styles.profileImage}
              />
             ):(
              <Image
                             source={require("../../../images/AvatarLight.png")}
                             style={styles.profileImage}
                           />
             )}
            </View>
            <View style={[styles.profileDetails]}>
              <View style={[styles.NameContainer]}>
                <SafeAreaView>
                  <Text
                    style={[
                      styles.name,
                      { color: theme === "light" ? "#000000" : "#FFFFFF" },
                    ]}
                  >
                    {userData?.name || "Provide Name"}
                  </Text>
                </SafeAreaView>
                <View style={[styles.usernameContainer]}>
                  <Text
                    style={[
                      styles.username,
                      { color: theme === "light" ? "#000000" : "#FFFFFF" },
                    ]}
                  >
                    @{userData?.username || "Provide Username"}
                  </Text>
                  <View style={styles.viewsContainer}>
                    <Text
                      style={[
                        styles.viewsText,
                        { color: theme === "light" ? "#000" : "#fff" },
                      ]}
                    >
                      {userData?.profileViews || 0}
                    </Text>
                    <Icon
                      name="visibility"
                      size={16 * scale}
                      color={theme === "light" ? "#000000" : "#FFFFFF"}
                    />
                  </View>
                </View>
              </View>
              <View style={[styles.statsContainer]}>
                <View style={[styles.statItem]}>
                  <Text
                    style={[
                      styles.statNumber,
                      { color: theme === "light" ? "#000000" : "#FFFFFF" },
                    ]}
                  >
                    {userData?.following || 0}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme === "light" ? "#000000" : "#FFFFFF" },
                    ]}
                  >
                    Following
                  </Text>
                </View>
                <View style={[styles.statItem, { marginLeft: 19 * scale }]}>
                  <Text
                    style={[
                      styles.statNumber,
                      { color: theme === "light" ? "#000000" : "#FFFFFF" },
                    ]}
                  >
                    {userData?.followers || 0}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme === "light" ? "#000000" : "#FFFFFF" },
                    ]}
                  >
                    Followers
                  </Text>
                </View>
              </View>
              <View style={[styles.editButtoncontainer]}>
                <TouchableOpacity
                  style={[
                    styles.editButton,
                    {
                      backgroundColor:
                        theme === "light" ? "#000000" : "#FFFFFF",
                    },
                  ]}
                  onPress={() => navigation.navigate("EditProfile")}
                >
                  <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={[styles.bioSection, ]}>
            <Text
              numberOfLines={3}
              ellipsizeMode="tail"
              style={[
                styles.bio,
                { color: theme === "light" ? "#000000" : "#FFFFFF" },
              ]}
            >
              {userData?.bio || "Enter your bio go to edit profile"}
            </Text>
          </View>

          <View style={[styles.detailsSection,]}>
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Icon
                  name="work"
                  size={20 * scale}
                  color={theme === "light" ? "#000000" : "#FFFFFF"}
                />
                <View style={styles.detailTextContainer}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: theme === "light" ? "#000000" : "#FFFFFF" },
                    ]}
                  >
                    Career
                  </Text>
                  
                </View>
              </View>
              <View style={styles.detailItem}>
                <Icon
                  name="location-on"
                  size={20 * scale}
                  color={theme === "light" ? "#000000" : "#FFFFFF"}
                />
                <View style={styles.detailTextContainer}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: theme === "light" ? "#000000" : "#FFFFFF" },
                    ]}
                  >
                    Location
                  </Text>
                  
                </View>
              </View>
              <View style={styles.detailItem}>
                <Icon
                  name="event"
                  size={20 * scale}
                  color={theme === "light" ? "#000000" : "#FFFFFF"}
                />
                <View style={styles.detailTextContainer}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: theme === "light" ? "#000000" : "#FFFFFF" },
                    ]}
                  >
                    Joined
                  </Text>
                  
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.viewMoreContainer}>
              <Text
                style={[
                  styles.viewMoreText,
                  { color: theme === "light" ? "#34A853" : "#4CAF50" },
                ]}
              >
                View more
              </Text>
            </TouchableOpacity>
          </View>
<View style={{width:"100%",height:1, backgroundColor: theme === "light" ? "#000000" : "#FFFFFF", marginTop:5}}></View>
          {/* Posts and Reviews Section */}
          <View
            style={[
              styles.tabsContainer,
              // isSticky && styles.stickyTabs,
              
            ]}
          >
            <View style={[styles.tabButtons ]}>
              <TouchableOpacity
                style={styles.tabButton}
                onPress={() => handleTabChange("posts")}
              >
                <Text
                  style={[
                    styles.tabText, styles.posts,{color: theme === "light" ? "#000000" : "#FFFFFF"},
                    
                  ]}
                >
                  Posts
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.tabButton}
                onPress={() => handleTabChange("reviews")}
              >
                <Text
                  style={[
                    styles.tabText, styles.reviews,{color: theme === "light" ? "#000000" : "#FFFFFF"},
                  
                  ]}
                >
                  Reviews
                </Text>
              </TouchableOpacity>
            </View>
            <Animated.View
              style={[
                styles.tabBackground,
                {
                  transform: [{ translateX: tabBackgroundPosition }],
                  backgroundColor: theme === "light" ? "#34A853" : "#4CAF50",
                },
              ]}
            />
          </View>
          <View style={{width:"100%",height:1, backgroundColor: theme === "light" ? "#000000" : "#FFFFFF", marginTop:10}}></View>

          {/* Sliding Content */}
          <View
            style={[styles.tabContentContainer,]}
            {...panResponder.panHandlers}
          >
            <Animated.View
              style={[
                styles.tabContentWrapper,
                { transform: [{ translateX: contentTranslateX }] },
              ]}
            >
              <View style={[styles.tabContent]}>
                {/* Posts */}
                <View style={[styles.postsContainer,]}>
                  <PostList posts={postData} theme={theme} user={userData} />
                </View>
              </View>

              <View style={[styles.tabContent]}>
                {/* Reviews */}
               
                {/* <ReviewItem review={reviews} theme={theme} userData={userData}/> */}
                <MockUserProfile/>
              </View>
            </Animated.View>
          </View>
        </View>
      </ScrollView>

      {/* Plus Button */}
      <TouchableOpacity
        style={[
          styles.plusButton,
          { backgroundColor: theme === "light" ? "#34A853" : "#4CAF50" },
        ]}
        onPress={() => navigation.navigate("NewPostScreen")}
      >
        <Icon name="add" size={30 * scale} color="#fff" />
      </TouchableOpacity>
      <Footer toggleSearch={toggleSearch} />
    </View>
    
</>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    width: "100%",
  },
  contentContainer: {
    width: "100%",
    // minHeight: height,
    // backgroundColor:"red"
  },
  profileHeader: {
    flexDirection: "row",
    width: "100%",
    height: height * 0.3,
  },
  profileImageContainer: {},
  profileImage: {
    width: 112 * scale,
    height: 112 * scale,
    borderRadius: 56 * scale,
    borderColor: "#34A853",
    borderWidth: 8 * scale,
    margin: 30 * scale,
    marginTop: 20 * scale,
    marginRight: 0,
  },
  profileDetails: {
    flex: 1,
    flexDirection: "column",
  },
  NameContainer: {},
  name: {
    fontSize: 20 * scale,
    marginTop: 40 * scale,
    marginLeft: 15 * scale,
    fontWeight: "500",
    marginRight: 20 * scale,
  },
  usernameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 15 * scale,
    marginRight: 20 * scale,
  },
  username: {
    fontSize: 14 * scale,
    marginRight: 10 * scale,
  },
  viewsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6 * scale,
  },
  viewsText: {
    fontSize: 14 * scale,
  },
  statsContainer: {
    // backgroundColor:"blue",
    flexDirection: "row",
    justifyContent: "space-between",
    // paddingHorizontal: 20 * scale,
    marginTop: 10 * scale,
    marginRight: 20 * scale,
    marginLeft: 15 * scale,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statNumber: {
    fontSize: 10 * scale,
    fontWeight: "500",
    marginRight: 5 * scale,
  },
  statLabel: {
    fontSize: 12 * scale,
  },
  editButtoncontainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 35 * scale,
  },
  editButton: {
    marginRight: scale * 20,
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.01,
    borderRadius: 5,
    // borderWidth: 1,
  },
  buttonText: {
    color: "#34A853",
    fontSize: 14 * scale,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  bioSection: {
    // marginTop: 12 * scale,
    // marginHorizontal: 10 * scale,
    // paddingHorizontal: 16 * scale,
    paddingLeft:15*scale,
    paddingRight:20*scale
  },
  bio: {
    fontSize: 14 * scale,
    fontWeight: "400",
    lineHeight: 18 * scale,
    letterSpacing: 0.1,
    // paddingVertical: 12 * scale,
    paddingHorizontal: 15 * scale,
    borderRadius: 8 * scale,
    textAlign: "left",
  },
  detailsSection: {

    marginTop: 15 * scale,
    paddingLeft: 15 * scale,
    paddingRight: 20 * scale
  },
  detailsRow: {
    marginLeft: 15 * scale,
    flexDirection: "row",
    justifyContent: "space-between",
    // padding: 10 * scale,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailTextContainer: {
    marginLeft: 12 * scale,
  },
  detailLabel: {
    fontSize: 12 * scale,
    marginBottom: 2 * scale,
  },
  detailValue: {
    fontSize: 14 * scale,
    fontWeight: "500",
  },
  viewMoreContainer: {
    marginLeft: 15 * scale,
    marginTop: 7 * scale,
  },
  viewMoreText: {
    fontSize: 14 * scale,
    fontWeight: "500",
  },
  tabsContainer: {
    marginTop: 10 * scale,
    width: "100%",
    paddingHorizontal: CONTENT_MARGIN,
  },
  stickyTabs: {
    position: "sticky",
    top: HEADER_HEIGHT,
    zIndex: 100,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tabButtons: {
    flexDirection: "row",
    justifyContent: "center",
    position: "relative",
    marginHorizontal:20*scale
  },
  tabButton: {
    flex: 1,
    paddingVertical: 5 * scale,
    // backgroundColor:"pink",
    alignItems: "center",
    zIndex: 1,
    width: 150 * scale + 40 * scale,
    marginRight: 10 * scale,
    height:30*scale
  },
  tabText: {
    fontSize: 16 * scale,
    fontWeight: "500",
    // width: 150 * scale,
    paddingRight:10*scale
  },
  posts:{
    marginRight:40*scale
  },
  reviews: {
    marginLeft: 40 * scale
  },
  tabBackground: {
  //  margin: 10 * scale,
    position: "absolute",
    top: 0,
    width: 120 * scale, // Width of each tab
    height: 30 * scale, // Height of the tab background
    // height: "100%", // Full height of the tab button
    borderRadius: 8 * scale,
    zIndex: 0, // Behind the tab text
    marginHorizontal:20*scale
    
  },
  tabContentContainer: {
    overflow: "hidden",
    width: "100%",
  },
  tabContentWrapper: {
    flexDirection: "row",
    width: width * 2,
   
  },
  tabContent: {
    
    width: width,
    paddingHorizontal: CONTENT_MARGIN,
    
    // minHeight: height * 0.5, // Consistent margin for responsiveness
  },
  postsContainer: {
    width: "100%",
  },
  postItem: {
    marginBottom: 20 * scale,
    borderWidth: 1,
    // borderColor: theme === "light" ? "#ddd" : "#444",
    borderRadius: 8 * scale,
    padding: 10 * scale,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  postAvatar: {
    width: 40 * scale,
    height: 40 * scale,
    borderRadius: 20 * scale,
    marginRight: 10 * scale,
  },
  postHeaderText: {
    flex: 1,
  },
  postUsername: {
    fontSize: 14 * scale,
    fontWeight: "500",
  },
  postHandle: {
    fontSize: 12 * scale,
  },
  postContentContainer: {
    backgroundColor: theme === "light" ? "#f5f5f5" : "#333",
    borderRadius: 8 * scale,
    padding: 10 * scale,
    marginBottom: 10 * scale,
  },
  postText: {
    fontSize: 14 * scale,
  },
  postImage: {
    width: "100%",
    height: 200 * scale,
    borderRadius: 10 * scale,
    marginBottom: 10 * scale,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10 * scale,
  },
  reviewsContainer: {
    width: "100%",
  },
  reviewItem: {
    marginBottom: 20 * scale,
    borderWidth: 1,
    borderColor: theme === "light" ? "#ddd" : "#444",
    borderRadius: 8 * scale,
    padding: 10 * scale,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewAvatar: {
    width: 40 * scale,
    height: 40 * scale,
    borderRadius: 20 * scale,
    marginRight: 10 * scale,
  },
  reviewHeaderText: {
    flex: 1,
  },
  reviewUsername: {
    fontSize: 14 * scale,
    fontWeight: "500",
  },
  reviewHandle: {
    fontSize: 12 * scale,
  },
  reviewContentContainer: {
    backgroundColor: theme === "light" ? "#f5f5f5" : "#333",
    borderRadius: 8 * scale,
    padding: 10 * scale,
    marginBottom: 10 * scale,
  },
  reviewText: {
    fontSize: 14 * scale,
    marginBottom: 5 * scale,
  },
  ratingText: {
    fontSize: 12 * scale,
  },
  showMoreText: {
    fontSize: 14 * scale,
    fontWeight: "500",
  },
  plusButton: {
    position: "absolute",
    bottom: 20 * scale,
    right: 20 * scale,
    width: 50 * scale,
    height: 50 * scale,
    borderRadius: 25 * scale,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});