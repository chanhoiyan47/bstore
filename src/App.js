import React, { useState, useEffect } from "react";
import config from "./config";


const API_URL = config.API_URL; // Change to your backend URL


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
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [receiptImage, setReceiptImage] = useState(null);
  const [receiptbase64, setReceiptbase64] = useState(null);
  const [cname, setCname] = useState("");
  const [note, setNote] = useState("");
  const [receipts, setReceipts] = useState(() => {
    const saved = localStorage.getItem("receipts");
    return saved ? JSON.parse(saved) : [];
  });
  const [paymentMethod, setPaymentMethod] = useState("receipt"); // default is upload receipt
  const newOrderId = "ORD" + Date.now();


  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

    // ✅ Fetch products from backend
    useEffect(() => {
      fetch(`${API_URL}/products`)
        .then(res => res.json())
        .then(data => {
          const normalized = data.map(p => ({
            ...p,
            price: Number(p.price), // ✅ Ensure it's a number
            image: p.imageUrl       // ✅ Match frontend naming
          }));
          setProducts(normalized);
        })
        .catch(err => console.error(err));

        fetch(`${API_URL}/settings`)
        .then(res => res.json())
        .then(data => setQrCodeUrl(data.qrCodeUrl));

    }, []);

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
      return cart
        .reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
        .toFixed(2);
    };
  
    const handleCheckout = () => {
      if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
      }
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
      };
      reader.readAsDataURL(file);
    };
  
    const handleBackToStore = () => {
      setShowPayment(false);
      setCart([]);
      setMessage(null);
      setReceiptImage(null);
    };
  
    const handleSendReceipt = async () => {
      // if (paymentMethod === "receipt" && !receiptbase64) {
      //   alert("Please upload a receipt image.");
      //   return;
      // }
    
      const formData = new FormData();
    
      // Image only if payment method is receipt
      // if (paymentMethod === "receipt") {
      //   formData.append("receipt", receiptbase64);
      // }
    
      formData.append("total", getTotal());
      formData.append("timestamp", new Date().toISOString());
      formData.append("note", note); 
      formData.append("cname", cname); 
      formData.append("orderId", newOrderId);
      formData.append("paymentMethod", paymentMethod);
    
      // ✅ Include cart details
      formData.append("cartItems", JSON.stringify(cart));
    
      try {
        setLoading(true);
        setMessage(null);

        const response = await fetch(`${API_URL}/upload`, {
          method: "POST",
          headers:{
            "api_key": config.API_KEY
          },
          body: formData,
        });
    
        const result = await response.json();
    
        alert("Receipt sent successfully!");
        setMessage({ type: "success", text: "Receipt uploaded successfully" });
        setReceiptImage(null);
        setCart([]);
        setNote("");
        // setCname("");
      } catch (err) {
        console.error(err);
        alert("Failed to send receipt.");
        setMessage({ type: "error", text: "Upload failed. Please try again." });
      } finally {
        setLoading(false)
      }
    };    
    // For credit card
    const handleAsiaPayCheckout = (orderId) => {
            if (paymentMethod === "creditCard" && !receiptbase64) {
        alert("Maybe later.");
        return;
      }
      // This should POST to your backend to get the AsiaPay form/action URL
      // window.location.href = `https://test.asiapay.com/payment?orderId=${orderId}&amount=${getTotal()}`;
    };
     
    if (showPayment) {
      return (
        <div className="p-4 max-w-xl mx-auto font-sans bg-gray-50 min-h-screen">
          <h1 className="text-2xl font-bold mb-4 text-center">Payment</h1>
          <p className="mb-2 text-center">Total Amount: <strong>${getTotal()}</strong></p>
          {/* Cart Summary */}
          <div className="mb-6 bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Your Order</h2>
            <ul className="text-sm text-gray-700 space-y-1">
            {cart.map((item) => (
              <li key={item.id}>
                {item.name} × {item.quantity} — ${Number(item.price * item.quantity).toFixed(2)}
                </li>
              ))}    
              </ul>
  <p className="mt-2 font-bold">
    Total: ${getTotal()}
  </p>
</div>      
          {/* Payment Method Selection */}
          <div className="mb-6 text-center">
            <label className="mr-4 font-medium">Choose Payment Method:</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="receipt">Upload Receipt</option>
              <option value="creditCard">Credit Card</option>
            </select>
          </div>
      
          {/* Receipt Upload Flow */}
          {paymentMethod === "receipt" && (
            <>
              {qrCodeUrl ? (
        <img className="mb-4 object-contain mx-auto" src={qrCodeUrl} alt="QR Code" style={{ width: "250px" }} />
      ) : (
        <p className="mb-2 text-center">QR Code not available</p>      
      )}
      
              <div className="mb-4">
                <label className="block mb-1 font-medium">Upload Your Payment Receipt:</label>
                <input type="file" accept="image/*" onChange={handleReceiptUpload} />
              </div>
      
              {receiptImage && (
                <div className="mb-4 text-center">
                  <p className="font-semibold mb-2">Receipt Preview:</p>
                  <img src={receiptImage} alt="Receipt" className="w-full max-w-xs rounded shadow mx-auto" />
                </div>
              )}
      
              {/* Name & Note Fields */}
              <div className="mb-4">
                <label className="block mb-1 font-medium">Your Name:</label>
                <input
                  type="text"
                  value={cname}
                  onChange={(e) => setCname(e.target.value)}
                  placeholder="Enter your name"
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
      
              <div className="mb-4">
                <label className="block mb-1 font-medium">Note:</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add any comments..."
                  className="border rounded px-3 py-2 w-full"
                />
              </div>
      
              <Button onClick={() => handleSendReceipt(newOrderId)}>Send Receipt</Button>
              {loading && <p style={{ color: "blue" }}>Please wait, uploading...</p>}
      {message && (
        <p style={{ color: message.type === "success" ? "green" : "red" }}>
          {message.text}
        </p>
      )}
            </>
          )}
      
          {/* Credit Card Flow */}
          {paymentMethod === "creditCard" && (
            <div className="text-center">
              <p className="mb-4 text-gray-600">You will be redirected to AsiaPay to complete your payment.</p>
              <Button onClick={() => handleAsiaPayCheckout(newOrderId)}>
                Pay with Credit Card
              </Button>
            </div>
          )}
      
          <div className="mt-6 text-center">
            <Button onClick={handleBackToStore}>Back to Store</Button>
          </div>
        </div>
      );
    }
    
  
    return (
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Navigation Bar */}
        <nav className="flex justify-between items-center bg-white shadow-md p-4 rounded-b-lg sticky top-0 z-50">
          <h1 className="text-2xl font-bold text-blue-600">B-Store</h1>
          <Button onClick={handleCheckout}>
            Checkout (${getTotal()})
          </Button>
        </nav>
    
        {/* Products Section */}
        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.length === 0 ? (
            <p className="text-gray-500">Loading products...</p>
          ) : (
            products.map((product) => {
              const priceNumber = Number(product.price);
              return (
                <div 
                  key={product.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition transform hover:-translate-y-1"
                >
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full max-h-64 object-contain"
                  />
                  <div className="p-4">
                    <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                    <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                    <p className="text-lg font-bold mb-4">${priceNumber.toFixed(2)}</p>
                    <Button onClick={() => addToCart(product)} className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                      Add to Cart
                    </Button>
                  </div>
                </div>
              );
            })
          )}
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
                  <span className="font-semibold">{item.name}</span> - ${Number(item.price).toFixed(2)} x {item.quantity}
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
