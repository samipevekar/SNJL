import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  loginRecruiter,
  registerRecruiter,
  verifyRecruiter,
} from "../api/recruiterAuthAPi.js";

const initialState = {
  status: "idle",
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

export const recruiterAuthSlice = createSlice({
  name: "recruiter",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerRecruiterAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerRecruiterAsync.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(registerRecruiterAsync.rejected, (state) => {
        state.status = "idle";
      })
      .addCase(verifyRecruiterAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(verifyRecruiterAsync.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(verifyRecruiterAsync.rejected, (state) => {
        state.status = "idle";
      })
      .addCase(loginRecruiterAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginRecruiterAsync.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(loginRecruiterAsync.rejected, (state) => {
        state.status = "idle";
      });
  },
});

export const selectRecruiterStatus = (state) => state.recruiterAuth.status;

export default recruiterAuthSlice.reducer;
