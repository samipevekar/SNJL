// store/slices/searchSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../components/Helpers/axiosinstance";
import { getToken } from "../../storage/AuthStorage";

// Search users
export const searchUsers = createAsyncThunk(
  "search/searchUsers",
  async (query, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const response = await axiosInstance.get(`/search/searchUser`, {
        headers: {
          Authorization: `token ${token}`, // Adjusted to Bearer token format
        },
        params: { query },
      });
      return response.data.data.length > 0 ? response.data.data : response.data.suggestions || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to search users");
    }
  }
);

// Fetch search history
export const fetchSearchHistory = createAsyncThunk(
  "search/fetchSearchHistory",
  async ({ page, limit }, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const response = await axiosInstance.get(`/search/searchUser`, {
        headers: {
          Authorization: `token ${token}`,
        },
        params: { history: true, page, limit },
      });
      return response.data; // Expecting { data, pagination }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch search history");
    }
  }
);

// Delete search history
export const deleteSearchHistory = createAsyncThunk(
  "search/deleteSearchHistory",
  async ({ searchId, clearAll = false }, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const response = await axiosInstance.post(
        `/search/searchdelete`,
        { searchId, clearAll },
        {
          headers: {
            Authorization: `token ${token}`,
          },
        }
      );
      return { searchId, clearAll }; // Return payload for reducer
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete search history");
    }
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState: {
    searchResults: [],
    searchHistory: [],
    loading: false,
    error: null,
    historyPagination: {},
  },
  reducers: {
    clearSearch: (state) => {
      state.searchResults = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search Users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.searchResults = [];
      })
      // Fetch Search History
      .addCase(fetchSearchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSearchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.searchHistory = action.meta.arg.page === 1
          ? action.payload.data
          : [...state.searchHistory, ...action.payload.data]; // Append for pagination
        state.historyPagination = action.payload.pagination;
      })
      .addCase(fetchSearchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Search History
      .addCase(deleteSearchHistory.fulfilled, (state, action) => {
        if (action.payload.clearAll) {
          state.searchHistory = [];
          state.historyPagination = {};
        } else {
          state.searchHistory = state.searchHistory.filter(
            (item) => item._id !== action.payload.searchId
          );
          state.historyPagination.totalItems -= 1;
        }
      });
  },
});

export const { clearSearch } = searchSlice.actions;
export default searchSlice.reducer;