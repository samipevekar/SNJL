import express from 'express'
import { sendMessage, acceptInvite, getChatHistory, getChatUsers} from "../controllers/chatController.js"

const chatRoutes = express.Router();

chatRoutes.post("/send", sendMessage); // Send a message
chatRoutes.post("/accept-invite", acceptInvite); // Recruiter accepts invite
chatRoutes.get("/history/:senderId/:receiverId", getChatHistory); // Get chat history
chatRoutes.get("/users/:userId", getChatUsers); // Get chat history

export default chatRoutes;
