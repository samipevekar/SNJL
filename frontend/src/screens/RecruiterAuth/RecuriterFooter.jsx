import { StyleSheet, View, TouchableOpacity, Dimensions, Text, Image, Modal, Pressable } from "react-native";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getUserData } from "../storage/userData";
import LinearGradient from "react-native-linear-gradient"; // Install this package for gradient effects

const { width } = Dimensions.get("window");
const scale = width / 375;

export default function RecuriterFooter() {
  const theme = useSelector((state) => state.theme.mode);
  const navigation = useNavigation();
  const route = useRoute(); 
  const [userData, setUserData] = useState(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false); // State for overlay visibility

  const avatarUri =
    typeof userData?.profileImage === "string" && userData?.profileImage.startsWith("http")
      ? userData.profileImage
      : null;

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getUserData();
        setUserData(user);
      } catch (err) {
        console.error("Error loading user data:", err);
      }
    };
    loadData();
  }, []);

  // Function to determine if the button is active
  const isActive = (screenName) => route.name === screenName;

  // Handle navigation for Post Job and Post Page
  const handlePostJob = () => {
    setIsOverlayVisible(false);
    navigation.navigate("PostJob"); // Replace with your PostJob screen name
  };

  const handlePostPage = () => {
    setIsOverlayVisible(false);
    navigation.navigate("PostPage"); // Replace with your PostPage screen name
  };

  return (
    <View style={[styles.container, { backgroundColor: theme === "light" ? "#000000" : "#FFFFFF" }]}>
      <View style={styles.footerItems}>
        {/* Home Icon */}
        <TouchableOpacity
          style={[styles.iconWrapper, { marginTop: 10 }, isActive("Home") && styles.activeButton]}
          onPress={() => navigation.navigate("Home")}
        >
          <Icon
            name="home"
            size={21 * scale}
            color={isActive("Home") ? "#34C759" : theme === "light" ? "#FFFFFF" : "#000000"}
          />
          <Text style={[styles.iconLabel, isActive("Home") && styles.activeText]}>Home</Text>
        </TouchableOpacity>

        {/* Search Icon */}
        <TouchableOpacity
          style={[styles.iconWrapper, { marginTop: 10 }, isActive("Search") && styles.activeButton]}
          onPress={() => navigation.navigate("Search")}
        >
          <Icon
            name="search"
            size={21 * scale}
            color={isActive("Search") ? "#34C759" : theme === "light" ? "#FFFFFF" : "#000000"}
          />
          <Text style={[styles.iconLabel, isActive("Search") && styles.activeText]}>Search</Text>
        </TouchableOpacity>

        {/* Add Post Icon with Overlay */}
        <TouchableOpacity
          style={[styles.iconWrapper, { marginTop: 10 }, isActive("AddPost") && styles.activeButton]}
          onPress={() => setIsOverlayVisible(true)}
        >
          <Icon
            name="add-circle"
            size={21 * scale}
            color={isActive("AddPost") ? "#34C759" : theme === "light" ? "#FFFFFF" : "#000000"}
          />
          <Text style={[styles.iconLabel, isActive("AddPost") && styles.activeText]}>Add Post</Text>
        </TouchableOpacity>

        {/* Hire Icon */}
        <TouchableOpacity
          style={[styles.iconWrapper, { marginTop: 10 }, isActive("Hire") && styles.activeButton]}
          onPress={() => navigation.navigate("Hire")}
        >
          <Icon
            name="work"
            size={21 * scale}
            color={isActive("Hire") ? "#34C759" : theme === "light" ? "#FFFFFF" : "#000000"}
          />
          <Text style={[styles.iconLabel, isActive("Hire") && styles.activeText]}>Hire</Text>
        </TouchableOpacity>

        {/* Profile Icon */}
        <TouchableOpacity
          style={[styles.iconWrapper, { marginTop: 10 }, isActive("UserProfile") && styles.activeButton]}
          onPress={() => navigation.navigate("UserProfile")}
        >
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={[
                { width: 21 * scale, height: 21 * scale, borderRadius: 10.5 },
                isActive("UserProfile") && styles.activeImage,
              ]}
            />
          ) : (
            <Icon
              name="person"
              size={21 * scale}
              color={isActive("UserProfile") ? "#34C759" : theme === "light" ? "#FFFFFF" : "#000000"}
            />
          )}
          <Text style={[styles.iconLabel, isActive("UserProfile") && styles.activeText]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Overlay Modal */}
      <Modal
        transparent={true}
        visible={isOverlayVisible}
        animationType="fade"
        onRequestClose={() => setIsOverlayVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setIsOverlayVisible(false)}>
          <View style={styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsOverlayVisible(false)}
            >
              <Icon name="close" size={20 * scale} color="#666" />
            </TouchableOpacity>

            {/* Post Job Button */}
            <TouchableOpacity onPress={handlePostJob}>
              <LinearGradient
                colors={["#34C759", "#28A745"]}
                style={styles.actionButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Icon name="work" size={18 * scale} color="#FFF" />
                <Text style={styles.actionButtonText}>Post Job</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Post Page Button */}
            <TouchableOpacity onPress={handlePostPage}>
              <LinearGradient
                colors={["#007BFF", "#0056B3"]}
                style={styles.actionButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Icon name="description" size={18 * scale} color="#FFF" />
                <Text style={styles.actionButtonText}>Post Page</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    width: "100%",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
  },
  footerItems: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-around",
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
  },
  iconLabel: {
    color: "#000000",
    fontSize: 10 * scale,
    marginTop: 2,
    fontFamily: "Inter",
  },
  activeButton: {},
  activeText: {
    color: "#34C759", 
  },
  activeImage: {
    borderWidth: 1,
    borderColor: "#34C759", 
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    width: "80%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 10,
    width: "100%",
    elevation: 5,
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 16 * scale,
    fontWeight: "bold",
    marginLeft: 10,
    fontFamily: "Inter",
  },
});