import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, ExternalLink, Pencil, X } from 'lucide-react';
import { useNavigate, useParams, useLocation, Link } from 'react-router';
import { auth, db } from '../db/firebase';
import { addDoc, collection, doc, getDoc, getDocs, updateDoc, increment } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function ModernFeed() {
  const location = useLocation();
  const navigate = useNavigate();
  let { id } = useParams();
  
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category') || 'politics';
  
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [postsList, setPostsList] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [postType, setPostType] = useState('note');
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

  const categories = [
    { id: 'politics', name: 'Politics' },
    { id: 'sports', name: 'Sports' },
    { id: 'music', name: 'Music' },
    { id: 'fashion', name: 'Fashion' },
    { id: 'gaming', name: 'Gaming' },
    { id: 'tech', name: 'Tech' }
  ];

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 4000);
  };

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

  const handleLike = (postId) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
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
      url: ''
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
        type: postType,
        avatar: names ? names.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'
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
    return postType === 'note' ? 300 : 5000;
  };

  const getCharacterCount = () => {
    return formData.content.length;
  };

  const isOverLimit = () => {
    return getCharacterCount() > getCharacterLimit();
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
                <div className="post-author-name">{post.author || names || 'User'}    <span className={`post-type-badge ${post.type === 'detailed' || post.type === 'letter' ? 'letter' : 'note'}`}>
                    {post.type === 'detailed' ? 'letter' : post.type || 'note'}
                  </span></div>
                <div className="post-meta">
             
                  <span className="post-timestamp">{formatTimestamp(post.timestamp)}</span>
                </div>
              </div>
              <button className="post-menu">
                <MoreHorizontal size={20} />
              </button>
            </div>

            {/* Post Content */}
            <div className="post-content">
              {post.title && (
                <h2 className="post-title">{post.title}</h2>
              )}
              <p className="post-text">{post.content}</p>
              
        
                <Link to={`/community/${post.id}`}  className="post-link">
                  Read more
                </Link>
          
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
                
                <button className="interaction-btn">
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
              </div>
              
              <button
                onClick={() => handleBookmark(post.id)}
                className={`bookmark-btn ${bookmarkedPosts.has(post.id) ? 'bookmarked' : ''}`}
              >
                <Bookmark size={16} fill={bookmarkedPosts.has(post.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="load-more-container">
        <button className="load-more-btn">
          Load More Posts
        </button>
      </div>

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

              {postType === 'letter' && (
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
      
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
    </div>
    </>
  );
}
