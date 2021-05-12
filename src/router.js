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
    await Posts.createPost(req.body).then((value) => {
      res.json(value);
    });
  })
  .get(async (req, res) => {
    // No parameters for this one
    await Posts.getPosts().then((value) => {
      res.json(value);
    });
  });

// GET /posts/:id: Posts.getPost
// PUT /posts/:id: Posts.updatePost
// DELETE /posts/:id: Posts.deletePost
router.route('/posts/:id')
  .get(async (req, res) => {
    // Based on parameters above^ :id
    await Posts.getPost(req.params.id).then((value) => {
      res.json(value);
    });
  })
  .put(async (req, res) => {
    await Posts.updatePost(req.params.id, req.body).then((value) => {
      res.json({ updated: value });
    });
  })
  .delete(async (req, res) => {
    await Posts.deletePost(req.params.id).then((value) => {
      res.json({ deleted: value });
    });
  });

export default router;
