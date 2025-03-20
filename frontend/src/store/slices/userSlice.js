// src/redux/slices/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fetchUserData = createAsyncThunk(
  'user/fetchData',
  async () => {
    // TODO: Replace with actual API call
    const response = await Promise.resolve({
        username: 'Sakasham Jaiswal',
        handle: '@sakashamjaiswal',
        postCount: '32.4k',  // Changed from posts
        following: '32.4k',
        followers: '32.4k',
        bio: 'Career | Location | Joining Date',
        posts: Array(4).fill({ 
          id: Math.random(), 
          content: '@sakashamjaiswal +1v' 
        }),
      });
    await AsyncStorage.setItem('userData', JSON.stringify(response));
    return response;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: { data: null, status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      });
  },
});

export const selectUser = (state) => state.user.data;
export default userSlice.reducer;