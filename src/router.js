import { Router } from 'express';
import * as Posts from './controllers/post_controller';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'welcome to our horror post api!' });
});

/// your routes will go here
// In this syntax, req and res are provided as parameters for the functions.

// Learned about routing from https://www.youtube.com/watch?v=JlgKybraoy4 and Tim
// POST /posts: Posts.createPost
// GET /posts: Posts.getPosts
router.route('/posts')
  .post(async (req, res) => {
    // body will have all the json fields. This is what the bodyparser is for.
    Posts.createPost(req.body);
  })
  .get(async (req, res) => {
    // No parameters for this one
    Posts.getPosts();
  });

// GET /posts/:id: Posts.getPost
// PUT /posts/:id: Posts.updatePost
// DELETE /posts/:id: Posts.deletePost
router.route('/posts/:id')
  .get(async (req, res) => {
    // Based on parameters above^ :id
    Posts.getPost(req.params.id);
  })
  .put(async (req, res) => {
    Posts.updatePost(req.params.id, req.body);
  })
  .delete(async (req, res) => {
    Posts.deletePost(req.params.id);
  });

export default router;
