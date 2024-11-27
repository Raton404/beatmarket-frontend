import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Success from '../components/Success';
import Failure from '../components/Failure';
import Pending from '../components/Pending';

const PaymentRoutes = () => {
  return (
    <Routes>
      <Route path="/success" element={<Success />} />
      <Route path="/failure" element={<Failure />} />
      <Route path="/pending" element={<Pending />} />
    </Routes>
  );
};

export default PaymentRoutes; 