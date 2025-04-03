// controllers/userController.js
import User from "../models/userModel.js";
import Recruiter from "../models/recruiterModel.js";
import SearchHistory from "../models/searchHistoryModel.js";
import Fuse from "fuse.js";

export const searchUsers = async (req, res) => {
  try {
    let { query, page = 1, limit = 10, history = false } = req.query;
    query = query ? query.trim() : "";
    const userId = req.user?.id;
    const role = req.user?.role;
    console.log(req.query)

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    const userType = role === "Recruiter" ? "Recruiter" : "User";

    // Fetch search history with pagination
    if (history === "true") {
      const skip = (page - 1) * limit;
      const searchHistory = await SearchHistory.find({ userId, userType })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select("query timestamp")
        .lean();

      const total = await SearchHistory.countDocuments({ userId, userType });

      return res.status(200).json({
        success: true,
        data: searchHistory,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      });
    }

    // Perform search across User and Recruiter
    if (query) {
      // Save search query to history (avoid duplicates within 5 minutes)
      const recentHistory = await SearchHistory.findOne({
        userId,
        userType,
        query,
        timestamp: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
      });
      if (!recentHistory) {
        await SearchHistory.create({ userId, userType, query });
      }

      const regex = new RegExp(`${query}`, "i");

      const matchedUsers = await User.find({
        $or: [{ name: regex }, { firstName: regex }, { lastName: regex }],
      })
        .select("name firstName lastName email profileImage")
        .limit(25)
        .lean();

      const matchedRecruiters = await Recruiter.find({
        $or: [{ name: regex }, { firstName: regex }, { lastName: regex }],
      })
        .select("name firstName lastName email profileImage")
        .limit(25)
        .lean();

      const combinedResults = [
        ...matchedUsers.map((user) => ({ ...user, role: "User" })),
        ...matchedRecruiters.map((recruiter) => ({ ...recruiter, role: "Recruiter" })),
      ];

      if (combinedResults.length === 0) {
        const allUsers = await User.find()
          .select("name firstName lastName email profileImage")
          .limit(50)
          .lean();
        const allRecruiters = await Recruiter.find()
          .select("name firstName lastName email profileImage")
          .limit(50)
          .lean();

        const allEntities = [
          ...allUsers.map((user) => ({ ...user, role: "User" })),
          ...allRecruiters.map((recruiter) => ({ ...recruiter, role: "Recruiter" })),
        ];

        const fuse = new Fuse(allEntities, {
          keys: ["name", "firstName", "lastName"],
          threshold: 0.3,
          distance: 100,
          includeScore: true,
        });

        const fuzzyResults = fuse.search(query);
        const suggestions = fuzzyResults.slice(0, 5).map((result) => ({
          name: result.item.name,
          firstName: result.item.firstName,
          lastName: result.item.lastName,
          email: result.item.email,
          profileImage: result.item.profileImage,
          role: result.item.role, // Consistent with combinedResults
        }));

        return res.status(200).json({
          success: true,
          message: "No exact match found, showing closest matches.",
          data: [],
          suggestions,
        });
      }

      return res.status(200).json({
        success: true,
        data: combinedResults,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Query parameter is required unless fetching search history",
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteSearchHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    const { searchId, clearAll = false } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated",
      });
    }

    const userType = role === "Recruiter" ? "Recruiter" : "User";

    if (clearAll) {
      await SearchHistory.deleteMany({ userId, userType });
      return res.status(200).json({
        success: true,
        message: "All search history cleared",
      });
    }

    if (!searchId) {
      return res.status(400).json({
        success: false,
        message: "Search ID is required unless clearing all history",
      });
    }

    const result = await SearchHistory.findOneAndDelete({ _id: searchId, userId, userType });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Search history entry not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Search history entry deleted",
    });
  } catch (error) {
    console.error("Delete search history error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
