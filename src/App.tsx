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
import AuthGuard from './components/AuthGuard';

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
            <AuthGuard>
              <MonteCarloPage />
            </AuthGuard>
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
    <AuthProvider>
      <RouterProvider router={createHashRouter(routes)} />
    </AuthProvider>
  );
};

export default App;
