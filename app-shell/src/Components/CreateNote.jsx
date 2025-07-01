import React, { useEffect, useState } from 'react';
import { Pencil, X } from 'lucide-react';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../db/firebase'; // Added auth import
import { useParams, useNavigate } from 'react-router'; // Added useNavigate import

export default function CreateNote() {
  const [activeCategory, setActiveCategory] = useState('politics');
  const [postsList, setPostsList] = useState([]);
  const [userEmail, setUserEmail] = useState('');
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
        category: formData.category, // Added category to save
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'published',
        reactions: 0,
        annotations: 0,
        authorId: auth.currentUser?.uid || null,
       authorEmail: userEmail,
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
    return <div className="loading">Loading posts...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <>
      <div className='main-container'>
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

   <div className="content-area" data-category={activeCategory}>
  <div className="user-posts">
    <h2 className="section-title">Recent Discussions - {activeCategory}</h2>
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
          <div className="post-title">{post.title}</div>
          <div className="post-meta">
            By {post.authorName || 'Anonymous'} • 
            {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'} • 
            {post.annotations || 0} Annotations
          </div>
          <div className="post-excerpt">{post.excerpt}</div>
        </div>
      ))
    )}
  </div>
</div>


        <button onClick={handleCreateNote} className='note-button'>
          <Pencil/>
        </button>
      </div>

      {/* Modal */}
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
                  rows="8"
                  required
                />
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
        </div>
      )}
    </>
  );
}
