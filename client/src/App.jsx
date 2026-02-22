import { Routes, Route } from 'react-router-dom'
import Home from "./pages/home";
import Login from "./pages/login";
import EmailVerify from "./pages/emailverify";
import ResetPassword from "./pages/resetpassword";


const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/email-verify' element={<EmailVerify />} />
        <Route path='/reset-password' element={<ResetPassword />} />
      </Routes>
    </div>
  )
}

export default App
