import React, { useState } from "react";

const products = [
  {
    id: 1,
    name: "Running Shoes",
    description: "Lightweight running shoes for daily training.",
    price: 59.99,
    image: "/images/c1.webp"
  },
  {
    id: 2,
    name: "Basketball Shoes",
    description: "High-top shoes for maximum ankle support.",
    price: 89.99,
    image: "/images/c2.webp"
  },
  {
    id: 3,
    name: "Casual Sneakers",
    description: "Stylish sneakers for everyday use.",
    price: 49.99,
    image: "/images/c3.webp"
  }
];

const Card = ({ children }) => (
  <div className="border p-4 rounded shadow bg-white">{children}</div>
);
const CardContent = ({ children }) => <div>{children}</div>;
const Button = ({ children, ...props }) => (
  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" {...props}>
    {children}
  </button>
);

export default function EShop() {
  const [cart, setCart] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null);
  const [receiptbase64, setReceiptbase64] = useState(null);
  const [receipts, setReceipts] = useState(() => {
    const saved = localStorage.getItem("receipts");
    return saved ? JSON.parse(saved) : [];
  });

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  };

  const handleCheckout = () => {
    setShowPayment(true);
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      alert("Only JPEG and PNG files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size should not exceed 5MB.");
      return;
    }
    
    setReceiptbase64(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptImage(reader.result);
      const newReceipt = {
        id: Date.now(),
        total: getTotal(),
        image: reader.result,
        date: new Date().toLocaleString()
      };
      const updatedReceipts = [newReceipt, ...receipts];
      setReceipts(updatedReceipts);      
      // localStorage.setItem("receipts", JSON.stringify(updatedReceipts));
    };
    reader.readAsDataURL(file);
  };

  const handleBackToStore = () => {
    setShowPayment(false);
    setCart([]);
    setReceiptImage(null);
  };

  const handleSendReceipt = async () => {
    if (!receiptbase64) return;
  
    const formData = new FormData();
    formData.append("receipt", receiptbase64);
    formData.append("total", getTotal());
    formData.append("timestamp", new Date().toISOString());
    formData.append("note", "Comment"); 
    formData.append("cname", "Customer"); 
  
    try {
      // const response = await fetch("http://localhost:5001/upload", {
        const response = await fetch("http://192.168.50.207:5001/upload", {
        method: "POST",
        body: formData,
      });
  
      const result = await response.json();
  
      const newRecord = {
        id: Date.now(),
        total: getTotal(),
        // image: `http://localhost:5001${result.filepath}`,
        image: `http://192.168.50.207:5001${result.filepath}`,
        timestamp: new Date().toLocaleString(),
      };
  
      // setUploadedReceipts((prev) => [...prev, newRecord]);
      setReceiptImage(null);
      alert("Receipt sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to send receipt.");
    }
  };
  

  if (showPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-4">Payment</h1>
          <p className="mb-6 text-center text-lg">
            Total Amount: <strong>${getTotal()}</strong>
          </p>
          
          <div className="flex justify-center mb-6">
            <img 
              src="/images/payt1.png" 
              alt="QR Code" 
              className="w-48 h-48 object-contain border rounded-lg shadow" 
            />
          </div>
  
          <div className="mb-4">
            <label className="block mb-2 font-medium text-gray-700">
              Upload Your Payment Receipt:
            </label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleReceiptUpload}
              className="block w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
  
          {receiptImage && (
            <div className="mb-6 text-center">
              <p className="font-semibold mb-2">Receipt Preview:</p>
              <img 
                src={receiptImage} 
                alt="Receipt" 
                className="w-full max-w-xs mx-auto rounded shadow" 
              />
            </div>
          )}
  
          <div className="space-y-3">
            <button 
              onClick={handleSendReceipt} 
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Send Receipt
            </button>
            <button 
              onClick={handleBackToStore} 
              className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Back to Store
            </button>
          </div>
        </div>
      </div>
    );
  }
  

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center bg-white shadow-md p-4 rounded-b-lg sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-blue-600">B-Store</h1>
        <Button onClick={handleCheckout} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Checkout (${getTotal()})
        </Button>
      </nav>
  
      {/* Products Section */}
      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition transform hover:-translate-y-1"
          >
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full max-h-64 object-contain"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-600 text-sm mb-3">{product.description}</p>
              <p className="text-lg font-bold mb-4">${product.price.toFixed(2)}</p>
              <Button onClick={() => addToCart(product)} className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
  
      {/* Cart Section */}
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-4">Cart</h2>
        {cart.length === 0 ? (
          <p className="text-gray-500">Your cart is empty.</p>
        ) : (
          <ul className="space-y-3">
            {cart.map((item) => (
              <li 
                key={item.id} 
                className="flex justify-between items-center bg-white p-4 rounded-lg shadow"
              >
                <div>
                  <span className="font-semibold">{item.name}</span> - ${item.price.toFixed(2)} x {item.quantity}
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => addToCart(item)} 
                    className="bg-green-500 hover:bg-green-600 p-4 rounded-lg shadow"
                  >
                    +
                  </Button>
                  <Button 
                    onClick={() => removeFromCart(item.id)} 
                    className="bg-red-500 hover:bg-red-600 p-4 rounded-lg shadow"
                  >
                    -
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
  
}
