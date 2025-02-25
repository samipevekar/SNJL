import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginUser, registerUser, verifyUser } from "../api/userAuthAPi.js";

const initialState = {
  status: "idle",
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

export const userAuthSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(registerUserAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerUserAsync.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(registerUserAsync.rejected, (state) => {
        state.status = "idle";
      })
      .addCase(verifyUserAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(verifyUserAsync.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(verifyUserAsync.rejected, (state) => {
        state.status = "idle";
      })
      .addCase(loginUserAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUserAsync.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(loginUserAsync.rejected, (state) => {
        state.status = "idle";
      });
  },
});

export const selectUserStatus = (state) => state.userAuth.status;

export default userAuthSlice.reducer;
