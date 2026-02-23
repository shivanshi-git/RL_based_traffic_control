import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/resetpassword";
import Navbar from "./components/Navbar";
import Welcome from "./pages/Welcome";

const App = () => {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        {/* <Route path="/email-verify/:token" element={<EmailVerify />} /> */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path="/welcome" element={<Welcome />} />
      </Routes>

    </BrowserRouter>
  )
}

export default App