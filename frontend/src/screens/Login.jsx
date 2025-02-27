import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const { control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    console.log(data);
    console.log({ email: data.email, password: data.password });
    setIsLoading(true);

    try {
      let response = await fetch('http://192.168.29.111:5000/api/v1/recruiter/login', { // Use 127.0.0.1 for iOS
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email, password: data.password })
      });

      let responseData = await response.json();
      console.log(responseData);

      if (responseData.success) {
        navigation.navigate('Home');
      } else {
        Alert.alert("Login Failed", responseData.message);
      }
    } catch (error) {
      console.log("Error:", error.message);
      Alert.alert("Error", "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Login</Text>

      {/* Email Field */}
      <View style={styles.inputFields}>
        <Text style={styles.inputText}>Enter your email</Text>
        <View style={styles.passwordContainer}>
          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: 'Enter a valid email',
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
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
      </View>

      {/* Password Field */}
      <View style={styles.inputFields}>
        <Text style={styles.inputText}>Enter your password</Text>
        <View style={styles.passwordContainer}>
          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
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
          <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.icon}>
            <Icon name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
          </Pressable>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
      </View>

      {/* Login Button */}
      <View style={{ width: "100%", padding: 10 }}>
        <Pressable disabled={isLoading} style={styles.button} onPress={handleSubmit(onSubmit)}>
          <Text style={styles.btnText}>{isLoading ? 'Logging in...' : 'Login'}</Text>
        </Pressable>
      </View>

      {/* Forgot Password Link */}
      <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
        <Text style={{ color: "gray", fontWeight: '400' }}>
          Forgot password? <Text style={{ fontWeight: 'bold', color: 'black' }}>Reset</Text>
        </Text>
        <Text style={{ fontWeight: 'bold', color: 'gray', marginTop: 5 }}>or</Text>
      </View>

      {/* Sign Up Link */}
      <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
        <Text style={{ color: "gray", fontWeight: '400' }}>
          Don't have an account? <Text style={{ fontWeight: 'bold', color: 'black' }}
          onPress={() => navigation.navigate('Register')}
          >Sign Up</Text>
        </Text>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputFields: {
    width: "100%",
    marginBottom: 13,
    paddingHorizontal: 10,
  },
  inputText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 15,
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
    backgroundColor: 'black',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  btnText: {
    color: "white",
    fontWeight: '900',
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 12,
  },
});