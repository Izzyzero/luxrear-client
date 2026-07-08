import {Routes, Route} from 'react-router-dom';
import {LandingPage} from '../pages/Landing/LandingPage';
import {LoginPage} from '../pages/Auth/Login';
import {RegisterPage} from '../pages/Auth/Register';
import{ ForgotPasswordPage} from '../pages/Auth/ForgottenPassword'
import {ResetPasswordPage} from '../pages/Auth/ResetPasswordPage'
import {OnboardingPage } from '../pages/Auth/Onboarding';
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { HomeFeedPage } from '../pages/Dashboard/HomeFeedPage'
import {ProfilePage} from '../pages/Profiles/Profile'
import {ExchangePage} from '../pages/Exchange/Exchange'
import {CommunityPage} from '../pages/Community/Community'
import {DiasporaPage} from '../pages/Diaspora/Diaspora'
import {SupportPage} from '../pages/Support/Support'
import {AdminPage} from '../pages/Admin/Admin'
import {ThreadPage} from '../pages/Community/ThreadPage'



function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgottenpassword" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      {/* <Route path="/dashboard" element={<DashboardPage />} /> */}
      <Route path="/dashboard" element={<DashboardLayout />}>
  <Route index element={<HomeFeedPage />} />
  <Route path="profile" element={<ProfilePage />} />
  <Route path="exchange" element={<ExchangePage />} />
  <Route path="community" element={<CommunityPage />} />
<Route path="community/thread/:postId" element={<ThreadPage />} />
  <Route path="diaspora" element={<DiasporaPage />} />
  <Route path="support" element={<SupportPage />} />
  <Route path="admin" element={<AdminPage />} />
</Route>


      
      
    </Routes>
  );
}

export default AppRoutes;