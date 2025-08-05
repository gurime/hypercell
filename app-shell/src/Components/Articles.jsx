/* eslint-disable no-unused-vars */
import Navbar from './Navbar'
import Footer from './Footer'
import { useNavigate } from 'react-router';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../db/firebase';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import ClipLoader from 'react-spinners/ClipLoader';

export default function Articles() {
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [articles, setArticles] = useState(null);
const [toast, setToast] = useState({ show: false, message: '', type: '' });
const showToast = (message, type = 'success') => {
setToast({ show: true, message, type });
setTimeout(() => {
setToast({ show: false, message: '', type: '' });
}, 4000);
};
const { id } = useParams();
const navigate = useNavigate();

useEffect(() => {
const fetchArticles = async () => {
try {
const querySnapshot = await getDocs(collection(db, 'blogs'));
const articles = querySnapshot.docs.map(doc => {
const data = { _id: doc.id, ...doc.data() };
return data;
});
setArticles(articles);
setLoading(false);
} catch (error) {
setError(error.message);
setLoadingArticles(false);
showToast('Failed to load articles', 'error');
}
};
fetchArticles();
}, [id]);


// Helper function to render content sections dynamically
const renderContentSections = () => {
const sections = [];
for (let i = 0; i <= 7; i++) {
const contentKey = i === 0 ? 'content' : `content${i}`;
const titleKey = i === 0 ? 'contentTitle' : `contentTitle${i}`;
if (articles[contentKey]) {
sections.push(
<div key={i} className="articles-body">
{articles[titleKey] && <h2>{articles[titleKey]}</h2>}
<p>{articles[contentKey]}</p>
</div>
);
}
}
return sections;
};

if (loading) {
return (
<>
<Navbar />
<div className="loading-container"> 
<ClipLoader size={50} color="#2637be"/>
</div>
<Footer />
</>
);
}

if (error) {
return (
<>
<Navbar />
<div className="error-container">
<h2>Article Not Found</h2>
<p>{error || "The requested article could not be found."}</p>
<button onClick={() => navigate(-1)} className="back-button">← Go Back</button>
</div>
<Footer />
</>
);
}

return (
<>
<Navbar/>
<article className="article-container">
<header className="article-header">
<div className="article-meta-top">
{articles.category && (
<span className="article-category">{articles.category}</span>
)}

{articles.date && (
<time className="article-date">{new Date(articles.date).toLocaleDateString('en-US', { 
year: 'numeric', 
month: 'long', 
day: 'numeric' 
})}</time>
)}
</div>
          
<h1 className="article-title">{articles.title}</h1>
          
<div className="article-meta-bottom">
{articles.authorName && (
<div className="author-info">
<span className="author-name">By {articles.authorName}</span>
</div>
)}

{articles.readTime && (
<span className="read-time">{articles.readTime} min read</span>
)}
</div>
          
<button className="article-back-button" onClick={() => navigate(-1)}>
← Back to What's Happening
</button>
</header>

<div className="article-content">
{renderContentSections()}
</div>

{(articles.authorName || articles.authorBio || articles.tags) && (
<footer className="article-footer">
{(articles.authorName || articles.authorBio) && (
<div className="author-section">
<div className="author-details">
{articles.authorName && <h4>About {articles.authorName}</h4>}
{articles.authorBio && <p>{articles.authorBio}</p>}
</div>
</div>
)}

{articles.tags && articles.tags.length > 0 && (
<div className="article-tags">
<h5>Tags:</h5>
<div className="tags-list">
{articles.tags.map((tag, index) => (
<span key={index} className="tag">#{tag}</span>
))}
</div>
</div>
)}
</footer>
)}
</article>
<Footer/>
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
)
}