import mongoose, { Schema } from 'mongoose';

// Adapted from express-mongo-server side SA

// edited to create a "post" that has a caption, content, which will probably be in the form of a url, an author, which is a User object, viewLimit and current Views
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
