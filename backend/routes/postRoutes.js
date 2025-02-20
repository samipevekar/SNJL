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



postRoutes.post("/createpost", checkAuth, upload.single("file"), createPost);
postRoutes.patch('/:postId/like',checkAuth, toggleLike);
postRoutes.post('/:postId/comment', checkAuth, addComment);
postRoutes.get('/trending', getTrendingPosts);
postRoutes.get('/random', getRandomPosts);
postRoutes.get('/friends',checkAuth, getFriendPosts);
postRoutes.delete('/:postId',checkAuth, deletePost);
postRoutes.get('/:id',checkAuth, getPostById);

export default postRoutes;