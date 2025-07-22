import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout.jsx'
import OrderList from '../features/orders/pages/OrderList.jsx'
import OrderEdit from '../features/orders/pages/OrderEdit.jsx'

// Dashboard placeholder component
const Dashboard = () => (
  <div>
    <h1>Dashboard</h1>
    <p>Welcome to Demo App v2!</p>
  </div>
)

// Placeholder components for future features
const Customers = () => <div><h1>Customers</h1><p>Coming soon...</p></div>
const Products = () => <div><h1>Products</h1><p>Coming soon...</p></div>

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <MainLayout>
        <Dashboard />
      </MainLayout>
    ),
  },
  {
    path: '/orders',
    element: (
      <MainLayout>
        <OrderList />
      </MainLayout>
    ),
  },
  {
    path: '/orders/:id/edit',
    element: (
      <MainLayout>
        <OrderEdit />
      </MainLayout>
    ),
  },
  {
    path: '/customers',
    element: (
      <MainLayout>
        <Customers />
      </MainLayout>
    ),
  },
  {
    path: '/products',
    element: (
      <MainLayout>
        <Products />
      </MainLayout>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
