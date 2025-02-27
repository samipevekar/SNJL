import {Router} from 'express';
import {
  createPost,
  toggleLike,
  addComment,
  getTrendingPosts,
  getRandomPosts,
  getFriendPosts,
  deletePost,
  getPostById
} from '../controllers/postController.js';
import upload from '../middlewares/multerMiddleware.js';
import { isLoggedIn } from '../middlewares/employerAuthMiddleware.js';
import { isUserLoggedIn } from '../middlewares/userAuthMiddleware.js';
import { checkAuth } from '../middlewares/checkAuth.js';

const postRoutes = Router();



postRoutes.post("/createpost", isLoggedIn, upload.single("file"), createPost);
postRoutes.patch('/:postId/like',isLoggedIn, toggleLike);
postRoutes.post('/:postId/comment', isLoggedIn, addComment);
postRoutes.get('/trending', getTrendingPosts);
postRoutes.get('/random', getRandomPosts);
postRoutes.get('/friends',isLoggedIn, getFriendPosts);
postRoutes.delete('/:postId',isLoggedIn, deletePost);
postRoutes.get('/:id', getPostById);

export default postRoutes;