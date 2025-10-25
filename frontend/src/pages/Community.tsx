import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../store/authSlice';
import { communityService } from '../services/communityService';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

interface Author {
  _id: string;
  fullName: string;
  profilePicture?: string;
  role: string;
  verification?: {
    status: string;
  };
  city?: string;
  rating?: number;
  completedJobs?: number;
}

interface Comment {
  _id: string;
  user: {
    _id: string;
    fullName: string;
    profilePicture?: string;
    role: string;
  };
  content: string;
  createdAt: string;
}

interface Post {
  _id: string;
  author: Author;
  content: string;
  postType: string;
  category: string;
  tags: string[];
  images: string[];
  likeCount: number;
  commentCount: number;
  isLikedByUser: boolean;
  comments: Comment[];
  viewCount: number;
  isPinned: boolean;
  createdAt: string;
}

const Community = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostType, setSelectedPostType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    postType: 'discussion',
    category: 'General',
    tags: [] as string[],
    images: [] as string[]
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

  const postTypes = ['all', 'discussion', 'tip', 'question', 'showcase'];
  const categories = ['General', 'Technical', 'Non-Technical', 'Business Tips', 'Client Advice', 'Success Stories', 'Help & Support'];

  useEffect(() => {
    loadPosts();
  }, [selectedPostType, selectedCategory, searchQuery, sortBy, currentPage]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await communityService.getPosts({
        postType: selectedPostType,
        category: selectedCategory,
        search: searchQuery,
        sort: sortBy,
        page: currentPage,
        limit: 10
      });
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch (error: any) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load community posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.content.trim()) {
      toast.error('Please enter post content');
      return;
    }

    try {
      await communityService.createPost(newPost);
      toast.success('Post created successfully!');
      setShowCreateModal(false);
      setNewPost({
        content: '',
        postType: 'discussion',
        category: 'General',
        tags: [],
        images: []
      });
      loadPosts();
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error(error.response?.data?.message || 'Failed to create post');
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const result = await communityService.toggleLike(postId);
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, likeCount: result.likeCount, isLikedByUser: result.isLiked }
          : post
      ));
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const handleAddComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      const comments = await communityService.addComment(postId, content);
      setPosts(posts.map(post => 
        post._id === postId 
          ? { ...post, comments, commentCount: comments.length }
          : post
      ));
      setCommentInputs({ ...commentInputs, [postId]: '' });
      toast.success('Comment added!');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await communityService.deletePost(postId);
      toast.success('Post deleted successfully');
      loadPosts();
    } catch (error: any) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'tip': return '💡';
      case 'question': return '❓';
      case 'showcase': return '🌟';
      default: return '💬';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#E3EFD3] via-white to-[#F8FBF9]">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#345635] to-[#6B8F71] rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">🌐 Community Hub</h1>
              <p className="text-[#E3EFD3] text-lg">
                Connect, Share, and Learn Together
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-white text-[#345635] rounded-xl hover:shadow-xl transition-all font-semibold hover:scale-105"
            >
              ✍️ Create Post
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-[#0D2B1D] mb-3">🔍 Search</h3>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B8F71] focus:border-transparent"
              />
            </div>

            {/* Post Type Filter */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-[#0D2B1D] mb-3">📝 Post Type</h3>
              <div className="space-y-2">
                {postTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedPostType(type)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                      selectedPostType === type
                        ? 'bg-[#345635] text-white'
                        : 'hover:bg-[#E3EFD3] text-[#345635]'
                    }`}
                  >
                    {getPostTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-[#0D2B1D] mb-3">🏷️ Category</h3>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B8F71] focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-[#0D2B1D] mb-3">⚡ Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B8F71] focus:border-transparent"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="discussed">Most Discussed</option>
              </select>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#345635]"></div>
                <p className="mt-4 text-[#6B8F71]">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <span className="text-6xl mb-4 block">📭</span>
                <h3 className="text-xl font-semibold text-[#0D2B1D] mb-2">No Posts Yet</h3>
                <p className="text-[#6B8F71] mb-6">Be the first to start a conversation!</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-[#345635] text-white rounded-lg hover:bg-[#6B8F71] transition-all"
                >
                  Create First Post
                </button>
              </div>
            ) : (
              posts.map(post => (
                <div key={post._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all">
                  {/* Post Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-[#345635] to-[#6B8F71] flex items-center justify-center text-white text-lg font-bold cursor-pointer"
                          onClick={() => navigate(`/profile/${post.author._id}`)}
                        >
                          {post.author.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 
                              className="font-semibold text-[#0D2B1D] cursor-pointer hover:text-[#345635]"
                              onClick={() => navigate(`/profile/${post.author._id}`)}
                            >
                              {post.author.fullName}
                            </h3>
                            {post.author.verification?.status === 'verified' && (
                              <span className="text-blue-500" title="Verified">✓</span>
                            )}
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              post.author.role === 'provider' 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {post.author.role}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span>{formatDate(post.createdAt)}</span>
                            {post.author.city && <span>📍 {post.author.city}</span>}
                            <span>{getPostTypeIcon(post.postType)} {post.postType}</span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded-full text-[#345635]">{post.category}</span>
                          </div>
                        </div>
                      </div>
                      {post.author._id === currentUser?._id && (
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-6">
                    <p className="text-[#0D2B1D] whitespace-pre-wrap">{post.content}</p>
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {post.tags.map((tag, idx) => (
                          <span key={idx} className="px-3 py-1 bg-[#E3EFD3] text-[#345635] rounded-full text-sm">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Post Actions */}
                  <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center gap-2 transition-all ${
                          post.isLikedByUser ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                        }`}
                      >
                        <span className="text-xl">{post.isLikedByUser ? '❤️' : '🤍'}</span>
                        <span className="font-medium">{post.likeCount}</span>
                      </button>
                      <button
                        onClick={() => setExpandedComments({ ...expandedComments, [post._id]: !expandedComments[post._id] })}
                        className="flex items-center gap-2 text-gray-600 hover:text-[#345635] transition-all"
                      >
                        <span className="text-xl">💬</span>
                        <span className="font-medium">{post.commentCount}</span>
                      </button>
                      <div className="flex items-center gap-2 text-gray-500">
                        <span>👁️</span>
                        <span className="text-sm">{post.viewCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {expandedComments[post._id] && (
                    <div className="px-6 pb-6 border-t border-gray-200">
                      {/* Add Comment */}
                      <div className="mt-4 flex gap-3">
                        <input
                          type="text"
                          value={commentInputs[post._id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                          placeholder="Write a comment..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B8F71] focus:border-transparent"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddComment(post._id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(post._id)}
                          className="px-6 py-2 bg-[#345635] text-white rounded-lg hover:bg-[#6B8F71] transition-all"
                        >
                          Post
                        </button>
                      </div>

                      {/* Comments List */}
                      <div className="mt-4 space-y-4">
                        {post.comments.map(comment => (
                          <div key={comment._id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6B8F71] to-[#AEC3B0] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {comment.user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm text-[#0D2B1D]">{comment.user.fullName}</span>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  comment.user.role === 'provider' 
                                    ? 'bg-purple-100 text-purple-700' 
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {comment.user.role}
                                </span>
                                <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E3EFD3] transition-all"
                >
                  ← Previous
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        currentPage === page
                          ? 'bg-[#345635] text-white'
                          : 'bg-white border border-gray-300 hover:bg-[#E3EFD3]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E3EFD3] transition-all"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#0D2B1D]">✍️ Create New Post</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Post Type */}
              <div>
                <label className="block text-sm font-semibold text-[#0D2B1D] mb-2">Post Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {postTypes.filter(t => t !== 'all').map(type => (
                    <button
                      key={type}
                      onClick={() => setNewPost({ ...newPost, postType: type })}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        newPost.postType === type
                          ? 'bg-[#345635] text-white'
                          : 'bg-gray-100 text-[#345635] hover:bg-[#E3EFD3]'
                      }`}
                    >
                      {getPostTypeIcon(type)} {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-[#0D2B1D] mb-2">Category</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B8F71] focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-semibold text-[#0D2B1D] mb-2">Content</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share your thoughts, tips, or questions..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B8F71] focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{newPost.content.length}/2000 characters</p>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-[#0D2B1D] mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g., nodejs, react, tips"
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B8F71] focus:border-transparent"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={!newPost.content.trim()}
                className="px-6 py-2 bg-[#345635] text-white rounded-lg hover:bg-[#6B8F71] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Community;
