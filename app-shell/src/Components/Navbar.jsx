/* eslint-disable no-unused-vars */
import navlogo from '/images/assets/hypercell_social.png'
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from "react-router";
import {House, CircleUser, Bell, Users, LogOut, LogIn, UserPlus} from 'lucide-react'
import { auth,db } from '../db/firebase';
import { doc, getDoc} from 'firebase/firestore';

export default function Navbar() {
const [isSignedIn, setIsSignedIn] = useState(false);
const [isAdmin, setIsAdmin] = useState(false);
const [names, setNames] = useState('');
const [notifications, setNotifications] = useState(0); // For notification badge
const navRef = useRef(null);
const navigate = useNavigate();
const location = useLocation();

useEffect(() => {
// Focus on mount
if (navRef.current) {
navRef.current.focus();
}
}, []);

useEffect(() => {
let isMounted = true;

// In your Navbar component
const unsubscribe = auth.onAuthStateChanged(async (user) => {
if (user) {
try {
            // Get user's custom claims
const idTokenResult = await user.getIdTokenResult();
const isAdmin = idTokenResult.claims.admin === true;
            
// Choose the appropriate collection based on user type
const collection = isAdmin ? "adminUsers" : "users";
const userDocRef = doc(db, collection, user.uid);
const userDocSnapshot = await getDoc(userDocRef);
            
if (userDocSnapshot.exists() && isMounted) {
const userData = userDocSnapshot.data();
const fullName = `${userData.fname || ''} ${userData.lname || ''}`.trim();
setNames(fullName || userData.email || (isAdmin ? 'Admin' : 'User'));
} else if (isMounted) {
setNames(isAdmin ? 'Admin' : 'User');
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

const handleLogout = async () => {
try {
await auth.signOut();
setTimeout(() => {
navigate('/login');
}, 2000);} catch (error) {
console.error('Logout error:', error);
}
};

const isActiveLink = (path) => {
return location.pathname === path;
};

const getInitials = (name) => {
return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
};

return (
<nav ref={navRef} tabIndex={-1} className="navbar" id="top-navbar">
<div className="logo">
<Link to="/">
<img src={navlogo} alt="Hypercell Social Logo"/>
</Link>
</div>

<ul className="navlinks">
{isSignedIn ? (
<div className='icon-nav'>
<Link 
to='/' 
title='Home'
className={isActiveLink('/') ? 'active' : ''}>
<House size={20} color='#8b5cf6' />
</Link>


<Link to='/profile' >{names}</Link>    

<Link 
to='/profile' 
title='Profile'
className={isActiveLink('/profile') ? 'active' : ''}>
<CircleUser size={20} color='#8b5cf6' />
</Link>
            
<Link 
to='/notifications' 
title='Notifications'
className={isActiveLink('/notifications') ? 'active' : ''}
style={{ position: 'relative' }}>
<Bell size={20} color='#8b5cf6' />
{notifications > 0 && (
<span className="notification-badge">
{notifications > 99 ? '99+' : notifications}
</span>
)}
</Link>
            
<Link 
to='/friends' 
title='Friends'
className={isActiveLink('/friends') ? 'active' : ''}
>
<Users size={20} color='#8b5cf6' />
</Link>
            
<button 
title='Logout' 
onClick={handleLogout}
className="logout-button"
>
<LogOut size={20} color='#8b5cf6' />
</button>
</div>
) : (
<div className="auth-links">
<Link to='/login' title='Sign In'>
<LogIn size={16} />
Sign In
</Link>

<Link to='/signup' title='Sign Up'>
<UserPlus size={16} />
Sign Up
</Link>
</div>
)}
</ul>
</nav>);
}