import User from "../models/userModel.js";
import Fuse from "fuse.js";

export const searchUsers = async (req, res) => {
  try {
    let { query } = req.query;
    query = query.trim();

  
    const regex = new RegExp(`${query}`, "i");
    let matchedUsers = await User.find({
      $or: [{ name: regex }, { firstName: regex }, { lastName: regex }],
    })
      .select("name firstName lastName email")
      .limit(50);

    // If no exact matches, use Fuzzy Search
    if (matchedUsers.length === 0) {
      const allUsers = await User.find().select("name firstName lastName email").limit(100);

      const fuse = new Fuse(allUsers, {
        keys: ["name", "firstName", "lastName"], // Search across multiple fields
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
      data: matchedUsers,
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
