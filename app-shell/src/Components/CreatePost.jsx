/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, ExternalLink, Pencil, X, AlertCircle, LinkIcon, Twitter, Facebook, Linkedin, Mail
 } from 'lucide-react';
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
const [shareDropdown, setShareDropdown] = useState(null);



  const [postsList, setPostsList] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
  const [loading, setLoading] = useState(true); 
   const [showModal, setShowModal] = useState(false);
  const [postType, setPostType] = useState('note');
  const [userEmail, setUserEmail] = useState('');
  const [names, setNames] = useState('');
  const [isSignedIn, setIsSignedIn] = useState();
const [editFormData, setEditFormData] = useState({
  title: '',
  content: '',
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





  const categories = [
    { id: 'politics', name: 'Politics' },
    { id: 'sports', name: 'Sports' },
    { id: 'music', name: 'Music' },
    { id: 'fashion', name: 'Fashion' },
    { id: 'gaming', name: 'Gaming' },
    { id: 'tech', name: 'Tech' },
    { id: 'community', name: 'Community' },
    { id: 'lifestyle', name: 'Lifestyle' },
    { id: 'health', name: 'Health' },
    { id: 'education', name: 'Education' },
    { id: 'entertainment', name: 'Entertainment' }
  ];


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
    tech: 'Technology news, innovations, and digital trends',
    community: 'Connect with others and share your thoughts on various topics',
    lifestyle: 'Explore lifestyle tips, trends, and personal stories',
    health: 'Health tips, wellness advice, and medical news',
    education: 'Educational resources, discussions, and learning opportunities',
    entertainment: 'Entertainment news, reviews, and pop culture discussions'
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

const handleBookmark = async (postId) => {
  if (!auth.currentUser) {
    alert('Sign in to bookmark');
    return;
  }

  const isCurrentlyBookmarked = bookmarkedPosts.has(postId);
  const postRef = doc(db, 'communityPosts', postId);

  // Update bookmarked posts state
  setBookmarkedPosts(prev => {
    const newSet = new Set(prev);
    if (isCurrentlyBookmarked) {
      newSet.delete(postId);
    } else {
      newSet.add(postId);
    }
    return newSet;
  });

  // Update Firestore
  try {
    if (isCurrentlyBookmarked) {
      await updateDoc(postRef, { bookmarks: increment(-1) });
    } else {
      await updateDoc(postRef, { bookmarks: increment(1) });
    }
  } catch (error) {
    console.error('Error updating bookmark:', error);
    // Revert optimistic update on error
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyBookmarked) {
        newSet.add(postId);
      } else {
        newSet.delete(postId);
      }
      return newSet;
    });
  }
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
    emoji: '',
    sentimentTone: '' // Add this line
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
// Updated share functions with Firebase integration

const handleShareDropdown = (postId) => {
  setShareDropdown(shareDropdown === postId ? null : postId);
};

// Fixed shareToSocial function
const shareToSocial = async (platform, post) => {
  try {
    // Update share count in Firebase
    const postRef = doc(db, 'communityPosts', post.id);
    await updateDoc(postRef, { 
      shares: increment(1),
      [`${platform}Shares`]: increment(1) // Track shares per platform
    });

    // Update local state optimistically
    setPostsList(prevPosts =>
      prevPosts.map(p =>
        p.id === post.id
          ? { ...p, shares: (p.shares || 0) + 1 }
          : p
      )
    );

    // Construct the post URL - adjust this based on your routing structure
    const postUrl = `${window.location.origin}/community/${post.id}`;
    const text = post.title 
      ? `Check out this post: ${post.title}` 
      : `Check out this post: ${post.content.substring(0, 50)}${post.content.length > 50 ? '...' : ''}`;
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
      reddit: `https://reddit.com/submit?title=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + postUrl)}`
    };
    
    window.open(urls[platform], '_blank', 'width=600,height=400');
    setShareDropdown(null);
    showToast(`Shared to ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`);

  } catch (error) {
    console.error('Error updating share count:', error);
    showToast('Error sharing post. Please try again.', 'error');
  }
};

// Fixed shareViaEmail function
const shareViaEmail = async (post) => {
  try {
    // Update share count in Firebase
    const postRef = doc(db, 'communityPosts', post.id);
    await updateDoc(postRef, { 
      shares: increment(1),
      emailShares: increment(1)
    });

    // Update local state optimistically
    setPostsList(prevPosts =>
      prevPosts.map(p =>
        p.id === post.id
          ? { ...p, shares: (p.shares || 0) + 1 }
          : p
      )
    );

    const postUrl = `${window.location.origin}/community/${post.id}`;
    const subject = `Check out this post: ${post.title || 'Interesting post'}`;
    const body = `I thought you might find this interesting:\n\n"${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}"\n\nRead more: ${postUrl}`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setShareDropdown(null);
    showToast('Email client opened!');

  } catch (error) {
    console.error('Error updating share count:', error);
    showToast('Error sharing via email. Please try again.', 'error');
  }
};

// New handleCopyLink function (this was missing in your original code)
const handleCopyLink = async (postId) => {
  try {
    // Update share count in Firebase
    const postRef = doc(db, 'communityPosts', postId);
    await updateDoc(postRef, { 
      shares: increment(1),
      linkCopies: increment(1)
    });

    // Update local state optimistically
    setPostsList(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, shares: (post.shares || 0) + 1 }
          : post
      )
    );

    const postUrl = `${window.location.origin}/community/${postId}`;
    await navigator.clipboard.writeText(postUrl);
    setShareDropdown(null);
    showToast('Link copied to clipboard!');

  } catch (error) {
    console.error('Error copying link or updating share count:', error);
    
    // Fallback for browsers that don't support clipboard API
    const postUrl = `${window.location.origin}/community/${postId}`;
    const textArea = document.createElement('textarea');
    textArea.value = postUrl;
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      showToast('Link copied to clipboard!');
    } catch (fallbackError) {
      showToast('Could not copy link. Please copy manually.', 'error');
    }
    
    document.body.removeChild(textArea);
    setShareDropdown(null);
  }
};
useEffect(() => {
  const handleClickOutside = () => {
    setShareDropdown(null);
  };
  
  if (shareDropdown) {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }
}, [shareDropdown]);



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
   shares: 0,
  twitterShares: 0,
  facebookShares: 0,
  linkedinShares: 0,
  emailShares: 0,
  linkCopies: 0,
  status: 'published',
  reactions: 0,
  annotations: 0,
  authorId: auth.currentUser?.uid || null,
  authorEmail: auth.currentUser?.email || userEmail,
  author: names || 'User',
  type: postType,
  avatar: names ? names.split(' ').map(n => n[0]).join('').toUpperCase() : 'U',
  intention: formData.intention,
  emoji: formData.emoji,
  sentimentTone: formData.sentimentTone // Add this line
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
            {/* jumbotron starts here */}

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
        {/* jumbotron stops here */}

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
        <div className='feed-blok-container'>
    <div className="feed-container">
      {/* Category Navigation */}
   

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
                  {/* Posts Feed */}


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

  <div 
  className="post-sentiment" 
  data-tone={post.sentimentTone}
>
  {post.sentimentTone && (
    <div className="post-sentiment">
      {post.emoji}{post.sentimentTone && <span className="sentiment-tone">Sentiment: {post.sentimentTone}</span>}
    </div>
  )}
</div>
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
            {/* Post Content */}


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
    onClick={() => handleBookmark(post.id)}
    className={`interaction-btn ${bookmarkedPosts.has(post.id) ? 'bookmarked' : ''}`}
  >
    <Bookmark size={16} fill={bookmarkedPosts.has(post.id) ? 'currentColor' : 'none'} />
    <span>{post.bookmarks || 0}</span>
  </button>
    
<div className="share-container">
  <button 
    onClick={(e) => {
      e.stopPropagation();
      handleShareDropdown(post.id);
    }}
    className="interaction-btn"
  >
    <Share2 size={16} />
    <span>{post.shares || 0}</span>
  </button>
  
  {shareDropdown === post.id && (
    <div className="share-dropdown">
      <button 
        className="share-option"
        onClick={() => handleCopyLink(post.id)}
      >
        <LinkIcon size={16} />
        Copy Link
      </button>
      
      <button 
        className="share-option"
        onClick={() => shareViaEmail(post)}
      >
        <Mail size={16} />
        Email
      </button>
      
      <button 
        className="share-option"
        onClick={() => shareToSocial('twitter', post)}
      >
        <Twitter size={16} />
        Twitter
      </button>
      
      <button 
        className="share-option"
        onClick={() => shareToSocial('facebook', post)}
      >
        <Facebook size={16} />
        Facebook
      </button>
      
  
      <button 
        className="share-option"
        onClick={() => shareToSocial('linkedin', post)}
      >
        <Linkedin size={16} />
        LinkedIn
      </button>
    </div>
  )}
</div>



  </div>

</div>
{/* Interaction Bar */}
</div>
))}
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
onClick={() => setPostType('note')}>
Note
</button>
<button 
type="button"
className={`toggle-btn ${postType === 'letter' ? 'active' : ''}`}
onClick={() => setPostType('letter')}>
Letter
</button>
</div>
            
<form onSubmit={handleSubmit} style={{padding:"1rem"}}>
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
required/>
</div>
)}

<div className="form-group">
<label className="form-label">Category</label>
<select
name="category"
value={formData.category}
onChange={handleInputChange}
className="form-select"
required>

{categories.map(cat => (
<option key={cat.id} value={cat.id}>{cat.name}</option>
))}
</select>
</div>

{/* Replace the separate Hypercell Clarify form groups with this combined section */}
<div className="form-group clarification-section">
<label className="form-label">Hypercell Clarification</label>
  
<div className="clarification-grid">
<div className="clarification-field">
<label className="sub-label">Intention</label>
<input
type="text"
name="intention"
required
value={formData.intention}
onChange={handleInputChange}
className="form-input compact"
placeholder="Make your intention clear"
maxLength={100}/>
</div>
    
<div className="clarification-field">
<label className="sub-label">Emoji</label>
<select
name="emoji"
value={formData.emoji}
onChange={handleInputChange}
className="form-select compact">
<option value="">Select emoji</option>
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
<option value="😃">😃 Excited</option>
<option value="😁">😁 Grinning</option>
<option value="😆">😆 Laughing</option>
<option value="😅">😅 Nervous</option>
<option value="🥰">🥰 Adoring</option>
<option value="😘">😘 Kiss</option>
<option value="😭">😭 Crying</option>
<option value="😱">😱 Shocked</option>
<option value="😴">😴 Sleepy</option>
<option value="🤯">🤯 Mind Blown</option>
<option value="👍">👍 Thumbs Up</option>
<option value="👎">👎 Thumbs Down</option>
<option value="✌️">✌️ Peace</option>
<option value="🤗">🤗 Hug</option>
<option value="🙌">🙌 Celebration</option>
<option value="🤞">🤞 Luck</option>
<option value="👏">👏 Clapping</option>
<option value="🙄">🙄 Eye Roll</option>
<option value="🤷">🤷 Shrug</option>
<option value="❤️">❤️ Heart</option>
<option value="🔥">🔥 Fire</option>
<option value="🌟">🌟 Star</option>
<option value="🎯">🎯 Target</option>
<option value="💯">💯 100%</option>
<option value="✨">✨ Sparkle</option>
<option value="🎊">🎊 Party</option>
<option value="🏆">🏆 Winner</option>
<option value="🏳️‍🌈">🏳️‍🌈 Pride</option>
<option value="🏳️‍⚧️">🏳️‍⚧️ Transgender</option>
</select>
</div>
    
<div className="clarification-field">
<label className="sub-label">Sentiment Tone</label>
<select
name="sentimentTone"
value={formData.sentimentTone}
onChange={handleInputChange}
className="form-select compact"
required>
<option value="">Select tone</option>
<option value="positively-positive">Positively Positive 😊</option>
<option value="positively-negative">Positively Negative 😔</option>
<option value="negatively-negative">Negatively Negative 😔</option>
<option value="negatively-positive">Negatively Positive 😃</option>
<option value="constructively-critical">Constructively Critical 🤔</option>
<option value="neutrally-informative">Neutrally Informative 📝</option>
<option value="supportively-encouraging">Supportively Encouraging 💪</option>
<option value="questioningly-curious">Questioningly Curious ❓</option>
<option value="humorously-light">Humorously Light 😄</option>
<option value="seriously-concerned">Seriously Concerned ⚠️</option>
</select>
</div>
</div>
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
required/>

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
placeholder="https://example.com"/>
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
          
 <option value="">Select emoji</option>
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
        <option value="😃">😃 Excited</option>
        <option value="😁">😁 Grinning</option>
        <option value="😆">😆 Laughing</option>
        <option value="😅">😅 Nervous</option>
        <option value="🥰">🥰 Adoring</option>
        <option value="😘">😘 Kiss</option>
        <option value="😭">😭 Crying</option>
        <option value="😱">😱 Shocked</option>
        <option value="😴">😴 Sleepy</option>
        <option value="🤯">🤯 Mind Blown</option>
        <option value="👍">👍 Thumbs Up</option>
        <option value="👎">👎 Thumbs Down</option>
        <option value="✌️">✌️ Peace</option>
        <option value="🤗">🤗 Hug</option>
        <option value="🙌">🙌 Celebration</option>
        <option value="🤞">🤞 Luck</option>
        <option value="👏">👏 Clapping</option>
        <option value="🙄">🙄 Eye Roll</option>
        <option value="🤷">🤷 Shrug</option>
        <option value="❤️">❤️ Heart</option>
        <option value="🔥">🔥 Fire</option>
        <option value="🌟">🌟 Star</option>
        <option value="🎯">🎯 Target</option>
        <option value="💯">💯 100%</option>
        <option value="✨">✨ Sparkle</option>
        <option value="🎊">🎊 Party</option>
        <option value="🏆">🏆 Winner</option>
        <option value="🏳️‍🌈">🏳️‍🌈 Pride</option>
        <option value="🏳️‍⚧️">🏳️‍⚧️ Transgender</option>
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
