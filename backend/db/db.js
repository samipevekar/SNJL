import mongoose from "mongoose";

async function connectMongo(){
    try {
        const url = process.env.MONGO_URI
        await mongoose.connect(url)  
        console.log('Mongodb Connected')  
    } catch (error) {
        console.log(error.message)
    }
}

export default connectMongo