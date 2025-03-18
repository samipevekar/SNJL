// controllers/userController.js
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
      friend.friendId.toString()
    );
    console.log("friend", loggedInUserFriends);

    // Query to exclude the logged-in user and their friends
    const excludeIds = [loggedInUserId, ...loggedInUserFriends];

    // Fetch random users from the User model
    const randomUsers = await User.aggregate([
      {
        $match: {
          _id: { $nin: excludeIds }, // Exclude logged-in user and friends
        },
      },
      { $sample: { size: 5 } }, // Get 5 random users
      {
        $project: {
          name: 1,
          username: 1,
          profileImage: 1,
          role: 1,
          bio: 1,
          friends: 1, // Include friends to calculate mutual friends
        },
      },
    ]);

    // Fetch random recruiters from the Recruiter model
    const randomRecruiters = await Recruiter.aggregate([
      {
        $match: {
          _id: { $nin: excludeIds }, // Exclude logged-in user and friends
        },
      },
      { $sample: { size: 5 } }, // Get 5 random recruiters
      {
        $project: {
          name: 1,
          email: 1,
          profileImage: 1,
          role: 1,
          friends: 1, // Include friends to calculate mutual friends
        },
      },
    ]);

    // Combine the results
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
            name: 1,
            username: 1,
            profileImage: 1,
            role: 1,
            bio: 1,
            friends: 1,
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
            name: 1,
            email: 1,
            profileImage: 1,
            role: 1,
            friends: 1,
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

    // Calculate mutual friends for each user
    const finalUsers = await Promise.all(
      combinedUsers.map(async (user) => {
        // Extract friend IDs of the random user, default to empty array if undefined
        const userFriends = (user.friends || []).map((friend) =>
          friend.friendId.toString()
        );

        // Find mutual friends by intersecting logged-in user's friends and random user's friends
        const mutualFriendIds = loggedInUserFriends.filter((friendId) =>
          userFriends.includes(friendId)
        );

        // Fetch details of mutual friends from both models
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

        // Filter out any null results and format mutual friends
        const formattedMutualFriends = mutualFriends
          .filter((friend) => friend !== null)
          .map((friend) => ({
            _id: friend._id,
            name: friend.name,
            profileImage: friend.profileImage,
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