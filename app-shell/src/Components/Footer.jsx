/* eslint-disable no-unused-vars */
 
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import navlogo from '../assets/chats.png'
import { useEffect, useState } from 'react';
// import { auth, db } from '../db/firebase';
// import { doc, getDoc } from 'firebase/firestore';


export default function Footer() { 
const location = useLocation();
const navigate = useNavigate();
const iSNewsLetterPage = location.pathname === '/newsletter';
const [isSignedIn, setIsSignedIn] = useState(false);
const [names, setNames] = useState('');


// Check if current route is /contact
const scrollToTopNav = () => {
const nav = document.getElementById('top-navbar');
if (nav) nav.scrollIntoView({ behavior: 'smooth' });
};

const activeStyle = ({ isActive }) => ({
backgroundColor: isActive ? 'blue' : '',
color: isActive ? 'white' : '',
textDecoration: 'none'
});


// useEffect(() => {
// const unsubscribe = auth.onAuthStateChanged(async (user) => {
// if (user) {
// try {
// const userDocRef = doc(db, "users", user.uid);
// const userDocSnapshot = await getDoc(userDocRef);
// if (userDocSnapshot.exists()) {
// const userData = userDocSnapshot.data();
// // Get the full name from fname and lname
// const fullName = `${userData.fname || ''} `.trim();
// setNames(fullName || userData.email || 'User');
// } else {
// setNames('User');
// }
// setIsSignedIn(true);
// } catch (error) {
// setIsSignedIn(true); // Still signed in even if we can't fetch user data
// setNames('User');
// }
// } else {
// setIsSignedIn(false);
// setNames('');
// }
// }); 
// return () => unsubscribe();
// }, []);


return(
<>

<footer className='footer'>
{!iSNewsLetterPage &&(
<div className='footer-headline'>
<button className='footer-newsletterbtn' onClick={() => navigate('/newsletter')}>
Sign-Up for our Newsletter
</button>
</div> )}
<div className="flex-footer">
<div className="footer-tablebox"> 
<div className="footer-headline">Make Money With Us</div>
<ul className="footer-navlink">
<li><Link to="/sell">Sell on Gulime</Link></li>
<li><Link to="/affiliate">Affiliate Program</Link></li>
<li><Link to="/business">Business Solutions </Link></li>
<li><Link to="/advertise">Advertise Your Products</Link></li>
<li><Link to="/wholesale">Wholesale Opportunities</Link></li>
</ul>
</div>
{/*first tablebox stops here*/}
<div className="footer-tablebox"> 
<div className="footer-headline">Fashion</div>
<ul className="footer-navlink">
<li><Link to="/fashion/womens-clothing">Women&apos;s Clothing</Link></li>
<li><Link to="/fashion/mens-clothing">Men&apos;s Clothing</Link></li>
<li><Link to="/fashion/shoes">Shoes</Link></li>
<li><Link to="/fashion/watches">Watches</Link></li>
<li><Link to="/fashion/accessories">Accessories</Link></li>
</ul>
</div>
{/*seconds tablebox stops here*/}
<div className="footer-tablebox"> 
<div className="footer-headline">Home & Living</div>
<ul className="footer-navlink">
<li><Link to="/home/kitchen-essentials">Kitchen Essentials</Link></li>
<li><Link to="/home/bedding-and-bath">Bedding & Bath</Link></li>
<li><Link to="/home/lighting">Lighting</Link></li>
<li><Link to="/home/storage-and-organization">Storage & Organization</Link></li>
<li><Link to="/home/decor">Decor</Link></li>
</ul>
</div>
{/*third tablebox stops here*/}
<div className="footer-tablebox" style={{borderRight:'none' ,borderBottom:'none'}}> 
<div className="footer-headline">Health & Care</div>
<ul className="footer-navlink">
<li><Link to="/health/skincare">Skincare</Link></li>
<li><Link to="/health/makeup">Makeup</Link></li>
<li><Link to="/health/haircare">Hair Care </Link></li>
<li><Link to="/health/vitamins">Vitamins</Link></li>
<li><Link to="/health/medical">Medical Supplies</Link></li>
</ul>
</div>
{/*fourth tablebox stops here*/}


</div>
<hr style={{color:'#fff',border:'solid 1px'}}/>

<div  className="nav logo-footer">
 {isSignedIn ? (  
 <img src={gpremium} alt="" />
 ) : (
  <img  title='Home Page' style={{marginRight:'auto '}} onClick={() => navigate('/')} src={navlogo}  alt='...'  />

 )}






<div className="navlinks sm-navlink" >
<NavLink to='/contact' style={activeStyle} > Contact Gulime</NavLink>
<NavLink to='/help' style={activeStyle}>Help</NavLink>
<NavLink to='/faq' style={activeStyle}>FAQ</NavLink> 
<NavLink to='/about' style={activeStyle}>About Gulime</NavLink>
<NavLink  to='/terms' style={activeStyle}> Terms of Use</NavLink> 
<NavLink  to='/privacy' style={activeStyle}>Privacy Policies</NavLink>
<NavLink style={activeStyle} to="/shippinginfo" >Shipping Information</NavLink>
<NavLink style={activeStyle} to="/careers">Careers</NavLink>
<NavLink style={activeStyle} to="/press">Press Releases </NavLink>
<NavLink style={activeStyle} to="/investors">Investor Relations</NavLink>
<NavLink style={activeStyle} to="/sustainability">Sustainability</NavLink>
<NavLink style={activeStyle} to="/returns">Returns & Refunds</NavLink>
<NavLink style={activeStyle}  to='/cookie'>Cookie Policies</NavLink>


</div>
</div>
<hr />
<div style={{
color:'#fff',
padding:'1rem 0',
textAlign:'center'
}}>
   &#169;2030 Hypercell Social, LLC All Rights Reserved <br />

</div>
<hr />

<div style={{
color:'#fff',
padding:'1rem 0',
textAlign:'center'
}}>
   <br />
    This material may not be published, broadcast, rewritten, or redistributed. 
</div>


<div className="footer-logo-box">

<img title='To Top'  onClick={scrollToTopNav}  src={navlogo} alt="..."     />

</div>
</footer>



</>
)
}