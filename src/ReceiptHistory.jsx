import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const API_URL = "http://localhost:5001"; // Change to your backend URL

export default function ReceiptHistory() {
  const [receipts, setReceipts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 50;
  const [loading, setLoading] = useState(true); // NEW loading state


  useEffect(() => {
    setLoading(true); // start loading
    fetch(`${API_URL}/receipts`)
      .then((res) => res.json())
      .then((data) => {
        const sortedData = data.sort(
          (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
        );
        setReceipts(sortedData);
      })
      .catch((err) => console.error("Error fetching receipts:", err))
      .finally(() => setLoading(false));
  }, []);

  const deleteReceipt = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this receipt?")) return;

    try {
      await fetch(`${API_URL}/receipts/${orderId}`, {
        method: "DELETE",
      });
      setReceipts(receipts.filter((r) => r.orderId !== orderId));
    } catch (err) {
      console.error("Error deleting receipt:", err);
    }
  };

  const downloadExcel = () => {
    const formattedReceipts = receipts.map((r) => ({
      orderId: r.orderId || "N/A",
      customer: r.cname || "N/A",
      total: r.total,
      note: r.note || "",
      paymentMethod: r.paymentMethod || "N/A",
      uploadedAt: new Date(r.uploadedAt).toLocaleString("en-HK", {
        timeZone: "Asia/Hong_Kong",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      cartItems:
        r.cartItems && r.cartItems.length > 0
          ? r.cartItems
              .map(
                (item) =>
                  `${item.name} × ${item.quantity} — $${(
                    item.price * item.quantity
                  ).toFixed(2)}`
              )
              .join("\n")
          : "No items",
      receiptUrl: r.receiptUrl || "No Image",
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedReceipts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Receipts");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `receipt_history_${new Date().toISOString()}.xlsx`);
  };

  // Pagination logic
  const totalPages = Math.ceil(receipts.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentReceipts = receipts.slice(
    startIndex,
    startIndex + recordsPerPage
  );

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", fontSize: "18px" }}>
        ⏳ Loading receipts, please wait...
      </div>
    );
  }


  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        📜 Receipt History
      </h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button style={btnStyle} onClick={downloadExcel}>
          📊 Download Excel
        </button>
      </div>

      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ backgroundColor: "#4CAF50", color: "white" }}>
            <th style={thStyle}>Order ID</th>
            <th style={thStyle}>Customer</th>
            <th style={thStyle}>Total</th>
            <th style={thStyle}>Note</th>
            <th style={thStyle}>Payment Method</th>
            <th style={thStyle}>Uploaded At</th>
            <th style={thStyle}>Cart Items</th>
            <th style={thStyle}>Preview</th>
            <th style={thStyle}>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentReceipts.map((r, index) => (
            <tr
              key={index}
              style={{
                backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
                textAlign: "center",
              }}
            >
              <td style={tdStyle}>{r.orderId || "N/A"}</td>
              <td style={tdStyle}>{r.cname || "N/A"}</td>
              <td style={tdStyle}>💲{r.total}</td>
              <td style={tdStyle}>{r.note || ""}</td>
              <td style={tdStyle}>{r.paymentMethod || "N/A"}</td>
              <td style={tdStyle}>
                {new Date(r.uploadedAt).toLocaleString()}
              </td>
              <td style={{ ...tdStyle, textAlign: "left" }}>
                {r.cartItems && r.cartItems.length > 0 ? (
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: "18px",
                      fontSize: "13px",
                    }}
                  >
                    {r.cartItems.map((item, idx) => (
                      <li key={idx}>
                        {item.name} × {item.quantity} — 💲
                        {(item.price * item.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span style={{ color: "#999", fontSize: "12px" }}>
                    No items
                  </span>
                )}
              </td>
              <td style={tdStyle}>
                {r.receiptUrl ? (
                  <a
                    href={r.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={r.receiptUrl}
                      alt="Receipt"
                      style={{
                        width: "90px",
                        height: "auto",
                        borderRadius: "8px",
                        boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
                      }}
                    />
                  </a>
                ) : (
                  <span style={{ color: "#999", fontSize: "12px" }}>
                    No Image
                  </span>
                )}
              </td>
              <td style={tdStyle}>
                <button
                  style={{
                    ...btnStyle,
                    backgroundColor: "#e53935",
                    padding: "5px 8px",
                  }}
                  onClick={() => deleteReceipt(r.orderId)}
                >
                  🗑 Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination buttons */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            style={{
              ...btnStyle,
              backgroundColor: currentPage === i + 1 ? "#388E3C" : "#4CAF50",
            }}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

const btnStyle = {
  padding: "8px 12px",
  margin: "0 3px",
  fontSize: "14px",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const thStyle = {
  padding: "12px",
  border: "1px solid #ddd",
  textAlign: "center",
};

const tdStyle = {
  padding: "12px",
  border: "1px solid #ddd",
  textAlign: "center",
};
