/* eslint-disable no-unused-vars */
 
import {  NavLink, useNavigate } from 'react-router-dom';
import navlogo from '/images/assets/hypercell_social.png'



export default function Footer() { 
const navigate = useNavigate();




const activeStyle = ({ isActive }) => ({
backgroundColor: isActive ? 'blue' : '',
color: isActive ? 'white' : '',
textDecoration: 'none'
});




return(
<>

<footer className='footer'>


{/*fourth tablebox stops here*/}

<hr style={{color:'#fff',border:'solid 1px'}}/>

<div  className="nav logo-footer">

  <img  title='Home Page' style={{marginRight:'auto '}} onClick={() => navigate('/')} src={navlogo}  alt='...'  />







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

<img  src={navlogo} alt="..."     />

</div>
</footer>



</>
)
}