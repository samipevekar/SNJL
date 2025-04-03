import { StyleSheet, View, TouchableOpacity, Dimensions, Text, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native"; // Import useRoute
import { getUserData } from "../storage/userData";

const { width } = Dimensions.get("window");
const scale = width / 375;

export default function Footer() {
  const theme = useSelector((state) => state.theme.mode);
  const navigation = useNavigation();
  const route = useRoute(); 
  const [userData, setUserData] = useState(null);

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

        {/* Add Post Icon */}
        <TouchableOpacity
          style={[styles.iconWrapper, { marginTop: 10 }, isActive("AddPost") && styles.activeButton]}
          onPress={() => navigation.navigate("AddPost")}
        >
          <Icon
            name="add-circle"
            size={21 * scale}
            color={isActive("AddPost") ? "#34C759" : theme === "light" ? "#FFFFFF" : "#000000"}
          />
          <Text style={[styles.iconLabel, isActive("AddPost") && styles.activeText]}>Add Post</Text>
        </TouchableOpacity>

        {/* Job Icon */}
        <TouchableOpacity
          style={[styles.iconWrapper, { marginTop: 10 }, isActive("Job") && styles.activeButton]}
          onPress={() => navigation.navigate("Job")}
        >
          <Icon
            name="work"
            size={21 * scale}
            color={isActive("Job") ? "#34C759" : theme === "light" ? "#FFFFFF" : "#000000"}
          />
          <Text style={[styles.iconLabel, isActive("Job") && styles.activeText]}>Job</Text>
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
  activeButton: {
    
  },
  activeText: {
    color: "#34C759", 
  },
  activeImage: {
    borderWidth: 1,
    borderColor: "#34C759", 
  },
});