import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import Header from "../../components/Header";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 375;

export default function UserProfile() {
  const theme = useSelector((state) => state.theme.mode);

  const userData = {
    name: "Sakasham Jaiswal",
    username: "@sakashamjaiswal",
    profileViews: "21.1k",
    following: "32.4k",
    followers: "32.4k",
    career: "Career",
    location: "Location",
    joiningDate: "Joining Date",
  };

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme === "light" ? "#fff" : "#000" }]}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Content */}
        <View style={styles.contentContainer}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <Image
              source={require("../../../images/AvatarLight.png")}
              style={styles.profileImage}
            />
            
            {/* Stats Section */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme === "light" ? "#000" : "#fff" }]}>
                  {userData.following}
                </Text>
                <Text style={[styles.statLabel, { color: theme === "light" ? "#666" : "#999" }]}>
                  Following
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: theme === "light" ? "#000" : "#fff" }]}>
                  {userData.followers}
                </Text>
                <Text style={[styles.statLabel, { color: theme === "light" ? "#666" : "#999" }]}>
                  Followers
                </Text>
              </View>
            </View>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={[styles.name, { color: theme === "light" ? "#000" : "#fff" }]}>
              {userData.name}
            </Text>
            <Text style={[styles.username, { color: theme === "light" ? "#666" : "#999" }]}>
              {userData.username}
            </Text>
            
            <View style={styles.viewsContainer}>
              <Icon 
                name="visibility" 
                size={16} 
                color={theme === "light" ? "#666" : "#999"} 
              />
              <Text style={[styles.viewsText, { color: theme === "light" ? "#666" : "#999" }]}>
                {userData.profileViews} profile views
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[
              styles.editButton,
              { 
                backgroundColor: theme === "light" ? "#f0f0f0" : "#1a1a1a",
                borderColor: theme === "light" ? "#ddd" : "#333"
              }
            ]}>
              <Text style={[styles.buttonText, { color: theme === "light" ? "#333" : "#fff" }]}>
                Edit profile
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[
              styles.followButton,
              { backgroundColor: theme === "light" ? "#10B981" : "#059669" }
            ]}>
              <Text style={[styles.buttonText, { color: "#fff" }]}>Follow</Text>
            </TouchableOpacity>
          </View>

          {/* Followed By Section */}
          <View style={styles.followedByContainer}>
            <Text style={[styles.followedByText, { color: theme === "light" ? "#666" : "#999" }]}>
              Followed by{' '}
              <Text style={[styles.highlightText, { color: theme === "light" ? "#10B981" : "#34D399" }]}>
                username
              </Text> +1v
            </Text>
          </View>

          {/* Profile Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Icon 
                name="work" 
                size={18} 
                color={theme === "light" ? "#666" : "#999"} 
              />
              <Text style={[styles.detailText, { color: theme === "light" ? "#666" : "#999" }]}>
                {userData.career}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Icon 
                name="location-on" 
                size={18} 
                color={theme === "light" ? "#666" : "#999"} 
              />
              <Text style={[styles.detailText, { color: theme === "light" ? "#666" : "#999" }]}>
                {userData.location}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Icon 
                name="event" 
                size={18} 
                color={theme === "light" ? "#666" : "#999"} 
              />
              <Text style={[styles.detailText, { color: theme === "light" ? "#666" : "#999" }]}>
                {userData.joiningDate}
              </Text>
            </View>
          </View>

          {/* View More */}
          <TouchableOpacity style={styles.viewMoreContainer}>
            <Text style={[styles.viewMoreText, { color: theme === "light" ? "#10B981" : "#34D399" }]}>
              View more information
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width * 0.05,
    paddingBottom: 30,
  },
  contentContainer: {
    marginTop: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 25,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  username: {
    fontSize: 16,
    marginBottom: 12,
  },
  viewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewsText: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  editButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  followButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  followedByContainer: {
    marginBottom: 25,
    alignItems: 'center',
  },
  followedByText: {
    fontSize: 14,
  },
  highlightText: {
    fontWeight: '500',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
  },
  viewMoreContainer: {
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
});