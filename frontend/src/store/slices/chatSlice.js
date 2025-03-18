// redux/slices/chatSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../components/Helpers/axiosinstance";
import { getToken } from "../../storage/AuthStorage";

// Async thunk to send a message
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ senderId, senderType, receiverId, receiverType, message }, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const response = await axiosInstance.post(
        "/chat/send",
        { senderId, senderType, receiverId, receiverType, message },
        {
          headers: {
            Authorization: `token ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to send message");
    }
  }
);

// Async thunk to send an invitation to a recruiter
export const sendInvite = createAsyncThunk(
  "chat/sendInvite",
  async ({ recruiterId, userId }, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const response = await axiosInstance.post(
        "/chat/accept-invite",
        { recruiterId, userId },
        {
          headers: {
            Authorization: `token ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to send invite");
    }
  }
);

// Async thunk to fetch chat history
export const fetchChatHistory = createAsyncThunk(
  "chat/fetchChatHistory",
  async ({ senderId, receiverId }, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const response = await axiosInstance.get(
        `/chat/history/${senderId}/${receiverId}`,
        {
          headers: {
            Authorization: `token ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch chat history");
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [], // Array of messages in the current chat
    loading: false,
    error: null,
    inviteStatus: null, // To track invite status
  },
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload); // Add new message from WebSocket
    },
    clearChat: (state) => {
      state.messages = [];
      state.error = null;
      state.inviteStatus = null;
    },
  },
  extraReducers: (builder) => {
    // Send Message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(action.payload); // Add the sent message to the state
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.inviteStatus = action.payload.includes("Recruiter has not accepted the invite yet")
          ? "pending"
          : null;
      });

    // Send Invite
    builder
      .addCase(sendInvite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendInvite.fulfilled, (state) => {
        state.loading = false;
        state.inviteStatus = "accepted";
      })
      .addCase(sendInvite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch Chat History
    builder
      .addCase(fetchChatHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload; // Set chat history
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addMessage, clearChat } = chatSlice.actions;
export default chatSlice.reducer;