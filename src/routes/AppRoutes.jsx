import {Routes, Route} from 'react-router-dom';
import {LandingPage} from '../pages/Landing/LandingPage';
import {LoginPage} from '../pages/Auth/Login';
import {RegisterPage} from '../pages/Auth/Register';
import{ ForgotPasswordPage} from '../pages/Auth/ForgottenPassword'
import {ResetPasswordPage} from '../pages/Auth/ResetPasswordPage'
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgottenpassword" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
    </Routes>
  );
}

export default AppRoutes;