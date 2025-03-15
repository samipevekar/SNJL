import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import Icon from "react-native-vector-icons/Ionicons";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUserAsync,
  selectUserLoginStatus,
  userLoginWithGoogleAsync,
} from "../../store/slices/userAuthSlice";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { ScrollView } from "react-native-gesture-handler";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

const UserLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  const loading = useSelector(selectUserLoginStatus);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      console.log(data);
      const result = await dispatch(loginUserAsync(data)).unwrap();
      if (result.success) {
        reset();
      }
      // Navigation after successful login
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Home" }],
        })
      );
    } catch (error) {
      Alert.alert("Error", error);
    }
  };

  useEffect(() => {
    GoogleSignin.configure();
  }, []);

  const googleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();

      await GoogleSignin.signOut();

      const userInfo = await GoogleSignin.signIn();

      try {
        const result = await dispatch(
          userLoginWithGoogleAsync({
            email: userInfo.data.user.email,
            name: userInfo.data.user.name,
            googleId: userInfo.data.user.id,
          })
        ).unwrap();

        if (result.success) {
          // Navigation after successful login
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Home" }],
            })
          );
        }
      } catch (error) {
        console.log(error);
      }
      console.log(userInfo.data.user);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled the sign-in process");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Sign-in is in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log("Google Play Services not available");
      } else {
        console.log(error);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <Text style={styles.text}>Login User</Text>

        {/* Email Field */}
        <View style={styles.inputFields}>
          <Text style={styles.inputText}>Enter your email</Text>
          <View style={styles.passwordContainer}>
            <Controller
              control={control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Enter a valid email",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="abc12@gmail.com"
                  style={styles.input}
                  keyboardType="email-address"
                  placeholderTextColor="gray"
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>
          {errors.email ? (
            <Text style={styles.errorText}>{errors.email.message}</Text>
          ) : (
            <View style={{ height: 16 }} />
          )}
        </View>

        {/* Password Field */}
        <View style={styles.inputFields}>
          <Text style={styles.inputText}>Enter your password</Text>
          <View style={styles.passwordContainer}>
            <Controller
              control={control}
              name="password"
              rules={{
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="Enter password"
                  style={styles.input}
                  placeholderTextColor="gray"
                  secureTextEntry={!showPassword}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={styles.icon}
            >
              <Icon
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="gray"
              />
            </Pressable>
          </View>
          {errors.password ? (
            <Text style={styles.errorText}>{errors.password.message}</Text>
          ) : (
            <View style={{ height: 16 }} />
          )}
        </View>

        {/* Forgot Password Link */}
        <View style={{ width: "100%", marginTop: 10, alignItems: "flex-end" }}>
          <Text style={{ color: "gray", fontWeight: "400", marginRight: 10 }}>
            Forgot password?
          </Text>
        </View>

        {/* Login Button */}
        <View style={{ width: "100%", paddingVertical: 10 }}>
          <Pressable
            disabled={loading == "loading"}
            style={({ pressed }) => [
              styles.button,
              { transform: [{ scale: pressed ? 0.9 : 1 }] },
              loading == "loading" && { opacity: 0.5 }, // Scale effect
            ]}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.btnText}>
              {loading == "loading" ? "Logging in..." : "Login"}
            </Text>
          </Pressable>
        </View>

        {/* Sign Up Link */}
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 0,
          }}
        >
          <Text style={{ color: "gray", fontWeight: "400" }}>
            Don't have an account?{" "}
            <Text
              style={{ fontWeight: "bold", color: "black" }}
              onPress={() => navigation.navigate("UserRegister")}
            >
              Sign Up
            </Text>
          </Text>
          <Text style={styles.grayText}>or</Text>
        </View>

        {/* Google Login Button */}
        <Pressable
          style={[styles.socialButton, { marginTop: 10 }]}
          onPress={googleLogin}
        >
          <FontAwesome
            name="google"
            size={20}
            color="black"
            style={styles.socialIcon}
          />
          <Text style={styles.socialText}>Continue with Google</Text>
        </Pressable>

        {/* Apple Login Button */}
        <Pressable style={styles.socialButton}>
          <FontAwesome
            name="apple"
            size={24}
            color="black"
            style={styles.socialIcon}
          />
          <Text style={styles.socialText}>Continue with Apple</Text>
        </Pressable>

        <Text style={styles.grayText}>or</Text>

        <Text style={styles.guest} onPress={() => navigation.navigate("Home")}>
          Continue as Guest
        </Text>

        <Pressable
          style={[styles.button, { backgroundColor: "#00c04b" }]}
          onPress={() => navigation.replace("RecruiterLogin")}
        >
          <Text style={styles.btnText}>Login as Recruiter</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default UserLogin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  text: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "20%",
  },
  inputFields: {
    width: "100%",
    marginBottom: 4,
  },
  inputText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: "black",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 14,
    paddingHorizontal: 10,
  },
  icon: {
    paddingRight: 10,
  },
  button: {
    width: "100%",
    height: 40,
    backgroundColor: "#00c04b",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
  },
  btnText: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    minHeight: 16, // Yeh ensure karega ki spacing maintain ho
  },
  grayText: {
    color: "gray",
    fontWeight: "700",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 14,
    height: 40,
    width: "100%",
    marginBottom: 10,
  },
  socialIcon: {
    marginRight: 10,
  },
  socialText: {
    fontSize: 14,
    fontWeight: "500",
  },
  guest: {
    marginBottom: 10,
    color: "gray",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});
