import {Routes, Route} from 'react-router-dom';
import {LandingPage} from '../pages/Landing/LandingPage';
import {LoginPage} from '../pages/Auth/Login';
import {RegisterPage} from '../pages/Auth/Register';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default AppRoutes;