import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../components/Helpers/axiosinstance.js";
import { storeToken } from "../../storage/AuthStorage.js";

const initialState = {
  registerStatus: "idle",
  verifyStatus: "idle",
  loginStatus: "idle",
  googleLoginStatus: "idle",
};

// register recruiter api
export const registerRecruiterAsync = createAsyncThunk(
  "auth/registerRecruiter",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/v1/recruiter/register", {
        name: credentials.name,
        email: credentials.email,
        password: credentials.password,
      });

      const responseData = response.data;

      if (!responseData.success) {
        return rejectWithValue(responseData.message || "Registration failed");
      }

      return responseData;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Network error. Please try again."
      );
    }
  }
);

// verify recruiter api
export const verifyRecruiterAsync = createAsyncThunk(
  "auth/verifyRecruiter",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/v1/recruiter/verify", {
        email: credentials.email,
        code: credentials.code,
      });

      const responseData = response.data;

      if (!responseData.success) {
        return rejectWithValue(responseData.message || "Verification failed");
      }

      // Store token after successful verification
      if (responseData.token) {
        await storeToken(responseData.token);
      }

      return responseData;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Verification error. Please try again."
      );
    }
  }
);

// login recruiter api
export const loginRecruiterAsync = createAsyncThunk(
  "auth/loginRecruiter",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/v1/recruiter/login", {
        email: credentials.email,
        password: credentials.password,
      });

      const responseData = response.data;

      if (!responseData.success || !responseData.token) {
        return rejectWithValue(responseData.message || "Login failed");
      }

      await storeToken(responseData.token);
      return responseData;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Network error");
    }
  }
);

// login with google api
export const recruiterLoginWithGoogleAsync = createAsyncThunk(
  "user/recruiterLoginWithGoogle",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/v1/recruiter/google", {
        email: credentials.email,
        name: credentials.name,
        googleId: credentials.id,
      });

      const responseData = response.data;

      if (!responseData.success || !responseData.token) {
        return rejectWithValue(responseData.message || "Login failed");
      }

      await storeToken(responseData.token);
      return responseData;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Network error");
    }
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
