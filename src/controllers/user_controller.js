import jwt from 'jwt-simple';
import dotenv from 'dotenv';
import User from '../models/user_model';
import Post from '../models/post_model';

// config init
dotenv.config({ silent: true });

export const signin = (user) => {
  return tokenForUser(user);
};

// note the lovely destructuring here indicating that we are passing in an object with these 4 keys
export const signup = async ({
  email, password, displayname, username,
}) => {
  // No email and pw
  if (!email || !password || !displayname || !username) {
    throw new Error('Please fill out all fields.');
  }

  // Check if a user with the given email address exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    // If does exist, return error
    throw new Error('Email is in use');
  }

  // create new user -- edited to reflect user model changes yuh
  const picURL = 'https://cdn.business2community.com/wp-content/uploads/2017/08/blank-profile-picture-973460_640.png';
  const user = new User();
  user.email = email;
  user.username = username;
  user.password = password;
  user.displayname = displayname;
  user.profilePic = picURL;
  user.followingList = [];
  user.followerList = [];
  // each user has their own unique collection of archived posts
  user.archivedFeed = [];
  user.isFollowingListVisible = true;
  user.isFollowerListVisible = true;
  await user.save();
  return tokenForUser(user);
};

export const updateProfilePic = async (userid, url) => {
  // Update photo url
  try {
    const updatedProfile = await User.findByIdAndUpdate(userid, { profilePic: url }, { new: true });
    return updatedProfile;
  } catch (error) {
    throw new Error(`update pfp error: ${error}`);
  }
};

export const getUsers = async () => {
  // All posts
  try {
    const allPosts = await User.find({}, null, { sort: { createdAt: -1 } });
    return allPosts;
  } catch (error) {
    throw new Error(`get posts error: ${error}`);
  }
};

export const addArchive = async (userid, postid) => {
  try {
    // add post to archivedFeed by id
    const user = await User.findById(userid).populate('archivedFeed');
    // checking if post is a duplicate
    let duplicate = false;
    user.archivedFeed.forEach((archievedPost) => {
      if (archievedPost.id === postid) {
        duplicate = true;
      }
    });
    if (!duplicate) {
      const post = await Post.findById(postid);
      user.archivedFeed.unshift(post);
    }
    await user.save();
    return user.archivedFeed;
  } catch (error) {
    throw new Error(`get users error: ${error}`);
  }
};

export const deleteArchive = async (userid, postid) => {
  try {
    // delete post from archivedFeed by id
    const user = await User.findById(userid).populate('archivedFeed');
    let index = 0;
    user.archivedFeed.forEach((archievedPost) => {
      if (archievedPost.id === postid) {
        user.archivedFeed.splice(index, 1);
      }
      index += 1;
    });
    await user.save();
    return user.archivedFeed;
  } catch (error) {
    throw new Error(`get users error: ${error}`);
  }
};

export const getArchivedFeed = async (userid) => {
  try {
    // found out how to deep populate from here: https://stackoverflow.com/questions/18867628/mongoose-deep-population-populate-a-populated-field
    const user = await User.findById(userid).populate({ path: 'archivedFeed', populate: { path: 'author' } });
    return user.archivedFeed;
  } catch (error) {
    throw new Error(`get archived posts error: ${error}`);
  }
};

export const getUser = async (id) => {
  try {
    return await User.findById(id);
  } catch (error) {
    console.log(`get user error: ${error}`);
    throw new Error(`get user error: ${error}`);
  }
};

export const getUserName = async (username) => {
  try {
    return await User.findOne({ username });
  } catch (error) {
    console.log(`get user error: ${error}`);
    throw new Error(`get user error: ${error}`);
  }
};

// helper for encoding a new token for a user object
function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, process.env.AUTH_SECRET);
}

export const search = async (name) => {
  try {
    const user = await User.find({
      username: new RegExp(name, 'gi'),
    }, null, {
      sort: { displayname: 1 },
    });
    return user;
  } catch (error) {
    throw new Error(`get users error: ${error}`);
  }
};
