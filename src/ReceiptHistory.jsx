import React, { useEffect, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const API_URL = config.API_URL; // Change to your backend URL


export default function ReceiptHistory() {
  const [receipts, setReceipts] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/receipts`)
      .then((res) => res.json())
      .then((data) => {
        const sortedData = data.sort(
          (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
        );
        setReceipts(sortedData);
      })
      .catch((err) => console.error("Error fetching receipts:", err));
  }, []);

  // const downloadJSON = () => {
  //   const blob = new Blob([JSON.stringify(receipts, null, 2)], {
  //     type: "application/json",
  //   });
  //   saveAs(blob, `receipt_history_${new Date().toISOString()}.json`);
  // };

  // const downloadZip = async () => {
  //   const zip = new JSZip();
  //   zip.file("receipt_history.json", JSON.stringify(receipts, null, 2));

  //   const imgFolder = zip.folder("images");
  //   await Promise.all(
  //     receipts.map(async (r) => {
  //       if (!r.receiptUrl) return;
  //       try {
  //         const response = await fetch(r.receiptUrl);
  //         const blob = await response.blob();
  //         const ext = r.mimetype?.split("/")[1] || "jpg";
  //         imgFolder.file(
  //           r.originalname || `receipt_${r.orderId || Date.now()}.${ext}`,
  //           blob
  //         );
  //       } catch (err) {
  //         console.error(`Failed to fetch image: ${r.receiptUrl}`, err);
  //       }
  //     })
  //   );

  //   const content = await zip.generateAsync({ type: "blob" });
  //   saveAs(content, `receipt_backup_${new Date().toISOString()}.zip`);
  // };

  const downloadExcel = () => {
    const formattedReceipts = receipts.map(r => ({
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
      cartItems: r.cartItems && r.cartItems.length > 0
        ? r.cartItems.map(item => `${item.name} × ${item.quantity} — $${(item.price * item.quantity).toFixed(2)}`).join("\n")
        : "No items",
      receiptUrl: r.receiptUrl || "No Image"
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
  
  

  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>📜 Receipt History</h1>

      {/* Action Buttons */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        {/* <button style={btnStyle} onClick={downloadJSON}>📄 Download JSON</button>
        <button style={btnStyle} onClick={downloadZip}>📦 Download ZIP</button> */}
        <button style={btnStyle} onClick={downloadExcel}>📊 Download Excel</button>
      </div>

      {/* Table */}
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
          </tr>
        </thead>
        <tbody>
          {receipts.map((r, index) => (
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
              <td style={tdStyle}>{new Date(r.uploadedAt).toLocaleString()}</td>
              <td style={{ ...tdStyle, textAlign: "left" }}>
                {r.cartItems && r.cartItems.length > 0 ? (
                  <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px" }}>
                    {r.cartItems.map((item, idx) => (
                      <li key={idx}>
                        {item.name} × {item.quantity} — 💲
                        {(item.price * item.quantity).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span style={{ color: "#999", fontSize: "12px" }}>No items</span>
                )}
              </td>
              <td style={tdStyle}>
                {r.receiptUrl ? (
                  <a href={r.receiptUrl} target="_blank" rel="noopener noreferrer">
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
                  <span style={{ color: "#999", fontSize: "12px" }}>No Image</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const btnStyle = {
  padding: "10px 15px",
  margin: "0 5px",
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
