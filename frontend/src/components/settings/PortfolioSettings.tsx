import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { userService } from '../../services/userService';
import { updateUser } from '../../store/authSlice';
import type { User } from '../../types';

interface PortfolioItem {
  title: string;
  description?: string;
  type: 'image' | 'video' | 'link' | 'github';
  url: string;
  thumbnail?: string;
  tags?: string[];
  createdAt?: Date | string;
}

interface PortfolioSettingsProps {
  user: User;
}

const PortfolioSettings = ({ user }: PortfolioSettingsProps) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(user.portfolio || []);
  
  const [newItem, setNewItem] = useState<PortfolioItem>({
    title: '',
    description: '',
    type: 'image',
    url: '',
    thumbnail: '',
    tags: []
  });
  
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !newItem.tags?.includes(tagInput.trim())) {
      setNewItem({
        ...newItem,
        tags: [...(newItem.tags || []), tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewItem({
      ...newItem,
      tags: newItem.tags?.filter(t => t !== tag) || []
    });
  };

  const handleAddPortfolioItem = async () => {
    if (!newItem.title.trim() || !newItem.url.trim()) {
      toast.error('Title and URL are required');
      return;
    }

    try {
      setLoading(true);
      const updatedPortfolio = [...portfolio, { ...newItem, createdAt: new Date() }];
      
      const updatedUser = await userService.updateProfile({ portfolio: updatedPortfolio });
      dispatch(updateUser(updatedUser));
      setPortfolio(updatedPortfolio);
      
      // Reset form
      setNewItem({
        title: '',
        description: '',
        type: 'image',
        url: '',
        thumbnail: '',
        tags: []
      });
      setShowAddForm(false);
      toast.success('Portfolio item added successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add portfolio item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePortfolioItem = async (index: number) => {
    if (!window.confirm('Are you sure you want to delete this portfolio item?')) {
      return;
    }

    try {
      setLoading(true);
      const updatedPortfolio = portfolio.filter((_, i) => i !== index);
      
      const updatedUser = await userService.updateProfile({ portfolio: updatedPortfolio });
      dispatch(updateUser(updatedUser));
      setPortfolio(updatedPortfolio);
      toast.success('Portfolio item deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete portfolio item');
    } finally {
      setLoading(false);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'github': return '💻';
      case 'link': return '🔗';
      default: return '📄';
    }
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'image': return 'Image';
      case 'video': return 'Video';
      case 'github': return 'GitHub';
      case 'link': return 'Link';
      default: return 'Other';
    }
  };

  if (user.role !== 'provider') {
    return (
      <div className="text-center py-12">
        <span className="text-4xl mb-3 block">💼</span>
        <p className="text-gray-600">Portfolio is only available for service providers.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Portfolio Showcase</h2>
          <p className="text-gray-600 mt-1">Showcase your work to attract more clients</p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Portfolio Item
          </button>
        )}
      </div>

      {/* Add Portfolio Form */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Portfolio Item</h3>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="e.g., Modern E-commerce Website"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Brief description of the project..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="image">🖼️ Image</option>
                <option value="video">🎥 Video</option>
                <option value="link">🔗 Website/Link</option>
                <option value="github">💻 GitHub Repository</option>
              </select>
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL *
              </label>
              <input
                type="url"
                value={newItem.url}
                onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                placeholder={
                  newItem.type === 'image' ? 'https://example.com/image.jpg' :
                  newItem.type === 'video' ? 'https://youtube.com/watch?v=...' :
                  newItem.type === 'github' ? 'https://github.com/username/repo' :
                  'https://example.com'
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Thumbnail (optional for non-image types) */}
            {newItem.type !== 'image' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thumbnail URL (Optional)
                </label>
                <input
                  type="url"
                  value={newItem.thumbnail}
                  onChange={(e) => setNewItem({ ...newItem, thumbnail: e.target.value })}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add tags (e.g., React, Design, Web)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newItem.tags && newItem.tags.length > 0 ? (
                  newItem.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 text-sm">No tags added</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleAddPortfolioItem}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Adding...' : 'Add to Portfolio'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewItem({ title: '', description: '', type: 'image', url: '', thumbnail: '', tags: [] });
                }}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Grid */}
      {portfolio.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Preview */}
              <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ctext y="50" font-size="50"%3E🖼️%3C/text%3E%3C/svg%3E';
                    }}
                  />
                ) : item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                {(!item.thumbnail || item.type !== 'image') && (
                  <div className="text-6xl">{getItemIcon(item.type)}</div>
                )}
                
                {/* Type Badge */}
                <div className="absolute top-2 right-2 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium">
                  {getItemIcon(item.type)} {getItemTypeLabel(item.type)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                )}
                
                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{item.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
                  >
                    View Project
                  </a>
                  <button
                    onClick={() => handleDeletePortfolioItem(index)}
                    disabled={loading}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-5xl">💼</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Portfolio Items Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start showcasing your work to attract more clients!
          </p>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Project
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PortfolioSettings;
