import {Routes, Route} from 'react-router-dom';
import {LandingPage} from '../pages/Landing/LandingPage';
import {LoginPage} from '../pages/Auth/Login';
import {RegisterPage} from '../pages/Auth/Register';
import{ ForgotPasswordPage} from '../pages/Auth/ForgottenPassword'
import {ResetPasswordPage} from '../pages/Auth/ResetPasswordPage'
import {OnboardingPage } from '../pages/Auth/Onboarding';
import { DashboardPage } from '../pages/Dashboard/dashboard';
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgottenpassword" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />

      
      
      
    </Routes>
  );
}

export default AppRoutes;