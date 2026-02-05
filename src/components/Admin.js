import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/Admin.css";

function Admin() {
  // --- State Variables ---
  const [mainImageFile, setMainImageFile] = useState(null);
  const [otherPhotosFiles, setOtherPhotosFiles] = useState([]);
  
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [classifications, setClassifications] = useState("");
  
  // NEW: Status fields
  const [status, setStatus] = useState("available");
  const [statusNote, setStatusNote] = useState("");
  const [expectedArrival, setExpectedArrival] = useState("");
  
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [serverStatus, setServerStatus] = useState(null);
  
  // Edit mode state
  const [editingProductId, setEditingProductId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const API_BASE_URL = "https://home-back-3lqs.onrender.com";

  // Status options
  const statusOptions = [
    { value: 'available', label: 'ხელმისაწვდომი', color: '#34c759' },
    { value: 'restoring', label: 'აღდგენის პროცესში', color: '#ff9500' },
    { value: 'on_the_way', label: 'გზაშია', color: '#007aff' },
    { value: 'out_of_stock', label: 'არ არის მარაგში', color: '#ff3b30' },
    { value: 'discontinued', label: 'შეწყვეტილი', color: '#8e8e93' }
  ];

  // --- Check Server Status ---
  const checkServerStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/`);
      const data = await res.json();
      setServerStatus(data);
      return data.database === 'connected';
    } catch (err) {
      console.error("Server status check failed:", err);
      setServerStatus({ database: 'error' });
      return false;
    }
  }, [API_BASE_URL]);

  // --- Logout Handler ---
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  // --- Handlers for Input Changes ---
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    setMainImageFile(file);
    setMessage(file ? `მთავარი სურათი არჩეულია: ${file.name}` : "");
  };

  const handleOtherPhotosChange = (e) => {
    const files = Array.from(e.target.files);
    setOtherPhotosFiles(files);
    setMessage(files.length > 0 ? `არჩეულია ${files.length} დამატებითი სურათი` : "");
  };

  // --- Clear Form Helper ---
  const clearForm = () => {
    setProductName("");
    setPrice("");
    setDescription("");
    setClassifications("");
    setStatus("available");
    setStatusNote("");
    setExpectedArrival("");
    setMainImageFile(null);
    setOtherPhotosFiles([]);
    setMessage("");
    
    // Clear file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => input.value = '');
  };

  // --- Edit Mode Functions ---
  const startEdit = (product) => {
    setIsEditing(true);
    setEditingProductId(product._id);
    
    setProductName(product.name || "");
    setPrice(product.price ? product.price.toString() : "");
    setDescription(product.description || "");
    setClassifications(product.classifications || "");
    setStatus(product.status || "available");
    setStatusNote(product.statusNote || "");
    setExpectedArrival(product.expectedArrival ? product.expectedArrival.split('T')[0] : "");
    
    setMessage(`რედაქტირების რეჟიმი: "${product.name}"`);
    
    // Scroll to top smoothly after a tiny delay to ensure state updates
    setTimeout(() => {
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    }, 100);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingProductId(null);
    clearForm();
    setMessage("");
  };

  // --- Product Upload/Update Logic ---
  const handleUpload = async () => {
    // Validation
    if (!productName.trim()) {
      setMessage("გთხოვთ შეიყვანოთ პროდუქტის სახელი");
      return;
    }
    if (!price.trim() || isNaN(parseFloat(price))) {
      setMessage("გთხოვთ შეიყვანოთ სწორი ფასი");
      return;
    }
    if (!isEditing && !mainImageFile) {
      setMessage("გთხოვთ აირჩიოთ მთავარი სურათი");
      return;
    }

    // Check server status first
    const isConnected = await checkServerStatus();
    if (!isConnected) {
      setMessage("ბაზასთან კავშირი არ არის. გთხოვთ სცადოთ რამდენიმე წამში...");
      return;
    }

    // Prepare Upload/Update
    setIsUploading(true);
    setMessage(isEditing ? "განახლება..." : "ატვირთვა...");
    
    try {
      const endpoint = isEditing 
        ? `${API_BASE_URL}/products/${editingProductId}`
        : `${API_BASE_URL}/products/upload`;
      
      console.log(`${isEditing ? 'UPDATE' : 'CREATE'} request to:`, endpoint);
      
      const formData = new FormData();
      formData.append("name", productName.trim());
      formData.append("price", price.trim());
      formData.append("description", description); // Don't trim to preserve formatting
      formData.append("classifications", classifications.trim());
      formData.append("status", status);
      
      if (statusNote.trim()) {
        formData.append("statusNote", statusNote.trim());
      }
      
      if (expectedArrival) {
        formData.append("expectedArrival", expectedArrival);
      }
      
      if (mainImageFile) {
        formData.append("mainImage", mainImageFile);
        console.log("Main image attached:", mainImageFile.name);
      }
      
      if (otherPhotosFiles.length > 0) {
        otherPhotosFiles.forEach(file => {
          formData.append("otherPhotos", file);
        });
        console.log("Other photos attached:", otherPhotosFiles.length);
      }

      // Make API Call
      const res = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        body: formData,
      });

      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);

      if (res.ok) {
        if (isEditing) {
          setMessage(`"${productName}" წარმატებით განახლდა`);
          
          // Update product in list
          if (data.product) {
            setProducts(prevProducts =>
              prevProducts.map(product => 
                product._id === editingProductId ? data.product : product
              )
            );
          }
          
          // Clear edit mode
          setIsEditing(false);
          setEditingProductId(null);
        } else {
          setMessage(`"${productName}" წარმატებით დაემატა`);
          
          // Add new product to list
          if (data.product) {
            setProducts(prevProducts => [data.product, ...prevProducts]);
          }
        }

        // Clear form
        clearForm();

        // Refresh data
        await loadProducts();
        await loadStats();
        
        // Clear success message after 5 seconds
        setTimeout(() => setMessage(""), 5000);
      } else {
        setMessage(`${isEditing ? 'განახლება' : 'ატვირთვა'} ვერ მოხერხდა: ${data.error || data.message || "უცნობი შეცდომა"}`);
      }
    } catch (err) {
      console.error(`${isEditing ? 'განახლება' : 'ატვირთვა'} შეცდომა:`, err);
      setMessage(`${isEditing ? 'განახლება' : 'ატვირთვა'} ვერ მოხერხდა: ${err.message || 'ქსელის შეცდომა'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // --- Fetching Products with Retry Logic ---
  const loadProducts = useCallback(async (retryCount = 0) => {
    const maxRetries = 5;
    const retryDelay = 3000;
    
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      
      if (!res.ok) {
        if (res.status === 404) {
          setProducts([]);
          return;
        }
        
        if (res.status === 503 && retryCount < maxRetries) {
          console.log(`Database disconnected, retrying in ${retryDelay/1000}s... (${retryCount + 1}/${maxRetries})`);
          
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return loadProducts(retryCount + 1);
        }
        
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Error loading products:", err);
      
      if (retryCount < maxRetries) {
        console.log(`Network error, retrying in ${retryDelay/1000}s... (${retryCount + 1}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return loadProducts(retryCount + 1);
      }
      
      setProducts([]);
    }
  }, [API_BASE_URL]);

  // --- Fetching Upload Statistics with Retry Logic ---
  const loadStats = useCallback(async (retryCount = 0) => {
    const maxRetries = 5;
    const retryDelay = 3000;
    
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      
      if (res.ok) {
        const data = await res.json();
        const productsArray = data.products || [];
        
        // Calculate price statistics
        const totalProducts = productsArray.length;
        const avgPrice = totalProducts > 0 
          ? (productsArray.reduce((sum, p) => sum + (p.price || 0), 0) / totalProducts).toFixed(2)
          : 0;
        const maxPrice = totalProducts > 0 
          ? Math.max(...productsArray.map(p => p.price || 0))
          : 0;
        const minPrice = totalProducts > 0 
          ? Math.min(...productsArray.map(p => p.price || 0))
          : 0;
        
        setStats({ 
          total: totalProducts,
          avgPrice,
          maxPrice,
          minPrice
        });
      } else if (res.status === 503 && retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return loadStats(retryCount + 1);
      }
    } catch (err) {
      console.error("Error loading stats:", err);
      
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return loadStats(retryCount + 1);
      }
      
      setStats({});
    }
  }, [API_BASE_URL]);

  // --- Deleting a Product ---
  const deleteProduct = async (productId, productName) => {
    if (!window.confirm(`დარწმუნებული ხართ რომ გსურთ "${productName}"-ის წაშლა?`)) return;

    const isConnected = await checkServerStatus();
    if (!isConnected) {
      setMessage("ბაზასთან კავშირი არ არის. გთხოვთ სცადოთ რამდენიმე წამში...");
      return;
    }

    try {
      setMessage("იშლება...");
      
      const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(`"${productName}" წარმატებით წაიშალა`);
        setProducts(prevProducts =>
          prevProducts.filter(product => product._id !== productId)
        );
        
        if (editingProductId === productId) {
          cancelEdit();
        }
        
        await loadStats();
        
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`წაშლა ვერ მოხერხდა: ${data.error || data.message || "უცნობი შეცდომა"}`);
      }
    } catch (err) {
      console.error("Delete error:", err);
      setMessage("წაშლა ვერ მოხერხდა: ქსელის შეცდომა");
    }
  };

  // Get status color
  const getStatusColor = (statusValue) => {
    const option = statusOptions.find(opt => opt.value === statusValue);
    return option ? option.color : '#8e8e93';
  };

  // Get status label
  const getStatusLabel = (statusValue) => {
    const option = statusOptions.find(opt => opt.value === statusValue);
    return option ? option.label : statusValue;
  };

  // --- Effect Hooks ---
  useEffect(() => {
    // Scroll to top immediately when component mounts
    window.scrollTo(0, 0);
    
    const loadInitialData = async () => {
      setIsLoadingInitial(true);
      await checkServerStatus();
      await loadProducts();
      await loadStats();
      setIsLoadingInitial(false);
    };
    
    loadInitialData();
  }, [loadProducts, loadStats, checkServerStatus]);

  // --- JSX Rendering ---
  return (
    <div className="admin-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">SmartHome Admin</h1>
          <button onClick={handleLogout} className="logout-btn">
            გასვლა
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Server Status Warning */}
        {serverStatus && serverStatus.database !== 'connected' && (
          <div className="alert alert-error">
            <strong>ბაზა არ არის მიერთებული</strong>
            <p>სერვერი მუშაობს, მაგრამ MongoDB-სთან კავშირი არ არის.</p>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoadingInitial && (
          <div className="alert alert-loading">
            <div className="spinner"></div>
            <p>იტვირთება...</p>
          </div>
        )}
        
        {/* Stats */}
        {!isLoadingInitial && (
          <div className="stats-bar">
            <div className="stat">
              <span className="stat-label">სულ პროდუქტი</span>
              <span className="stat-value">{stats.total || 0}</span>
            </div>
          </div>
        )}

        {/* Upload Form */}
        <section className="form-section">
          <div className="section-header">
            <h2 className="section-title">
              {isEditing ? 'პროდუქტის რედაქტირება' : 'ახალი პროდუქტის დამატება'}
            </h2>
            {isEditing && (
              <button onClick={cancelEdit} className="btn-text">
                გაუქმება
              </button>
            )}
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label className="label">პროდუქტის სახელი</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                disabled={isUploading}
                className="input"
                placeholder="შეიყვანეთ სახელი"
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label className="label">ფასი</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isUploading}
                className="input"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group form-group-full">
              <label className="label">აღწერა</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
                className="textarea"
                placeholder="შეიყვანეთ აღწერა"
                rows="3"
                maxLength={1000}
              />
            </div>

            <div className="form-group form-group-full">
              <label className="label">კლასიფიკაცია</label>
              <input
                type="text"
                value={classifications}
                onChange={(e) => setClassifications(e.target.value)}
                disabled={isUploading}
                className="input"
                placeholder="მაგ: Smart Home, Security"
                maxLength={200}
              />
            </div>

            {/* NEW: Status Section */}
            <div className="form-group">
              <label className="label">სტატუსი</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={isUploading}
                className="input select-input"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label">მოსალოდნელი თარიღი (არასავალდებულო)</label>
              <input
                type="date"
                value={expectedArrival}
                onChange={(e) => setExpectedArrival(e.target.value)}
                disabled={isUploading}
                className="input"
              />
            </div>

            <div className="form-group form-group-full">
              <label className="label">სტატუსი (არასავალდებულო)</label>
              <input
                type="text"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                disabled={isUploading}
                className="input"
                placeholder="მაგ: გზაშია, მალე იქნება მარაგში"
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label className="label">
                მთავარი სურათი
              </label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  disabled={isUploading}
                  className="file-input"
                  id="mainImage"
                />
                <label htmlFor="mainImage" className="file-label">
                  {mainImageFile ? mainImageFile.name : 'აირჩიეთ ფაილი'}
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="label">დამატებითი სურათები</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleOtherPhotosChange}
                  disabled={isUploading}
                  className="file-input"
                  id="otherPhotos"
                />
                <label htmlFor="otherPhotos" className="file-label">
                  {otherPhotosFiles.length > 0 ? `${otherPhotosFiles.length} ფაილი` : 'აირჩიეთ ფაილები'}
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="btn-primary"
          >
            {isUploading ? 'მუშავდება...' : isEditing ? 'განახლება' : 'დამატება'}
          </button>

          {message && (
            <div className={`message ${message.includes('წარმატებით') ? 'message-success' : 'message-error'}`}>
              {message}
            </div>
          )}
        </section>

        {/* Products List */}
        <section className="products-section">
          <h2 className="section-title">ყველა პროდუქტი ({products.length})</h2>
          
          {products.length > 0 ? (
            <div className="products-grid">
              {products.map((product) => (
                <div 
                  key={product._id} 
                  className={`product-card ${editingProductId === product._id ? 'product-card-editing' : ''}`}
                >
                  {product.mainImage && (
                    <div className="product-image-wrapper">
                      <img
                        src={product.mainImage}
                        alt={product.name || 'Product'}
                        className="product-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      {/* Status Badge on Image */}
                      <div 
                        className="product-status-badge"
                        style={{ backgroundColor: getStatusColor(product.status || 'available') }}
                      >
                        {getStatusLabel(product.status || 'available')}
                      </div>
                    </div>
                  )}
                  
                  <div className="product-content">
                    <div className="product-header">
                      <h3 className="product-name">{product.name || 'უსახელო პროდუქტი'}</h3>
                      <span className="product-price">₾{product.price ? product.price.toFixed(2) : '0.00'}</span>
                    </div>
                    
                    {product.classifications && (
                      <p className="product-classifications">{product.classifications}</p>
                    )}
                    
                    {product.description && (
                      <p className="product-description">
                        {product.description.length > 100
                          ? `${product.description.substring(0, 100)}...`
                          : product.description
                        }
                      </p>
                    )}

                    {/* Status Info */}
                    {(product.statusNote || product.expectedArrival) && (
                      <div className="product-status-info">
                        {product.statusNote && (
                          <p className="status-note">📌 {product.statusNote}</p>
                        )}
                        {product.expectedArrival && (
                          <p className="status-arrival">
                            📅 მოსალოდნელია: {new Date(product.expectedArrival).toLocaleDateString('ka-GE')}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="product-meta">
                      {product.otherPhotos && product.otherPhotos.length > 0 && (
                        <span className="meta-badge">
                          {product.otherPhotos.length} სურათი
                        </span>
                      )}
                      <span className="meta-badge">
                        {new Date(product.uploadDate).toLocaleDateString('ka-GE')}
                      </span>
                    </div>

                    <div className="product-actions">
                      <button
                        onClick={() => startEdit(product)}
                        className="btn-secondary"
                        disabled={isEditing}
                      >
                        რედაქტირება
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id, product.name || 'ეს პროდუქტი')}
                        className="btn-delete"
                      >
                        წაშლა
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>პროდუქტები ჯერ არ არის დამატებული</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Admin;