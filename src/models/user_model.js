import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Adapted from express-mongo-server side SA

// create a PostSchema with a title field
const UserSchema = new Schema({
  email: { type: String, unique: true, lowercase: true },
  password: { type: String },
  author: { type: String },
},
{
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true,
});

UserSchema.pre('save', async function beforeUserSave(next) {
  // this is a reference to our model,
  // the function runs in some other context, no binding
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);

  user.password = hash;
  console.log(user.password);
  return next();
});

UserSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  console.log('getting here');
  console.log(candidatePassword);
  console.log(this.password);
  const comparison = await bcrypt.compare(candidatePassword, this.password);
  console.log(comparison);
  return comparison;
};

// create a PostModel class from schema
const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
