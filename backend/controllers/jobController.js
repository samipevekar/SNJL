import Job from "../models/jobModel.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Create a job
export const createJob = async (req, res) => {
  // const userId = "65c778ab12df56789abc1234"; //65c778ab12df56789abc1239
  // console.log(req.user.id)
  const userId = req.user.id
  const role = req.user.role

  try {

    if(role !== 'Recruiter'){
      return res.status(401).json({ message: "You cannot create a job"})
    }

    const job = new Job({ ...req.body, postedBy: userId });
    let savedJob = await job.save();
    res.status(200).json(savedJob);
  } catch (error) {
    res.status(500).send("Internal Server Error");
    console.log("Error in createJob function", error.message);
  }
};

// Get all jobs
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({});
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).send("Internal Server Error");
    console.log("Error in getAllJobs function", error.message);
  }
};

// Get specific job
export const getSingleJob = async (req, res) => {
  const { id } = req.params;
  try {
    const job = await Job.findById(id);
    res.status(200).json(job);
  } catch (error) {
    res.status(500).send("Internal Server Error");
    console.log("Error in getSingleJobs function", error.message);
  }
};

// Update specific job
export const updateJob = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id

  try {

    let createdJob = await Job.findById(id)
    if(createdJob.postedBy.toString() !== userId){
      return res.status(401).json({message: "You are not authorized to update this job"})
    }

    let job = await Job.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(job);
  } catch (error) {
    res.status(500).send("Internal Server Error");
    console.log("Error in updateJob function", error.message);
  }
};

// Delete specifc job
export const deleteJob = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id
  try {
    let createdJob = await Job.findById(id)
    if(createdJob.postedBy.toString() !== userId){
      return res.status(401).json({message: "You are not authorized to delete this job"})
    }

    const job = await Job.findByIdAndDelete(id, req.body, { new: true });
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).send("Internal Server Error");
    console.log("Error in deleteJob function", error.message);
  }
};

// Apply for a job
export const jobApply = async (req, res) => {
  const { id } = req.params;
  const user = req.user.id
  const { portfolio } = req.body;

  const resume = req.files?.resume ? req.files.resume[0].path : null;
  const file = req.files?.file ? req.files.file[0].path : null;

  try {
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // check user already applied for this job or not
    let alreadyApplied = await job.applicants.find((elt)=>elt.user.toString() === user)
    if(alreadyApplied){
      return res.status(400).json({ message: "You already applied for this job" })
    }

    // upload resume on Cloudinary in raw format 
    let uploadedResume;
    if (resume) {
      uploadedResume = await uploadOnCloudinary(resume, "raw");
      if (!uploadedResume) {
        return res.status(500).json({ message: "Resume upload failed" });
      }
    }

    // upload file on cloudinary
    let uploadedFile;
    if (file) {
      uploadedFile = await uploadOnCloudinary(file, "auto");
      if (!uploadedFile) {
        return res.status(500).json({ message: "File upload failed" });
      }
    }

    // add applicant 
    job.applicants.push({
      user: user,
      resume: uploadedResume ? uploadedResume.secure_url : null,
      file: uploadedFile ? uploadedFile.secure_url : null,
      portfolio: portfolio,
    });

    await job.save();
    res.status(200).json({ message: "Application submitted successfully", job });
  } catch (error) {
    res.status(500).send("Internal Server Error");
    console.log("Error in jobApply function", error.message);
  }
};



// Get all applications for a job
export const getAllApplicants = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id

  try {
    let job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if(job.postedBy.toString() !== userId){
      return res.status(403).json({ message: "You are not authorized to view this job"})
    }

    let applications = job.applicants.map((applicant) => applicant);
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).send("Internal Server Error");
    console.log("Error in getAllApplications function", error.message);
  }
};

// Get all jobs created by specific employer
export const getJobsBySpecificEmployer = async (req, res) => {
  const { id } = req.user

  try {
    const jobs = await Job.find({ postedBy: id });
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).send("Internal Server Error");
    console.log("Error in getJobsBySpecificEmployer function", error.message);
  }
};

// Search for a job
export const searchJob = async (req, res) => {
    try {
        const { query, company, location, salary, jobType, experience, skills } = req.query;
        let filter = {};
    
        // Full-Text Search (Only if query is provided)
        let projection = {};
        if (query) {
          filter.$text = { $search: query };
          projection = { score: { $meta: "textScore" } }; // Include score only for text search
        }
    
        //  Additional Filters
        if (company) filter.company = new RegExp(company, "i");
        if (location) filter.location = new RegExp(location, "i");
        if (salary) filter.salary = { $gte: Number(salary) };
        if (jobType) filter.jobType = jobType;
        if (experience) filter.experience = experience;
        if (skills) {
          const skillsArray = skills.split(",");
          filter.skills = { $in: skillsArray };
          console.log(skillsArray)
        }
    
        // Fetch jobs
        const jobs = await Job.find(filter, projection)
          .sort(query ? { score: { $meta: "textScore" } } : {}) // Sort by textScore only if searching
        //   .limit(20);
    
        res.status(200).json(jobs);
      } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
      }
};
