import mongoose, { Schema } from 'mongoose';

// Adapted from express-mongo-server side SA

// create a PostSchema with a title field
const PostSchema = new Schema({
  title: String,
  tags: String,
  content: String,
  coverUrl: String,
});

// create a PostModel class from schema
const PostModel = mongoose.model('Post', PostSchema);

export default PostModel;
