/* eslint-disable no-unused-vars */
import { Pencil, X, MessageSquare, Heart } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { auth, db } from '../db/firebase';
import { addDoc, collection, doc, getDoc, getDocs, updateDoc, increment } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function CreatePost() {
  const location = useLocation();
  const navigate = useNavigate();
  let { id } = useParams();
  
  // Get category from URL search params or default to 'politics'
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category') || 'politics';
  
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [postsList, setPostsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postType, setPostType] = useState('quick');
  const [userEmail, setUserEmail] = useState('');
  const [names, setNames] = useState('');
  const [isSignedIn, setIsSignedIn] = useState();
  const [formData, setFormData] = useState({
    title: '',
    category: initialCategory,
    content: '',
    url: '',
    tags: []
  });

  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [showModal, setShowModal] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 4000);
  };

  // Sample images for each category
  const categoryImages = {
    politics: '/images/assets/polbg.png',
    sports: '/images/assets/spg.png',
    music: '/images/assets/musbg.png',
    fashion: '/images/assets/fashbg.png',
    gaming: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=600&fit=crop',
    tech: '/images/assets/techbg.png'
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

  useEffect(() => {
    let isMounted = true;
  
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnapshot = await getDoc(userDocRef);
          if (userDocSnapshot.exists() && isMounted) {
            const userData = userDocSnapshot.data();
            const fullName = `${userData.fname || ''} ${userData.lname || ''}`.trim();
            setNames(fullName || userData.email || 'User');
          } else if (isMounted) {
            setNames('User');
          }
          if (isMounted) setIsSignedIn(true);
        } catch (error) {
          if (isMounted) {
            setIsSignedIn(true);
            setNames('User');
          }
        }
      } else if (isMounted) {
        setIsSignedIn(false);
        setNames('');
      }
    });
  
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'communityPosts'));
        const postsList = querySnapshot.docs.map(doc => ({ 
          id: doc.id,
          ...doc.data() 
        }));
        setPostsList(postsList);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [id]);

  const showCategory = (categoryId) => {
    setActiveCategory(categoryId);
    // Update URL with category parameter
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set('category', categoryId);
    navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
  };

  const handleCreateNote = () => {
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      title: '',
      content: '',
      category: activeCategory, // Use current active category
      url: ''
    });
    setPostType('quick');
  };

  const handlePostTypeChange = (newType) => {
    setPostType(newType);
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
        category: activeCategory // Use current active category
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

  // Handle annotation click
  const handleAnnotationClick = async (e, postId) => {
    e.stopPropagation(); // Prevent navigation to post details
    
    try {
      const postRef = doc(db, 'communityPosts', postId);
      await updateDoc(postRef, {
        annotations: increment(1)
      });
      
      // Update local state
      setPostsList(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, annotations: (post.annotations || 0) + 1 }
            : post
        )
      );
      
      showToast('Annotation added!');
    } catch (error) {
      console.error('Error updating annotations:', error);
      showToast('Error adding annotation', 'error');
    }
  };

  // Handle reaction click
  const handleReactionClick = async (e, postId) => {
    e.stopPropagation(); // Prevent navigation to post details
    
    try {
      const postRef = doc(db, 'communityPosts', postId);
      await updateDoc(postRef, {
        reactions: increment(1)
      });
      
      // Update local state
      setPostsList(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, reactions: (post.reactions || 0) + 1 }
            : post
        )
      );
      
      showToast('Reaction added!');
    } catch (error) {
      console.error('Error updating reactions:', error);
      showToast('Error adding reaction', 'error');
    }
  };

  // Handle post card click (for navigation)
  const handlePostCardClick = (postId) => {
    // Navigate to post details with current category in URL
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('category', activeCategory);
    navigate(`/community/${postId}?${newSearchParams.toString()}`);
  };

  if (error) {
    return <div className="error">Error: {error}</div>;
  }
  
  const filteredPosts = postsList.filter(post => post.category === activeCategory);

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
            {/* <h1 className="category-title">{activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}</h1> */}
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
      {filteredPosts.length === 0 ? (
        <div className="user-posts-section">
          <h2>Community {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Posts</h2>
          <div className='user-posts-empty'>
            <p>Community posts for {activeCategory} will appear here</p>
          </div>
        </div>
      ) : (
        <div className="user-posts-section">
          <h2>Community {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Posts</h2>
          <div className="user-posts-grid">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="post-card"
                onClick={() => handlePostCardClick(post.id)}
              >
                <div className="post-header">
                  <div className="post-author">{names}</div>
                  <div className="post-date">
                    {post.createdAt?.seconds
                      ? new Date(post.createdAt.seconds * 1000).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Recently'}
                  </div>
                </div>
                
                <div className="post-content">
                  {post.content}
                </div>
                
                <div className="post-stats">
                  <button 
                    className="post-stat-button"
                    onClick={(e) => handleAnnotationClick(e, post.id)}
                    title="Add annotation"
                  >
                    <MessageSquare size={16} />
                    <span className="stat-label">annotations</span>
                    <span className="stat-value">{post.annotations || 0}</span>
                  </button>
                  <button 
                    className="post-stat-button"
                    onClick={(e) => handleReactionClick(e, post.id)}
                    title="Add reaction"
                  >
                    <Heart size={16} />
                    <span className="stat-label">reactions</span>
                    <span className="stat-value">{post.reactions || 0}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={handleCreateNote} className='note-button'>
        <Pencil/>
      </button>
    
      {/* Modal */}
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