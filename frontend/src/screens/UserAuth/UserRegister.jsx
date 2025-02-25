import React, { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import Icon from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import {
  registerUserAsync,
  selectUserStatus,
} from "../../store/slices/userAuthSlice";

const UserRegister = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const loading = useSelector(selectUserStatus);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    dispatch(registerUserAsync({ data, navigation, reset }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Register User</Text>

      {/* Name Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputText}>Enter your name</Text>
        <View style={styles.passwordContainer}>
          <Controller
            control={control}
            name="name"
            rules={{ required: "Name is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Enter your name"
                style={styles.input}
                placeholderTextColor="gray"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>
        <Text style={styles.errorText}>{errors.name?.message || " "}</Text>
      </View>

      {/* Email Field */}
      <View style={styles.inputContainer}>
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
        <Text style={styles.errorText}>{errors.email?.message || " "}</Text>
      </View>

      {/* Password Field */}
      <View style={styles.inputContainer}>
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
        <Text style={styles.errorText}>{errors.password?.message || " "}</Text>
      </View>

      {/* Confirm Password Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputText}>Re-Enter your password</Text>
        <View style={styles.passwordContainer}>
          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: "Confirm password is required",
              validate: (value) =>
                value === watch("password") || "Passwords do not match",
            }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Confirm password"
                style={styles.input}
                placeholderTextColor="gray"
                secureTextEntry={!showConfirmPassword}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          <Pressable
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.icon}
          >
            <Icon
              name={showConfirmPassword ? "eye-off" : "eye"}
              size={20}
              color="gray"
            />
          </Pressable>
        </View>
        <Text style={styles.errorText}>
          {errors.confirmPassword?.message || " "}
        </Text>
      </View>

      {/* Sign Up Button */}
      <Pressable
        disabled={loading === "loading"}
        style={({ pressed }) => [
          styles.button,
          { transform: [{ scale: pressed ? 0.9 : 1 }] }, // Scale effect
        ]}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.btnText}>
          {loading === "loading" ? "Signing up..." : "Sign Up"}
        </Text>
      </Pressable>

      {/* Sign In Link */}
      <View style={styles.signInContainer}>
        <Text
          style={styles.grayText}
          onPress={() => navigation.navigate("UserLogin")}
        >
          Already have an account? <Text style={styles.boldText}>Sign in</Text>
        </Text>
        <Text style={styles.grayText}>or</Text>
      </View>

      {/* Google Login Button */}
      <Pressable style={styles.socialButton}>
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

      <Pressable
        style={[styles.button, { backgroundColor: "#00c04b" }]}
        onPress={() => navigation.navigate("RecruiterRegister")}
      >
        <Text style={styles.btnText}>Signup as Recruiter</Text>
      </Pressable>
    </View>
  );
};

export default UserRegister;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  text: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 7,
  },
  inputText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 5,
  },
  input: {
    flex: 1,
    height: 45,
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
    height: 45,
    backgroundColor: "black",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  btnText: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
  },
  signInContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  grayText: {
    color: "gray",
    fontWeight: "700",
  },
  boldText: {
    fontWeight: "bold",
    color: "black",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 14,
    height: 45,
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
  errorText: {
    color: "red",
    fontSize: 12,
    height: 16,
  },
  recText: {
    width: "100%",
    height: 45,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    textAlign: "center",
    backgroundColor: "#00c04b",
  },
});
