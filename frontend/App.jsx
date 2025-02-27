import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Navigation from "./src/navigation/Navigation";
import "react-native-gesture-handler";
import { Provider } from "react-redux";
import { store } from "./src/store/store.js";

const App = () => {
  return (
    <Provider store={store}>
      <View style={styles.container}>
        <Navigation />
      </View>
    </Provider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
  },
});
