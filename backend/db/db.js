import mongoose from "mongoose";

async function connectMongo(){
    try {
        const url = process.env.MONGO_URI
        // const url = 'mongodb://127.0.0.1:27017/SNJL'
        await mongoose.connect(url)  
        console.log('Mongodb Connected')  
    } catch (error) {
        console.log(error.message)
    }
}

export default connectMongo