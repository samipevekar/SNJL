import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getToken } from '../storage/AuthStorage';

const AuthCheck = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkToken = async () => {
      const storedToken = await getToken();

      if (storedToken) {
        navigation.replace('Home'); // If there is token then redirect to home
      } else {
        navigation.replace('UserRegister'); // If there is no token then redirect to register
      }
    };

    checkToken();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="blue" />
    </View>
  );
};

export default AuthCheck;
