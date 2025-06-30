import { Route, Routes } from "react-router-dom"
import Home from './Components/Home'
import NoPage from "./Components/Nopage"
import Profile from './auth/Profile'
import Signup from "./auth/Signup"
import Login from "./auth/Login"
import RequireAuth from './auth/RequireAuth'
function App() {
return (
<>
<Routes>
<Route path="/" element={
<RequireAuth>
<Home />
</RequireAuth>}/>
{/* Other routes */}
<Route path="/profile" element={<Profile />} />
<Route path="/login" element={<Login/>}/>
<Route path="/signup" element={<Signup/>}/>




{/* Catch all route */}
<Route path="*" element={<NoPage />} />
</Routes>
</>
  )
}

export default App
