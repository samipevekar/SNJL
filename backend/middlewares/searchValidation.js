export const searchValidation = (req, res, next) => {
    const { query } = req.query;
  
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Search query is required and must be a text string.",
      });
    }
  
    if (query.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters long.",
      });
    }
  
    // Ensure the query contains only letters and spaces (no numbers or special characters)
    if (!/^[A-Za-z\s]+$/.test(query.trim())) {
      return res.status(400).json({
        success: false,
        message: "Search query must contain only letters and spaces.",
      });
    }
  
    next();
  };
  