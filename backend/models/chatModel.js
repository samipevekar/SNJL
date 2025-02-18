import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "senderType"
    },
    senderType: { 
        type: String, 
        enum: ["User", "Recruiter"] 
    },
    receiver: { 
        type: mongoose.Schema.Types.ObjectId, 
        refPath: "receiverType" 
    },
    receiverType: { 
        type: String,
        enum: ["User", "Recruiter"]
    },
    message: {
        type: String,
    },
},{timestamps:true});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat
