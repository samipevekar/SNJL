import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../components/Helpers/axiosinstance.js";
import { storeToken } from "../../storage/AuthStorage.js";
import { storeUserData } from "../../storage/userData.js";

const initialState = {
  registerStatus: "idle",
  verifyStatus: "idle",
  loginStatus: "idle",
  googleLoginStatus: "idle",
  user: {},
  isLoggedIn: false,
};

// register user api
export const registerUserAsync = createAsyncThunk(
  "user/registerUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/v1/user/register", {
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      });

      const responseData = response.data;

      if (!responseData.success) {
        return rejectWithValue(responseData?.message || "Registration failed");
      }

      return responseData;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Network erorr. Please try again"
      );
    }
  }
);

// verify user api
export const verifyUserAsync = createAsyncThunk(
  "user/verifyUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/v1/user/verify", {
        email: credentials.email,
        code: credentials.code,
      });

      const responseData = response.data;

      if (!responseData.success) {
        return rejectWithValue(responseData.message || "Verification failed");
      }

      if (responseData.token) {
        console.log("tokem" ,responseData)
        await storeToken(responseData.token);
        await storeUserData(responseData.worker);
      }

      return responseData;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Verification error. Please try again."
      );
    }
  }
);

// login user api
export const loginUserAsync = createAsyncThunk(
  "user/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      console.log("cre",credentials);
      const response = await axiosInstance.post("/v1/user/login", {
        email: credentials.email,
        password: credentials.password,
      });

      const responseData = response.data;

      if (!responseData.success || !responseData.token) {
        return rejectWithValue(responseData.message || "Login failed");
      }
      console.log("tokem" ,responseData)
      await storeToken(responseData.token);
      await storeUserData(responseData.worker);
      return responseData;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Network error");
    }
  }
);


// login with google api
export const userLoginWithGoogleAsync = createAsyncThunk(
  "user/userLoginWithGoogle",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/v1/user/google", {
        email: credentials.email,
        name: credentials.name,
        googleId: credentials.id,
      });

      const responseData = response.data;

      if (!responseData.success || !responseData.token) {
        return rejectWithValue(responseData?.message || "Login failed");
      }

      await storeToken(responseData.token);
      return responseData;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Network error");
    }
  }
);

export const userAuthSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUserAsync.pending, (state) => {
        state.registerStatus = "loading";
      })
      .addCase(registerUserAsync.fulfilled, (state) => {
        state.registerStatus = "idle";
      })
      .addCase(registerUserAsync.rejected, (state) => {
        state.registerStatus = "idle";
      })
      .addCase(verifyUserAsync.pending, (state) => {
        state.verifyStatus = "loading";
      })
      .addCase(verifyUserAsync.fulfilled, (state,action) => {
        state.verifyStatus = "idle";
        state.isLoggedIn = true;
        state.user = action.payload.worker || {};
      })
      .addCase(verifyUserAsync.rejected, (state) => {
        state.verifyStatus = "idle";
      })
      .addCase(loginUserAsync.pending, (state) => {
        state.loginStatus = "loading";
      })
      .addCase(loginUserAsync.fulfilled, (state,action )=> {
        state.loginStatus = "idle";
        state.isLoggedIn = true;
        state.user = action.payload.worker || {};
      })
      .addCase(loginUserAsync.rejected, (state) => {
        state.loginStatus = "idle";
      })
      .addCase(userLoginWithGoogleAsync.pending, (state) => {
        state.googleLoginStatus = "loading";
      })
      .addCase(userLoginWithGoogleAsync.fulfilled, (state) => {
        state.googleLoginStatus = "idle";
      })
      .addCase(userLoginWithGoogleAsync.rejected, (state) => {
        state.googleLoginStatus = "idle";
      });
  },
});

export const selectUserRegisterStatus = (state) =>
  state.userAuth.registerStatus;
export const selectUserLoginStatus = (state) => state.userAuth.loginStatus;
export const selectUserVerifyStatus = (state) => state.userAuth.verifyStatus;
export const selectUserGoogleStatus = (state) =>
  state.userAuth.googleLoginStatus;

export default userAuthSlice.reducer;
