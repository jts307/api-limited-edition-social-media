import mongoose, { Schema } from 'mongoose';

// Adapted from express-mongo-server side SA

// create a PostSchema with a title field
const PostSchema = new Schema({
  content: String,
  caption: String,
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  viewLimit: Number,
  currentViews: Number,
});

// create a PostModel class from schema
const PostModel = mongoose.model('Post', PostSchema);

export default PostModel;
