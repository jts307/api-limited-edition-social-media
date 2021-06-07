import { Router } from 'express';
import jwt from 'jwt-simple';
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
    try {
      // body will have all the json fields. This is what the bodyparser is for.
      await Posts.createPost(req.user, req.body).then((value) => {
        res.json(value);
      });
    } catch (error) {
      // or catch the error and send back an error
      res.status(500).json({ error });
    }
  })
  .get(async (req, res) => {
    try {
      // No parameters for this one
      await Posts.getPosts().then((value) => {
        res.json(value);
      });
    } catch (error) {
      // or catch the error and send back an error
      res.status(500).json({ error });
    }
  });

// GET /posts/:id: Posts.getPost
// PUT /posts/:id: Posts.updatePost
// DELETE /posts/:id: Posts.deletePost
router.route('/posts/:id')
  .get(async (req, res) => {
    try {
      // Based on parameters above^ :id
      await Posts.getPost(req.params.id).then((value) => {
        res.json(value);
      });
    } catch (error) {
      // or catch the error and send back an error
      res.status(500).json({ error });
    }
  })
  .put(requireAuth, async (req, res) => {
    try {
      await Posts.updatePost(req.params.id, req.body).then((value) => {
        res.json(value);
      });
    } catch (error) {
      // or catch the error and send back an error
      res.status(500).json({ error });
    }
  })
  .delete(requireAuth, async (req, res) => {
    try {
      await Posts.deletePost(req.params.id).then((value) => {
        res.json({ deleted: value });
      });
    } catch (error) {
      // or catch the error and send back an error
      res.status(500).json({ error });
    }
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

function wrapUndefined(obj) {
  return obj === undefined ? true : obj;
}

router.post('/profile', async (req, res) => {
  try {
    const { sub } = jwt.decode(req.headers.authorization, process.env.AUTH_SECRET);
    const user = await UserController.getUser(sub);
    const response = {
      displayname: user.displayname,
      email: user.email,
      followerList: user.followerList,
      followingList: user.followingList,
      username: user.username,
      badges: user.badges,
      profilePic: user.profilePic,
      id: user.id,
      isFollowingListVisible: wrapUndefined(user.isFollowingListVisible),
      isFollowerListVisible: wrapUndefined(user.isFollowerListVisible),
      isBadgeListVisible: wrapUndefined(user.isBadgeListVisible),
    };
    res.json(response);
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

// archive route
router.post('/archive', async (req, res) => {
  try {
    const { sub } = jwt.decode(req.headers.authorization, process.env.AUTH_SECRET);
    const user = await UserController.getUser(sub);
    const archive = await UserController.addArchive(user.id, req.body.postId);
    res.json(archive);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.toString() });
  }
});

// archiveFeed route
router.get('/archive', async (req, res) => {
  try {
    const { sub } = jwt.decode(req.headers.authorization, process.env.AUTH_SECRET);
    const user = await UserController.getUser(sub);
    const archivefeed = await UserController.getArchivedFeed(user.id);
    res.json(archivefeed);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.toString() });
  }
});

router.post('/profile/follow/:username', async (req, res) => {
  try {
    const { sub } = jwt.decode(req.headers.authorization, process.env.AUTH_SECRET);
    const user = await UserController.getUser(sub);
    const otherUser = await UserController.getUserName(req.params.username);
    if (user === undefined || otherUser === undefined) {
      res.status(400).send({ error: 'Invalid user' });
      return;
    }
    if (!user.followingList.includes(otherUser.id)) {
      user.followingList.push(otherUser.id);
      otherUser.followerList.push(user.id);

      await user.save();
      try {
        await otherUser.save();
      } catch (error) { // Catching version error
        res.status(400).send({ error: 'User cannot follow themselves' });
      }
    }
    res.json({ user: user.followingList, otherUser: otherUser.followerList });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.toString() });
  }
});

router.get('/profile/follow/:username', async (req, res) => {
  try {
    const { sub } = jwt.decode(req.headers.authorization, process.env.AUTH_SECRET);
    const user = await UserController.getUser(sub);
    const otherUser = await UserController.getUserName(req.params.username);
    if (user === undefined || otherUser === undefined) {
      res.status(400).send({ error: 'Invalid user' });
      return;
    }
    res.json(user.followingList.includes(otherUser.id));
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

router.post('/profile/unfollow/:username', async (req, res) => {
  try {
    const { sub } = jwt.decode(req.headers.authorization, process.env.AUTH_SECRET);
    const user = await UserController.getUser(sub);
    const otherUser = await UserController.getUserName(req.params.username);
    if (user === undefined || otherUser === undefined) {
      res.status(400).send({ error: 'Invalid user' });
    }
    if (user.followingList.includes(otherUser.id)) {
      user.followingList.remove(otherUser.id);
      otherUser.followerList.remove(user.id);
      await user.save();
      await otherUser.save();
    }
    res.json({ user: user.followingList, otherUser: otherUser.followerList });
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

router.post('/user/:username', async (req, res) => {
  try {
    const user = await UserController.getUserName(req.params.username);
    if (user === undefined) {
      res.status(400).send({ error: 'Invalid user' });
    }
    const {
      displayname, profilePic,
      followerList, isFollowerListVisible,
      followingList, isFollowingListVisible,
      badges, isBadgeListVisible,
    } = user;
    res.json({
      displayname,
      profilePic,
      followerList,
      isFollowerListVisible: wrapUndefined(isFollowerListVisible),
      followingList,
      isFollowingListVisible: wrapUndefined(isFollowingListVisible),
      badges,
      isBadgeListVisible: wrapUndefined(isBadgeListVisible),
    });
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

router.put('/user/:field', async (req, res) => {
  try {
    const { sub } = jwt.decode(req.headers.authorization, process.env.AUTH_SECRET);
    const user = await UserController.getUser(sub);
    if (user === undefined) {
      res.status(400).send({ error: 'Invalid user' });
    }
    switch (req.params.field) {
      case 'isFollowingListVisible':
        user.isFollowingListVisible = !user.isFollowingListVisible;
        break;
      case 'isFollowerListVisible':
        user.isFollowerListVisible = !user.isFollowerListVisible;
        break;
      case 'isBadgeListVisible':
        user.isBadgeListVisible = !user.isBadgeListVisible;
        break;
      default:
        res.status(422).send('Bad input to profile visible endpoint');
    }

    user.save();
    res.json({
      isFollowingListVisible: user.isFollowingListVisible,
      isFollowerListVisible: user.isFollowerListVisible,
      isBadgeListVisible: user.isBadgeListVisible,
    });
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

router.get('/sign-s3', signS3);

router.get('/search/:username', async (req, res) => {
  try {
    const users = await UserController.search(req.params.username);
    res.json(users);
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
});

export default router;
