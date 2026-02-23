import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import EmailVerify from "./pages/emailverify";
import ResetPassword from "./pages/resetpassword";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/email-verify' element={<EmailVerify />} />
        <Route path='/reset-password' element={<ResetPassword />} />
      </Routes>

    </BrowserRouter>
  )
}

export default App