import { StyleSheet, View, TouchableOpacity, Dimensions, Text } from "react-native";
import React from "react";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

// Get screen width for better responsiveness
const { width } = Dimensions.get("window");
const scale = width / 375;

export default function Footer({ toggleSearch }) {
  const theme = useSelector((state) => state.theme.mode);
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: theme === "light" ? "#111" : "#f9f9f9" }]}>
      <View style={styles.footerItems}>
        {/* Home Icon */}
        <TouchableOpacity
          style={[styles.iconWrapper, { marginTop: 10 }]}
          onPress={() => navigation.navigate("Home")} // Adjust the screen name as per your navigation setup
        >
          <Icon name="home" size={21 * scale} color="#FFFFFF" />
          <Text style={styles.iconLabel}>Home</Text>
        </TouchableOpacity>

        {/* Search Icon */}
        <TouchableOpacity
          style={[styles.iconWrapper, { marginTop: 10 }]}
          onPress={() => {
            toggleSearch(); // Trigger the search animation in Header
            navigation.navigate("Search"); // Navigate to Search screen
          }}
        >
          <Icon name="search" size={21 * scale} color="#FFFFFF" />
          <Text style={styles.iconLabel}>Search</Text>
        </TouchableOpacity>

        {/* Add Post Icon */}
        <TouchableOpacity
          style={[styles.iconWrapper, { marginTop: 10 }]}
          onPress={() => navigation.navigate("AddPost")} // Adjust the screen name
        >
          <Icon name="add-circle" size={21 * scale} color="#FFFFFF" />
          <Text style={styles.iconLabel}>Add Post</Text>
        </TouchableOpacity>

        {/* Job Icon */}
        <TouchableOpacity
          style={[styles.iconWrapper, { marginTop: 10 }]}
          onPress={() => navigation.navigate("Job")} // Adjust the screen name
        >
          <Icon name="work" size={21 * scale} color="#FFFFFF" />
          <Text style={styles.iconLabel}>Job</Text>
        </TouchableOpacity>

        {/* Profile Icon */}
        <TouchableOpacity
          style={[styles.iconWrapper, { marginTop: 10 }]}
          onPress={() => navigation.navigate("Profile")} // Adjust the screen name
        >
          <Icon name="person" size={21 * scale} color="#FFFFFF" />
          <Text style={styles.iconLabel}>Profile</Text>
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
    elevation: 4, // Adds a slight shadow for better UI
  },
  footerItems: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-around", // Distribute icons evenly
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
  },
  iconLabel: {
    color: "#FFFFFF",
    fontSize: 10 * scale,
    marginTop: 2,
    fontFamily: "Inter", // Match the font family from your EditProfile.jsx
  },
});