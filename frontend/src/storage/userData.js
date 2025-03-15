import AsyncStorage from "@react-native-async-storage/async-storage";

//set user data in async storage
export const storeUserData = async (userData) => {
    try {
        console.log("Storing user data...");
        await AsyncStorage.setItem("userData", JSON.stringify(userData));
        console.log("User data stored successfully!");
    } catch (error) {
        console.log("Error storing user data:", error);
    }
};


// ✅ To Get User Data

export const getUserData = async () => {
    try {
        console.log("Fetching user data...");
        const userData = await AsyncStorage.getItem("userData");
        // console.log("User data:", userData);
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.log("Error fetching user data:", error);
        return null;
    }
};


// ✅ To Remove User Data
export const removeUserData = async () => {
    try {
        await AsyncStorage.removeItem("userData");
        console.log("User data removed successfully!");
    } catch (error) {
        console.log("Error removing user data:", error);
    }
};