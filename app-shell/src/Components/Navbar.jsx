import navlogo from '../assets/chats.png'
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from "react-router";
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
</ul>
</nav>
</>
)
}
