import { StyleSheet, TextInput, View, TouchableOpacity, Animated, Dimensions, Text, FlatList, Image } from "react-native";
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { searchUsers } from "../store/slices/searchSlice"; // Import the async thunk

const { width } = Dimensions.get("window");
const scale = width / 375;

export default function Header() {
  const theme = useSelector((state) => state.theme.mode);
  
  const navigation = useNavigation();
  const dispatch = useDispatch();
 


  // Render search result item with profile image and name
  const renderSearchResult = ({ item }) => {
    const hasValidProfileImage = item.profileImage && item.profileImage.startsWith("https");
    const displayName = item.name || `${item.firstName || ""} ${item.lastName || ""}`.trim() || item.email;

    return (
      <TouchableOpacity
        style={styles.resultItem}
        onPress={() => {
          // Navigate to ViewProfile with user data
          navigation.navigate("ViewProfile", { user: item });
          setSearchQuery(""); // Clear search after selection
        }}
      >
        <View style={styles.resultContent}>
          {hasValidProfileImage ? (
            <Image source={{ uri: item.profileImage }} style={styles.resultImage} />
          ) : (
            <Image source={require("../../images/AvatarLight.png")} style={styles.resultImage} />
          )}
          <Text style={styles.resultText}>{displayName}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme === "light" ? "#111" : "#f9f9f9" }]}>
      <View style={styles.headerItems}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <Icon name="west" size={21 * scale} color={theme === "light" ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>

        {/* Search Input Box */}
       

        {/* Search & More Icons */}
        <View style={styles.iconsContainer}>
          <TouchableOpacity
            style={[styles.iconWrapper,  { marginTop: 10 }]}
          >
            <Icon name="notifications" size={21 * scale} color={theme === "light" ? "#FFFFFF" : "#000000"} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconWrapper, { marginTop: 10 }]}
          >
            <Icon name="chat" size={21 * scale} color={theme === "light" ? "#FFFFFF" : "#000000"} />
          </TouchableOpacity>
        </View>
      </View>

    
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#111",
    elevation: 4,
  },
  headerItems: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
  },
  backIcon: {
    padding: 8,
    borderRadius: 50,
  },
  searchBox: {
    position: "absolute",
    left: 50,
    right: 100, // Adjusted to leave space for icons
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "#222",
  },
  input: {
    height: 40,
    fontSize: 16,
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    height: 21 * scale,
    width: 21 * scale,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginLeft: 8,
  },
  darkIcon: {
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#555",
  },
  resultsContainer: {
    position: "absolute",
    top: 60,
    left: 12,
    right: 12,
    backgroundColor: "#333",
    borderRadius: 10,
    maxHeight: 200,
    zIndex: 1000,
    padding: 10,
  },
  resultItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#555",
  },
  resultContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  resultImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#34C759",
  },
  resultText: {
    color: "#FFFFFF",
    fontSize: 14,
    flexShrink: 1, // Ensures text doesn't overflow
  },
  loadingText: {
    color: "#FFFFFF",
    textAlign: "center",
  },
  errorText: {
    color: "#FF4444",
    textAlign: "center",
  },
  noResultsText: {
    color: "#FFFFFF",
    textAlign: "center",
  },
  resultsList: {
    flexGrow: 0,
  },
});