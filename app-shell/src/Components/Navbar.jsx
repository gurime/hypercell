import navlogo from '../assets/hypercell_social.png'
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from "react-router";
import {House, CircleUser, Bell, Users, LogOut, LogIn, UserPlus} from 'lucide-react'
import { auth,db } from '../db/firebase';
import { doc, getDoc} from 'firebase/firestore';
export default function Navbar() {
const [isOpen, setIsOpen] = useState(false);
const [isSignedIn, setIsSignedIn] = useState(false);
const [names, setNames] = useState('');
const navRef = useRef(null);
const navigate = useNavigate();

useEffect(() => {
  let isMounted = true;

const unsubscribe = auth.onAuthStateChanged(async (user) => {
if (user) {
try {
const userDocRef = doc(db, "users", user.uid);
const userDocSnapshot = await getDoc(userDocRef);
if (userDocSnapshot.exists() && isMounted) {
const userData = userDocSnapshot.data();
const fullName = `${userData.fname || ''}`.trim();
setNames(fullName || userData.email || 'User');
} else if (isMounted) {
setNames('User');
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

return (
<>
<nav ref={navRef} tabIndex={-1} className="navbar" id="top-navbar">
<div className="logo">
<Link to="/">
<img src={navlogo} alt="Logo"/>  
</Link>
</div>

<ul className="navlinks">
  {isSignedIn ? (
	<div className='icon-nav profilecss'>
	  <Link title='Home' to='/'>
		<House color='#fff' />
	  </Link>
	  <Link title='Profile' to='/profile'>
		<CircleUser color='#fff' />
	  </Link>
	  <Link title='Notifications' to='/notifications'>
		<Bell color='#fff' />
	  </Link>
	  <Link title='Friends' to='/friends'>
		<Users color='#fff' />
	  </Link>
<button title='Logout' onClick={() => {
  auth.signOut().then(() => navigate('/login'));
}} className="logout-button">
  <LogOut color='#fff' />
</button>
	</div>
  ) : (
<>
<Link title='Login' to='/login'>
Sign In
</Link>

<Link>
Sign Up
</Link>
</>
)}
</ul>
</nav>
</>
)
}
