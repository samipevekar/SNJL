import { Alert } from "react-native";
import { CommonActions } from "@react-navigation/native";
import { storeToken } from "../../storage/AuthStorage";

export const registerUser = async (data, navigation, reset) => {
  try {
    const response = await fetch(
      "http://192.168.29.112:5000/api/v1/user/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      }
    );

    let responseData = await response.json();
    console.log(responseData);

    if (response.ok) {
      Alert.alert("Email Verification", responseData.message);
      navigation.navigate("UserVerify", { email: data.email }); // ✅ Correct way to use navigation
    } else {
      Alert.alert("Error", responseData.message);
    }

    return responseData;
  } catch (error) {
    Alert.alert("Network Error", "Something went wrong. Please try again.");
    console.error("Registration Error:", error);
    return null;
  } finally {
    reset();
  }
};

export const verifyUser = async (email, code, reset, navigation) => {
  try {
    const response = await fetch(
      "http://192.168.41.81:5000/api/v1/user/verify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, code: code }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      Alert.alert("Invalid", data.message);
    }

    if (response.ok) {
      await storeToken(data.token); // to store data in async storage
    }

    if (response.ok) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Home" }], // to delete all routes form stack
        })
      );
    }
  } catch (error) {
    console.log(error.message);
  } finally {
    reset();
  }
};

export const loginUser = async (data, navigation, reset) => {
  try {
    let response = await fetch("http://192.168.41.81:5000/api/v1/user/login", {
      // Use 127.0.0.1 for iOS
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: data.email, password: data.password }),
    });

    let responseData = await response.json();
    console.log(responseData);

    // if (response.ok) {
    storeToken(responseData.token);
    // }

    if (response.ok) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "AuthCheck" }], // to delete all routes form stack
        })
      );
    } else {
      Alert.alert("Login Failed", responseData.message);
    }
  } catch (error) {
    console.log("Error:", error.message);
    Alert.alert("Error", "An error occurred during login");
  } finally {
    setIsLoading(false);
    reset();
  }
};
