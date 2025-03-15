import { configureStore } from "@reduxjs/toolkit";
import userAuthReducer from "./slices/userAuthSlice.js";
import recruiterAuthReducer from "./slices/recruiterAuthSlice.js";
import themeReducer  from './slices/themeSlice.js'
import userReducer from './slices/userSlice.js'
import postReducer from './slices/postSlice.js'
export const store = configureStore({
  reducer: {
    userAuth: userAuthReducer,
    recruiterAuth: recruiterAuthReducer,
    theme: themeReducer,
    user: userReducer,
    posts: postReducer
  },
});
