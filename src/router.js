import { Router } from 'express';
import * as Posts from './controllers/post_controller';
import * as UserController from './controllers/user_controller';
import { requireAuth, requireSignin } from './services/passport';
import signS3 from './services/s3';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to Limited Edition Social Media API!' });
});

// In this syntax, req and res are provided as parameters for the functions.

// Learned about routing from https://www.youtube.com/watch?v=JlgKybraoy4 and Tim
// POST /posts: Posts.createPost
// GET /posts: Posts.getPosts
router.route('/posts')
  .post(requireAuth, async (req, res) => {
    // body will have all the json fields. This is what the bodyparser is for.
    await Posts.createPost(req.user, req.body).then((value) => {
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
  .put(requireAuth, async (req, res) => {
    await Posts.updatePost(req.params.id, req.body).then((value) => {
      res.json(value);
    });
  })
  .delete(requireAuth, async (req, res) => {
    await Posts.deletePost(req.params.id).then((value) => {
      res.json({ deleted: value });
    });
  });

// signin route
router.post('/signin', requireSignin, async (req, res) => {
  try {
    const token = UserController.signin(req.user);
    console.log('token created');
    res.json({ token, email: req.user.email });
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

// signup route
router.post('/signup', async (req, res) => {
  try {
    const token = await UserController.signup(req.body);
    res.json({ token, email: req.body.email });
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

router.get('/sign-s3', signS3);

export default router;
