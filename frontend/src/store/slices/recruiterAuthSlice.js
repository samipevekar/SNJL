import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  // loginRecruiter,
  // registerRecruiter,
  // verifyRecruiter,
} from "../api/recruiterAuthAPi.js";
import axiosInstance from "../../components/Helpers/axiosinstance.js";
import { storeToken } from "../../storage/AuthStorage.js";
// import { CommonActions } from "@react-navigation/native";

const initialState = {
  status: "idle",
};

// export const registerRecruiterAsync = createAsyncThunk(
//   "user/registerRecruiter",
//   async ({ data, navigation, reset }) => {
//     const response = await registerRecruiter(data, navigation, reset);
//     return response;
//   }
// );


export const registerRecruiterAsync = createAsyncThunk(
  'auth/registerRecruiter',
  async (credentials, { rejectWithValue }) => {
  
    try {
      const response = await axiosInstance.post(
        '/recruiter/register',
        {
          name: credentials.name,
          email: credentials.email,
          password: credentials.password
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const responseData = response.data;
      
      if (!responseData.success) {
        return rejectWithValue(responseData.message || 'Registration failed');
      }

      return responseData;

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Network error. Please try again.'
      );
    }
  }
);

// export const verifyRecruiterAsync = createAsyncThunk(
//   "user/verifyRecruiter",
//   async ({ email, code, reset, navigation }) => {
//     const response = await verifyRecruiter(email, code, reset, navigation);
//     return response;
//   }
// );


export const verifyRecruiterAsync = createAsyncThunk(
  'auth/verifyRecruiter',
  async (credentials, { rejectWithValue }) => {
    try {
     
      const response = await axiosInstance.post(
        '/recruiter/verify',
        {
          email: credentials.email,
          code: credentials.code
        },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const responseData = response.data;
      
      if (!responseData.success) {
        return rejectWithValue(responseData.message || 'Verification failed');
      }

      // Store token after successful verification
      if (responseData.token) {
        await storeToken(responseData.token);
      }

      return responseData;

    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 
        'Verification error. Please try again.'
      );
    }
  }
);


// export const loginRecruiterAsync = createAsyncThunk(
//   "user/loginRecruiter",
//   async ({ data, navigation, reset }) => {
    
//     const response = await loginRecruiter(data, navigation, reset);
//     return response;
//   }
// );




export const loginRecruiterAsync = createAsyncThunk(
  'auth/loginRecruiter',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/recruiter/login',
        {
          email: credentials.email,
          password: credentials.password
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const responseData = response.data;
      
      if (!responseData.success || !responseData.token) {
        return rejectWithValue(responseData.message || 'Login failed');
      }

      await storeToken(responseData.token);
      return responseData;

    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Network error');
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
