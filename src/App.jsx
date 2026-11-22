import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useLayoutEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import NavBar from "./Component/NavBar.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";

const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Enroll = lazy(() => import("./pages/enrollment/Enroll.jsx"));
const Verify = lazy(() => import("./pages/verification/Verify.jsx"));
const Blog = lazy(() => import("./pages/Blog.jsx"));
const Dashboard = lazy(() => import("./pages/dashboard/dashboard.jsx"));
const UserProfilePage = lazy(() => import("./pages/dashboard/dashboard.jsx").then(module => ({ default: module.UserProfilePage })));
const UserSettingsPage = lazy(() => import("./pages/dashboard/dashboard.jsx").then(module => ({ default: module.UserSettingsPage })));

function AppContent() {
  const location = useLocation();
  const { checking, isLoggedIn, isAdmin } = useAuth();
  const isAdminPath = location.pathname === "/admin" || location.pathname.startsWith("/admin/");
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    document.body.classList.toggle("admin-route", isAdminPath);
    root.style.scrollBehavior = "auto";
    if (location.hash) {
      window.requestAnimationFrame(() => {
        document.querySelector(location.hash)?.scrollIntoView();
      });
    } else {
      window.scrollTo(0, 0);
    }
    root.style.scrollBehavior = previousScrollBehavior;
  }, [isAdminPath, location.hash, location.pathname]);

  return (
    <>
      {!isAdminPath && <NavBar />}
      <div className={`page-shell${isAdminPath ? " page-shell-admin" : ""}`}>
        <Suspense fallback={<div className="route-loading" role="status">Loading page…</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={checking ? null : isLoggedIn ? <Navigate to={isAdmin ? "/admin" : "/"} replace /> : <Signup />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/:section" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/settings" element={<UserSettingsPage />} />
            <Route path="/enrollment" element={<Enroll />} />
            <Route path="/verification" element={<Verify />} />
            <Route path="/ourblog" element={<Blog />} />
            <Route path="/ourblog/:slug" element={<Blog />} />
            <Route path="/enrollment-preview" element={<Navigate to="/enrollment" replace />} />
            <Route path="/verification-preview" element={<Navigate to="/verification" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;