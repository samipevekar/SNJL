import express from 'express';
import { getFriendList, getRecommendations, respondToRequest, sendFriendRequest ,getFriendRequests} from '../controllers/friendController.js';
import { isLoggedIn } from '../middlewares/employerAuthMiddleware.js';

const friendrequestroute = express.Router();

// Send friend request
friendrequestroute.post('/friend-request/:receiverId',isLoggedIn, sendFriendRequest);

// Respond to friend request
friendrequestroute.patch('/friend-requests/:requestId',isLoggedIn, respondToRequest);

// Get all friend requests
friendrequestroute.get('/friend-requests/getrequests',isLoggedIn, getFriendRequests);

// Get friend recommendations
friendrequestroute.get('/:userId/recommendations/:modelType', isLoggedIn, getRecommendations);

// Get paginated friend list
friendrequestroute.get('/:userId/friends/:modelType', isLoggedIn, getFriendList);

export default friendrequestroute;