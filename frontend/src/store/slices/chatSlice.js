// store/slices/chatSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../components/Helpers/axiosinstance';
import { getToken } from '../../storage/AuthStorage';

// Thunk to fetch chat history with pagination
export const fetchChatHistory = createAsyncThunk(
  'chat/fetchChatHistory',
  async ({ senderId, receiverId, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const response = await axiosInstance.get(`/chat/history/${receiverId}`, {
        headers: { Authorization: `token ${token}` },
        params: { page, limit },
      });
      console.log('Fetch chat history response:', response.data);
      return {
        messages: response.data.messages,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error('Fetch chat history error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chat history');
    }
  }
);

// Thunk to send a message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ senderId, senderType, receiverId, receiverType, message }, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const response = await axiosInstance.post(
        '/chat/send',
        { senderId, senderType, receiverId, receiverType, message },
        { headers: { Authorization: `token ${token}` } }
      );
      console.log('Send message response:', response.data);
      return response.data.message;
    } catch (error) {
      console.error('Send message error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

// Thunk to send an invitation
export const sendInvite = createAsyncThunk(
  'chat/sendInvite',
  async ({ receiverId, receiverType }, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const response = await axiosInstance.post(
        '/chat/invite',
        { receiverId, receiverType },
        { headers: { Authorization: `token ${token}` } }
      );
      console.log('Send invite response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Send invite error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to send invitation');
    }
  }
);

// Thunk to accept an invitation
export const acceptInvite = createAsyncThunk(
  'chat/acceptInvite',
  async ({ invitationId }, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const response = await axiosInstance.post(
        '/chat/accept-invite',
        { invitationId },
        { headers: { Authorization: `token ${token}` } }
      );
      console.log('Accept invite response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Accept invite error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to accept invitation');
    }
  }
);

// Thunk to mark a message as seen
export const markMessageAsSeen = createAsyncThunk(
  'chat/markMessageAsSeen',
  async ({ messageId }, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const response = await axiosInstance.post(
        '/chat/mark-seen',
        { messageId },
        { headers: { Authorization: `token ${token}` } }
      );
      console.log('Mark message as seen response:', response.data);
      return { messageId };
    } catch (error) {
      console.error('Mark message as seen error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to mark message as seen');
    }
  }
);



export const fetchAllChats = createAsyncThunk(
  'chat/fetchAllChats',
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const response = await axiosInstance.get('/chat/all-chats', {
        headers: { Authorization: `token ${token}` },
      });
      console.log('Fetch all chats response:', response.data);
      return response.data.chats;
    } catch (error) {
      console.error('Fetch all chats error:', error.response?.data);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all chats');
    }
  }
);

// Create the chat slice
const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: [],
    messages: [],
    loading: false,
    sendingMessage: false,
    markingMessageAsSeen: false,
    acceptingInvite: false, 
    error: null,
    inviteStatus: null,
    typingStatus: false,
    pagination: null,
  },
  reducers: {
    addMessage: (state, action) => {
      console.log('Adding message to state:', action.payload);
      state.messages.unshift(action.payload);
    },
    updateMessageStatus: (state, action) => {
      const { messageId, status } = action.payload;
      console.log('Updating message status:', { messageId, status });
      const message = state.messages.find((msg) => msg._id === messageId);
      if (message) {
        message.status = status;
      }
    },
    setTypingStatus: (state, action) => {
      console.log('Setting typing status:', action.payload);
      state.typingStatus = action.payload;
    },
    clearChat: (state) => {
      console.log('Clearing chat state');
      state.messages = [];
      state.loading = false;
      state.sendingMessage = false;
      state.markingMessageAsSeen = false;
      state.acceptingInvite = false;
      state.error = null;
      state.inviteStatus = null;
      state.typingStatus = false;
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(fetchAllChats.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchAllChats.fulfilled, (state, action) => {
      state.loading = false;
      state.chats = action.payload;
      console.log('All chats updated in state:', state.chats.length, 'chats');
    })
    .addCase(fetchAllChats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
      .addCase(fetchChatHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = [...state.messages,...action.payload.messages];
        state.pagination = action.payload.pagination;
        console.log('Chat history updated in state:', state.messages.length, 'messages');
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sendingMessage = false;
        state.error = action.payload;
      })
      .addCase(sendInvite.pending, (state) => {
        state.sendingInvite = true;
        state.error = null;
      })
      .addCase(sendInvite.fulfilled, (state, action) => {
        state.sendingInvite = false;
        state.inviteStatus = action.payload.status || 'pending';
      })
      .addCase(sendInvite.rejected, (state, action) => {
        state.sendingInvite = false;
        state.error = action.payload;
      })
      .addCase(acceptInvite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptInvite.fulfilled, (state, action) => {
        state.acceptingInvite = false;
        state.inviteStatus = 'accepted';
      })
      .addCase(acceptInvite.rejected, (state, action) => {
        state.acceptingInvite = false;
        state.error = action.payload;
      })
      .addCase(markMessageAsSeen.pending, (state) => {
        state.markingMessageAsSeen = true;
        state.error = null;
      })
      .addCase(markMessageAsSeen.fulfilled, (state, action) => {
        state.markingMessageAsSeen = false;
        const { messageId } = action.payload;
        const message = state.messages.find((msg) => msg._id === messageId);
        if (message) {
          message.status = 'seen';
        }
      })
      .addCase(markMessageAsSeen.rejected, (state, action) => {
        state.markingMessageAsSeen = false;
        state.error = action.payload;
      });
  },
});

export const { addMessage, updateMessageStatus, setTypingStatus, clearChat } = chatSlice.actions;
export default chatSlice.reducer;