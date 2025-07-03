/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Pencil, X } from 'lucide-react';
import { addDoc, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../db/firebase'; // Added auth import
import { useParams, useNavigate,Link } from 'react-router'; // Added useNavigate import
import { onAuthStateChanged } from 'firebase/auth';
import ClipLoader from 'react-spinners/ClipLoader';
import Navbar from './Navbar';
import Footer from './Footer';

export default function CreateNote() {
  const [activeCategory, setActiveCategory] = useState('politics');
  const [postsList, setPostsList] = useState([]);
  const [featuredPosts, setfeaturedPosts] = useState([]);
  const [userEmail, setUserEmail] = useState('');
const [names, setNames] = useState('');
const [ isSignedIn,setIsSignedIn] = useState()

  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null); // Added error state
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  
  const navigate = useNavigate(); // Added navigate hook
  let { id } = useParams();

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 4000);
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
          // Updated line to include both first and last name
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
    const fetchFeaturedProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'blogs'));
        const featuredProductList = querySnapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
        setfeaturedPosts(featuredProductList);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'communityPosts'));
        const postsList = querySnapshot.docs.map(doc => ({ 
          id: doc.id, // Changed _id to id to match your JSX
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

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'politics'
  });

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
      excerpt: '',
      content: '',
      category: 'politics'
    });
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
      excerpt: formData.excerpt,
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
      excerpt: '',
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


  // Filter posts by active category
  const filteredPosts = postsList.filter(post => post.category === activeCategory);

if (loading) {
return (
<>
<Navbar />
<div className="admin-loading"> 
<ClipLoader size={50} color="#2637be"/>
</div>
<Footer />
</>
);
}
  

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <>
    <div className='main-container'>
<div className='hypercell-container'>
  {/* Left Sidebar */}
  <div className="left-sidebar">
    <div className="logo">
      <h2>Hypercell Social</h2>
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

  {/* Main Content */}
  <div className="main-content">
    <div className="content-header">
      <h1>{activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}</h1>
    </div>

    <div className="content-area" data-category={activeCategory}>
      {/* Featured Posts Section */}
      <div className="business-posts">
        {featuredPosts.length > 0 && (
          <>
            <h2 data-title={activeCategory} className="section-title">
              Featured {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} News
            </h2>
            {featuredPosts.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/blog/${product._id}`)}
                style={{cursor:'pointer'}}
                className="post-card"
              >
                <div className="business-badge">Official</div>
                <div className="post-title">{product.title}</div>
                <div className="post-meta">
                  By <Link className="post-meta" to="/profile">{names}</Link> •{" "}
                  {product.createdAt?.seconds
                    ? new Date(product.createdAt.seconds * 1000).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Recently'}
                  {product.reactions > 0 && ` • ${product.reactions} Reactions`}
                </div>
                <div className="post-excerpt">{product.content.slice(0, 100)}...</div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* User Posts Section */}
      <div className="user-posts">
        <h2 data-category={activeCategory} className="section-title">
          Recent Discussions - {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
        </h2>

        {filteredPosts.length === 0 ? (
          <div className="no-posts">No posts in this category yet.</div>
        ) : (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="post-card"
              onClick={() => navigate(`/community/${post.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="post-title">
                {post.title.charAt(0).toUpperCase() + post.title.slice(1)}
              </div>
              <div className="post-meta">
                By <Link className="post-meta" to="/profile">{names}</Link> •{" "}
                {post.createdAt?.seconds
                  ? new Date(post.createdAt.seconds * 1000).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Recently'}
                {post.annotations > 0 && ` • ${post.annotations} Annotations`}
              </div>
              <div className="post-excerpt">{post.excerpt.slice(0,100)}...</div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>

  {/* Right Sidebar - What's Happening */}
  <div className="right-sidebar">
    <div className="whats-happening">
      <h2>What's happening</h2>
      
      <div className="trending-item">
        <div className="trending-category">Trending in {activeCategory}</div>
        <div className="trending-topic">#BreakingNews</div>
        <div className="trending-posts">1,234 posts</div>
      </div>
      
      <div className="trending-item">
        <div className="trending-category">Trending</div>
        <div className="trending-topic">#TechNews</div>
        <div className="trending-posts">856 posts</div>
      </div>
      
      <div className="trending-item">
        <div className="trending-category">Politics · Trending</div>
        <div className="trending-topic">#Election2024</div>
        <div className="trending-posts">2,567 posts</div>
      </div>
      
      <div className="trending-item">
        <div className="trending-category">Sports · Trending</div>
        <div className="trending-topic">#WorldCup</div>
        <div className="trending-posts">4,123 posts</div>
      </div>
      
      <div className="show-more">
        <a href="#">Show more</a>
      </div>
    </div>
    
    <div className="who-to-follow">
      <h2>Who to follow</h2>
      
      <div className="follow-suggestion">
        <div className="user-avatar"></div>
        <div className="user-info">
          <div className="user-name">Tech News</div>
          <div className="user-handle">@technews</div>
        </div>
        <button className="follow-btn">Follow</button>
      </div>
      
      <div className="follow-suggestion">
        <div className="user-avatar"></div>
        <div className="user-info">
          <div className="user-name">Sports Central</div>
          <div className="user-handle">@sportscentral</div>
        </div>
        <button className="follow-btn">Follow</button>
      </div>
      
      <div className="show-more">
        <a href="#">Show more</a>
      </div>
    </div>  {/* Floating Action Button */}
  <button onClick={handleCreateNote} className='note-button'>
    <Pencil/>
  </button>
  </div>


</div>

{/* Modal remains the same */}
{showModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">
        <h2>Create New Note</h2>
        <button onClick={handleCloseModal} className="close-button">
          <X size={24} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="note-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter note title"
            required
          />
        </div>

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
          <label htmlFor="excerpt">Excerpt</label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleInputChange}
            placeholder="Brief description of your note"
            rows="3"
            required
          />
        </div>

      <div className="form-group">
  <label htmlFor="content">Content</label>
  <textarea
    id="content"
    name="content"
    value={formData.content}
    onChange={handleInputChange}
    placeholder="Write your full note content here"
    maxLength={500} // Limits to 500 characters
    rows="8"
    required
  />
  <div className="character-count">
    {formData.content.length}/250 characters
  </div>
</div>

        <div className="form-actions">
          <button type="button" onClick={handleCloseModal} className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="submit-button">
            Create Note
          </button>
        </div>
      </form>
    </div>
  </div>
)}
</div>

      {/* Toast Notification */}
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
           <div className="right-ad">ad</div>
        </div>
      )}
     
    </>
  );
}
