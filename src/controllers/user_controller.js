import jwt from 'jwt-simple';
import dotenv from 'dotenv';
import User from '../models/user_model';

// config init
dotenv.config({ silent: true });

export const signin = (user) => {
  return tokenForUser(user);
};

// note the lovely destructuring here indicating that we are passing in an object with these 3 keys
export const signup = async ({ email, password, authorname }) => {
  // No email and pw
  if (!email || !password) {
    throw new Error('You must provide email and password');
  }

  // Check if a user with the given email address exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    // If does exist, return error
    throw new Error('Email is in use');
  }

  // create new user
  const user = new User();
  user.email = email;
  user.password = password;
  user.author = authorname;
  await user.save();
  return tokenForUser(user);
};

// helper for encoding a new token for a user object
function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, process.env.AUTH_SECRET);
}
