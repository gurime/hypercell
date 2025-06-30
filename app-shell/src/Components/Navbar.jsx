import navlogo from '../assets/hypercell_social.png'
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from "react-router";
import {House, CircleUser, Bell, Users, LogOut, LogIn, UserPlus} from 'lucide-react'
export default function Navbar() {
const [isOpen, setIsOpen] = useState(false);
const [isSignedIn, setIsSignedIn] = useState(false);
const [names, setNames] = useState('');
const navRef = useRef(null);
const navigate = useNavigate();
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
	  <Link title='Logout' to='/logout'>
		<LogOut color='#fff' />
	  </Link>
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
