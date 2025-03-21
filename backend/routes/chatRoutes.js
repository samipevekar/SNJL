import express from 'express';
import { sendMessage, markMessageAsSeen, typing, getChatHistory, sendInvitation, acceptInvitation, getAllChats } from '../controllers/chatController.js';
import { isLoggedIn } from '../middlewares/employerAuthMiddleware.js';

const chatRoutes = express.Router();

chatRoutes.post('/send', isLoggedIn, sendMessage);
chatRoutes.post('/mark-seen', isLoggedIn, markMessageAsSeen);
chatRoutes.post('/typing', isLoggedIn, typing);
chatRoutes.get('/history/:userId', isLoggedIn, getChatHistory);
chatRoutes.post('/invite', isLoggedIn, sendInvitation);
chatRoutes.post('/accept-invite', isLoggedIn, acceptInvitation);
chatRoutes.get('/all-chats', isLoggedIn, getAllChats);

export default chatRoutes;