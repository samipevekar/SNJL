// src/redux/slices/jobSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Async thunk to create a job
export const createJob = createAsyncThunk(
  'job/createJob',
  async (jobData, { rejectWithValue }) => {
    try {
      // Retrieve the token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Send POST request to the backend
      const response = await axios.post('http://your-backend-url/jobs/', jobData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data; // Return the created job
    } catch (error) {
      // Handle errors and return the error message
      const message = error.response?.data?.message || error.message || 'Failed to create job';
      return rejectWithValue(message);
    }
  }
);

const jobSlice = createSlice({
  name: 'job',
  initialState: {
    job: null, // Store the created job
    status: 'idle', // idle | loading | succeeded | failed
    error: null, // Store error message if any
  },
  reducers: {
    // Reset the state after a job is created (optional)
    resetJobState: (state) => {
      state.job = null;
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createJob.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.job = action.payload;
        state.error = null;
      })
      .addCase(createJob.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { resetJobState } = jobSlice.actions;
export const selectJob = (state) => state.job.job;
export const selectJobStatus = (state) => state.job.status;
export const selectJobError = (state) => state.job.error;

export default jobSlice.reducer;