import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/resetpassword";
import Navbar from "./components/Navbar";
import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";

const App = () => {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* ✅ NEW DASHBOARD ROUTE */}
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>

    </BrowserRouter>
  )
}

export default App