import React from 'react';
import './App.css';
import Root from './routes/root';
import {
  Navigate,
  RouteObject,
  RouterProvider,
  createHashRouter,
} from 'react-router-dom';
import ErrorPage from './pages/ErrorPage';
import MonteCarloPage from './pages/MonteCarloPage';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { GoogleOAuthProvider } from '@react-oauth/google';

const App = () => {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: <Root />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: <Navigate to="monte_carlo" replace />,
        },
        {
          path: 'monte_carlo',
          element: (
            <ProtectedRoute>
              <MonteCarloPage />
            </ProtectedRoute>
          ),
        },
        {
          path: 'login',
          element: <LoginPage />,
        },
      ],
    },
  ];

  return (
    <GoogleOAuthProvider
      clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}
    >
      <AuthProvider>
        <RouterProvider router={createHashRouter(routes)} />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
