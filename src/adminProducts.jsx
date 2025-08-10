import React, { useEffect, useState } from "react";

// const API_URL = "https://bstore-server-6ekc.onrender.com"; // Change to your backend URL
const API_URL = "http://localhost:5001"; // Change to your backend URL

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "", image: null });
  const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
  

// Fetch products
const fetchProducts = async () => {
  try {
    setLoading(true); // start loading
    const res = await fetch(`${API_URL}/products`);
    const data = await res.json();
    setProducts(data);
  } catch (err) {
    console.error("Error fetching products:", err);
  } finally {
    setLoading(false); // stop loading
  }
};

useEffect(() => {
  fetchProducts();
}, []);

  // Handle form input
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

// Add product
const addProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("description", form.description);
    if (form.image) formData.append("image", form.image);
  
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        body: formData,
      });
      alert("Add Prodcut Successfully!")
    } catch {
      alert("Fail to add Prodcut.")
    }    
  
    setForm({ name: "", price: "", description: "", image: null });
    fetchProducts();
  };
  
  

  // Edit product
  const editProduct = async (id, e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("description", form.description);
    if (form.image) {
      formData.append("image", form.image); // Only if new image selected
    }

    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "PUT",
        body: formData,
      });
      setEditingId(null);
    setForm({ name: "", price: "", description: "", image: null });
    fetchProducts();
    alert("Edit Product successfully!");
    } catch {
      alert("Fail to Edit Product.");
    }        
  };

  // Delete product
  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const res = await fetch(`${API_URL}/products/${id}`, { method: "DELETE" });
        fetchProducts();
        alert("delete Product successfully!");
      } catch {
        alert("Failure to delete Product.");
      } finally {

      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", fontSize: "18px" }}>
        ⏳ Loading , please wait...
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center" }}>Admin Product Management</h2>

      <button
  style={{
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "10px",
  }}
  onClick={() => window.location.href = "/admin/update-qrcode"}
>
  📷 Update QR Code
</button>


      {/* Add / Edit Form */}
      <form
        onSubmit={(e) => {
          editingId ? editProduct(editingId, e) : addProduct(e);
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="price" placeholder="Price" value={form.price} onChange={handleChange} required />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={handleChange}
          required={!editingId} // Only required when adding
        />
        <button
          type="submit"
          style={{
            background: "#4CAF50",
            color: "white",
            padding: "10px",
            border: "none",
            cursor: "pointer",
          }}
        >
          {editingId ? "Update Product" : "Add Product"}
        </button>
      </form>

      {/* Products Table */}
      <table
        border="1"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "center",
        }}
      >
        <thead style={{ background: "#f2f2f2" }}>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>
                <img src={p.imageUrl} alt={p.name} style={{ width: "80px" }} />
              </td>
              <td>{p.name}</td>
              <td>${p.price}</td>
              <td>{p.description}</td>
              <td>
                <button
                  onClick={() => {
                    setEditingId(p.id);
                    setForm({
                      name: p.name,
                      price: p.price,
                      description: p.description,
                      image: null,
                    });
                  }}
                  style={{
                    background: "#2196F3",
                    color: "white",
                    padding: "5px",
                    marginRight: "5px",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProduct(p.id)}
                  style={{ background: "#f44336", color: "white", padding: "5px" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
