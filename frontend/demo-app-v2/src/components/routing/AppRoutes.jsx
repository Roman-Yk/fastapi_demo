import { Routes, Route } from 'react-router-dom';
import { OrdersPage } from '../../pages/OrdersPage';


export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<OrdersPage />} />
    </Routes>
  );
};
