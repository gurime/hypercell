/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Heart, ArrowLeft, Send, User, Flag, ChevronDown } from 'lucide-react';
import { 
  doc, 
  getDoc, 
  addDoc, 
  collection, 
  updateDoc, 
  increment, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  deleteDoc,
  writeBatch,
  limit,
  startAfter
} from 'firebase/firestore';
import { auth, db } from '../db/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import BounceLoader from 'react-spinners/BounceLoader';
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
  const [reactedComments, setReactedComments] = useState(new Set());
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [currentUser, setCurrentUser] = useState(null);

  // Pagination states
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);
  const [lastCommentDoc, setLastCommentDoc] = useState(null);

  // Moderation states
  const [reportingComment, setReportingComment] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  // Real-time listeners refs
  const commentsUnsubscribe = useRef(null);
  const postUnsubscribe = useRef(null);

  const COMMENT_LIMIT = 500;
  const COMMENTS_PER_PAGE = 10;

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
        setCurrentUser(user);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnapshot = await getDoc(userDocRef);
          if (userDocSnapshot.exists() && isMounted) {
            const userData = userDocSnapshot.data();
            const fullName = `${userData.fname || ''} ${userData.lname || ''}`.trim();
            setNames(fullName || userData.email || 'User');
          } else if (isMounted) {
            setNames(user.displayName || user.email || 'User');
          }
          if (isMounted) setIsSignedIn(true);
        } catch (error) {
          console.error('Error fetching user data:', error);
          if (isMounted) {
            setIsSignedIn(true);
            setNames(user.displayName || user.email || 'User');
          }
        }
      } else if (isMounted) {
        setIsSignedIn(false);
        setNames('');
        setCurrentUser(null);
        setLikedPosts(new Set());
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Load user's liked posts from likes collection
  useEffect(() => {
    if (!currentUser) return;

    const loadUserLikes = async () => {
      try {
        const likesQuery = query(
          collection(db, 'likes'),
          where('userId', '==', currentUser.uid)
        );
        const likesSnapshot = await getDocs(likesQuery);
        const likedPostIds = likesSnapshot.docs.map(doc => doc.data().postId);
        setLikedPosts(new Set(likedPostIds));
      } catch (error) {
        console.error('Error loading user likes:', error);
      }
    };

    loadUserLikes();
  }, [currentUser]);

  // Real-time post listener
  useEffect(() => {
    if (!id) return;

    const postRef = doc(db, 'communityPosts', id);
    postUnsubscribe.current = onSnapshot(
      postRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const postData = {
            id: docSnap.id,
            ...docSnap.data()
          };
          setPost(postData);
          setLoading(false);
        } else {
          setError('Post not found');
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error listening to post:', error);
        setError('Failed to load post');
        setLoading(false);
      }
    );

    return () => {
      if (postUnsubscribe.current) {
        postUnsubscribe.current();
      }
    };
  }, [id]);

  // Real-time comments listener with pagination
  useEffect(() => {
    if (!id) return;

    const commentsQuery = query(
      collection(db, 'comments'),
      where('postId', '==', id),
      orderBy('createdAt', 'desc'),
      limit(COMMENTS_PER_PAGE)
    );

    commentsUnsubscribe.current = onSnapshot(
      commentsQuery,
      (snapshot) => {
        const commentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setComments(commentsData);
        setLastCommentDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMoreComments(snapshot.docs.length === COMMENTS_PER_PAGE);

        // Load user's reacted comments
        if (currentUser && commentsData.length > 0) {
          const userReactedComments = commentsData
            .filter(comment => comment.reactedBy && comment.reactedBy.includes(currentUser.uid))
            .map(comment => comment.id);
          setReactedComments(new Set(userReactedComments));
        }
      },
      (error) => {
        console.error('Error listening to comments:', error);
        setComments([]);
      }
    );

    return () => {
      if (commentsUnsubscribe.current) {
        commentsUnsubscribe.current();
      }
    };
  }, [id, currentUser]);

  // Load more comments (pagination)
  const loadMoreComments = async () => {
    if (!hasMoreComments || loadingMoreComments || !lastCommentDoc) return;

    setLoadingMoreComments(true);
    try {
      const nextCommentsQuery = query(
        collection(db, 'comments'),
        where('postId', '==', id),
        orderBy('createdAt', 'desc'),
        startAfter(lastCommentDoc),
        limit(COMMENTS_PER_PAGE)
      );

      const snapshot = await getDocs(nextCommentsQuery);
      const newComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (newComments.length > 0) {
        setComments(prev => [...prev, ...newComments]);
        setLastCommentDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMoreComments(newComments.length === COMMENTS_PER_PAGE);
      } else {
        setHasMoreComments(false);
      }
    } catch (error) {
      console.error('Error loading more comments:', error);
      showToast('Error loading more comments', 'error');
    } finally {
      setLoadingMoreComments(false);
    }
  };

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

  // Enhanced like/unlike functionality using likes collection
  const handleReactionClick = async (postId) => {
    if (!auth.currentUser) {
      showToast('Sign in to like posts', 'error');
      return;
    }

    const userId = auth.currentUser.uid;
    const likeId = `${userId}_${postId}`;
    const isCurrentlyLiked = likedPosts.has(postId);
    
    // Optimistic update
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyLiked) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });

    setPost(prevPost => ({
      ...prevPost,
      reactions: (prevPost.reactions || 0) + (isCurrentlyLiked ? -1 : 1)
    }));

    try {
      const batch = writeBatch(db);
      const postRef = doc(db, 'communityPosts', postId);
      const likeRef = doc(db, 'likes', likeId);

      if (isCurrentlyLiked) {
        // Unlike: delete like document and decrement counter
        batch.delete(likeRef);
        batch.update(postRef, { reactions: increment(-1) });
      } else {
        // Like: create like document and increment counter
        batch.set(likeRef, {
          userId,
          postId,
          createdAt: new Date()
        });
        batch.update(postRef, { reactions: increment(1) });
      }

      await batch.commit();
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert optimistic update on error
      setPost(prevPost => ({
        ...prevPost,
        reactions: (prevPost.reactions || 0) + (isCurrentlyLiked ? 1 : -1)
      }));
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.add(postId);
        } else {
          newSet.delete(postId);
        }
        return newSet;
      });
      showToast('Error updating reaction. Please try again.', 'error');
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      showToast('Please write a comment before submitting', 'info');
      return;
    }

    if (!isSignedIn) {
      showToast('Please sign in to comment', 'error');
      return;
    }

    if (newComment.length > COMMENT_LIMIT) {
      showToast(`Comment must be less than ${COMMENT_LIMIT} characters`, 'error');
      return;
    }

    setCommentLoading(true);
    try {
      const comment = {
        content: newComment.trim(),
        postId: id,
        authorName: names,
        authorId: auth.currentUser?.uid || null,
        createdAt: new Date(),
        reactions: 0,
        reactedBy: [],
        isReported: false,
        isHidden: false
      };

      await addDoc(collection(db, 'comments'), comment);
      
      // Update the post's comments count in Firestore
      const postRef = doc(db, 'communityPosts', id);
      await updateDoc(postRef, {
        commentsCount: increment(1)
      });
      
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
      const currentComment = comments.find(c => c.id === commentId);
      
      await updateDoc(commentRef, {
        reactions: increment(1),
        reactedBy: [...(currentComment?.reactedBy || []), currentUser.uid]
      });

      setReactedComments(prev => new Set(prev).add(commentId));
      showToast('Comment reaction added!');
    } catch (error) {
      console.error('Error updating comment reaction:', error);
      showToast('Error adding reaction', 'error');
    }
  };

  // Report comment functionality
  const handleReportComment = async (commentId, reason) => {
    if (!isSignedIn) {
      showToast('Please sign in to report content', 'error');
      return;
    }

    try {
      // Add report to reports collection
      await addDoc(collection(db, 'reports'), {
        type: 'comment',
        contentId: commentId,
        postId: id,
        reporterId: currentUser.uid,
        reporterName: names,
        reason: reason,
        createdAt: new Date(),
        status: 'pending'
      });

      // Mark comment as reported
      const commentRef = doc(db, 'comments', commentId);
      await updateDoc(commentRef, {
        isReported: true,
        reportCount: increment(1)
      });

      setShowReportModal(false);
      setReportingComment(null);
      setReportReason('');
      showToast('Comment reported successfully. Thank you for helping keep our community safe.', 'success');
    } catch (error) {
      console.error('Error reporting comment:', error);
      showToast('Error reporting comment', 'error');
    }
  };

  const openReportModal = (commentId) => {
    setReportingComment(commentId);
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setReportingComment(null);
    setReportReason('');
  };

  // Handle Enter key for comment submission
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !commentLoading) {
      e.preventDefault();
      handleCommentSubmit();
    }
  };

  if (loading) {
    return (
      <div className="community-container">
        <div className="community-post-details-container">
          <div className="loading-spinner">
            <div className="loading-text"><BounceLoader color="#36d7b7" size={30} /></div>
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
                  {/* Post Type */}
         
                <div className="community-user-details">
                  <h3 className="community-username">{post.author || names || 'Anonymous'}</h3>   {post.type && (
              <div className="post-type-section">
                <span className={`post-type-badge ${post.type === 'detailed' || post.type === 'letter' ? 'letter' : 'note'}`}>
                  {post.type === 'detailed' ? 'letter' : post.type || 'note'}
                </span>
              </div>
            )}
                </div>


         
            </div>
              </div>

              <div className='community-back'> <button onClick={handleBack} className="community-btn-back">
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <p className="post-date">{formatDate(post.createdAt)}</p>
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

            {/* Clarification */}
            {(post.intention || post.emoji) && (
              <div className="post-clarification">
                {post.emoji && <span className="clarify-emoji">{post.emoji}</span>}
                {post.intention && <span className="clarify-text">"{post.intention}"</span>}
              </div>
            )}

            {/* Sentiment */}
            {post.sentimentTone && (
              <div className="post-sentiment" data-tone={post.sentimentTone}>
                <div className="sentiment-display">
                  <span className="sentiment-tone">Sentiment: {post.sentimentTone}</span>
                </div>
              </div>
            )}

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
                  title="View comments"
                >
                  <MessageSquare size={20} />
                  <span className="button-text">Comments</span>
                  <span className="annotation-count">
                    {post.commentsCount || 0}
                  </span>
                </button>
                
                <button 
                  className={`reaction-button ${likedPosts.has(post.id) ? 'liked' : ''}`}
                  onClick={() => handleReactionClick(post.id)}
                  title="Add reaction"
                  disabled={!isSignedIn}
                >
                  <Heart size={20} fill={likedPosts.has(post.id) ? 'currentColor' : 'none'} />
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
                  Comments ({post.commentsCount || 0})
                </h3>

                {/* Add Comment Form */}
                <div className="comment-form">
                  <div className="comment-input-container">
                  
                    <div className="comment-input-wrapper">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isSignedIn ? "Write a comment... (Ctrl+Enter to submit)" : "Sign in to comment..."}
                        className="comment-textarea"
                        rows={3}
                        maxLength={COMMENT_LIMIT}
                        disabled={commentLoading || !isSignedIn}
                      />
                      <div className="character-count">
                        {newComment.length}/{COMMENT_LIMIT}
                      </div>
                      <button
                        onClick={handleCommentSubmit}
                        disabled={commentLoading || !isSignedIn || !newComment.trim()}
                        className="submit-comment-button"
                      >
                        {commentLoading ? (
                          <BounceLoader color="#ffffff" size={16} />
                        ) : (
                          <>
                            <Send size={16} />
                            <span>Submit</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="comments-list">
                  {comments.filter(comment => !comment.isHidden).map((comment) => (
                    <div key={comment.id} className="comment-item">
                    
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-author">{comment.authorName}</span>
                          <span className="comment-date">{formatDate(comment.createdAt)}</span>
                          {isSignedIn && currentUser.uid !== comment.authorId && (
                            <button
                              onClick={() => openReportModal(comment.id)}
                              className="report-button"
                              title="Report comment"
                            >
                              <Flag size={12} />
                            </button>
                          )}
                        </div>
                        <p className="comment-text">{comment.content}</p>
                        <button
                          onClick={() => handleCommentReaction(comment.id)}
                          className={`comment-reaction-button ${reactedComments.has(comment.id) ? 'reacted' : ''}`}
                          disabled={!isSignedIn || reactedComments.has(comment.id)}
                          title={reactedComments.has(comment.id) ? "Already reacted" : "React to comment"}
                        >
                          <Heart 
                            size={14} 
                            fill={reactedComments.has(comment.id) ? 'currentColor' : 'none'}
                          />
                          <span>{comment.reactions || 0}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More Comments Button */}
                {hasMoreComments && (
                  <div className="load-more-comments">
                    <button
                      onClick={loadMoreComments}
                      disabled={loadingMoreComments}
                      className="load-more-button"
                    >
                      {loadingMoreComments ? (
                        <BounceLoader color="#36d7b7" size={16} />
                      ) : (
                        <>
                          <ChevronDown size={16} />
                          <span>Load More Comments</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

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
       
        
        {/* Report Modal */}
        {showReportModal && (
          <div className="comment-modal-overlay">
            <div className="comment-modal-content report-modal">
              <div className="comment-modal-header">
                <h3>Report Comment</h3>
                <button onClick={closeReportModal} className="comment-modal-close">×</button>
              </div>
              <div className="comment-modal-body">
                <p>Why are you reporting this comment?</p>
                <div className="report-reasons">
                  {[
                    'Spam or misleading',
                    'Harassment or bullying',
                    'Hate speech',
                    'Violence or threats',
                    'Inappropriate content',
                    'Other'
                  ].map((reason) => (
                    <label key={reason} className="report-reason">
                      <input
                        type="radio"
                        name="reportReason"
                        value={reason}
                        checked={reportReason === reason}
                        onChange={(e) => setReportReason(e.target.value)}
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="comment-modal-footer">
                <button onClick={closeReportModal} className="cancel-button">
                  Cancel
                </button>
                <button
                  onClick={() => handleReportComment(reportingComment, reportReason)}
                  disabled={!reportReason}
                  className="report-submit-button"
                >
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        )}
        

      </div>  
        <Footer/>
           {/* Toast Notification */}
        {toast.show && (
          <div className={`toast ${toast.type === 'success' ? 'toast-success' : toast.type === 'error' ? 'toast-error' : 'toast-info'}`}>
            <div className="toast-content">
              <span className="toast-icon">
                {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
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