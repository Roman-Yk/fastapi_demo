import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { 
  OrdersPage, 
  CreateOrderPage, 
  EditOrderPage 
} from '../../pages';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Orders Routes */}
      <Route path="/" element={<OrdersPage />} />
      <Route path="/orders" element={<Navigate to="/" replace />} />
      <Route path="/orders/create" element={<CreateOrderPage />} />
      <Route path="/orders/:orderId/edit" element={<EditOrderPage />} />
      
      {/* Catch-all route - redirect to orders */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}; 