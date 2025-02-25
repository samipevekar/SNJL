import express from "express"
import { createJob, deleteJob, getAllApplicants, getAllJobs, getJobsBySpecificEmployer, getSingleJob, jobApply, searchJob, updateJob } from "../controllers/jobController.js"
import { isLoggedIn } from "../middlewares/employerAuthMiddleware.js"
import upload from "../middlewares/multerMiddleware.js"
import { isUserLoggedIn } from "../middlewares/userAuthMiddleware.js"

const app = express.Router()

// Job Routes
app.post('/',isLoggedIn,createJob)                                     // Create job route
app.get('/',getAllJobs)                                     // Get all jobs
app.get('/employer',isLoggedIn,getJobsBySpecificEmployer)              // Get all applications
app.get('/search',searchJob)                                // Get all applications
app.get('/:id',getSingleJob)                                // Get single job
app.put('/:id',isLoggedIn,updateJob)                                   // Update a job
app.delete('/:id',isLoggedIn,deleteJob)                                // Delete a job
app.post('/apply/:id',isLoggedIn,upload.fields([{ name: "resume" }, { name: "file" }]),jobApply)                             // Apply a job
app.get('/applicants/:id',isLoggedIn,getAllApplicants)                 // Get all applications

export default app