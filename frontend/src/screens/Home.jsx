import { StyleSheet, Text, View, Button } from "react-native";
import React, { useEffect, useState } from "react";
import { getToken, removeToken } from "../storage/AuthStorage";
import { useNavigation } from "@react-navigation/native";

const Home = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    await removeToken(); // ✅ Token Remove
    navigation.replace("UserRegister"); // ✅ Navigate to Login
  };

  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 40, marginBottom: 20 }}>Welcome to Home</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
