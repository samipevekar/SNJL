// store/slices/onlineStatusSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Thunk to fetch initial online statuses (optional, if you have an endpoint)
export const fetchOnlineStatuses = createAsyncThunk(
  'onlineStatus/fetchOnlineStatuses',
  async (userIds, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const response = await axiosInstance.post(
        '/users/online-status',
        { userIds },
        { headers: { Authorization: `token ${token}` } }
      );
      console.log('Fetched online statuses:', response.data);
      return response.data.statuses;
    } catch (error) {
      console.error('Fetch online statuses error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch online statuses');
    }
  }
);

const onlineStatusSlice = createSlice({
  name: 'onlineStatus',
  initialState: {
    statuses: {}, // Map of userId to status ('online' or 'offline')
    loading: false,
    error: null,
  },
  reducers: {
    setUserOnlineStatus: (state, action) => {
      const { userId, status } = action.payload;
      console.log(`Setting online status for user ${userId}: ${status}`);
      state.statuses[userId] = status;
    },
    clearOnlineStatuses: (state) => {
      state.statuses = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOnlineStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOnlineStatuses.fulfilled, (state, action) => {
        state.loading = false;
        state.statuses = { ...state.statuses, ...action.payload };
      })
      .addCase(fetchOnlineStatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUserOnlineStatus, clearOnlineStatuses } = onlineStatusSlice.actions;
export default onlineStatusSlice.reducer;