import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  loginRecruiter,
  recruiterLoginWithGoogle,
  registerRecruiter,
  verifyRecruiter,
} from "../api/recruiterAuthAPi.js";

const initialState = {
  registerStatus: "idle",
  verifyStatus: "idle",
  loginStatus: "idle",
  googleLoginStatus: "idle"
};

export const registerRecruiterAsync = createAsyncThunk(
  "user/registerRecruiter",
  async ({ data, navigation, reset }) => {
    const response = await registerRecruiter(data, navigation, reset);
    return response;
  }
);

export const verifyRecruiterAsync = createAsyncThunk(
  "user/verifyRecruiter",
  async ({ email, code, reset, navigation }) => {
    const response = await verifyRecruiter(email, code, reset, navigation);
    return response;
  }
);

export const loginRecruiterAsync = createAsyncThunk(
  "user/loginRecruiter",
  async ({ data, navigation, reset }) => {
    const response = await loginRecruiter(data, navigation, reset);
    return response;
  }
);

export const recruiterLoginWithGoogleAsync = createAsyncThunk(
  "user/recruiterLoginWithGoogle",
  async ({ data, navigation }) => {
    const response = await recruiterLoginWithGoogle(data, navigation);
    return response;
  }
);

export const recruiterAuthSlice = createSlice({
  name: "recruiter",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerRecruiterAsync.pending, (state) => {
        state.registerStatus = "loading";
      })
      .addCase(registerRecruiterAsync.fulfilled, (state) => {
        state.registerStatus = "idle";
      })
      .addCase(registerRecruiterAsync.rejected, (state) => {
        state.registerStatus = "idle";
      })
      .addCase(verifyRecruiterAsync.pending, (state) => {
        state.verifyStatus = "loading";
      })
      .addCase(verifyRecruiterAsync.fulfilled, (state) => {
        state.verifyStatus = "idle";
      })
      .addCase(verifyRecruiterAsync.rejected, (state) => {
        state.verifyStatus = "idle";
      })
      .addCase(loginRecruiterAsync.pending, (state) => {
        state.loginStatus = "loading";
      })
      .addCase(loginRecruiterAsync.fulfilled, (state) => {
        state.loginStatus = "idle";
      })
      .addCase(loginRecruiterAsync.rejected, (state) => {
        state.loginStatus = "idle";
      })
      .addCase(recruiterLoginWithGoogleAsync.pending, (state) => {
        state.googleLoginStatus = "loading";
      })
      .addCase(recruiterLoginWithGoogleAsync.fulfilled, (state) => {
        state.googleLoginStatus = "idle";
      })
      .addCase(recruiterLoginWithGoogleAsync.rejected, (state) => {
        state.googleLoginStatus = "idle";
      });
  },
});

export const selectRecruiterRegisterStatus = (state) => state.recruiterAuth.registerStatus;
export const selectRecruiterLoginStatus = (state) => state.recruiterAuth.loginStatus;
export const selectRecruiterVerifyStatus = (state) => state.recruiterAuth.verifyStatus;
export const selectRecruiterGoogleStatus = (state) => state.recruiterAuth.googleLoginStatus;

export default recruiterAuthSlice.reducer;
