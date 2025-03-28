import { StyleSheet, Text, View, Button } from "react-native";
import React, { useEffect, useState } from "react";
import { getToken, removeToken } from "../storage/AuthStorage";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { getUserData } from "../storage/userData";
import PostReviewTab from "../components/PostReviewTab";
import Footer from "../components/Footer";


const Home = () => {
  
console.log("home" ,getUserData())
  const navigation = useNavigation();

  const handleLogout = async () => {
    await removeToken(); // ✅ Token Remove
    navigation.replace("UserRegister"); // ✅ Navigate to Login
  };

  return (
    <>
    <View style={styles.container}>
      <Text style={{ fontSize: 40, marginBottom: 20 }}>Welcome to Home</Text>
      <Button title="Logout" onPress={handleLogout} />
      <Button title="Profile" onPress={() => navigation.navigate("UserProfile")} />
      <Button title="ChatScreen" onPress={() => navigation.navigate("ChatScreen")} />
      <Button title="RandomUser" onPress={() => navigation.navigate("RandomUser")} />
      <Button title="AllChatsScreen" onPress={() => navigation.navigate("AllChatsScreen")} />
      
  
     
      
    </View>
    <Footer style={{ position: "absolute", bottom: 0}}/>
    </>
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
