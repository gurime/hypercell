/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, ExternalLink, Pencil, X,LinkIcon, Mail,  ArrowBigUp, Vote, Trophy, Music, Shirt, Gamepad2, Laptop, Users, Dumbbell, GraduationCap, Film
 } from 'lucide-react';
import { useNavigate, useParams, useLocation, Link } from 'react-router';
import { auth, db } from '../db/firebase';
import { addDoc, collection, doc, getDoc, getDocs, updateDoc, increment, deleteDoc, serverTimestamp, query, orderBy} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import BounceLoader from 'react-spinners/BounceLoader';
export default function CreatePost() {
const location = useLocation();
const navigate = useNavigate();
const feedContainerRef = useRef(null);
let { id } = useParams();

const showCategory = (categoryId) => {
// Fade out jumbotron
setIsJumbotronVisible(false);
// After fade out completes, change category and fade in
setTimeout(() => {
setActiveCategory(categoryId);
const newSearchParams = new URLSearchParams(location.search);
newSearchParams.set('category', categoryId);
navigate(`${location.pathname}?${newSearchParams.toString()}`, { replace: true });
setIsJumbotronVisible(true);
    
// Auto-scroll to feed container so user sees new posts immediately
if (feedContainerRef.current) {
feedContainerRef.current.scrollIntoView({ 
behavior: 'smooth',
block: 'start'
});
}
}, 300); // Match this with your CSS transition duration
};
const searchParams = new URLSearchParams(location.search);
const initialCategory = searchParams.get('category') || 'politics';
const [articles, setArticles] = useState([]);
const [loadingArticles, setLoadingArticles] = useState(true);
const [isJumbotronVisible, setIsJumbotronVisible] = useState(true);
const [activeCategory, setActiveCategory] = useState(initialCategory);
const [activeDropdown, setActiveDropdown] = useState(null);
const [showScrollTop, setShowScrollTop] = useState(false);
const [editingPost, setEditingPost] = useState(null);
const [shareDropdown, setShareDropdown] = useState(null);
const [postsList, setPostsList] = useState([]);
const [likedPosts, setLikedPosts] = useState(new Set());
const [bookmarkedPosts, setBookmarkedPosts] = useState(new Set());
const [isMounted, setIsMounted] = useState(true);
const [loading, setLoading] = useState(true); 
const [showModal, setShowModal] = useState(false);
const [postType, setPostType] = useState('note');
const [userEmail, setUserEmail] = useState('');
const [error, setError] = useState(null);
const [names, setNames] = useState('');
const [isSignedIn, setIsSignedIn] = useState();
const [editFormData, setEditFormData] = useState({
title: '',
content: '',
intention: '',
emoji: '',
sentimentTone: ''
});

const [formData, setFormData] = useState({
title: '',
category: initialCategory,
content: '',
url: '',
intention: '',
emoji: '',
sentimentTone: '' 
});

const [toast, setToast] = useState({ show: false, message: '', type: '' });
const showToast = (message, type = 'success') => {
setToast({ show: true, message, type });
setTimeout(() => {
setToast({ show: false, message: '', type: '' });
}, 4000);
};

//handle functions starts here
const handleInputChange = (e) => {
const { name, value } = e.target;
setFormData(prev => ({
...prev,
[name]: value
}));
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
emoji: post.emoji || '',
sentimentTone: post.sentimentTone || ''
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
updatedAt: new Date(),
sentimentTone: editFormData.sentimentTone});
    
    // Update local state
setPostsList(prev => prev.map(post => 
post.id === editingPost.id 
? { 
...post, 
title: editFormData.title,
content: editFormData.content,
intention: editFormData.intention,
emoji: editFormData.emoji,
sentimentTone: editFormData.sentimentTone
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
emoji: '',
sentimentTone: ''
});
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

const handleCreateNote = () => {
setShowModal(true);
setFormData({
title: '',
content: '',
category: activeCategory,
url: '',
intention: '',
emoji: '',
sentimentTone: ''
});
setPostType('note');
};

const handleLike = async (postId) => {
if (!auth.currentUser) {
showToast('Sign in to like notes', 'error');
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
showToast('Sign in to bookmark');
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
showToast.error('Error updating bookmark:', error);
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
showToast.error('Error copying link or updating share count:', error);   
// Fallback for browsers that don't support clipboard API
const postUrl = `${window.location.origin}/community/${postId}`;
const textArea = document.createElement('textarea');
textArea.value = postUrl;
document.body.appendChild(textArea);
textArea.select();
document.body.removeChild(textArea);
setShareDropdown(null);
showToast('Link copied to clipboard!', 'success');
}
};

// Updated share functions with Firebase integration

const handleShareDropdown = (postId) => {
setShareDropdown(shareDropdown === postId ? null : postId);
if (shareDropdown !== postId) {
showToast('Share options opened!', 'info');
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
const subject = `Check out this note: ${post.title || 'Interesting post'}`;
const body = `I thought you might find this interesting:\n\n"${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}"\n\nRead more: ${postUrl}`;
    
window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
setShareDropdown(null);
showToast('Email client opened!');
} catch (error) {
showToast('Error sharing via email. Please try again.', 'error');
}
};

const handleSubmit = async (e) => {
  e.preventDefault();    
  try {
    const communityPost = {
title: formData.title,
content: formData.content,
url: formData.url,
category: formData.category,
timestamp: serverTimestamp(), // Use server timestamp
createdAt: serverTimestamp(), // Use server timestamp
updatedAt: serverTimestamp(), // Use server timestamp
shares: 0,
bookmarks: 0,
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
sentimentTone: formData.sentimentTone 
};
await addDoc(collection(db, 'communityPosts'), communityPost);
// Re-fetch posts to get the updated list with proper ordering
const q = query(collection(db, 'communityPosts'),orderBy('createdAt', 'desc'));
const querySnapshot = await getDocs(q);
const updatedPostsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
setPostsList(updatedPostsList);
setFormData({
title: '',
content: '',
category: activeCategory,
url: '',
intention: '',
sentimentTone: '',
emoji: '',
});
handleCloseModal();
showToast(postType === 'note' ? 'Note created successfully!' : 'Letter created successfully!', 'success');
} catch (error) {
showToast('Error creating post. Please try again.', 'error');
}
};


const scrollToTopNav = () => {
window.scrollTo({
top: 0,
behavior: 'smooth'
});
};
//handle functions end here




//useEffects starts here
useEffect(() => {
const handleClickOutside = () => {
setActiveDropdown(null);
setShareDropdown(null);
};
document.addEventListener('click', handleClickOutside);
return () => document.removeEventListener('click', handleClickOutside);
}, []);




useEffect(() => {
  const fetchArticles = async () => {
try {
const querySnapshot = await getDocs(collection(db, 'blogs'));
const articles = querySnapshot.docs.map(doc => {
const data = { id: doc.id, ...doc.data() };
return data;
});
setArticles(articles);
setLoadingArticles(false);
} catch (error) {
setError(error.message);
setLoadingArticles(false);
showToast('Error fetching articles', 'error');
}
};
fetchArticles();
}, [id]);





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
setUserEmail(user.email || '');
} else if (isMounted) {
setNames('User');
setUserEmail(user.email || '');
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
const q = query(
collection(db, 'communityPosts'),
orderBy('createdAt', 'desc')
);
const querySnapshot = await getDocs(q);
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


useEffect(() => {
const handleClickOutside = () => {
setShareDropdown(null);
setActiveDropdown(null);
};
if (shareDropdown) {
document.addEventListener('click', handleClickOutside);
return () => document.removeEventListener('click', handleClickOutside);
}
}, [shareDropdown]);

useEffect(() => {
const handleScroll = () => {
setShowScrollTop(window.scrollY > 100);
};
window.addEventListener('scroll', handleScroll);
handleScroll();
return () => window.removeEventListener('scroll', handleScroll);
}, []);
//useEffects stop here




// Categories and their images
const categories = [
{ id: 'politics', name: 'Politics' },
{ id: 'sports', name: 'Sports' },
{ id: 'music', name: 'Music' },
{ id: 'fashion', name: 'Fashion' },
{ id: 'gaming', name: 'Gaming' },
{ id: 'tech', name: 'Tech' },
{ id: 'community', name: 'Community' },
{ id: 'lifestyle', name: 'Lifestyle' },
{ id: 'healthFitness', name: 'Health & Fitness' },
{ id: 'education', name: 'Education' },
{ id: 'entertainment', name: 'Entertainment' }
];

const categoryImages = {
politics: '/images/assets/politicsbg.jpg',
sports: '/images/assets/sportsbg.jpg',
music: '/images/assets/musicbg.jpg',
fashion: '/images/assets/fashionbg.jpg',
gaming: '/images/assets/gamingbg.jpg',
tech: '/images/assets/techbg.jpg',
community: '/images/assets/communitybg.jpg',
lifestyle: '/images/assets/lifestylebg.jpg',
healthFitness: '/images/assets/healthbg.jpg',
education: '/images/assets/educationbg.jpg',
entertainment: '/images/assets/entertainmentbg.jpg'
};

const categoryDescriptions = {
politics: 'Stay informed with the latest political news and discussions',
sports: 'Your ultimate destination for sports news and updates',
music: 'Discover new artists, tracks, and music industry news',
fashion: 'Latest trends, styles, and fashion industry insights',
gaming: 'Gaming news, reviews, and community discussions',
tech: 'Technology news, innovations, and digital trends',
community: 'Connect with others and share your thoughts on various topics',
lifestyle: 'Explore lifestyle tips, trends, and personal stories',
healthFitness: 'Workout routines, fitness tips, nutrition guidance, and wellness advice',
education: 'Educational resources, discussions, and learning opportunities',
entertainment: 'Entertainment news, reviews, and pop culture discussions'
};

const categoryIcons = {
  politics: Vote,
  sports: Trophy,
  music: Music,
  fashion: Shirt,
  gaming: Gamepad2,
  tech: Laptop,
  community: Users,
  lifestyle: Heart, 
  healthFitness: Dumbbell,
  education: GraduationCap,
  entertainment: Film
};
// Categories,Icons,and their images






// Helper functions start here
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

const formatArticleDate = (date) => {
if (!date) return '';
const articleDate = new Date(date);
const now = new Date();
const diffTime = Math.abs(now - articleDate);
const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
if (diffDays === 0) return 'Today';
if (diffDays === 1) return 'Yesterday';
if (diffDays < 7) return `${diffDays} days ago`;
return articleDate.toLocaleDateString('en-US', { 
month: 'short', 
day: 'numeric' 
});
};


const getInitials = (name) => {
if (!name) return 'U';
return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getDomainFromUrl = (url) => {
try {
const urlObj = new URL(url);
return urlObj.hostname.replace('www.', '');
} catch (error) {
return url;
}
};


// Add these helper functions before your return statement:
const getTrendingTopics = (category, posts) => {
// Get actual topics from posts in this category
const categoryPosts = posts.filter(post => post.category === category);
// Extract keywords from titles and content to create trending topics
const topicCounts = {};
categoryPosts.forEach(post => {
// Extract words from title and content
const text = `${post.title || ''} ${post.content || ''}`.toLowerCase();
const words = text.match(/\b\w{4,}\b/g) || []; // Words with 4+ characters
words.forEach(word => {
// Filter out common words and focus on meaningful terms
const commonWords = ['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'about', 'would', 'there', 'could', 'other', 'more', 'very', 'what', 'know', 'just', 'first', 'into', 'over', 'think', 'also', 'your', 'work', 'life', 'only', 'can', 'should', 'after', 'being', 'now', 'made', 'before', 'here', 'through', 'when', 'where', 'much', 'some', 'these', 'many', 'then', 'them', 'well', 'were'];
      
if (!commonWords.includes(word) && word.length > 3) {
topicCounts[word] = (topicCounts[word] || 0) + 1;
}
});
});
  
// Convert to trending topics format and sort by frequency
const trendingTopics = Object.entries(topicCounts)
.sort(([,a], [,b]) => b - a)
.slice(0, 4)
.map(([topic, count]) => ({
title: topic.charAt(0).toUpperCase() + topic.slice(1),
posts: count
}));
  
// If we don't have enough trending topics from actual data, fill with category-specific defaults
const defaultTopics = {
politics: [
{ title: "Election Updates", posts: 0 },
{ title: "Policy Changes", posts: 0 },
{ title: "Congressional News", posts: 0 },
{ title: "Local Government", posts: 0 }
],

sports: [
{ title: "Championship Finals", posts: 0 },
{ title: "Trade Rumors", posts: 0 },
{ title: "Player Injuries", posts: 0 },
{ title: "Season Highlights", posts: 0 }
],

music: [
{ title: "New Releases", posts: 0 },
{ title: "Concert Reviews", posts: 0 },
{ title: "Artist Collaborations", posts: 0 },
{ title: "Music Awards", posts: 0 }
],

fashion: [
{ title: "Fashion Week", posts: 0 },
{ title: "Seasonal Trends", posts: 0 },
{ title: "Designer Launches", posts: 0 },
{ title: "Street Style", posts: 0 }
],

gaming: [
{ title: "Game Reviews", posts: 0 },
{ title: "Console Updates", posts: 0 },
{ title: "Esports News", posts: 0 },
{ title: "Indie Games", posts: 0 }
],

tech: [
{ title: "AI Developments", posts: 0 },
{ title: "Startup News", posts: 0 },
{ title: "Product Launches", posts: 0 },
{ title: "Tech Reviews", posts: 0 }
],

community: [
{ title: "Local Events", posts: 0 },
{ title: "Volunteer Opportunities", posts: 0 },
{ title: "Community Projects", posts: 0 },
{ title: "Neighborhood News", posts: 0 }
],

lifestyle: [
{ title: "Wellness Tips", posts: 0 },
{ title: "Home Decor", posts: 0 },
{ title: "Travel Stories", posts: 0 },
{ title: "Life Hacks", posts: 0 }
],

healthFitness: [
{ title: "Workout Routines", posts: 0 },
{ title: "Nutrition Tips", posts: 0 },
{ title: "Mental Health", posts: 0 },
{ title: "Fitness Challenges", posts: 0 }
],

education: [
{ title: "Study Tips", posts: 0 },
{ title: "Online Courses", posts: 0 },
{ title: "Career Advice", posts: 0 },
{ title: "Academic News", posts: 0 }
],

entertainment: [
{ title: "Movie Reviews", posts: 0 },
{ title: "TV Show Discussions", posts: 0 },
{ title: "Celebrity News", posts: 0 },
{ title: "Streaming Updates", posts: 0 }
]
};
  
// If we have trending topics from actual data, use them, otherwise use defaults
if (trendingTopics.length > 0) {
// Fill remaining slots with defaults if needed
const defaults = defaultTopics[category] || defaultTopics.community;
while (trendingTopics.length < 4 && defaults.length > trendingTopics.length) {
trendingTopics.push(defaults[trendingTopics.length]);
}
return trendingTopics;
}
return defaultTopics[category] || defaultTopics.community;
};



const getCategoryTags = (category) => {
const tags = {
politics: ["democracy", "policy", "elections", "government"],
sports: ["athletics", "competition", "teams", "championships"],
music: ["artists", "albums", "concerts", "genres"],
fashion: ["style", "trends", "designers", "runway"],
gaming: ["videogames", "esports", "reviews", "streaming"],
tech: ["innovation", "startups", "AI", "gadgets"],
community: ["local", "events", "volunteer", "neighborhood"],
lifestyle: ["wellness", "travel", "home", "personal"],
healthFitness: ["workout", "nutrition", "wellness", "fitness"],
education: ["learning", "skills", "career", "academic"],
entertainment: ["movies", "shows", "celebrities", "streaming"]
};
return tags[category] || tags.community;
};

const getTopContributors = (posts) => {
const contributors = {};
posts.forEach(post => {
const author = post.author || 'Anonymous';
if (!contributors[author]) {
contributors[author] = {
name: author,
posts: 0,
notes: 0,
letters: 0,
reactions: 0
};
}
contributors[author].posts++;
contributors[author].reactions += post.reactions || 0;
// Count notes and letters separately
if (post.type === 'note') {
contributors[author].notes++;
} else if (post.type === 'letter' || post.type === 'detailed') {
contributors[author].letters++;
}
});
  
return Object.values(contributors)
.sort((a, b) => b.posts - a.posts)
.slice(0, 3);
};

const formatPostTypes = (contributor) => {
const parts = [];
if (contributor.notes > 0) {
parts.push(`${contributor.notes} ${contributor.notes === 1 ? 'note' : 'notes'}`);
}
  
if (contributor.letters > 0) {
parts.push(`${contributor.letters} ${contributor.letters === 1 ? 'letter' : 'letters'}`);
}  
return parts.join(' + ') || '0 notes/letters';
};

const getFilteredArticles = () => {
return articles.filter(article => 
article.category && article.category.toLowerCase() === activeCategory.toLowerCase()
);
};

const isPostOwner = (post) => {
if (!auth.currentUser) return false;
// Check if current user is the author by comparing user ID or email
return post.authorId === auth.currentUser.uid || 
post.authorEmail === auth.currentUser.email;
};

//helper functions end here

return (
<>
{/* jumbotron starts here */}
<div className={`jumbotron-container ${isJumbotronVisible ? 'fade-in' : 'fade-out'}`}>
<div 
className='datawallpaper'
style={{
backgroundImage: `url(${categoryImages[activeCategory]})`
}}>
<div className="category-overlay">
<h1 className="category-title">
{activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
</h1>
{/* <p className="category-description">
{categoryDescriptions[activeCategory]}
</p> */}
</div>

</div>
</div>
{/* jumbotron stops here */}


<div className='feed-blok-container' ref={feedContainerRef}>

<div className='feed-blok-left'>
<div className="category-nav">
<h1 className="category-title" style={{color: '#fff', fontSize: '2.5rem', marginBottom: '1rem',textAlign: 'center',borderBottom: 'solid 1px' + '#fff'}}>
{activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
</h1>
{categories.map(category => {
const IconComponent = categoryIcons[category.id];
return (
<button
key={category.id}
onClick={() => showCategory(category.id)}
className={`category-pill ${activeCategory === category.id ? 'active' : ''}`}>
<IconComponent size={26} />
<span>{category.name}</span>
</button>
);
})}
{/* Scroll to Top Button */}
{showScrollTop && (
<button onClick={scrollToTopNav} className="category-pill">
<ArrowBigUp size={24} />
Go Up
</button>
)}
</div>
</div>

<div className="feed-container">
   

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
</span>
</div>

<div className="post-meta">
<span className="post-timestamp">{formatTimestamp(post.timestamp)}</span>
</div>
</div>
{/* Post Header */}

{/* post menu */}
<div className="post-menu-container">
<button 
className="post-menu"
onClick={(e) => {
e.stopPropagation();
handleDropdownToggle(post.id);
}}>
<MoreHorizontal size={20} />
</button>
  
{activeDropdown === post.id && isPostOwner(post) && (
<div className="post-dropdown">
<button 
className="dropdown-item"
onClick={() => handleEditPost(post)}>
<Pencil size={16} />
Edit {post.type === 'note' ? 'Note' : 'Letter'}
</button>

<button 
className="dropdown-item delete"
onClick={() => handleDeletePost(post.id)}>
<X size={16} />
Delete {post.type === 'note' ? 'Note' : 'Letter'}
</button>
</div>
)}
</div>
{/* post menu */}
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
data-tone={post.sentimentTone}>
{post.sentimentTone && (
<div className="post-sentiment">
{post.emoji}{post.sentimentTone && <span className="sentiment-tone">Sentiment: {post.sentimentTone}</span>}
</div>
)}
</div>

<div style={{ display: 'flex', alignItems: 'center', gap: '8px',marginTop: '8px' }}>

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

<button
onClick={() => handleBookmark(post.id)}
className={`interaction-btn ${bookmarkedPosts.has(post.id) ? 'bookmarked' : ''}`}
>
<Bookmark size={16} fill={bookmarkedPosts.has(post.id) ? 'currentColor' : 'none'} />
<span>{post.bookmarks || 0}</span>
</button>
      
<button className="interaction-btn">
<MessageSquare size={16} />
<span>{post.annotations || 0}</span>
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


{/* Floating Action Button */}

      
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
required
onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
className="form-input"
placeholder="Enter post title"
/>
</div>
)}



<div className="form-group clarification-section">
<label className="form-label">Hypercell Clarification</label>
  
<div className="clarification-grid">
<div className="clarification-field">
<label className="sub-label">Intention</label>
<input
type="text"
name="intention"
required
value={editFormData.intention}
onChange={(e) => setEditFormData(prev => ({ ...prev, intention: e.target.value }))}
className="form-input compact"
placeholder="Make your intention clear"
maxLength={100}/>
</div>
    
<div className="clarification-field">
<label className="sub-label">Emoji</label>
<select
name="emoji"
value={editFormData.emoji}
onChange={(e) => setEditFormData(prev => ({ ...prev, emoji: e.target.value }))}
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
value={editFormData.sentimentTone}
onChange={(e) => setEditFormData(prev => ({ ...prev, sentimentTone: e.target.value }))}
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
<label className="form-label">Content</label>
<textarea
value={editFormData.content}
onChange={(e) => setEditFormData(prev => ({ ...prev, content: e.target.value }))}
placeholder="Edit your content here..."
className="form-textarea"
required
/>
</div>
<div className={`character-count ${isOverLimit() ? 'over-limit' : ''}`}>
{getCharacterCount()}/{getCharacterLimit()} characters
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

</div>


<div className='feed-blok-right'>
<div className="sidebar-cards">
<div className="card-content">
{loadingArticles ? (
<div className="articles-loading">
<p><BounceLoader color={"#36d7b7"} size={60}/></p>
</div>
) : getFilteredArticles().length === 0 ? (
<div className="no-articles">
<p>No articles available for {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}</p>
</div>
) : (
getFilteredArticles().slice(0, 5).map((article) => ( // Show max 5 articles
<div 
key={article.id} 
className="article-item"
onClick={() => navigate(`/articles/${article.id}`)}>

<div className="article-content">
<h4 className="article-title" style={{
  fontSize: article.title.length > 60 ? '1rem' : '1.2rem',
  lineHeight: article.title.length > 60 ? '1.2rem' : '1.5rem'
}}>{article.title.slice(0, 60)}{article.title.length > 60 && '...'}</h4>
<div className="article-meta">

{article.category && (
<span className="article-category">{article.category}</span>
)}
<span className="article-date">{formatArticleDate(article.date)}</span>
</div>

{article.content && (
<p className="article-excerpt">
{article.content.substring(0, 100)}...
</p>
)}

{article.readTime && (
<span className="article-read-time">{article.readTime} min read</span>
)}
</div>
</div>
))
)}
</div>
{/* Trending Topics Card - Now uses actual Firebase data */}
<div className="sidebar-card">
<div className="card-header">
<h3>Hot Topics in {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}</h3>
</div>

<div className="card-content">
{getTrendingTopics(activeCategory, postsList).map((topic, index) => (
<div key={index} className="trending-item">
<span className="trending-number">#{index + 1}</span>
<div className="trending-content">
<p className="trending-title">{topic.title}</p>
<span className="trending-posts">{topic.posts} mentions</span>
</div>
</div>
))}
</div>
</div>

{/* Quick Stats Card - Uses actual filtered posts */}
{/* <div className="sidebar-card">
<div className="card-header">
<h3>Quick Stats</h3>
</div>

<div className="card-content">
<div className="stat-item">
<span className="stat-number">{filteredPosts.length}</span>
<span className="stat-label">Total {filteredPosts.length === 1 ? 'Note' : 'Thoughts'}</span>
</div>

<div className="stat-item">
<span className="stat-number">{filteredPosts.filter(p => p.type === 'note').length}</span>
<span className="stat-label">Notes</span>
</div>

<div className="stat-item">
<span className="stat-number">{filteredPosts.filter(p => p.type === 'letter' || p.type === 'detailed').length}</span>
<span className="stat-label">Letters</span>
</div>

<div className="stat-item">
<span className="stat-number">{filteredPosts.reduce((sum, p) => sum + (p.reactions || 0), 0)}</span>
<span className="stat-label">Total Hearts</span>
</div>
</div>
</div> */}

{/* Category Info Card */}
<div className="sidebar-card">
<div className="card-header">
<h3>About {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}</h3>
</div>

<div className="card-content">
<p className="category-info">
{categoryDescriptions[activeCategory]}
</p>
<div className="category-tags">
{getCategoryTags(activeCategory).map((tag, index) => (
<span key={index} className="category-tag">#{tag}</span>
))}
</div>
</div>
</div>

{/* Recent Activity Card - Uses actual Firebase posts */}
<div className="sidebar-card">
<div className="card-header">
<h3>Recent Activity</h3>
</div>

<div className="card-content">
{filteredPosts.slice(0, 3).map(post => (
<div key={post.id} className="activity-item">
<div className="activity-avatar">
{getInitials(post.author || names)}
</div>

<div className="activity-content">
<p className="activity-text">
<strong>{post.author || 'User'}</strong> wrote a {post.type || 'note'}
</p>
<span className="activity-time">{formatTimestamp(post.timestamp)}</span>
</div>
</div>
))}
</div>
</div>

{/* Active Contributors Card - Uses actual Firebase data */}
{/* <div className="sidebar-card">
<div className="card-header">
<h3>Active Contributors</h3>
</div>
<div className="card-content">
{getTopContributors(filteredPosts).map((contributor, index) => (
<div key={index} className="contributor-item">
<div className="contributor-avatar">
{getInitials(contributor.name)}
</div>

<div className="contributor-info">
<p className="contributor-name">{contributor.name}</p>
<span className="contributor-posts">
{formatPostTypes(contributor)}
</span>
</div>
<span className="contributor-likes">{contributor.reactions} ❤️</span>
</div>
))}
</div>
</div> */}
</div>


</div>
</div>

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
