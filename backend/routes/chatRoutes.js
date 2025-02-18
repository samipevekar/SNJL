import express from 'express'
import { sendMessage, acceptInvite, getChatHistory, getChatUsers} from "../controllers/chatController.js"

const router = express.Router();

router.post("/send", sendMessage); // Send a message
router.post("/accept-invite", acceptInvite); // Recruiter accepts invite
router.get("/history/:senderId/:receiverId", getChatHistory); // Get chat history
router.get("/users/:userId", getChatUsers); // Get chat history

export default router
