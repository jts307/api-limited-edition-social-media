import Post from '../models/post_model';

export const createPost = async (user, postFields) => {
  // create new post
  const post = new Post();
  post.author = user;
  post.caption = postFields.caption;
  post.content = postFields.content;
  post.preview = postFields.preview;
  post.type = postFields.type;
  post.viewLimit = postFields.viewLimit;
  post.currentViews = postFields.currentViews;
  post.hashtags = postFields.hashtags;
  post.coverBlur = postFields.coverBlur;
  post.archive = postFields.archive;
  try {
    // await creating a new post, then return it
    const savedpost = await post.save();
    return savedpost;
  } catch (error) {
    throw new Error(`create post error: ${error}`);
  }
};

export const getPosts = async () => {
  // All posts
  try {
    const allPosts = await Post.find({}, null, { sort: { createdAt: -1 } }).populate('author');
    return allPosts;
  } catch (error) {
    throw new Error(`get posts error: ${error}`);
  }
};

export const getPost = async (id) => {
  // Single Post
  try {
    const post = await Post.findById(id).populate('author');
    return post;
  } catch (error) {
    throw new Error(`get post error: ${error}`);
  }
};

export const deletePost = async (id) => {
  // Delete a single post
  try {
    const postToDelete = await Post.findByIdAndDelete(id).populate('author');
    return postToDelete;
  } catch (error) {
    throw new Error(`delete post error: ${error}`);
  }
};

export const updatePost = async (id, postFields) => {
  // Update a single post
  try {
    const updatedPost = await Post.findByIdAndUpdate(id, postFields, { new: true }).populate('author');
    return updatedPost;
  } catch (error) {
    throw new Error(`update post error: ${error}`);
  }
};

