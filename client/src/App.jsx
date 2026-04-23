import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/resetpassword";
import Navbar from "./components/Navbar";
import Welcome from "./pages/Welcome";
import TrafficSimulation from "./pages/TrafficSimulation";
import SetupAutomation from "./pages/SetupAutomation";
import SetupQueue from "./pages/SetupQueue";
import ProtectedRoute from "./components/ProtectedRoute";

// Wrapper that conditionally shows the Navbar
const AppLayout = () => {
  const location = useLocation();
  const hideNavbarPaths = ["/setup-automation", "/setup-queue", "/simulation"];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        {/* <Route path="/email-verify/:token" element={<EmailVerify />} /> */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/setup-automation" element={<ProtectedRoute><SetupAutomation /></ProtectedRoute>} />
        <Route path="/setup-queue" element={<ProtectedRoute><SetupQueue /></ProtectedRoute>} />
        <Route path="/simulation" element={<ProtectedRoute><TrafficSimulation /></ProtectedRoute>} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}

export default App