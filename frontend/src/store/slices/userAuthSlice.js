import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginUser, registerUser, userLoginWithGoogle, verifyUser } from "../api/userAuthAPi.js";

const initialState = {
  registerStatus: "idle",
  verifyStatus: "idle",
  loginStatus: "idle",
  googleLoginStatus: "idle"
};

export const registerUserAsync = createAsyncThunk(
  "user/registerUser",
  async ({ data, navigation, reset }) => {
    const response = await registerUser(data, navigation, reset);
    return response;
  }
);

export const verifyUserAsync = createAsyncThunk(
  "user/verifyUser",
  async ({ email, code, reset, navigation }) => {
    const response = await verifyUser(email, code, reset, navigation);
    return response;
  }
);

export const loginUserAsync = createAsyncThunk(
  "user/loginUser",
  async ({ data, navigation, reset }) => {
    const response = await loginUser(data, navigation, reset);
    return response;
  }
);

export const userLoginWithGoogleAsync = createAsyncThunk(
  "user/userLoginWithGoogle",
  async ({ data, navigation }) => {
    const response = await userLoginWithGoogle(data, navigation);
    return response;
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
      .addCase(verifyUserAsync.fulfilled, (state) => {
        state.verifyStatus = "idle";
      })
      .addCase(verifyUserAsync.rejected, (state) => {
        state.verifyStatus = "idle";
      })
      .addCase(loginUserAsync.pending, (state) => {
        state.loginStatus = "loading";
      })
      .addCase(loginUserAsync.fulfilled, (state) => {
        state.loginStatus = "idle";
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
      })
  },
});

export const selectUserRegisterStatus = (state) => state.userAuth.registerStatus;
export const selectUserLoginStatus = (state) => state.userAuth.loginStatus;
export const selectUserVerifyStatus = (state) => state.userAuth.verifyStatus;
export const selectUserGoogleStatus = (state) => state.userAuth.googleLoginStatus;

export default userAuthSlice.reducer;
