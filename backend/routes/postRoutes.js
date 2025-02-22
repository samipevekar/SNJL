import {Router} from 'express';
import {
  createPost,
  toggleLike,
  addComment,
  getTrendingPosts,
  getRandomPosts,
<<<<<<< HEAD
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
=======
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
>>>>>>> c4a33076ffea3ea32ee7263582d0720d45db6b97

export default postRoutes;