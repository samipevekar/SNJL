import { configureStore } from "@reduxjs/toolkit";
import userAuthReducer from "./slices/userAuthSlice.js";
import recruiterAuthReducer from "./slices/recruiterAuthSlice.js";

export const store = configureStore({
  reducer: {
    userAuth: userAuthReducer,
    recruiterAuth: recruiterAuthReducer,
  },
});
