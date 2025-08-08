// src/pages/ReceiptHistory.jsx
import React, { useEffect, useState } from "react";

const ReceiptHistory = () => {
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const response = await fetch("http://localhost:5001/receipts");
        const data = await response.json();
        setReceipts(data);
      } catch (err) {
        console.error("Failed to fetch receipts:", err);
      }
    };

    fetchReceipts();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-bold mb-6">Receipt Metadata History</h1>
      <pre className="bg-white p-4 rounded shadow overflow-auto text-sm">
        {JSON.stringify(receipts, null, 2)}
      </pre>
    </div>
  );
};

export default ReceiptHistory;
