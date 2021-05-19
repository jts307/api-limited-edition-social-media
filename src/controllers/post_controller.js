import Post from '../models/post_model';

export const createPost = async (user, postFields) => {
  // create new post
  const post = new Post();
  post.author = user;
  post.title = postFields.title;
  post.tags = postFields.tags;
  post.content = postFields.content;
  post.coverUrl = postFields.coverUrl;

  try {
    const savedpost = await post.save();
    return savedpost;
  } catch (error) {
    throw new Error(`create post error: ${error}`);
  }
};
export const getPosts = async () => {
  // All posts
  try {
    const allPosts = await Post.find({}).populate('author');
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
