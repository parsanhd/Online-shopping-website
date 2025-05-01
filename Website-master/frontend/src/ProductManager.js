import React, { useState } from 'react';
import apiService from './apiService';

function ProductManager() {
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    brand: '',
    size: '',
    description: ''
  });

  const [editProduct, setEditProduct] = useState({
    productid: '',
    name: '',
    price: '',
    category: '',
    brand: '',
    size: '',
    description: ''
  });

  const [stock, setStock] = useState({ productid: '', warehouseid: '', quantity: '' });
  const [deleteId, setDeleteId] = useState('');

  const resetAll = () => {
    setNewProduct({ name: '', price: '', category: '', brand: '', size: '', description: '' });
    setEditProduct({ productid: '', name: '', price: '', category: '', brand: '', size: '', description: '' });
    setStock({ productid: '', warehouseid: '', quantity: '' });
    setDeleteId('');
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const { name, price, category, brand, size, description } = newProduct;
    const { warehouseid, quantity } = stock;

    if (!name || !price || !category || !brand || !size || !description || !warehouseid || !quantity) {
      alert("❗ All product and stock fields are required.");
      return;
    }

    try {
      const res = await apiService.addProduct({ ...newProduct, price: parseFloat(price) });
      const newId = res.data.productid;
      await apiService.updateStock(newId, warehouseid, parseInt(quantity));
      alert(`✅ Product added (ID: ${newId}) and stock registered.`);
      resetAll();
    } catch (err) {
      alert("❌ Failed to add product or stock.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { productid, ...rest } = editProduct;

    if (!productid) {
      alert("❗ Product ID is required to update.");
      return;
    }

    const updates = {};
    Object.entries(rest).forEach(([key, value]) => {
      if (value !== '') updates[key] = key === 'price' ? parseFloat(value) : value;
    });

    if (Object.keys(updates).length === 0) {
      alert("❗ No update fields provided.");
      return;
    }

    try {
      await apiService.updateProduct(productid, updates);
      alert("✅ Product updated.");
      resetAll();
    } catch (err) {
      alert("❌ Failed to update product.");
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!deleteId) {
      alert("❗ Product ID is required to delete.");
      return;
    }

    try {
      await apiService.deleteProduct(deleteId);
      alert("✅ Product deleted.");
      resetAll();
    } catch (err) {
      alert("❌ Failed to delete product.");
      console.error("❌ Error deleting product:", err.message);
    }
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    const { productid, warehouseid, quantity } = stock;
    if (!productid || !warehouseid || !quantity) {
      alert("❗ All stock fields are required.");
      return;
    }

    try {
      await apiService.updateStock(productid, warehouseid, parseInt(quantity));
      alert("✅ Stock updated.");
      resetAll();
    } catch (err) {
      alert("❌ Failed to update stock.");
    }
  };

  return (
    <div className="container">
      <h2>Product Manager</h2>

      {/* ➕ Add Product */}
      <form onSubmit={handleAdd}>
        <h3>Add Product (Auto-ID)</h3>
        {['name', 'price', 'category', 'brand', 'size', 'description'].map((field) => (
          <input
            key={field}
            name={field}
            placeholder={`${field.charAt(0).toUpperCase() + field.slice(1)} *`}
            value={newProduct[field]}
            onChange={(e) => setNewProduct(prev => ({ ...prev, [field]: e.target.value }))}
          />
        ))}
        <input name="warehouseid" placeholder="Warehouse ID *" value={stock.warehouseid} onChange={(e) => setStock(prev => ({ ...prev, warehouseid: e.target.value }))} />
        <input name="quantity" placeholder="Initial Quantity *" type="number" value={stock.quantity} onChange={(e) => setStock(prev => ({ ...prev, quantity: e.target.value }))} />
        <div className="form-actions">
          <button type="submit" className="primary-button">Add Product</button>
        </div>
      </form>

      <hr />

      {/* ✏️ Update Product */}
      <form onSubmit={handleUpdate}>
        <h3>Update Product</h3>
        <input name="productid" placeholder="Product ID *" value={editProduct.productid} onChange={(e) => setEditProduct(prev => ({ ...prev, productid: e.target.value }))} />
        {['name', 'price', 'category', 'brand', 'size', 'description'].map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={editProduct[field]}
            onChange={(e) => setEditProduct(prev => ({ ...prev, [field]: e.target.value }))}
          />
        ))}
        <div className="form-actions">
          <button type="submit" className="primary-button">Update Product</button>
        </div>
      </form>

      <hr />

      {/* 🗑️ Delete Product */}
      <form onSubmit={handleDelete}>
        <h3>Delete Product</h3>
        <input name="deleteId" placeholder="Product ID *" value={deleteId} onChange={(e) => setDeleteId(e.target.value)} />
        <div className="form-actions">
          <button type="submit" className="delete-button">Delete Product</button>
        </div>
      </form>

      <hr />

      {/* 📦 Update Stock */}
      <form onSubmit={handleStockUpdate}>
        <h3>Update Stock</h3>
        <input name="productid" placeholder="Product ID *" value={stock.productid} onChange={(e) => setStock(prev => ({ ...prev, productid: e.target.value }))} />
        <input name="warehouseid" placeholder="Warehouse ID *" value={stock.warehouseid} onChange={(e) => setStock(prev => ({ ...prev, warehouseid: e.target.value }))} />
        <input name="quantity" placeholder="Add Quantity *" type="number" value={stock.quantity} onChange={(e) => setStock(prev => ({ ...prev, quantity: e.target.value }))} />
        <div className="form-actions">
          <button type="submit" className="primary-button">Update Stock</button>
        </div>
      </form>
    </div>
  );
}

export default ProductManager;