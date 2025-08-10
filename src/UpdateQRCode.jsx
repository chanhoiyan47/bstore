import { useState } from "react";

const API_URL = config.API_URL; // Change to your backend URL


export default function UpdateQRCode() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Please select a QR code image first.");
    const formData = new FormData();
    formData.append("qrCode", file);

    const res = await fetch(`${API_URL}/upload-qrcode`, {
      method: "POST",
      headers:{
        "api_key": config.API_KEY
      },
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      alert("QR Code updated successfully!");
      window.location.href = "/admin/products"; // back to management
    } else {
      alert("Failed to update QR code.");
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif" }}>
      <h1>Update Store QR Code</h1>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          setFile(e.target.files[0]);
          setPreview(URL.createObjectURL(e.target.files[0]));
        }}
      />
      {preview && (
        <div style={{ marginTop: "10px" }}>
          <p>Preview:</p>
          <img src={preview} alt="QR Preview" style={{ width: "200px" }} />
        </div>
      )}
      <br />
      <button
        style={{
          backgroundColor: "#4CAF50",
          color: "white",
          padding: "10px 15px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={handleUpload}
      >
        Upload QR Code
      </button>
    </div>
  );
}
