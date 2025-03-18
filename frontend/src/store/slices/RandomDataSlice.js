// redux/slices/RandomDataSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../components/Helpers/axiosinstance"; // Adjust path
import { getToken } from "../../storage/AuthStorage"; // Adjust path

// Async thunk to fetch random users
export const fetchRandomUsers = createAsyncThunk(
  "randomUsers/fetchRandomUsers",
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const response = await axiosInstance.get("/randomData/getRandomUser", {
        headers: {
          Authorization: `token ${token}`,
        },
      });
      return response.data; // Expecting an array of up to 10 users
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch random users"
      );
    }
  }
);

const randomDataSlice = createSlice({
  name: "randomUsers",
  initialState: {
    users: [], // Array of random users
    loading: false,
    error: null,
  },
  reducers: {
    clearRandomUsers: (state) => {
      state.users = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRandomUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRandomUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload; // Store the array of users
      })
      .addCase(fetchRandomUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRandomUsers } = randomDataSlice.actions;
export default randomDataSlice.reducer;