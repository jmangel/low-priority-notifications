import React from 'react';
import './App.css';
import Root from './routes/root'
import { RouteObject, RouterProvider, createBrowserRouter } from 'react-router-dom';
import ErrorPage from './pages/ErrorPage';

const App = () => {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: <Root />,
      errorElement: <ErrorPage />,
    }
  ];

  return <RouterProvider router={createBrowserRouter(routes)} />
}

export default App;
