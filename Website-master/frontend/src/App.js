import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import apiService from "./apiService";
import './App.css';

import Login from "./Login";
import Signup from "./Signup";
import ProductManager from './ProductManager';

// Main App Component with Router
function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/addresses" element={<AddressManager />} />
            <Route path="/cards" element={<CardManager />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin/products" element={<ProductManager />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

// Navigation Bar Component
function Navbar() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userName, setUserName] = useState("");
  const [userType, setUserType] = useState("");
  const navigate = useNavigate();

  const fetchSessionInfo = () => {
    apiService.getSessionInfo()
      .then(res => {
        setUserName(res.data.name);
        setUserType(res.data.type);
      })
      .catch(() => {
        setUserName("");
        setUserType("");
      });
  };

  useEffect(() => {
    fetchSessionInfo();

    const handleLoginEvent = () => {
      fetchSessionInfo();
    };

    window.addEventListener("loginStatusChanged", handleLoginEvent);

    return () => {
      window.removeEventListener("loginStatusChanged", handleLoginEvent);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await apiService.logout();
      setUserName("");
      setUserType("");
      setCartCount(0);
      navigate("/");
      window.dispatchEvent(new Event("loginStatusChanged"));
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">🛒 MyShop</Link>
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>

        {userType === "customer" && (
          <>
            <Link to="/cart" className="cart-link">
              Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
            <Link to="/addresses">Addresses</Link>
            <Link to="/cards">Credit Cards</Link>
          </>
        )}

        {userType === "staff" && (
          <Link to="/admin/products">Manage Products</Link>
        )}

        {userName ? (
          <div className="user-dropdown" onClick={() => setUserMenuOpen(!userMenuOpen)}>
            <span className="user-name">{userName.split(" ")[0]} ⌄</span>
            {userMenuOpen && (
              <div className="user-dropdown-menu">
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="secondary-button" style={{ padding: '0.5rem 1rem' }}>
            Log In / Sign Up
          </Link>
        )}
      </div>
    </nav>
  );
}

// Home Page with Product Listing
function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    apiService.getProducts()
      .then(res => {
        setProducts(res.data);
        const uniqueCategories = [...new Set(res.data.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    apiService.addToCart(product.productid, 1)
      .then(() => {
        window.dispatchEvent(new Event("cartUpdated"));
        showNotification(`${product.name} added to cart`);
      })
      .catch(err => alert("Failed to add to cart"));
  };

  const showNotification = (message) => {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add("show"), 10);
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 2000);
  };

  return (
    <div className="container">
      <div className="hero-section">
        <h1>Welcome to MyShop</h1>
        <p>Find the best products at the best prices</p>
      </div>
      
      <div className="search-filter-container">
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        
        {categories.length > 0 && (
          <select 
            className="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="loading-spinner">Loading products...</div>
      ) : filteredProducts.length > 0 ? (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <div key={product.productid} className="product-card">
              <div 
                className="product-image"
                onClick={() => navigate(`/product/${product.productid}`)}
              >
                {/* Placeholder for product image */}
                <div className="product-image-placeholder">
                  {product.name.charAt(0)}
                </div>
              </div>
              <h3>{product.name}</h3>
              <p className="product-price">${Number(product.price).toFixed(2)}</p>
              <button
                className="add-to-cart-btn"
                onClick={() => addToCart(product)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-results">
          <p>No products found. Try a different search term or category.</p>
        </div>
      )}
    </div>
  );
}

// Product Detail Page
function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const productId = window.location.pathname.split('/').pop();

  useEffect(() => {
    setLoading(true);
    apiService.getProduct(productId)
      .then(res => setProduct(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [productId, navigate]);

  const addToCart = () => {
    apiService.addToCart(product.productid, 1)
      .then(() => {
        window.dispatchEvent(new Event("cartUpdated"));
        navigate('/cart');
      })
      .catch(err => alert("Failed to add to cart"));
  };
  
  return (
    <div className="container">
      <div className="product-detail">
        <div className="product-detail-image">
          {/* Placeholder for product image */}
          <div className="product-image-placeholder large">
            {product.name.charAt(0)}
          </div>
        </div>
        <div className="product-detail-info">
          <h1>{product.name}</h1>
          <p className="product-category">{product.category}</p>
          <p className="product-price-large">${product.price.toFixed(2)}</p>
          <p className="product-description">{product.description}</p>
          <div className="product-actions">
            <button className="primary-button" onClick={addToCart}>
              Add to Cart
            </button>
            <button className="secondary-button" onClick={() => navigate('/')}>
              Back to Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Shopping Cart Component
function Cart() {
  const [cart, setCart] = useState({});
  const [addresses, setAddresses] = useState([]);
  const [cards, setCards] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState({ addressid: "", cardnum: "", deliverytype: "Standard" });
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiService.fetchCart(),
      apiService.getProducts(),
      apiService.getAddresses(),
      apiService.getCards()
    ])
      .then(([cartRes, productsRes, addressesRes, cardsRes]) => {
        console.log("✅ Fetched cart data from server:", cartRes.data);
        console.log("✅ Fetched products:", productsRes.data);
  
        const cartArray = cartRes.data;
  
        const cartObject = {};
        for (const item of cartArray) {
          cartObject[item.productid] = item.buy_amount;
        }
  
        console.log("✅ Cart after conversion to object:", cartObject);
  
        setCart(cartObject);
        setProducts(productsRes.data);
        setAddresses(addressesRes.data);
        setCards(cardsRes.data);
  
        if (addressesRes.data.length > 0) {
          setOrderDetails(prev => ({ ...prev, addressid: addressesRes.data[0].addressid }));
        }
        if (cardsRes.data.length > 0) {
          setOrderDetails(prev => ({ ...prev, cardnum: cardsRes.data[0].card_number }));
        }
      })
      .catch(err => {
        console.error("❌ Error fetching cart/products/addresses/cards:", err);
      })
      .finally(() => setLoading(false));
  }, []);
  
  // 👉 Cart logic and console logs
  console.log("🧹 Current cart object in render:", cart);
  console.log("🛍️ Full products list:", products);
  const productList = products.filter(p => cart && cart[p.productid] > 0);
  console.log("🛒 Final productList for Cart page:", productList);
  
  const calculateTotal = () => {
    return productList.reduce((total, p) => {
      return total + (p.price * cart[p.productid]);
    }, 0);
  };
  
  const getDeliveryFee = () => {
    return orderDetails.deliverytype === "Express" ? 15.99 : 5.99;
  };
  
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      // Delete item from cart
      apiService.deleteFromCart(productId)
        .then(() => {
          const newCart = { ...cart };
          delete newCart[productId];
          setCart(newCart);
          window.dispatchEvent(new Event("cartUpdated"));
        })
        .catch(err => alert("Failed to remove item from cart"));
    } else {
      // Update quantity in DB
      apiService.updateCart(productId, newQuantity)
        .then(() => {
          const newCart = { ...cart };
          newCart[productId] = newQuantity;
          setCart(newCart);
          window.dispatchEvent(new Event("cartUpdated"));
        })
        .catch(err => alert("Failed to update cart"));
    }
  };  

  const handleCheckout = () => {
    if (!orderDetails.addressid || !orderDetails.cardnum) return alert("Please select address and payment");
    apiService.checkout(orderDetails)
      .then(() => {
        alert("Order placed successfully!");
        setCart({});
        window.dispatchEvent(new Event("cartUpdated"));
      })
      .catch(err => alert("Checkout failed"));
  };

  if (loading) {
    return <div className="loading-spinner">Loading cart...</div>;
  }

  return (
    <div className="container">
      <h1>Shopping Cart</h1>
      
      {productList.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button onClick={() => navigate('/')} className="primary-button">
            Browse Products
          </button>
        </div>
      ) : (
        <div className="cart-page">
          <div className="cart-items">
            {productList.map(product => (
              <div key={product.productid} className="cart-item">
                <div className="cart-item-image">
                  {/* Placeholder for product image */}
                  <div className="product-image-placeholder small">
                    {product.name.charAt(0)}
                  </div>
                </div>
                
                <div className="cart-item-details">
                  <h3>{product.name}</h3>
                  <p>${Number(product.price).toFixed(2)}</p>
                </div>
                
                <div className="cart-item-quantity">
                  <button 
                    className="quantity-btn" 
                    onClick={() => updateQuantity(product.productid, cart[product.productid] - 1)}
                  >
                    -
                  </button>
                  <span>{cart[product.productid]}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(product.productid, cart[product.productid] + 1)}
                  >
                    +
                  </button>
                </div>
                
                <div className="cart-item-total">
                  ${(product.price * cart[product.productid]).toFixed(2)}
                </div>
                
                <button 
                  className="remove-item"
                  onClick={() => updateQuantity(product.productid, 0)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          
          <div className="checkout-container">
            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span>${getDeliveryFee().toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${(calculateTotal() + getDeliveryFee()).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="checkout-form">
              <div className="form-group">
                <label>Delivery Type</label>
                <select 
                  value={orderDetails.deliverytype}
                  onChange={e => setOrderDetails({...orderDetails, deliverytype: e.target.value})}
                >
                  <option value="Standard">Standard (3-5 days)</option>
                  <option value="Express">Express (1-2 days)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Delivery Address</label>
                {addresses.length > 0 ? (
                  <select 
                    value={orderDetails.addressid}
                    onChange={e => setOrderDetails({...orderDetails, addressid: e.target.value})}
                  >
                    {addresses.map(address => (
                      <option key={address.addressid} value={address.addressid}>
                        {address.street_1}, {address.city}, {address.state}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="missing-info">
                    <p>No addresses found</p>
                    <Link to="/addresses">Add Address</Link>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                {cards.length > 0 ? (
                  <select 
                    value={orderDetails.cardnum}
                    onChange={e => setOrderDetails({...orderDetails, cardnum: e.target.value})}
                  >
                    {cards.map(card => (
                      <option key={card.card_number} value={card.card_number}>
                        Card ending in {card.card_number.slice(-4)}, Expires: {card.expiry_date}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="missing-info">
                    <p>No payment methods found</p>
                    <Link to="/cards">Add Payment Method</Link>
                  </div>
                )}
              </div>

              <button 
                className="checkout-button"
                onClick={handleCheckout}
                disabled={!orderDetails.addressid || !orderDetails.cardnum}
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Address Management Component
function AddressManager() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAddress, setNewAddress] = useState({
    street_1: "",
    street_2: "",
    city: "",
    state: "",
    zip: "",
    country: "USA"
  });
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = () => {
    setLoading(true);
    apiService.getAddresses()
      .then(res => setAddresses(res.data))
      .catch(err => console.error("Error fetching addresses:", err))
      .finally(() => setLoading(false));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({...prev, [name]: value}));
  };

  const resetForm = () => {
    setNewAddress({
      street_1: "",
      street_2: "",
      city: "",
      state: "",
      zip: ""
    });
  };  

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing address
      apiService.updateAddress(editingId, newAddress)
        .then(() => {
          loadAddresses();
          resetForm();
          setEditingId(null);
          setIsAdding(false);
        })
        .catch(err => console.error("❌ Error updating address:", err));
    } else {
      // Add new address
      apiService.addAddress(newAddress)
        .then(() => {
          loadAddresses();
          resetForm();
          setIsAdding(false);
        })
        .catch(err => console.error("❌ Error adding address:", err));
    }
  };
  
  const handleDelete = (addressid) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      apiService.deleteAddress(addressid)
        .then(() => loadAddresses())
        .catch(err => console.error("❌ Error deleting address:", err));
    }
  };
  
  const handleEdit = (address) => {
    // ✅ Transform backend address object to form state shape
    setNewAddress({
      street_1: address.street_1 || "",
      street_2: address.street_2 || "",
      city: address.city || "",
      state: address.state || "",
      zip: address.zip_code || "" // Map zip_code → zip
    });
    setEditingId(address.addressid);
    setIsAdding(true);
  };  

  if (loading && addresses.length === 0) {
    return <div className="loading-spinner">Loading addresses...</div>;
  }

  return (
    <div className="container">
      <div className="section-header">
        <h1>Manage Addresses</h1>
        {!isAdding && (
          <button 
            className="add-button"
            onClick={() => {
              resetForm();
              setEditingId(null);
              setIsAdding(true);
            }}
          >
            + Add New Address
          </button>
        )}
      </div>

      {isAdding ? (
        <div className="form-container">
          <h2>{editingId ? "Edit Address" : "Add New Address"}</h2>
          <form onSubmit={handleSubmit} className="address-form">
            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                name="street_1"
                value={newAddress.street_1}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Apartment, suite, etc. (optional)</label>
              <input
                type="text"
                name="street_2"
                value={newAddress.street_2}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={newAddress.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={newAddress.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>ZIP Code</label>
                <input
                  type="text"
                  name="zip"
                  value={newAddress.zip}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Country</label>
                <select
                  name="country"
                  value={newAddress.country}
                  onChange={handleInputChange}
                  required
                >
                  <option value="USA">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="Mexico">Mexico</option>
                </select>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="primary-button">
                {editingId ? "Update Address" : "Save Address"}
              </button>
              <button 
                type="button" 
                className="secondary-button"
                onClick={() => {
                  setIsAdding(false);
                  resetForm();
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="address-list">
          {addresses.length === 0 ? (
            <div className="empty-state">
              <p>You don't have any saved addresses yet.</p>
            </div>
          ) : (
            addresses.map(address => (
              <div key={address.addressid} className="address-card">
                <div className="address-content">
                  <p className="address-line">{address.street_1}</p>
                  {address.street_2 && <p className="address-line">{address.street_2}</p>}
                  <p className="address-line">
                    {address.city}, {address.state} {address.zip}
                  </p>
                  <p className="address-line">{address.country}</p>
                </div>
                <div className="address-actions">
                  <button 
                    className="edit-button"
                    onClick={() => handleEdit(address)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDelete(address.addressid)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Credit Card Management Component
function CardManager() {
  const [cards, setCards] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCard, setNewCard] = useState({
    card_number: "",
    cardholder_name: "",
    expiry_date: "",
    cvv: "",
    addressid: ""
  });

  useEffect(() => {
    Promise.all([
      apiService.getCards(),
      apiService.getAddresses()
    ])
    .then(([cardsRes, addressesRes]) => {
      setCards(cardsRes.data);
      setAddresses(addressesRes.data);
      if (addressesRes.data.length > 0) {
        setNewCard(prev => ({...prev, addressid: addressesRes.data[0].addressid}));
      }
    })
    .catch(err => console.error("Error fetching data:", err))
    .finally(() => setLoading(false));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "card_number") {
      const digits = value.replace(/\D/g, "");
      let formatted = "";
      for (let i = 0; i < digits.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += " ";
        formatted += digits[i];
      }
      setNewCard(prev => ({...prev, [name]: formatted.slice(0, 19)}));
    } else if (name === "expiry_date") {
      const digits = value.replace(/\D/g, "");
      let formatted = digits;
      if (digits.length > 2) {
        formatted = digits.slice(0, 2) + "/" + digits.slice(2, 4);
      }
      setNewCard(prev => ({...prev, [name]: formatted.slice(0, 5)}));
    } else if (name === "cvv") {
      const digits = value.replace(/\D/g, "");
      setNewCard(prev => ({...prev, [name]: digits.slice(0, 4)}));
    } else {
      setNewCard(prev => ({...prev, [name]: value}));
    }
  };

  const resetForm = () => {
    setNewCard({
      card_number: "",
      cardholder_name: "",
      expiry_date: "",
      cvv: "",
      addressid: addresses.length > 0 ? addresses[0].addressid : ""
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const [month, year] = newCard.expiry_date.split("/");
    if (!month || !year || isNaN(month) || isNaN(year) || Number(month) < 1 || Number(month) > 12) {
      alert("❌ Invalid expiry date. Please use MM/YY format.");
      return;
    }

    const formattedExpiryDate = `20${year.padStart(2, "0")}-${month.padStart(2, "0")}-01`;
    const cardData = {
      ...newCard,
      card_number: newCard.card_number.replace(/\s/g, ""),
      expiry_date: formattedExpiryDate
    };

    if (editingId) {
      apiService.updateCard(editingId, cardData)
        .then(() => {
          apiService.getCards().then(res => setCards(res.data));
          setEditingId(null);
          resetForm();
          setIsAdding(false);
        })
        .catch(err => console.error("❌ Error updating card:", err));
    } else {
      apiService.addCard(cardData)
        .then(() => {
          apiService.getCards().then(res => setCards(res.data));
          resetForm();
          setIsAdding(false);
        })
        .catch(err => console.error("❌ Error adding card:", err));
    }
  };

  const handleDelete = (cardNumber) => {
    const normalizedCardNumber = cardNumber.replace(/\s/g, "");
    if (window.confirm("Are you sure you want to delete this card?")) {
      apiService.deleteCard(normalizedCardNumber)
        .then(() => apiService.getCards().then(res => setCards(res.data)))
        .catch(err => console.error("❌ Error deleting card:", err));
    }
  };

  const handleEdit = (card) => {
    const formattedNumber = card.card_number.replace(/(\d{4})(?=\d)/g, "$1 ");
    setNewCard({
      card_number: formattedNumber,
      cardholder_name: card.cardholder_name || "",
      expiry_date: formatExpiryForEdit(card.expiry_date),
      cvv: "",
      addressid: card.addressid || ""
    });
    setEditingId(card.card_number.replace(/\s/g, ""));
    setIsAdding(true);
  };

  const formatExpiryForEdit = (date) => {
    if (!date) return "";
    const parts = date.split("-");
    if (parts.length === 3) {
      return `${parts[1]}/${parts[0].slice(2)}`;
    }
    return "";
  };

  const getAddressForCard = (addressId) => {
    const address = addresses.find(a => a.addressid === addressId);
    if (!address) return "Unknown address";
    return `${address.street_1}, ${address.city}, ${address.state}`;
  };

  if (loading && cards.length === 0) {
    return <div className="loading-spinner">Loading payment methods...</div>;
  }

  const canAddCards = addresses.length > 0;

  return (
    <div className="container">
      <div className="section-header">
        <h1>Manage Payment Methods</h1>
        {!isAdding && canAddCards && (
          <button 
            className="add-button"
            onClick={() => {
              resetForm();
              setEditingId(null);
              setIsAdding(true);
            }}
          >
            + Add New Card
          </button>
        )}
      </div>

      {!canAddCards && (
        <div className="notice-message">
          <p>You need to add at least one address before adding payment methods.</p>
          <Link to="/addresses" className="action-link">Add Address</Link>
        </div>
      )}

      {isAdding && canAddCards ? (
        <div className="form-container">
          <h2>{editingId ? "Edit Payment Method" : "Add New Payment Method"}</h2>
          <form onSubmit={handleSubmit} className="card-form">
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                name="card_number"
                value={newCard.card_number}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                required
                disabled={editingId !== null} // ✅ Disable during edit
              />
            </div>

            <div className="form-group">
              <label>Cardholder Name</label>
              <input
                type="text"
                name="cardholder_name"
                value={newCard.cardholder_name}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Expiration Date</label>
                <input
                  type="text"
                  name="expiry_date"
                  value={newCard.expiry_date}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  required
                />
              </div>

              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  name="cvv"
                  value={newCard.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Billing Address</label>
              <select
                name="addressid"
                value={newCard.addressid}
                onChange={handleInputChange}
                required
              >
                {addresses.map(address => (
                  <option key={address.addressid} value={address.addressid}>
                    {address.street_1}, {address.city}, {address.state}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button">
                {editingId ? "Update Card" : "Save Card"}
              </button>
              <button 
                type="button" 
                className="secondary-button"
                onClick={() => {
                  setIsAdding(false);
                  resetForm();
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card-list">
          {cards.length === 0 ? (
            <div className="empty-state">
              <p>You don't have any saved payment methods yet.</p>
              {canAddCards && (
                <button 
                  className="primary-button"
                  onClick={() => {
                    resetForm();
                    setIsAdding(true);
                  }}
                >
                  Add Payment Method
                </button>
              )}
            </div>
          ) : (
            cards.map(card => (
              <div key={card.card_number} className="card-item">
                <div className="card-preview">
                  <div className="card-type">
                    {card.card_number.startsWith('4') ? '💳 Visa' : 
                     card.card_number.startsWith('5') ? '💳 Mastercard' : 
                     card.card_number.startsWith('3') ? '💳 Amex' : 
                     '💳 Card'}
                  </div>
                  <div className="card-number">
                    •••• •••• •••• {card.card_number.slice(-4)}
                  </div>
                  <div className="card-details">
                    <div className="cardholder">{card.cardholder_name}</div>
                    <div className="expiry">Expires: {card.expiry_date}</div>
                  </div>
                </div>
                <div className="card-info">
                  <p className="billing-address">
                    <strong>Billing Address:</strong> {getAddressForCard(card.addressid)}
                  </p>
                </div>
                <div className="card-actions">
                  <button 
                    className="edit-button"
                    onClick={() => handleEdit(card)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-button"
                    onClick={() => handleDelete(card.card_number)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>MyShop</h3>
          <p>Your one-stop shop for all your needs</p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <Link to="/">Home</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/addresses">Addresses</Link>
          <Link to="/cards">Payment Methods</Link>
        </div>
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>Email: support@myshop.com</p>
          <p>Phone: (555) 123-4567</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} MyShop. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default App;