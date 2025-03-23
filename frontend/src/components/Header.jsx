import { StyleSheet, TextInput, View, TouchableOpacity, Animated, Dimensions, Image } from "react-native";
import React from "react";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

// Get screen width for better responsiveness
const { width } = Dimensions.get("window");
const scale = width / 375;

export default function Header({ searchVisible, inputAnim, toggleSearch }) {
  const theme = useSelector((state) => state.theme.mode);
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: theme === "light" ? "#111" : "#f9f9f9" }]}>
      <View style={styles.headerItems}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <Icon name="west" size={21 * scale} color={theme === "light" ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>

        {/* Search Input Box */}
        <Animated.View
          style={[
            styles.searchBox,
            {
              width: inputAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", width > 400 ? "65%" : "55%"],
              }),
              opacity: inputAnim,
              backgroundColor: theme === "dark" ? "#222" : "rgba(255,255,255,0.1)",
              borderColor: theme === "dark" ? "#555" : "transparent",
              borderWidth: theme === "dark" ? 1 : 0,
              shadowColor: theme === "dark" ? "#000" : "transparent",
              shadowOpacity: theme === "dark" ? 0.2 : 0,
              shadowRadius: theme === "dark" ? 4 : 0,
              shadowOffset: { width: 0, height: 2 },
            },
          ]}
        >
          <TextInput
            placeholder="Search user..."
            placeholderTextColor={theme === "light" ? "#bbb" : "#888"}
            style={[styles.input, { color: theme === "light" ? "white" : "white" }]}
          />
        </Animated.View>

        {/* Search & More Icons */}
        <View style={[styles.iconsContainer]}>
          

          <TouchableOpacity
            style={[styles.iconWrapper, theme === "dark" && styles.darkIcon, { marginTop: 10 }]}
          >
            <Icon name="notifications" size={21 * scale} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconWrapper, theme === "dark" && styles.darkIcon, { marginTop: 10 }]}
          >
            <Icon name="chat" size={21 * scale} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
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
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: "center",
    overflow: "hidden",
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
});