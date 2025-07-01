/* eslint-disable no-unused-vars */
 
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import navlogo from '../assets/hypercell_social.png'
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

{/*fourth tablebox stops here*/}

<hr style={{color:'#fff',border:'solid 1px'}}/>

<div  className="nav logo-footer">
 {isSignedIn ? (  
 <img src={gpremium} alt="" />
 ) : (
  <img  title='Home Page' style={{marginRight:'auto '}} onClick={() => navigate('/')} src={navlogo}  alt='...'  />

 )}






<div className="navlinks sm-navlink" >
<NavLink to='/contact' style={activeStyle} > Contact Hypercell Social</NavLink>
<NavLink to='/help' style={activeStyle}>Help</NavLink>
<NavLink to='/faq' style={activeStyle}>FAQ</NavLink> 
<NavLink to='/about' style={activeStyle}>About Hypercell Social</NavLink>
<NavLink  to='/terms' style={activeStyle}> Terms of Use</NavLink> 
<NavLink  to='/privacy' style={activeStyle}>Privacy Policies</NavLink>
<NavLink style={activeStyle} to="/careers">Careers</NavLink>
<NavLink style={activeStyle} to="/press">Press Releases </NavLink>
<NavLink style={activeStyle} to="/investors">Investor Relations</NavLink>
<NavLink style={activeStyle} to="/sustainability">Sustainability</NavLink>
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