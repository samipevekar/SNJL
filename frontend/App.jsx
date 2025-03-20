import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Navigation from "./src/navigation/Navigation";
import "react-native-gesture-handler"; // Ensure this is imported at the top
import { GestureHandlerRootView } from "react-native-gesture-handler"; // Import GestureHandlerRootView
import { Provider } from "react-redux";
import { store } from "./src/store/store.js";
import { SocketProvider } from "./src/components/Helpers/SocketProvider.js";

const App = () => {
  return (
    <Provider store={store}>
    <SocketProvider>  
    
    <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Navigation />
        </View>
      </GestureHandlerRootView>
    
      </SocketProvider>
     
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