import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Layout } from './components/Layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';

// Public pages
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Student pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentAssignments } from './pages/student/StudentAssignments';

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { isAuthenticated, user } = useAuthStore();

  const getDefaultRoute = () => {
    if (!isAuthenticated || !user) return '/';
    return `/${user.role.toLowerCase()}/dashboard`;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Landing />} />
            <Route path="/login" element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Register />} />

            {/* Student routes */}
            <Route path="/student/dashboard" element={
              <ProtectedRoute requiredRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/assignments" element={
              <ProtectedRoute requiredRoles={['STUDENT']}>
                <StudentAssignments />
              </ProtectedRoute>
            } />

            {/* Placeholder routes for other pages */}
            <Route path="/student/grades" element={
              <ProtectedRoute requiredRoles={['STUDENT']}>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Grades</h2>
                  <p className="text-gray-600">This page is coming soon!</p>
                </div>
              </ProtectedRoute>
            } />
            <Route path="/student/profile" element={
              <ProtectedRoute requiredRoles={['STUDENT']}>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile</h2>
                  <p className="text-gray-600">This page is coming soon!</p>
                </div>
              </ProtectedRoute>
            } />

            {/* Teacher routes */}
            <Route path="/teacher/dashboard" element={
              <ProtectedRoute requiredRoles={['TEACHER']}>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Teacher Dashboard</h2>
                  <p className="text-gray-600">This page is coming soon!</p>
                </div>
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h2>
                  <p className="text-gray-600">This page is coming soon!</p>
                </div>
              </ProtectedRoute>
            } />

            {/* Catch all - redirect to appropriate dashboard */}
            <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
          </Routes>
        </Layout>

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </QueryClientProvider>
  );
}

export default App;