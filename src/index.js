import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ReceiptHistory from "./ReceiptHistory";
import AdminProducts from "./adminProducts";
import UpdateQRCode from './UpdateQRCode';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin/receipts" element={<ReceiptHistory />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/update-qrcode" element={<UpdateQRCode/>}/>
      </Routes>
    </Router>
  </React.StrictMode>
);
