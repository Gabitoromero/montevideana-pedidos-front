import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { LoginPage } from './modules/auth/LoginPage';

// Placeholder components
// const LoginPage = () => (
//   <div className="min-h-screen flex items-center justify-center bg-gray-100">
//     <div className="bg-white p-8 rounded-lg shadow-md">
//       <h1 className="text-2xl font-bold mb-4">Login</h1>
//       <p className="text-gray-600">Login page placeholder</p>
//     </div>
//   </div>
// );

const HomePage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Home</h1>
      <p className="text-gray-600">Protected home page placeholder</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
