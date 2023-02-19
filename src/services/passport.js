import passport from 'passport';
import LocalStrategy from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';

import User from '../models/user_model';

// loads in .env file if needed
dotenv.config({ silent: true });

// options for local strategy, we'll use email AS the username
// not have separate ones
const localOptions = { usernameField: 'email' };

// options for jwt strategy
// we'll pass in the jwt in an `authorization` header
// so passport can find it there
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: process.env.AUTH_SECRET,
};
// NOTE: we are not calling this a bearer token (although it technically is), if you see people use Bearer in front of token on the internet you could either ignore it, use it but then you have to parse it out here as well as prepend it on the frontend.

// username/email + password authentication strategy
const localLogin = new LocalStrategy(localOptions, async (email, password, done) => {
  let user;
  let isMatch;
  try {
    user = await User.findOne({ email });
    isMatch = await user?.comparePassword(password);
  } catch (error) {
    // calls done with an error if either findOne or the comparePassword functions fail
    return done(error);
  }

  if (!user) {
    // If we don't have a user in the first place, then we return done with null, false because there is no user to log on to
    return done(null, false);
  } else if (!isMatch) {
    // If the password is not a match, then we done with false because we shouldn't allow the user to log in
    return done(null, false);
  } else {
    // If we have a user and we have a match in password, then we done with the user because we want to allow the user to locally login.
    return done(null, user);
  }
});

const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
  // is called with confirmed jwt we just need to confirm that user exits
  let user;
  try {
    user = await User.findById(payload.sub);
  } catch (error) {
    // If there is an error when awaiting for findById, we return done with an error and false saying user doesn't exist
    done(error, false);
  }
  if (user) {
    // If we find the user, we return done with the user indicating the user does exist
    done(null, user);
  } else {
    // If no user was found, then we return done with false so that it indicates a user with given id does not exist.
    done(null, false);
  }
});

// Tell passport to use this strategy
passport.use(jwtLogin); // for 'jwt'
passport.use(localLogin); // for 'local'

// middleware functions to use in routes
export const requireAuth = passport.authenticate('jwt', { session: false });
export const requireSignin = passport.authenticate('local', { session: false });
