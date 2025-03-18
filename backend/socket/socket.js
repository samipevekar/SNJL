import { Server } from 'socket.io'
import { createServer } from 'http'
import express from 'express'

const app = express()

const server = createServer(app)

const io = new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
})

export const getReceiverSocketId = (receiverId)=>{
    console.log("receiverId",receiverId)
    return userSocketMap[receiverId]
}

const userSocketMap = {}

io.on("connection",(socket)=>{
    console.log("user connected ",socket.id)

    let userId = socket.handshake.query.userId
    if(userId){
        userSocketMap[userId] = socket.id 
    }

    io.emit("getOnlineUsers",Object.keys(userSocketMap))

    socket.on("disconnect",()=>{
        console.log("user disconnected",socket.id)
        if(userId){
            delete userSocketMap[userId];
        }
    })
})

export {io, server, app}