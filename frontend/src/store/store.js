import { configureStore } from "@reduxjs/toolkit";
import userAuthReducer from "./slices/userAuthSlice.js";
import recruiterAuthReducer from "./slices/recruiterAuthSlice.js";
import themeReducer  from './slices/themeSlice.js'
import userReducer from './slices/userSlice.js'
import postReducer from './slices/postSlice.js'
import randomDataReducer from './slices/RandomDataSlice.js'
import chatReducer from './slices/chatSlice.js'
import onlineStatusReducer from './slices/onlineStatusSlice.js'
export const store = configureStore({
  reducer: {
    userAuth: userAuthReducer,
    recruiterAuth: recruiterAuthReducer,
    theme: themeReducer,
    user: userReducer,
    posts: postReducer,
    randomUsers: randomDataReducer,
    chat: chatReducer,
    onlineStatus: onlineStatusReducer,

  },
});
