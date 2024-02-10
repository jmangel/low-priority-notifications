import React from 'react';
import './App.css';
import Root from './routes/root'
import { RouteObject, RouterProvider, createBrowserRouter } from 'react-router-dom';

const App = () => {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: <Root />
    }
  ];

  return <RouterProvider router={createBrowserRouter(routes)} />
}

export default App;
