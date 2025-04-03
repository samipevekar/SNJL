// redux/slices/postSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../components/Helpers/axiosinstance";
import { getToken } from "../../storage/AuthStorage";


export const fetchUserPosts = createAsyncThunk(
  "posts/fetchUserPosts",
  async (userId, { rejectWithValue }) => {
    try {
      // console.log("userid", userId);
      const token = await getToken();
      // console.log("token", token);
      const response = await axiosInstance.get(`/posts/${userId}`, {
        headers: {
          Authorization: `token ${token}`,
        },
        params: {
          offset: 0,
          limit: 10,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch posts");
    }
  }
);

export const toggleLikePost = createAsyncThunk(
  "posts/toggleLikePost",
  async ({ postId, optimisticLikes }, { rejectWithValue, getState }) => {
    const state = getState();
    console.log("xyz",optimisticLikes)
    const originalPost = state.posts.posts.find((p) => p._id === postId);
    const originalLikes = originalPost ? [...originalPost.likes] : []; // Backup original likes

    try {
    
      const token = await getToken();
      
      const response = await axiosInstance.patch(
        `/posts/${postId}/like`,
        {},
        {
          headers: {
            Authorization: `token ${token}`,
          },
        }
      );
    
      return { postId, likes: response.data.likes }; // Server-confirmed likes
    } catch (error) {
      // Revert to original likes on failure
      return rejectWithValue({
        error: error.response?.data?.error || "Failed to toggle like",
        originalLikes,
        postId,
      });
    }
  }
);


export const toggleSavePost = createAsyncThunk(
  "posts/toggleSavePost",
  async (postId, { rejectWithValue, getState }) => {
    const state = getState();
  
    // const isSaved = state.posts
 
    const isSaved = state.posts?.savedPosts.some((id) => id === postId);
    console.log("savepost",isSaved)

    try {
      const token = await getToken();
      const response = await axiosInstance.patch(
        `/posts/${postId}/save`,
        {},
        { headers: { Authorization: `token ${token}` } }
      );
      return { postId, isSaved: response.data.isSaved }; // Backend returns { isSaved: true/false }
    } catch (error) {
      return rejectWithValue({
        error: error.response?.data?.error || "Failed to toggle save",
        postId,
        isSaved,
      });
    }
  }
);

export const fetchSavedPosts = createAsyncThunk(
  "posts/fetchSavedPosts",
  async (_, { rejectWithValue }) => {
    try {
      const token = await getToken();
      const response = await axiosInstance.get("/api/saved-posts", {
        headers: { Authorization: `token ${token}` },
        params: { page: 1, limit: 10 },
      });
      return response.data.savedPosts.map((post) => post._id); // Store only post IDs
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || "Failed to fetch saved posts");
    }
  }
);

const postSlice = createSlice({
  name: "posts",
  initialState: {
    posts: [],
    savedPosts: [],
    loading: false,
    error: null,
    total: 0,
    nextOffset: null,
  },
  reducers: {
    clearPosts: (state) => {
      state.posts = [];
      state.total = 0;
      state.nextOffset = null;
    },
    // Optimistic update reducer
    updateLikesOptimistically: (state, action) => {
      
      const { postId, optimisticLikes } = action.payload;
      const post = state.posts.find((p) => p._id === postId);
      if (post) {
        post.likes = optimisticLikes;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts;
        state.total = action.payload.total;
        state.nextOffset = action.payload.nextOffset;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleLikePost.pending, (state, action) => {
        state.loading = true;
        const { postId, optimisticLikes } = action.meta.arg;
        
        const post = state.posts.find((p) => p._id === postId);
       
        if (post) {
          post.likes = optimisticLikes; // Apply optimistic update immediately
        }
       
      })
      .addCase(toggleLikePost.fulfilled, (state, action) => {
        state.loading = false;
      
        const { postId, likes } = action.payload;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.likes = likes; // Update with server-confirmed likes
          console.log("Updated post with server data:", post);
        }
      })
      .addCase(toggleLikePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error;
        const { postId, originalLikes } = action.payload;
        const post = state.posts.find((p) => p._id === postId);
        if (post) {
          post.likes = originalLikes; // Revert to original likes on failure
          console.log("Reverted post likes due to error:", post);
        }
      })
      .addCase(toggleSavePost.pending, (state, action) => {
        state.loading = true;
        const postId = action.meta.arg;
        const isCurrentlySaved = state.savedPosts.includes(postId);
        if (isCurrentlySaved) {
          state.savedPosts = state.savedPosts.filter((id) => id !== postId);
        } else {
          state.savedPosts.push(postId);
        }
      })
      .addCase(toggleSavePost.fulfilled, (state, action) => {
        state.loading = false;
        const { postId, isSaved } = action.payload;
        if (isSaved && !state.savedPosts.includes(postId)) {
          state.savedPosts.push(postId);
        } else if (!isSaved) {
          state.savedPosts = state.savedPosts.filter((id) => id !== postId);
        }
      })
      .addCase(toggleSavePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.error;
        const { postId, isSaved } = action.payload;
        // Revert optimistic update
        if (isSaved && !state.savedPosts.includes(postId)) {
          state.savedPosts.push(postId);
        } else if (!isSaved) {
          state.savedPosts = state.savedPosts.filter((id) => id !== postId);
        }
      })
      // Fetch Saved Posts
      .addCase(fetchSavedPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSavedPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.savedPosts = action.payload;
      })
      .addCase(fetchSavedPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPosts, updateLikesOptimistically } = postSlice.actions;
export default postSlice.reducer;