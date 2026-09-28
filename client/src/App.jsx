import { Navigate, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Classes from './pages/Classes';
import ClassDetails from './pages/ClassDetails';
import Home from './pages/Home';
import Login from './pages/Login';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageBookings from './pages/admin/ManageBookings';
import ManageClasses from './pages/admin/ManageClasses';
import ManageUsers from './pages/admin/ManageUsers';
import ClassLearners from './pages/trainer/ClassLearners';
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import LearnerDashboard from './pages/learner/LearnerDashboard';

function App() {
  return (
    <AuthProvider>
      <div className="app-shell">
        <Navbar />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/classes/:id" element={<ClassDetails />} />
            <Route
              path="/learner"
              element={
                <ProtectedRoute allowedRoles={['learner']}>
                  <LearnerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute allowedRoles={['learner']}>
                  <MyBookings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['learner', 'trainer', 'admin']}>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/classes"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageClasses />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageBookings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageUsers />
                </ProtectedRoute>
              }
            />

            <Route
              path="/trainer"
              element={
                <ProtectedRoute allowedRoles={['trainer']}>
                  <TrainerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/trainer/classes"
              element={
                <ProtectedRoute allowedRoles={['trainer']}>
                  <ManageClasses />
                </ProtectedRoute>
              }
            />

            <Route
              path="/trainer/classes/:classId/learners"
              element={
                <ProtectedRoute allowedRoles={['trainer']}>
                  <ClassLearners />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
