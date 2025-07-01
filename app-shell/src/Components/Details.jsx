import { useNavigate, useParams } from "react-router-dom";
import Navbar from "./Navbar";
import ClipLoader from "react-spinners/ClipLoader";
import Footer from "./Footer";
import { useEffect, useState } from "react";
import {  doc, getDoc } from "firebase/firestore";
import { db } from "../db/firebase";

export default function Details() {
 const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [blog,setBlog] = useState(null);
const [toast, setToast] = useState({ show: false, message: '', type: '' });

const navigate = useNavigate();
 let { id } = useParams();
 useEffect(() => {
    const fetchBlog = async () => {
      try {
        // Fetch specific document by ID
        const docRef = doc(db, 'blogs', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setBlog({
            _id: docSnap.id,
            ...docSnap.data()
          });
        } else {
          setError("Blog not found");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    } else {
      setError("No blog ID provided");
      setLoading(false);
    }
  }, [id]); // Add id as dependency

if (loading) {
return (
<>
<Navbar />
<div className="loading"> 
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
<div className="error-message">
<h2>Blog Not Found</h2>
<p>{error || "The requested blog could not be found."}</p>
<button onClick={() => navigate(-1)} className="no-page-button">← Go Back</button>
</div>
<Footer />
</>
);
}
  return (
    <>
<Navbar/>

 <div className="blog-container">
<div className="blog-details">
<header className="blog-header">
<h1 className="blog-title">{blog.title}</h1>
<div className="blog-meta">
{blog.date && <time className="blog-date">{blog.date}</time>}
{blog.category && <span className="blog-category">{blog.category}</span>}
{blog.readTime && <span className="read-time">{blog.readTime}</span>}
<button className="back-button" onClick={() => navigate(-1)}>← Go Back</button>
</div>
</header>

        
<div className="blog-content">
{blog.content && (
<div className="blog-body">
{blog.contentTitle && <h2>{blog.contentTitle}</h2>}
<p>{blog.content}</p>
</div>
)}

{blog.content1 && (
<div className="blog-body">
{blog.contentTitle1 && <h2>{blog.contentTitle1}</h2>}
<p>{blog.content1}</p>
</div>
)}

{blog.content2 && (
<div className="blog-body">
{blog.contentTitle2 && <h2>{blog.contentTitle2}</h2>}
<p>{blog.content2}</p>
</div>
)}

{blog.content3 && (
<div className="blog-body">
{blog.contentTitle3 && <h2>{blog.contentTitle3}</h2>}
<p>{blog.content3}</p>
</div>
)}

{blog.content4 && (
<div className="blog-body">
{blog.contentTitle4 && <h2>{blog.contentTitle4}</h2>}
<p>{blog.content4}</p>
</div>
)}

{blog.content5 && (
<div className="blog-body">
{blog.contentTitle5 && <h2>{blog.contentTitle5}</h2>}
<p>{blog.content5}</p>
</div>
)}

{blog.content6 && (
<div className="blog-body">
{blog.contentTitle6 && <h2>{blog.contentTitle6}</h2>}
<p>{blog.content6}</p>
</div>
)}

{blog.content7 && (
<div className="blog-body">
{blog.contentTitle7 && <h2>{blog.contentTitle7}</h2>}
<p>{blog.content7}</p>
</div>
)}
</div>

{(blog.authorName || blog.authorBio || blog.tags) && (
<footer className="blog-footer">
{(blog.authorName || blog.authorBio) && (
<div className="author-info">
<div className="author-details">
{blog.authorName && <h4>{blog.authorName}</h4>}
{blog.authorBio && <p>{blog.authorBio}</p>}
</div>
</div>
)}

{blog.tags && blog.tags.length > 0 && (
<div className="blog-tags">
{blog.tags.map((tag, index) => (
<span key={index} className="tag">{tag}</span>
))}
</div>
)}
</footer>
)}
</div>
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
)
}