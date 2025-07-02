import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react'
import { useParams } from 'react-router';
import { db } from '../db/firebase';
import Navbar from './Navbar';
import Footer from './Footer';

export default function CommunityDetails() {
  const [blog, setBlog] = useState(null);
  let { id } = useParams();
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        // Fetch specific document by ID
        const docRef = doc(db, 'communityPosts', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setBlog({
            _id: docSnap.id,
            ...docSnap.data()
          });
        }
        // Errors are not tracked since 'error' is removed
      } catch (error) {
        // Errors are not tracked since 'error' is removed
      } finally {
        // Loading state is not tracked since 'loading' is removed
      }
    };

    if (id) {
      fetchBlog();
    }
    // No else block since 'error' and 'loading' are removed
  }, [id]); // Add id as dependency
  return (
    <>
    <Navbar/>
      {blog && blog.content}
      {blog && blog.category}
      <Footer/>
    </>
  )
}
