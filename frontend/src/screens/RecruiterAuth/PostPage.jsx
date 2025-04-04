import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Header from "../../components/Header";
import RecuriterFooter from "./RecuriterFooter";


const PostPage = () => {
  return (
    <View style={styles.container}>
      <Header></Header>
      <Text style={styles.title}>Post a Page</Text>
      <Text>Create and publish a new page.</Text>
      <RecuriterFooter></RecuriterFooter>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
});

export default PostPage;