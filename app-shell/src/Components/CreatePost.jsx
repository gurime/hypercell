import { Pencil, X } from 'lucide-react';
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { db } from '../db/firebase';
import { addDoc, collection, getDocs } from 'firebase/firestore';

export default function CreatePost() {
  const [activeCategory, setActiveCategory] = useState('politics');
    const [postsList, setPostsList] = useState([]);
    const [loading, setLoading] = useState(true); // Added loading state
      const [postType, setPostType] = useState('quick'); // 'quick' or 'detailed'
  const [formData, setFormData] = useState({
    title: '',
    category: 'politics',
    content: '',
    url: '',
    tags: []
  });

    const [error, setError] = useState(null); // Added error state
      const [toast, setToast] = useState({ show: false, message: '', type: '' });
      const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 4000);
  };
   const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Sample images for each category (you can replace these with actual images)
  const categoryImages = {
    politics: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&h=600&fit=crop',
    sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&h=600&fit=crop',
    music: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=600&fit=crop',
    fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=600&fit=crop',
    gaming: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=600&fit=crop',
    tech: 'https://cdn.impossibleimages.ai/wp-content/uploads/2023/04/25130031/AI-Background-Image-Generator-How-It-Works-and-Why-You-Need-It.jpg'
  };

  // Category descriptions
  const categoryDescriptions = {
    politics: 'Stay informed with the latest political news and discussions',
    sports: 'Your ultimate destination for sports news and updates',
    music: 'Discover new artists, tracks, and music industry news',
    fashion: 'Latest trends, styles, and fashion industry insights',
    gaming: 'Gaming news, reviews, and community discussions',
    tech: 'Technology news, innovations, and digital trends'
  };

  const showCategory = (categoryId) => {
    setActiveCategory(categoryId);
  };

  const handleCreateNote = () => {
      setShowModal(true);
    };
  
 const handleCloseModal = () => {
  setShowModal(false);
  setFormData({
    title: '',
    content: '',
    category: 'politics',
    url: ''
  });
  setPostType('quick'); // Reset to quick post type
};

// Add a new function to handle post type changes:
const handlePostTypeChange = (newType) => {
  setPostType(newType);
  // Clear title when switching to quick post
  if (newType === 'quick') {
    setFormData(prev => ({
      ...prev,
      title: ''
    }));
  }
};
  
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const communityPost = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'published',
        reactions: 0,
        annotations: 0,
        authorId: auth.currentUser?.uid || null,
        authorEmail: auth.currentUser?.email || userEmail,
    
      };
  
      await addDoc(collection(db, 'communityPosts'), communityPost);
      
      // Refresh posts list after adding new post
      const querySnapshot = await getDocs(collection(db, 'communityPosts'));
      const updatedPostsList = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setPostsList(updatedPostsList);
      
      setFormData({
        title: '',
        content: '',
        category: 'politics'
      });
      handleCloseModal();
      showToast('Note created successfully!');
      
    } catch (error) {
      console.error('Error adding document: ', error);
      showToast('Error creating note. Please try again.', 'error');
    }
  };
  
    const getCharacterLimit = () => {
    return postType === 'quick' ? 280 : 10000;
  };

  const getCharacterCount = () => {
    return formData.content.length;
  };

  const isOverLimit = () => {
    return getCharacterCount() > getCharacterLimit();
  };


  return (
    <>
      <div className='jumbotron-container'>
        <div 
          className='datawallpaper'
          style={{
            backgroundImage: `url(${categoryImages[activeCategory]})`
          }}
        >
          <div className="category-overlay">
            <h1 className="category-title">{activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}</h1>
            <p className="category-description">{categoryDescriptions[activeCategory]}</p>
          </div>
        </div>
        
        <div className="category-tabs">
          <button 
            className={`tab-button ${activeCategory === 'politics' ? 'active' : ''}`} 
            onClick={() => showCategory('politics')}
          >
            Politics
          </button>
          <button 
            className={`tab-button ${activeCategory === 'sports' ? 'active' : ''}`} 
            onClick={() => showCategory('sports')}
          >
            Sports
          </button>
          <button 
            className={`tab-button ${activeCategory === 'music' ? 'active' : ''}`} 
            onClick={() => showCategory('music')}
          >
            Music
          </button>
          <button 
            className={`tab-button ${activeCategory === 'fashion' ? 'active' : ''}`} 
            onClick={() => showCategory('fashion')}
          >
            Fashion
          </button>
          <button 
            className={`tab-button ${activeCategory === 'gaming' ? 'active' : ''}`} 
            onClick={() => showCategory('gaming')}
          >
            Gaming
          </button>
          <button 
            className={`tab-button ${activeCategory === 'tech' ? 'active' : ''}`} 
            onClick={() => showCategory('tech')}
          >
            Tech
          </button>
        </div>
      </div>

      {/* Company Posts Section */}
      <div className="company-posts-section">
        <h2>Featured {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Posts</h2>
        <div className="company-posts-placeholder">
          <p>Company posts for {activeCategory} will appear here</p>
        </div>
      
      </div>

      {/* User Posts Section */}
      <div className="user-posts-section">
        <h2>Community Posts</h2>
        <div className="user-posts-placeholder">
          <p>User posts will appear here</p>
        
        </div> 
            <button onClick={handleCreateNote} className='note-button'>
    <Pencil/>
  </button>
      </div>

      {/* Modal remains the same */}
{showModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">
        <h2>Create New Post</h2>
        <button onClick={handleCloseModal} className="close-button">
          <X size={24} />
        </button>
      </div>
      
      {/* Post Type Toggle */}
      <div className="post-type-toggle">
        <button 
          type="button"
          className={`toggle-btn ${postType === 'quick' ? 'active' : ''}`}
          onClick={() => setPostType('quick')}
        >
         Note
        </button>
        <button 
          type="button"
          className={`toggle-btn ${postType === 'detailed' ? 'active' : ''}`}
          onClick={() => setPostType('detailed')}
        >
      Letter
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="note-form">
        {/* Only show title for detailed posts */}
        {postType === 'detailed' && (
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter post title"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          >
            <option value="politics">Politics</option>
            <option value="sports">Sports</option>
            <option value="music">Music</option>
            <option value="fashion">Fashion</option>
            <option value="gaming">Gaming</option>
            <option value="tech">Technology</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="content">
            {postType === 'quick' ? 'Note' : 'Letter'}
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder={
              postType === 'quick' 
                ? "Write a Note!" 
                : "Write your detailed Letter here."
            }
            maxLength={getCharacterLimit()}
            rows={postType === 'quick' ? 4 : 8}
            required
            className={isOverLimit() ? 'over-limit' : ''}
          />
          <div className={`character-count ${isOverLimit() ? 'over-limit' : ''}`}>
            {getCharacterCount()}/{getCharacterLimit()} characters
            {postType === 'detailed' && (
              <span className="limit-note"> (No strict limit for detailed posts)</span>
            )}
          </div>
        </div>

        {/* URL field for detailed posts */}
        {postType === 'detailed' && (
          <div className="form-group">
            <label htmlFor="url">Link (Optional)</label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="https://example.com"
            />
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={handleCloseModal} className="cancel-button">
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={isOverLimit()}
          >
            {postType === 'quick' ? 'Post' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {toast.type === 'success' ? '✓' : '✕'}
            </span>
            <span className="toast-message">{toast.message}</span>
            <button 
              className="toast-close"
              onClick={() => setToast({ show: false, message: '', type: '' })}
            >
              ×
            </button>
          </div>
        </div>
      )}
 
    </>
  );
}