import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ To Store Token
export const storeToken = async (token) => {
  try {
    await AsyncStorage.setItem("token", token);
    console.log("Token stored successfully!");
  } catch (error) {
    console.log("Error storing token:", error);
  }
};

// ✅ To Get Token
export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    return token; 
  } catch (error) {
    console.log("Error fetching token:", error);
    return null;
  }
};

// ✅ To Remove Token
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem("token");
    console.log("Token removed successfully!");
  } catch (error) {
    console.log("Error removing token:", error);
  }
};
