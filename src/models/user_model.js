import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Adapted from express-mongo-server side SA
// edited user model to have a following and follower list, which are arrays of User objects
const UserSchema = new Schema({
  email: { type: String, unique: true, lowercase: true },
  password: { type: String },
  username: { type: String },
  displayname: { type: String },
  followingList: { type: [Schema.Types.ObjectId], ref: 'User' },
  followerList: { type: [Schema.Types.ObjectId], ref: 'User' },
  profilePic: { type: String },
  badges: { type: [Schema.Types.ObjectId], ref: 'User' },
},
{
  toObject: { virtuals: true },
  toJSON: {
    virtuals: true,
    transform(doc, ret, options) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
      delete ret.__v;
      return ret;
    },
  },
  timestamps: true,
});

UserSchema.pre('save', async function beforeUserSave(next) {
  // this is a reference to our model,
  // the function runs in some other context, no binding
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    return next();
  } catch (error) {
    return next(error);
  }
});

// Check to see if the candidate password is identical to the real password.
UserSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  const comparison = await bcrypt.compare(candidatePassword, this.password);
  return comparison;
};

// create a PostModel class from schema
// UserSchema.index({ username: 'text' });
const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
