import { Route, Routes } from "react-router-dom"
import Home from './Components/Home'
import NoPage from "./Components/Nopage"

function App() {
return (
<>
<Routes>
<Route path="/" element={<Home />} />
{/* Other routes */}





{/* Catch all route */}
<Route path="*" element={<NoPage />} />
</Routes>
</>
  )
}

export default App
