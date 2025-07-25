import { Route, Routes } from "react-router-dom"
import Home from './Components/Home'
import NoPage from "./Components/Nopage"
import Profile from './auth/Profile'
import Signup from "./auth/Signup"
import Login from "./auth/Login"
import RequireAuth from './auth/RequireAuth'
import Details from "./Components/Details"
import BlogAdmin from "./Admin/BlogAdmin"
import CommunityDetails from "./Components/CommunityDetails"
function App() {
return (
<>
<Routes>
<Route path="/" element={
<RequireAuth>
<Home />
</RequireAuth>}/>
<Route path='/blog/:id' element={<Details/>}/>
<Route path='/community/:id' element={<CommunityDetails/>}/>
{/* Other routes */}
<Route path="/profile" element={<Profile />} />
<Route path="/login" element={<Login/>}/>
<Route path="/signup" element={<Signup/>}/>
<Route path="/BlogAdmin" element={<BlogAdmin/>}/>




{/* Catch all route */}
<Route path="*" element={<NoPage />} />
</Routes>
</>
  )
}

export default App
