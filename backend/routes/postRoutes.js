import {Router} from 'express';
import {
  createPost,
  toggleLike,
  addComment,
  getTrendingPosts,
  getRandomPosts,
  getFriendPosts
} from '../controllers/postController.js';
import upload from '../middlewares/multerMiddleware.js';
import { isLoggedIn } from '../middlewares/employerAuthMiddleware.js';

const postRoutes = Router();

postRoutes.post("/createpost", isLoggedIn, upload.array("files", 5), createPost);
postRoutes.patch('/:postId/like',  isLoggedIn,toggleLike);
postRoutes.post('/:postId/comment', isLoggedIn,addComment);
postRoutes.get('/trending', getTrendingPosts);
postRoutes.get('/random',isLoggedIn, getRandomPosts);
postRoutes.get('/friends', isLoggedIn,getFriendPosts);

export default postRoutes;