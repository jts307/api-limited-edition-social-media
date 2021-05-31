import mongoose, { Schema } from 'mongoose';

// Adapted from express-mongo-server side SA

// edited to create a "post" that has a caption, content,
// which will probably be in the form of a url, an author, which is a User object, viewLimit and current Views
// added in .env to test auth secrets
const PostSchema = new Schema({
  content: String, // the meat of the post, what is shown when a post is clicked
  preview: String, // the preview shown before a post is clicked
  type: String, // the type of content: video or image
  caption: String,
  viewLimit: Number,
  currentViews: Number,
  coverBlur: Number,
  hashtags: [String],
  // placing this below to group the more similar fields above
  author: { type: Schema.Types.ObjectId, ref: 'User' },
},
{
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
});

// create a PostModel class from schema
const PostModel = mongoose.model('Post', PostSchema);

export default PostModel;
