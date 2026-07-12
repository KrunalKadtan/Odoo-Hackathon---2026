import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { OrganizationPage } from './pages/admin/OrganizationPage';
import { AssetsPage } from './pages/assets/AssetsPage';
import { AllocationsPage } from './pages/allocations/AllocationsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          {
            path: '/',
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/assets',
            element: <AssetsPage />,
          },
          {
            path: '/allocations',
            element: <AllocationsPage />,
          },
          {
            path: '/admin/organization',
            element: <OrganizationPage />,
          },
        ]
      }
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  }
]);
