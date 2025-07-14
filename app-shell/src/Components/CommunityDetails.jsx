/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, ArrowLeft, Send, User } from 'lucide-react';
import { doc, getDoc, addDoc, collection, updateDoc, increment, getDocs, query, where, orderBy } from 'firebase/firestore';
import { auth, db } from '../db/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom'; // Not 'react-router'
import Navbar from './Navbar'
import Footer from './Footer'


export default function CommunityPostDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [names, setNames] = useState('Current User');
  const [hasAnnotated, setHasAnnotated] = useState(false);
const [reactedComments, setReactedComments] = useState(new Set());
const [hasReacted, setHasReacted] = useState(false);

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Auth state listener
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
          setNames(user.displayName || user.email || 'User'); // Use auth user data as fallback
        }
        if (isMounted) setIsSignedIn(true);
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (isMounted) {
          setIsSignedIn(true);
          setNames(user.displayName || user.email || 'User'); // Better fallback
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

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setError('No post ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const docRef = doc(db, 'communityPosts', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPost({
            id: docSnap.id,
            ...docSnap.data()
          });
        } else {
          setError('Post not found');
        }
      } catch (err) {
        setError('Failed to load post');
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return;

      try {
        const commentsQuery = query(
          collection(db, 'comments'),
          where('postId', '==', id),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(commentsQuery);
        const commentsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setComments([]);
      }
    };

    fetchComments();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
const handleAnnotationClick = async (e) => {
  e.stopPropagation();

  if (hasAnnotated) {
    showToast('You have already added an annotation', 'info');
    return;
  }

  if (!isSignedIn) {
    showToast('Please sign in to add annotations', 'error');
    return;
  }

  try {
    const postRef = doc(db, 'communityPosts', postId);
    
    // Get the current post document to read annotations array
    const postDoc = await getDoc(postRef);
    const annotations = postDoc.exists() ? postDoc.data().annotations || [] : [];
    const newAnnotationsLength = annotations.length + 1; // Assuming adding one annotation
    
    // Update the annotations length or array accordingly
    await updateDoc(postRef, {
      annotations: newAnnotationsLength
    });
    
    // Update local state
    setPostsList(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, annotations: newAnnotationsLength }
          : post
      )
    );
    
    showToast('Annotation added!');
  } catch (error) {
    console.error('Error updating annotations:', error);
    showToast('Error adding annotation', 'error');
  }
};

const handleReactionClick = async (e) => {
  e.stopPropagation();
  
  if (hasReacted) {
    showToast('You have already reacted to this post', 'info');
    return;
  }

  if (!isSignedIn) {
    showToast('Please sign in to add reactions', 'error');
    return;
  }
  
  try {
    const postRef = doc(db, 'communityPosts', id);
    await updateDoc(postRef, { 
      reactions: increment(1) 
    });
    
    setPost(prev => ({
      ...prev,
      reactions: (prev.reactions || 0) + 1
    }));
    
    setHasReacted(true);
    showToast('Reaction added!');
  } catch (error) {
    console.error('Error updating reactions:', error);
    showToast('Error adding reaction', 'error');
  }
};

// Fix 4: Updated comment submit validation
const handleCommentSubmit = async () => {
  if (!newComment.trim()) {
    showToast('Please write a comment before submitting', 'info');
    return;
  }

  if (!isSignedIn) {
    showToast('Please sign in to comment', 'error');
    return;
  }

  setCommentLoading(true);
  try {
    const comment = {
      content: newComment,
      postId: id,
      authorName: names,
      authorId: auth.currentUser?.uid || null,
      createdAt: new Date(),
      reactions: 0
    };

    const docRef = await addDoc(collection(db, 'comments'), comment);
    
    const newCommentWithId = {
      id: docRef.id,
      ...comment,
      createdAt: { seconds: Date.now() / 1000 }
    };
    
    setComments(prev => [newCommentWithId, ...prev]);
    setNewComment('');
    showToast('Comment added successfully!');
  } catch (error) {
    console.error('Error adding comment:', error);
    showToast('Error adding comment', 'error');
  } finally {
    setCommentLoading(false);
  }
};

const handleCommentReaction = async (commentId) => {
  if (!isSignedIn) {
    showToast('Please sign in to react to comments', 'error');
    return;
  }

  if (reactedComments.has(commentId)) {
    showToast('You have already reacted to this comment', 'info');
    return;
  }

  try {
    const commentRef = doc(db, 'comments', commentId);
    await updateDoc(commentRef, {
      reactions: increment(1)
    });

    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, reactions: (comment.reactions || 0) + 1 }
          : comment
      )
    );

    // Add to reacted set
    setReactedComments(prev => new Set(prev).add(commentId));

    showToast('Comment reaction added!');
  } catch (error) {
    console.error('Error updating comment reaction:', error);
    showToast('Error adding reaction', 'error');
  }
};

  if (loading) {
    return (
      <div className="community-container">
        <div className="community-post-details-container">
          <div className="loading-spinner">
            <div className="loading-text">Loading post...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="community-container">
        <div className="community-post-details-container">
          <div className="error-message">
            <h2 className="error-title">Oops! Something went wrong</h2>
            <p className="error-text">{error}</p>
            <button onClick={handleBack} className="back-button">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="community-container">
        <div className="community-post-details-container">
          <div className="error-message centered">
            <h2 className="not-found-title">Post not found</h2>
            <button onClick={handleBack} className="back-button">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar/>
    <div className="community-container">
      <div className="community-post-details-container">
        <div className="community-post-card">
          {/* Header */}
          <div className="community-post-header">
            <div className="community-user-info">
              <div className="community-user-avatar">
                <div className="community-default-avatar">
                  {names?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div className="community-user-details">
                <h3 className="community-username">{names || 'Anonymous'}</h3>
                <p className="post-date">{formatDate(post.createdAt)}</p>
              </div>
            </div>
            <button onClick={handleBack} className="community-btn-back">
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          </div>

          {/* Category */}
          {post.category && (
            <div className="community-post-category">
              <span className="community-category-tag">
                {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
              </span>
            </div>
          )}

          {/* Title */}
          {post.title && (
            <h1 className="community-post-title">
              {post.title}
            </h1>
          )}

          {/* Content */}
          <div className="community-post-content">
            {post.content ? (
              <div className="community-content-text">
                {post.content.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="community-no-content">No content available</p>
            )}
          </div>

          {/* Media */}
          {post.imageUrl && (
            <div className="community-post-media">
              <img src={post.imageUrl} alt="Post content" className="post-image" />
            </div>
          )}

          {/* URL Link */}
          {post.url && (
            <div className="url-link-container">
              <a 
                href={post.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="url-link"
              >
                View Link
              </a>
            </div>
          )}

          {/* Reactions & Annotations */}
          <div className="community-post-reactions">
            <div className="reactions-container">
              <button 
                className="annotation-button"
                onClick={handleAnnotationClick}
                title="Add annotation"
              >
                <MessageSquare size={20} />
                <span className="button-text">Annotations</span>
                <span className="annotation-count">
                  {post.annotations || 0}
                </span>
              </button>
              
              <button 
                className="reaction-button"
                onClick={handleReactionClick}
                title="Add reaction"
              >
                <Heart size={20} />
                <span className="button-text">Reactions</span>
                <span className="reaction-count">
                  {post.reactions || 0}
                </span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          <div className="community-comments-section">
            <div className="comments-container">
              <h3 className="comments-title">
                Comments ({comments.length})
              </h3>

              {/* Add Comment Form */}
              <div className="comment-form">
                <div className="comment-input-container">
                  <div className="comment-avatar-container">
                    <div className="comment-avatar">
                      {names?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="comment-input-wrapper">
           <textarea
  value={newComment}
  onChange={(e) => setNewComment(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleCommentSubmit();
    }
  }}
  placeholder={isSignedIn ? "Write a comment... (Ctrl+Enter to submit)" : "Sign in to comment..."}
  className="comment-textarea"
  rows={3}
  disabled={commentLoading || !isSignedIn}
/>

                    <div className="comment-submit-container">
<button
  onClick={handleCommentSubmit}
  className="comment-submit-button"
  disabled={commentLoading || !isSignedIn || !newComment.trim()}
  title={isSignedIn ? "Submit comment" : "Sign in to comment"}
>
  <Send size={14} />
  <span>Submit</span>
</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="comments-list">
                {comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-avatar-container">
                      <div className="comment-avatar">
                        {comment.authorName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </div>
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="comment-author">{comment.authorName}</span>
                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="comment-text">{comment.content}</p>
                      <button
                        onClick={() => handleCommentReaction(comment.id)}
                        className="comment-reaction-button"
                        disabled={!isSignedIn}
                      >
                        <Heart size={14} />
                        <span>{comment.reactions || 0}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {comments.length === 0 && (
                <div className="no-comments">
                  <MessageSquare size={48} className="no-comments-icon" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
<Footer/>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          <div className="toast-content">
            <span className="toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
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
    </div></>
  );
}
