import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Icon from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  
  const { control, handleSubmit,reset, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    console.log({name:data.name,email:data.email,password:data.password})
    setIsLoading(true);
    
    try {
      let response = await fetch('http://192.168.41.81:5000/api/v1/user/register', { // Use 127.0.0.1 for iOS
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({name:data.name,email:data.email,password:data.password})
      });
  
      let responseData = await response.json();
      console.log(responseData);
      Alert.alert("Email Verification",responseData.message)
      
      
    } catch (error) {
      console.log("Error:", error.message);
    } finally {
      setIsLoading(false);
      reset()
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Register</Text>

      {/* Name Field */}
      <View style={styles.inputFields}>
        <Text style={styles.inputText}>Enter your name</Text>
        <View style={styles.passwordContainer}>
          <Controller
            control={control}
            name="name"
            rules={{ required: 'Name is required' }}
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
        {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
      </View>

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

      {/* Confirm Password Field */}
      <View style={styles.inputFields}>
        <Text style={styles.inputText}>Re-Enter your password</Text>
        <View style={styles.passwordContainer}>
          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: 'Confirm password is required',
              validate: value => value === watch('password') || 'Passwords do not match',
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
          <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.icon}>
            <Icon name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="gray" />
          </Pressable>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
      </View>

      {/* Sign Up Button */}
      <View style={{ width: "100%", padding: 10 }}>
        <Pressable disabled={isLoading} style={styles.button} onPress={handleSubmit(onSubmit)}>
          <Text style={styles.btnText}>{isLoading ? 'Sign in...': 'Sign Up'}</Text>
        </Pressable>
      </View>

      {/* Sign In Link */}
      <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
        <Text style={{ color: "gray", fontWeight: '400' }}>
          Already have an account? <Text style={{ fontWeight: 'bold', color: 'black' }}>Sign in</Text>
        </Text>
        <Text style={{ fontWeight: 'bold', color: 'gray', marginTop: 5 }}>or</Text>
      </View>

      {/* Google Login Button */}
      <View style={[styles.inputFields, { marginTop: 10 }]}>
        <Pressable style={[styles.socialButton]}>
          <FontAwesome name="google" size={20} color="black" style={styles.socialIcon} />
          <Text style={styles.socialText}>Continue with Google</Text>
        </Pressable>
      </View>

      {/* Apple Login Button */}
      <View style={styles.inputFields}>
        <Pressable style={[styles.socialButton]}>
          <FontAwesome name="apple" size={24} color="black" style={styles.socialIcon} />
          <Text style={styles.socialText}>Continue with Apple</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical:10
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
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 14,
    height: 45,
    width: "100%",
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
    // marginTop: 2,
  },
});