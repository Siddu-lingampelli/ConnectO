import CommunityPost from '../models/CommunityPost.js';
import User from '../models/User.model.js';

// @desc    Get all community posts
// @route   GET /api/community
// @access  Private
export const getCommunityPosts = async (req, res) => {
  try {
    const { postType, category, search, sort = 'recent' } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { isApproved: true };

    // Filter by post type
    if (postType && postType !== 'all') {
      query.postType = postType;
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search in content
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting
    let sortQuery = {};
    switch (sort) {
      case 'popular':
        sortQuery = { 'likes': -1, createdAt: -1 };
        break;
      case 'discussed':
        sortQuery = { 'comments': -1, createdAt: -1 };
        break;
      case 'recent':
      default:
        sortQuery = { isPinned: -1, createdAt: -1 };
    }

    const posts = await CommunityPost.find(query)
      .populate('author', 'fullName email profilePicture role verification city')
      .populate('comments.user', 'fullName profilePicture')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await CommunityPost.countDocuments(query);

    // Add like and comment counts
    const postsWithCounts = posts.map(post => ({
      ...post,
      likeCount: post.likes?.length || 0,
      commentCount: post.comments?.length || 0,
      isLikedByUser: post.likes?.some(like => like.user.toString() === req.user._id.toString())
    }));

    res.json({
      posts: postsWithCounts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPosts: total
    });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single post
// @route   GET /api/community/:id
// @access  Private
export const getPostById = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate('author', 'fullName email profilePicture role verification city rating completedJobs')
      .populate('comments.user', 'fullName profilePicture role');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.viewCount += 1;
    await post.save();

    const postData = post.toObject();
    postData.likeCount = post.likes?.length || 0;
    postData.commentCount = post.comments?.length || 0;
    postData.isLikedByUser = post.likes?.some(like => like.user.toString() === req.user._id.toString());

    res.json(postData);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new post
// @route   POST /api/community
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { content, postType, category, tags, images } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const newPost = new CommunityPost({
      author: req.user._id,
      content,
      postType: postType || 'discussion',
      category: category || 'General',
      tags: tags || [],
      images: images || []
    });

    await newPost.save();
    
    const populatedPost = await CommunityPost.findById(newPost._id)
      .populate('author', 'fullName email profilePicture role verification city');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update post
// @route   PUT /api/community/:id
// @access  Private
export const updatePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const { content, postType, category, tags, images } = req.body;

    if (content) post.content = content;
    if (postType) post.postType = postType;
    if (category) post.category = category;
    if (tags) post.tags = tags;
    if (images) post.images = images;

    await post.save();

    const updatedPost = await CommunityPost.findById(post._id)
      .populate('author', 'fullName email profilePicture role verification city');

    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete post
// @route   DELETE /api/community/:id
// @access  Private
export const deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user is the author or admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await CommunityPost.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Like/Unlike a post
// @route   POST /api/community/:id/like
// @access  Private
export const toggleLike = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === req.user._id.toString()
    );

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push({ user: req.user._id });
    }

    await post.save();

    const updatedPost = await CommunityPost.findById(post._id)
      .populate('author', 'fullName profilePicture role');

    res.json({
      likeCount: updatedPost.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add comment to post
// @route   POST /api/community/:id/comment
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      user: req.user._id,
      content
    });

    await post.save();

    const updatedPost = await CommunityPost.findById(post._id)
      .populate('comments.user', 'fullName profilePicture role');

    res.json(updatedPost.comments);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete comment
// @route   DELETE /api/community/:id/comment/:commentId
// @access  Private
export const deleteComment = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is comment author or post author or admin
    if (
      comment.user.toString() !== req.user._id.toString() &&
      post.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    post.comments.pull(req.params.commentId);
    await post.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's posts
// @route   GET /api/community/my-posts
// @access  Private
export const getMyPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.find({ author: req.user._id })
      .populate('author', 'fullName profilePicture role')
      .sort({ createdAt: -1 })
      .lean();

    const postsWithCounts = posts.map(post => ({
      ...post,
      likeCount: post.likes?.length || 0,
      commentCount: post.comments?.length || 0
    }));

    res.json(postsWithCounts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get trending posts
// @route   GET /api/community/trending
// @access  Private
export const getTrendingPosts = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const posts = await CommunityPost.aggregate([
      {
        $match: {
          isApproved: true,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $addFields: {
          likeCount: { $size: '$likes' },
          commentCount: { $size: '$comments' },
          engagementScore: {
            $add: [
              { $multiply: [{ $size: '$likes' }, 2] },
              { $multiply: [{ $size: '$comments' }, 3] },
              '$viewCount'
            ]
          }
        }
      },
      {
        $sort: { engagementScore: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Populate author details
    await CommunityPost.populate(posts, {
      path: 'author',
      select: 'fullName profilePicture role verification'
    });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
