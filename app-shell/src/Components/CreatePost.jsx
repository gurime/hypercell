import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, ExternalLink, Pencil, X, AlertCircle } from 'lucide-react';
import { useNavigate, useParams, useLocation, Link } from 'react-router';
import { auth, db } from '../db/firebase';
import { addDoc, collection, doc, getDoc, getDocs, updateDoc, increment, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function ModernFeed() {
  const location = useLocation();
  const navigate = useNavigate();
  let { id } = useParams();
  
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category') || 'politics';
  
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeDropdown, setActiveDropdown] = useState(null);
const [editingPost, setEditingPost] = useState(null);


  const [postsList, setPostsList] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [loading, setLoading] = useState(true); 
   const [showModal, setShowModal] = useState(false);
  const [postType, setPostType] = useState('note');
  const [userEmail, setUserEmail] = useState('');
  const [names, setNames] = useState('');
  const [isSignedIn, setIsSignedIn] = useState();
  const [showClarifyModal, setShowClarifyModal] = useState(false);
const [currentClarifyPost, setCurrentClarifyPost] = useState(null);
const [editFormData, setEditFormData] = useState({
  title: '',
  content: '',
  intention: '',
  emoji: ''
});
const [clarifyData, setClarifyData] = useState({
  intention: '',
  emoji: ''
});

  const [formData, setFormData] = useState({
    title: '',
  category: initialCategory,
  content: '',
  url: '',
  tags: [],
  intention: '',
  emoji: ''
  });
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const showToast = (message, type = 'success') => {
setToast({ show: true, message, type });
setTimeout(() => {
setToast({ show: false, message: '', type: '' });
}, 4000);
};

  // 4. Add these new handler functions
const handleClarify = (postId) => {
  setCurrentClarifyPost(postId);
  setShowClarifyModal(true);
};

const handleDropdownToggle = (postId) => {
  setActiveDropdown(activeDropdown === postId ? null : postId);
};

const handleEditPost = (post) => {
  setEditingPost(post);
  setEditFormData({
    title: post.title || '',
    content: post.content || '',
    intention: post.intention || '',
    emoji: post.emoji || ''
  });
  setActiveDropdown(null);
};

const handleDeletePost = async (postId) => {
  if (window.confirm('Are you sure you want to delete this post?')) {
    try {
      await deleteDoc(doc(db, 'communityPosts', postId));
      
      // Update local state
      setPostsList(prev => prev.filter(post => post.id !== postId));
      setActiveDropdown(null);
      showToast('Post deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting post: ', error);
      showToast('Error deleting post. Please try again.', 'error');
    }
  }
};

const handleEditSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const postRef = doc(db, 'communityPosts', editingPost.id);
    await updateDoc(postRef, {
      title: editFormData.title,
      content: editFormData.content,
      intention: editFormData.intention,
      emoji: editFormData.emoji,
      updatedAt: new Date()
    });
    
    // Update local state
    setPostsList(prev => prev.map(post => 
      post.id === editingPost.id 
        ? { 
            ...post, 
            title: editFormData.title,
            content: editFormData.content,
            intention: editFormData.intention,
            emoji: editFormData.emoji
          }
        : post
    ));
    
    setEditingPost(null);
    showToast('Post updated successfully!');
    
  } catch (error) {
    console.error('Error updating post: ', error);
    showToast('Error updating post. Please try again.', 'error');
  }
};

const handleCloseEdit = () => {
  setEditingPost(null);
  setEditFormData({
    title: '',
    content: '',
    intention: '',
    emoji: ''
  });
};

// Add this useEffect to handle clicking outside dropdown
useEffect(() => {
  const handleClickOutside = () => {
    setActiveDropdown(null);
  };
  
  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
}, []);

const handleCloseClarifyModal = () => {
  setShowClarifyModal(false);
  setCurrentClarifyPost(null);
  setClarifyData({ intention: '', emoji: '' });
};

const handleClarifySubmit = async (e) => {
  e.preventDefault();
  
  try {
    const postRef = doc(db, 'communityPosts', currentClarifyPost);
    await updateDoc(postRef, {
      intention: clarifyData.intention,
      emoji: clarifyData.emoji,
      updatedAt: new Date()
    });
    
    // Update local state
    setPostsList(prev => prev.map(post => 
      post.id === currentClarifyPost 
        ? { ...post, intention: clarifyData.intention, emoji: clarifyData.emoji }
        : post
    ));
    
    handleCloseClarifyModal();
    showToast('Clarification added successfully!');
    
  } catch (error) {
    console.error('Error adding clarification: ', error);
    showToast('Error adding clarification. Please try again.', 'error');
  }
};

  const categories = [
    { id: 'politics', name: 'Politics' },
    { id: 'sports', name: 'Sports' },
    { id: 'music', name: 'Music' },
    { id: 'fashion', name: 'Fashion' },
    { id: 'gaming', name: 'Gaming' },
    { id: 'tech', name: 'Tech' }
  ];


  // Your existing useEffect and functions here...
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
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [id]);

  const showCategory = (categoryId) => {
    setActiveCategory(categoryId);
    const newSearchParams = new URLSearchParams(location.search);
    newSearchParams.set('category', categoryId);
    navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
  };
const handleLike = async (postId) => {
  if (!auth.currentUser) {
    alert('Sign in to like');
    return;
  }

  const isCurrentlyLiked = likedPosts.has(postId);
  const postRef = doc(db, 'communityPosts', postId);
  
  // Update liked posts state
  setLikedPosts(prev => {
    const newSet = new Set(prev);
    if (isCurrentlyLiked) {
      newSet.delete(postId);
    } else {
      newSet.add(postId);
    }
    return newSet;
  });

  // Update posts list (optimistic update)
  setPostsList(prevPosts =>
    prevPosts.map(post =>
      post.id === postId
        ? {
            ...post,
            reactions: (post.reactions || 0) + (isCurrentlyLiked ? -1 : 1),
          }
        : post
    )
  );

  // Update Firestore
  try {
    if (isCurrentlyLiked) {
      await updateDoc(postRef, { reactions: increment(-1) });
    } else {
      await updateDoc(postRef, { reactions: increment(1) });
    }
  } catch (error) {
    console.error('Error updating like:', error);
    // Revert optimistic update on error
    setPostsList(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              reactions: (post.reactions || 0) + (isCurrentlyLiked ? 1 : -1),
            }
          : post
      )
    );
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyLiked) {
        newSet.add(postId);
      } else {
        newSet.delete(postId);
      }
      return newSet;
    });
  }
};


    const categoryImages = {
    politics: '/images/assets/polbg.png',
    sports: '/images/assets/spg.png',
    music: '/images/assets/musbg.png',
    fashion: '/images/assets/fashbg.png',
    gaming: '/images/assets/gambg.png',
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


  const handleBookmark = (postId) => {
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleCreateNote = () => {
    setShowModal(true);
  };
const handleCloseModal = () => {
  setShowModal(false);
  setFormData({
    title: '',
    content: '',
    category: activeCategory,
    url: '',
    intention: '',
    emoji: ''
  });
  setPostType('note');
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
      url: formData.url,
      category: formData.category,
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'published',
      reactions: 0,
      annotations: 0,
      authorId: auth.currentUser?.uid || null,
      authorEmail: auth.currentUser?.email || userEmail,
      author: names || 'User',
      type: postType, // This will be either 'note' or 'letter'
      avatar: names ? names.split(' ').map(n => n[0]).join('').toUpperCase() : 'U',
      intention: formData.intention,
      emoji: formData.emoji
    };

      await addDoc(collection(db, 'communityPosts'), communityPost);
      
      const querySnapshot = await getDocs(collection(db, 'communityPosts'));
      const updatedPostsList = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      setPostsList(updatedPostsList);
      
      setFormData({
        title: '',
        content: '',
        category: activeCategory,
        url: ''
      });
      handleCloseModal();
      showToast('Post created successfully!');
      
    } catch (error) {
      console.error('Error adding document: ', error);
      showToast('Error creating post. Please try again.', 'error');
    }
  };

const getCharacterLimit = () => {
  return postType === 'note' ? 280 : 10000; // Updated limits
};

// Add a preview character limit constant
const PREVIEW_LIMIT = 150; // Characters to show in preview



const getCharacterCount = () => {
  return formData.content.length;
};

const isOverLimit = () => {
  return getCharacterCount() > getCharacterLimit();
};

// Helper function to get preview text
const getPreviewText = (content, type) => {
  if (type === 'note') {
    return content; // Notes always show in full
  }
  
  // For letters, always show preview with ... if longer than PREVIEW_LIMIT
  if (content.length > PREVIEW_LIMIT) {
    return `${content.slice(0, PREVIEW_LIMIT)}...`;
  }
  
  return content;
};

  const filteredPosts = postsList.filter(post => post.category === activeCategory);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Recently';
    
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return '1d ago';
    return date.toLocaleDateString();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (error) {
    return <div style={{padding: '20px', color: 'red'}}>Error: {error}</div>;
  }

const getDomainFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch (error) {
    return url;
  }
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
            {/* <h1 className="category-title">{activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}</h1> */}
            <p className="category-description">{categoryDescriptions[activeCategory]}</p>
          </div>
        </div>
        </div>
        <div className='feed-blok-container'>
    <div className="feed-container">
      {/* Category Navigation */}
      <div className="category-nav">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => showCategory(category.id)}
            className={`category-pill ${activeCategory === category.id ? 'active' : ''}`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Posts Feed */}
      <div className="posts-feed">  
         
        {filteredPosts.map(post => (
          <div key={post.id} className="post-card">
            {/* Post Header */}
            <div className="post-header">
              <div className="post-avatar">
                {getInitials(post.author || names)}
              </div>
              <div className="post-author-info">
<div className="post-author-name">{post.author || names || 'User'}    
<span className={`post-type-badge ${post.type === 'detailed' || post.type === 'letter' ? 'letter' : 'note'}`}>
                    {post.type === 'detailed' ? 'letter' : post.type || 'note'}
</span></div>
                <div className="post-meta">
             
                  <span className="post-timestamp">{formatTimestamp(post.timestamp)}</span>
                </div>
              </div>
              <div className="post-menu-container">
  <button 
    className="post-menu"
    onClick={(e) => {
      e.stopPropagation();
      handleDropdownToggle(post.id);
    }}
  >
    <MoreHorizontal size={20} />
  </button>
  
  {activeDropdown === post.id && (
    <div className="post-dropdown">
      <button 
        className="dropdown-item"
        onClick={() => handleEditPost(post)}
      >
        <Pencil size={16} />
        Edit Post
      </button>
      <button 
        className="dropdown-item delete"
        onClick={() => handleDeletePost(post.id)}
      >
        <X size={16} />
        Delete Post
      </button>
    </div>
  )}
</div>

            </div>

            {/* Post Content */}
<div className="post-content">
  {post.title && (
    <h2 className="post-title">{post.title}</h2>
  )}
  
  <p className="post-text">
    {getPreviewText(post.content, post.type)}
  </p>
  
  {(post.intention || post.emoji) && (
    <div className="post-clarification">
      {post.emoji && <span className="clarify-emoji">{post.emoji}</span>}
      {post.intention && <span className="clarify-text">"{post.intention}"</span>}
    </div>
  )}

  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

{post.url && (
  <div className="url-link-container">
    <a href={post.url} target="_blank" rel="noopener noreferrer" className="post-link">
      {getDomainFromUrl(post.url)}
    </a>
    <ExternalLink size={16} />
  </div>
)}
  {/* Only show "Read more" for letters when content exceeds preview limit */}
  {(post.type === 'letter' || post.type === 'detailed') && post.content.length > PREVIEW_LIMIT && (
    <Link to={`/community/${post.id}`} className="post-link">
      Read more
    </Link>
  )}
  </div>

</div>


            {/* Interaction Bar */}
          <div className="interaction-bar">
  <div className="interaction-buttons">
    <button
      onClick={() => handleLike(post.id)}
      className={`interaction-btn ${likedPosts.has(post.id) ? 'liked' : ''}`}
    >
      <Heart size={16} fill={likedPosts.has(post.id) ? 'currentColor' : 'none'} />
      <span>{post.reactions || 0}</span>
    </button>
    
    <button className="interaction-btn">
      <MessageSquare size={16} />
      <span>{post.annotations || 0}</span>
    </button>
    
    <button 
      onClick={() => handleClarify(post.id)}
      className="interaction-btn"
    >
      <AlertCircle size={16} />
      <span>Edit Clarify</span>
    </button>
    
    <button className="interaction-btn">
      <Share2 size={16} />
      <span>Share</span>
    </button>

      {/* <button
    onClick={() => handleBookmark(post.id)}
    className={`bookmark-btn ${bookmarkedPosts.has(post.id) ? 'bookmarked' : ''}`}
  >
    <Bookmark size={16} fill={bookmarkedPosts.has(post.id) ? 'currentColor' : 'none'} />
  </button> */}
  </div>

</div>

      </div>
        ))}
      </div>
{/* 
      <div className="load-more-container">
        <button className="load-more-btn">
          Load More Posts
        </button>
      </div> */}

      {/* Floating Action Button */}
      <button onClick={handleCreateNote} className="fab">
        <Pencil size={24} />
      </button>
      
      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Create New Post</h2>
              <button onClick={handleCloseModal} className="modal-close">
                <X size={24} />
              </button>
            </div>
            
            <div className="post-type-toggle">
              <button 
                type="button"
                className={`toggle-btn ${postType === 'note' ? 'active' : ''}`}
                onClick={() => setPostType('note')}
              >
                Note
              </button>
              <button 
                type="button"
                className={`toggle-btn ${postType === 'letter' ? 'active' : ''}`}
                onClick={() => setPostType('letter')}
              >
                Letter
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              {postType === 'letter' && (
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter post title"
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
  <label className="form-label">Intention (Optional)</label>
  <input
    type="text"
    name="intention"
    value={formData.intention}
    onChange={handleInputChange}
    className="form-input"
    placeholder="e.g., This note is meant to be nice"
    maxLength={100}
  />
</div>

<div className="form-group">
  <label className="form-label">Emoji (Optional)</label>
  <select
    name="emoji"
    value={formData.emoji}
    onChange={handleInputChange}
    className="form-select"
  >
    <option value="">Select an emoji</option>
    <option value="😊">😊 Happy</option>
    <option value="😢">😢 Sad</option>
    <option value="😡">😡 Angry</option>
    <option value="😍">😍 Love</option>
    <option value="🤔">🤔 Thinking</option>
    <option value="😂">😂 Funny</option>
    <option value="😎">😎 Cool</option>
    <option value="🙏">🙏 Grateful</option>
    <option value="💪">💪 Strong</option>
    <option value="🎉">🎉 Celebration</option>
  </select>
</div>


              <div className="form-group">
                <label className="form-label">
                  {postType === 'note' ? 'Note' : 'Letter'}
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder={postType === 'note' ? "Write a Note!" : "Write your detailed Letter here."}
                  maxLength={getCharacterLimit()}
                  className="form-textarea"
                  required
                />
                <div className={`character-count ${isOverLimit() ? 'over-limit' : ''}`}>
                  {getCharacterCount()}/{getCharacterLimit()} characters
                </div>
              </div>
{(postType === 'letter' || postType === 'note') && (
  <div className="form-group">
    <label className="form-label">Link (Optional)</label>
    <input
      type="url"
      name="url"
      value={formData.url}
      onChange={handleInputChange}
      className="form-input"
      placeholder="https://example.com"
    />
  </div>
)}


              <div className="form-actions">
                <button type="button" onClick={handleCloseModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isOverLimit()}>
                  {postType === 'note' ? 'Post Note' : 'Create Letter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showClarifyModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">
        <h2 className="modal-title">Edit Clarification</h2>
        <button onClick={handleCloseClarifyModal} className="modal-close">
          <X size={24} />
        </button>
      </div>
      
      <form onSubmit={handleClarifySubmit}>
        <div className="form-group">
          <label className="form-label">Intention</label>
          <input
            type="text"
            value={clarifyData.intention}
            onChange={(e) => setClarifyData(prev => ({ ...prev, intention: e.target.value }))}
            className="form-input"
            placeholder="e.g., Edit this to clarify your intention"
            maxLength={100}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Emoji</label>
          <select
            value={clarifyData.emoji}
            onChange={(e) => setClarifyData(prev => ({ ...prev, emoji: e.target.value }))}
            className="form-select"
            required
          >
            <option value="">Select an emoji</option>
            <option value="😊">😊 Happy</option>
            <option value="😢">😢 Sad</option>
            <option value="😡">😡 Angry</option>
            <option value="😍">😍 Love</option>
            <option value="🤔">🤔 Thinking</option>
            <option value="😂">😂 Funny</option>
            <option value="😎">😎 Cool</option>
            <option value="🙏">🙏 Grateful</option>
            <option value="💪">💪 Strong</option>
            <option value="🎉">🎉 Celebration</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleCloseClarifyModal} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Add Clarification
          </button>
        </div>
      </form>
    </div>
  </div>
)}

      {editingPost && (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">
        <h2 className="modal-title">Edit Post</h2>
        <button onClick={handleCloseEdit} className="modal-close">
          <X size={24} />
        </button>
      </div>
      
      <form onSubmit={handleEditSubmit}>
        {(editingPost.type === 'letter' || editingPost.type === 'detailed') && (
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              value={editFormData.title}
              onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
              className="form-input"
              placeholder="Enter post title"
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Intention (Optional)</label>
          <input
            type="text"
            value={editFormData.intention}
            onChange={(e) => setEditFormData(prev => ({ ...prev, intention: e.target.value }))}
            className="form-input"
            placeholder="e.g., This note is meant to be nice"
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Emoji (Optional)</label>
          <select
            value={editFormData.emoji}
            onChange={(e) => setEditFormData(prev => ({ ...prev, emoji: e.target.value }))}
            className="form-select"
          >
            <option value="">Select an emoji</option>
            <option value="😊">😊 Happy</option>
            <option value="😢">😢 Sad</option>
            <option value="😡">😡 Angry</option>
            <option value="😍">😍 Love</option>
            <option value="🤔">🤔 Thinking</option>
            <option value="😂">😂 Funny</option>
            <option value="😎">😎 Cool</option>
            <option value="🙏">🙏 Grateful</option>
            <option value="💪">💪 Strong</option>
            <option value="🎉">🎉 Celebration</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Content</label>
          <textarea
            value={editFormData.content}
            onChange={(e) => setEditFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Edit your content here..."
            className="form-textarea"
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleCloseEdit} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Update Post
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
    </div>
    </div>
    </>
  );
}
