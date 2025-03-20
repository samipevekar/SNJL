import express from 'express';
import { getFriendList, getRecommendations, respondToRequest, sendFriendRequest ,getFriendRequests} from '../controllers/friendController.js';
import { isLoggedIn } from '../middlewares/employerAuthMiddleware.js';

const friendRoutes = express.Router();

// Send friend request
friendRoutes.post('/friend-request/:receiverId',isLoggedIn, sendFriendRequest);

// Respond to friend request
friendRoutes.patch('/friend-requests/:requestId',isLoggedIn, respondToRequest);

// Get all friend requests
friendRoutes.get('/friend-requests/getrequests',isLoggedIn, getFriendRequests);

// Get friend recommendations
friendRoutes.get('/:userId/recommendations/:modelType', isLoggedIn, getRecommendations);

// Get paginated friend list
friendRoutes.get('/:userId/friends/:modelType', isLoggedIn, getFriendList);

export default friendRoutes;