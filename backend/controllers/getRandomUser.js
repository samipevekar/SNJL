import User from "../models/userModel.js";
import Recruiter from "../models/recruiterModel.js";

// @desc    Get 10 random users (User or Recruiter) excluding friends, with mutual friends
// @route   GET /api/users/random
// @access  Private
const getRandomUsers = async (req, res) => {
  try {
    // Extract logged-in user info from req.user
    const loggedInUserId = req.user.id; // Use 'id' as set by middleware
    
    const loggedInUserRole = req.user.role; // Use 'role' as set by middleware

    // Fetch the full user document based on role and id
    let loggedInUser;
    if (loggedInUserRole === "User") {
      loggedInUser = await User.findById(loggedInUserId).select("-password");
    } else if (loggedInUserRole === "Recruiter") {
      loggedInUser = await Recruiter.findById(loggedInUserId).select("-password");
    }

    if (!loggedInUser) {
      return res.status(404).json({ success: false, message: "Logged-in user not found" });
    }

    // Get the friends list of the logged-in user (as strings for comparison)
    const loggedInUserFriends = (loggedInUser.friends || []).map((friend) =>
      friend.friendId ? friend.friendId.toString() : null
    ).filter(friendId => friendId !== null); // Filter out nulls if friendId is missing
    console.log("Logged-in user friends:", loggedInUserFriends);

    // Query to exclude the logged-in user and their friends
    const excludeIds = [loggedInUserId, ...loggedInUserFriends];
    console.log("Excluded IDs:", excludeIds); // Debug to verify exclusion list

    // Validate that excludeIds contains valid ObjectIds
    if (excludeIds.length === 0) {
      console.log("No friends or self to exclude, proceeding with all users.");
    } else if (excludeIds.some(id => !id.match(/^[0-9a-fA-F]{24}$/))) {
      console.warn("Invalid ObjectId detected in excludeIds, filtering out:", excludeIds);
      excludeIds.filter(id => id.match(/^[0-9a-fA-F]{24}$/));
    }

    // Fetch random users from the User model (all fields except email, password, and phone)
    const randomUsers = await User.aggregate([
      {
        $match: {
          _id: { $nin: excludeIds }, // Exclude logged-in user and friends
        },
      },
      { $sample: { size: 5 } }, // Get 5 random users
      {
        $project: {
          password: 0, // Exclude password
          email: 0,    // Exclude email
          phone: 0,    // Exclude phone
          // Include all other fields by omitting password, email, and phone
        },
      },
    ]);

    // Fetch random recruiters from the Recruiter model (all fields except email, password, and phone)
    const randomRecruiters = await Recruiter.aggregate([
      {
        $match: {
          _id: { $nin: excludeIds }, // Exclude logged-in user and friends
        },
      },
      { $sample: { size: 5 } }, // Get 5 random recruiters
      {
        $project: {
          password: 0, // Exclude password
          email: 0,    // Exclude email
          phone: 0,    // Exclude phone
          // Include all other fields by omitting password, email, and phone
        },
      },
    ]);

    // Combine the results with userModel identifier
    let combinedUsers = [
      ...randomUsers.map((user) => ({
        ...user,
        userModel: "User",
      })),
      ...randomRecruiters.map((recruiter) => ({
        ...recruiter,
        userModel: "Recruiter",
      })),
    ];

    // If fewer than 10 users, fetch more to fill the gap
    if (combinedUsers.length < 10) {
      const remainingCount = 10 - combinedUsers.length;
      const additionalUsers = await User.aggregate([
        {
          $match: {
            _id: { $nin: excludeIds },
          },
        },
        { $sample: { size: remainingCount } },
        {
          $project: {
            password: 0, // Exclude password
            email: 0,    // Exclude email
            phone: 0,    // Exclude phone
          },
        },
      ]);

      const additionalRecruiters = await Recruiter.aggregate([
        {
          $match: {
            _id: { $nin: excludeIds },
          },
        },
        { $sample: { size: remainingCount - additionalUsers.length } },
        {
          $project: {
            password: 0, // Exclude password
            email: 0,    // Exclude email
            phone: 0,    // Exclude phone
          },
        },
      ]);

      combinedUsers = [
        ...combinedUsers,
        ...additionalUsers.map((user) => ({
          ...user,
          userModel: "User",
        })),
        ...additionalRecruiters.map((recruiter) => ({
          ...recruiter,
          userModel: "Recruiter",
        })),
      ];
    }

    // Calculate mutual friends for each user with profile images
    const finalUsers = await Promise.all(
      combinedUsers.map(async (user) => {
        // Extract friend IDs of the random user, default to empty array if undefined
        const userFriends = (user.friends || []).map((friend) =>
          friend.friendId ? friend.friendId.toString() : null
        ).filter(friendId => friendId !== null);

        // Find mutual friends by intersecting logged-in user's friends and random user's friends
        const mutualFriendIds = loggedInUserFriends.filter((friendId) =>
          userFriends.includes(friendId)
        );

        // Fetch details of mutual friends from both models, ensuring profileImage is included
        const mutualFriends = await Promise.all(
          mutualFriendIds.map(async (friendId) => {
            // Determine the model of each friend from the random user's friends array
            const friendInfo = (user.friends || []).find(
              (friend) => friend.friendId.toString() === friendId
            );
            const friendModel = friendInfo?.friendModel;

            if (friendModel === "User") {
              return await User.findById(friendId).select(
                "name profileImage role"
              );
            } else if (friendModel === "Recruiter") {
              return await Recruiter.findById(friendId).select(
                "name profileImage role"
              );
            }
            return null;
          })
        );

        // Filter out any null results and format mutual friends with profileImage
        const formattedMutualFriends = mutualFriends
          .filter((friend) => friend !== null)
          .map((friend) => ({
            _id: friend._id,
            name: friend.name,
            profileImage: friend.profileImage, // Ensure profileImage is included
            role: friend.role,
            userModel: friend.role === "User" ? "User" : "Recruiter",
          }));

        // Remove the friends array from the response (not needed anymore)
        const { friends, ...userWithoutFriends } = user;

        return {
          ...userWithoutFriends,
          mutualFriends: formattedMutualFriends,
          mutualFriendCount: formattedMutualFriends.length,
        };
      })
    );

    // Shuffle the final list to mix Users and Recruiters
    finalUsers.sort(() => Math.random() - 0.5);

    // Return the first 10 users
    res.status(200).json(finalUsers.slice(0, 10));
  } catch (error) {
    console.error("Error in getRandomUsers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { getRandomUsers };