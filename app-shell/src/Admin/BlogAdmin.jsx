/* eslint-disable no-unused-vars */
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db, auth } from '../db/firebase';
import { useEffect, useState } from 'react';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

export default function Blogdmin() {
const navigate = useNavigate();
const [tags, setTags] = useState([]);
const [tagInput, setTagInput] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);
const [submitMessage, setSubmitMessage] = useState('');
const [toast, setToast] = useState({ show: false, message: '', type: '' });
const [names, setNames] = useState('');
const [userEmail, setUserEmail] = useState('');
const [isSignedIn, setIsSignedIn] = useState(false);
const [Login, setLogin] = useState({
email: '',
password: ''
});
  
const [formData, setFormData] = useState({
title: '',
authorName: '',
authorBio: '',
category: '',
date: '',
readTime: '',
featured: false,
contentTitle: '',
content: '',
contentTitle1: '',
content1: '',
contentTitle2: '',
content2: '',
contentTitle3: '',
content3: '',
contentTitle4: '',
content4: '',
contentTitle5: '',
content5: '',
contentTitle6: '',
content6: '',
contentTitle7: '',
content7: ''
});
  

const showToast = (message, type = 'success') => {
setToast({ show: true, message, type });
setTimeout(() => {
setToast({ show: false, message: '', type: '' });
}, 4000);
};

useEffect(() => {
const unsubscribe = auth.onAuthStateChanged(async (user) => {
if (user) {
try {
const userDocRef = doc(db, "adminUsers", user.uid);
const userDocSnapshot = await getDoc(userDocRef);
if (userDocSnapshot.exists()) {
const userData = userDocSnapshot.data();
// Check if user has admin role
if (userData.role === 'admin' || userData.isAdmin === true) {
// User is admin, proceed with normal flow
const fullName = `${userData.fname || ''} ${userData.lname || ''}`.trim();
const userName = fullName || userData.email || 'User';
setNames(userName);
setUserEmail(userData.email || user.email);
setFormData(prev => ({
...prev,
authorName: userName,
authorBio: userData.bio || ''
}));
setIsSignedIn(true);
} else {
// User exists but is not admin
await signOut(auth);
showToast('Access denied. Admin privileges required.', 'error');
setIsSignedIn(false);
}
} else {
// User not in admin collection
await signOut(auth);
showToast('Access denied. You are not authorized to access this page.', 'error');
setIsSignedIn(false);
}
} catch (error) {
await signOut(auth);
showToast('Error verifying admin access. Please try again.', 'error');
setIsSignedIn(false);
}
} else {
setIsSignedIn(false);
setNames('');
setUserEmail('');
setFormData({
title: '',
authorName: '',
authorBio: '',
category: '',
date: '',
readTime: '',
featured: false,
contentTitle: '',
content: '',
contentTitle1: '',
content1: '',
contentTitle2: '',
content2: '',
contentTitle3: '',
content3: '',
contentTitle4: '',
content4: '',
contentTitle5: '',
content5: '',
contentTitle6: '',
content6: '',
contentTitle7: '',
content7: '',
tags: []
});
}
});
return () => unsubscribe();
}, []);

const handleInputChange = (e) => {
const { name, value, type, checked } = e.target;
setFormData(prev => ({
...prev,
[name]: type === 'checkbox' ? checked : value
}));
};

const handleTagAdd = (e) => {
if (e.key === 'Enter' && tagInput.trim()) {
e.preventDefault();
if (!tags.includes(tagInput.trim())) {
setTags([...tags, tagInput.trim()]);
}
setTagInput('');
}
};

const removeTag = (indexToRemove) => {
setTags(tags.filter((_, index) => index !== indexToRemove));
};

const handleSubmit = async (e) => {
e.preventDefault();
if (!isSignedIn) {
showToast('You must be signed in to publish blog posts.', 'error');
return;
}
setIsSubmitting(true);
setLoading(true);
setSubmitMessage('');
try {
// Create blog post object with actual form data
const blogPost = {
title: formData.title,
authorName: formData.authorName,
authorBio: formData.authorBio,
category: formData.category,
date: formData.date,
readTime: formData.readTime,
featured: formData.featured,
contentTitle: formData.contentTitle,
content: formData.content,
contentTitle1: formData.contentTitle1,
content1: formData.content1,
contentTitle2: formData.contentTitle2,
content2: formData.content2,
contentTitle3: formData.contentTitle3,
content3: formData.content3,
contentTitle4: formData.contentTitle4,
content4: formData.content4,
contentTitle5: formData.contentTitle5,
content5: formData.content5,
contentTitle6: formData.contentTitle6,
content6: formData.content6,
contentTitle7: formData.contentTitle7,
content7: formData.content7,
tags: tags, // FIXED: Use the tags state instead of formData.tags
timestamp: new Date(),
createdAt: new Date(),
updatedAt: new Date(),
authorId: auth.currentUser?.uid || null,
authorEmail: userEmail,
status: 'published'
};

// Add the blog post to Firestore
const docRef = await addDoc(collection(db, 'blogs'), blogPost);
showToast('Blog post published successfully!', 'success');
// Reset form after successful submission
setFormData({
 title: '',
 authorName: names, // Keep author name
 authorBio: '',
 category: '',
 date: '',
 readTime: '',
 featured: false,
 contentTitle: '',
 content: '',
 contentTitle1: '',
 content1: '',
 contentTitle2: '',
 content2: '',
 contentTitle3: '',
 content3: '',
 contentTitle4: '',
 content4: '',
 contentTitle5: '',
 content5: '',
 contentTitle6: '',
 content6: '',
 contentTitle7: '',
 content7: ''
});
setTags([]); // This is correct - resetting the tags state    
} catch (error) {
showToast('Sorry, there was an error publishing your blog post. Please try again.', 'error');
} finally {
setIsSubmitting(false);
setLoading(false);
}
};

const handleLogin = async (e) => {
e.preventDefault();
setLoading(true);
setError('');
try {
// Sign in user with Firebase Auth
const userCredential = await signInWithEmailAndPassword(
auth, 
Login.email, 
Login.password
);
    
// Check if user is admin
const adminDocRef = doc(db, "adminUsers", userCredential.user.uid);
const adminDocSnapshot = await getDoc(adminDocRef);
if (!adminDocSnapshot.exists()) {
// User not in admin collection
await signOut(auth);
showToast('Access denied. Admin account required.', 'error');
return;
}
    
const userData = adminDocSnapshot.data();
if (userData.role !== 'admin' && !userData.isAdmin) {
// User exists but is not admin
await signOut(auth);
showToast('Access denied. Admin privileges required.', 'error');
return;
}
    
// User is admin, get the name and show welcome message
const fullName = `${userData.fname || ''} ${userData.lname || ''}`.trim();
const userName = fullName || userData.email || userCredential.user.email || 'Admin';
showToast(`Welcome back, ${userName}`, 'success');
navigate('/BlogAdmin');
} catch (error) {
setError(error.message);
showToast('Login failed. Please check your credentials.', 'error');
} finally {
setLoading(false);
}
};


const handleLogout = async () => {
try {
await signOut(auth);
showToast('Logged out successfully', 'success');
navigate('/BlogAdmin');
} catch (error) {
showToast('Error signing out', 'error');
}
};

// Don't render form if user is not signed in
if (!isSignedIn) {
return (
<div>
<Navbar/>
<div className="admin-cms-container">
<div className="admin-header">
<p>Please sign in as an admin user to access the blog management system.</p>
</div>

<div className="admin-login-form">
<form onSubmit={handleLogin} className="admin-form">
<div className="admin-form-group">
<label className="admin-label">Email</label>
<input
type="email"
name="email"
value={Login.email}
onChange={(e) => setLogin({ ...Login, email: e.target.value })}
className="admin-input"
required/>
</div>

<div className="admin-form-group">
<label className="admin-label">Password</label>
<input
 type="password"
 name="password"
 value={Login.password}
 onChange={(e) => setLogin({ ...Login, password: e.target.value })}
 className="admin-input"
 required/>
</div>

<button type="submit" className="admin-button admin-button-primary">
{loading ? 'Signing in...' : 'Sign In'}
</button>
</form>
{error && <div className="admin-error-message">{error}</div>}
</div>
</div>
<Footer/>
</div>
);
}

return (
<>
<Navbar/>
<div className="admin-cms-container">
<div className="admin-header">
<h1 className="admin-title">Blog CMS - Add New Post</h1>
<div className="admin-user-info">
<span className="admin-user-email">{userEmail}</span>
<button onClick={handleLogout} className="admin-button admin-button-secondary">
Logout
</button>
</div>
</div>

<form onSubmit={handleSubmit} className="admin-form">
{/* Basic Info */}
<div className="admin-section">
<h2 className="admin-section-title">Basic Information</h2>
            
<div className="admin-form-group">
<label className="admin-label">Title</label>
<input
type="text"
name="title"
value={formData.title}
onChange={handleInputChange}
className="admin-input"
required/>
</div>

<div className="admin-form-group">
<label className="admin-label">Author Name</label>
<input
type="text"
name="authorName"
value={formData.authorName}
onChange={handleInputChange}
className="admin-input"
required/>
</div>

<div className="admin-form-group">
<label className="admin-label">Author Bio</label>
<textarea
name="authorBio"
value={formData.authorBio}
onChange={handleInputChange}
className="admin-textarea"
required/>
</div>

<div className="admin-form-group">
  <label className="admin-label">Category</label>
  <select
    name="category"
    value={formData.category}
    onChange={handleInputChange}
    className="admin-input"
    required
  >
    <option value="">Select a category</option>
    <option value="politics">Politics</option>
    <option value="sports">Sports</option>
    <option value="music">Music</option>
    <option value="fashion">Fashion</option>
    <option value="gaming">Gaming</option>
    <option value="tech">Technology</option>
  </select>
</div>

<div className="admin-form-group">
<label className="admin-label">Date</label>
<input
type="date"
name="date"
value={formData.date}
onChange={handleInputChange}
className="admin-input"
required/>
</div>

<div className="admin-form-group">
<label className="admin-label">Read Time</label>
<input
type="text"
name="readTime"
value={formData.readTime}
onChange={handleInputChange}
className="admin-input"
placeholder="e.g., 4 min read"
required/>
</div>

<div className="admin-form-group">
<label className="admin-checkbox-label">
<input
type="checkbox"
name="featured"
checked={formData.featured}
onChange={handleInputChange}
className="admin-checkbox"
/>
Featured Post
</label>
</div>
</div>

{/* Content Sections */}
<div className="admin-section">
<h2 className="admin-section-title">Main Content</h2>
<div className="admin-form-group">
<label className="admin-label">Content Title</label>
<input
type="text"
name="contentTitle"
value={formData.contentTitle}
onChange={handleInputChange}
className="admin-input"
required
/>
</div>

<div className="admin-form-group">
<label className="admin-label">Content</label>
<textarea
name="content"
value={formData.content}
onChange={handleInputChange}
className="admin-textarea admin-textarea-large"
required/>
</div>
</div>

{/* Additional Content Sections */}
{[1, 2, 3, 4, 5, 6, 7].map(num => (
<div key={num} className="admin-section">
<h2 className="admin-section-title">Content Section {num}</h2>
<div className="admin-form-group">
<label className="admin-label">Content Title {num}</label>
<input
type="text"
name={`contentTitle${num}`}
value={formData[`contentTitle${num}`]}
onChange={handleInputChange}
className="admin-input"/>
</div>

<div className="admin-form-group">
<label className="admin-label">Content {num}</label>
<textarea
name={`content${num}`}
value={formData[`content${num}`]}
onChange={handleInputChange}
className="admin-textarea"/>
</div>
</div>
))}

{/* Tags */}
<div className="admin-section">
<h2 className="admin-section-title">Tags</h2>
<div className="admin-form-group">
<label className="admin-label">Add Tags</label>
<input
type="text"
value={tagInput}
onChange={(e) => setTagInput(e.target.value)}
onKeyDown={handleTagAdd}
className="admin-input"
placeholder="Enter one tag at a time, press Enter to add"/>

<div className="admin-tags-list">
{tags.map((tag, index) => (
<div key={index} className="admin-tag-item">
<span className="admin-tag-text">{tag}</span>
<button
type="button"
onClick={() => removeTag(index)}
className="admin-tag-remove">×
</button>
</div>
))}
</div>
</div>
</div>

<button
type="submit"
className="admin-button admin-button-primary admin-submit-button"
disabled={loading || isSubmitting}>
{loading ? 'Publishing...' : 'Publish Blog Post'}
</button>
</form>
</div>
<Footer/>
      
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