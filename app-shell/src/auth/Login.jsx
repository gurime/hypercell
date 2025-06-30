
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../db/firebase';
export default function Login() {
const navigate = useNavigate();
const [loading, setLoading] = useState(false);
const [error,setError] = useState('');
const [formData, setFormData] = useState({
email: '',
password: ''
});
const [toast, setToast] = useState({ show: false, message: '', type: '' });
const showToast = (message, type = 'success') => {
setToast({ show: true, message, type });
setTimeout(() => {
setToast({ show: false, message: '', type: '' });
}, 4000);
};



const handleChange = (e) => {
setFormData({
...formData,
[e.target.name]: e.target.value
});
};

const handleSubmit = async (e) => {
e.preventDefault();
setLoading(true);
setError('');

try {
// Sign in user with Firebase Auth
await signInWithEmailAndPassword(
auth, 
formData.email, 
formData.password
);
// Show success message and redirect
showToast('Login successful', 'success');
setTimeout(() => {
navigate('/');
}, 1000);
} catch (error) {
setError(error.message);
      
// Handle different Firebase auth errors
let errorMessage = 'Login failed';
      
if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
errorMessage = 'Wrong password. Please try again.';
} else if (error.code === 'auth/user-not-found') {
errorMessage = 'No account found with this email.';
} else if (error.code === 'auth/invalid-email') {
errorMessage = 'Invalid email address.';
} else if (error.code === 'auth/too-many-requests') {
errorMessage = 'Too many failed attempts. Please try again later.';
}
// Show error toast
showToast(errorMessage, 'error');
} finally {
setLoading(false);
}
};
return (
<>
<div className="login-page">
<div className="login-container">
<div className="login-card">
<h1 className="login-title">Welcome Back</h1>
<p className="login-subtitle">Sign in to your Hypercell Social account</p>            
<form onSubmit={handleSubmit} className="login-form">

<div className="form-group">
<label htmlFor="email" className="form-label">Email Address</label>
<input 
type="email" 
id="email" 
name="email" 
value={formData.email}
onChange={handleChange}
className="form-input"
required />
</div>
              
<div className="form-group">
<label htmlFor="password" className="form-label">Password</label>
<input 
type="password" 
id="password" 
name="password" 
value={formData.password}
onChange={handleChange}
className="form-input"
required />
</div>
              
<div className="form-options">
<a href="/forgotPassword" className="forgot-password-link">
Forgot your password?
</a>
</div>
              
<button 
type="submit" 
className="login-button"
disabled={loading}>
{loading ? 'Signing In...' : 'Sign In'}
</button>
</form>
            
<div className="login-footer">
<p>Don&apos;t have an account? <a href="/signup" className="signup-link">Create Account</a></p>
</div>
</div>
</div>
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
</div>
)}
</>
)
}
