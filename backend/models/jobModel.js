import mongoose from 'mongoose'

const jobSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    salary:{
        type:Number,
        required:true
    },
    company:{
        type:String,
        required:true
    },
    jobType:{
        type:String,
        enum:["Full-Time","Part-Time","Internship","Remote","Hybrid"],
        required:true
    },
    experience:{
        type:String,
        enum:["Fresher","1-3 Years","3-5 Years","5-10 Years"],
        required:true
    },
    skills:{
        type:[String],
        required:true
    },
    postedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    applicants: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          resume: {
            type: String,
            default:null
          },
          file: { 
            type: String,
            default: null 
          },
          portfolio:{
            type:String
          },
          appliedAt: {
            type: Date,
            default: Date.now,
          },
        }
    ]
      
},{timestamps:true})

jobSchema.index({ title: "text", description: "text" })

const Job = mongoose.model("Job",jobSchema)

export default Job