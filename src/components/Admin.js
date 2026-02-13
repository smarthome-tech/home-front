import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import "../styles/Admin.css";

// ─── Simple Rich Text Toolbar ─────────────────────────────────────────────────
// Uses native execCommand (no external packages) for color + font size.
// Wraps a contentEditable div. Value is stored as HTML string.
function RichEditor({ value, onChange, disabled, placeholder, rows = 5 }) {
  const editorRef = useRef(null);
  const isInternalUpdate = useRef(false);

  // Sync incoming value into DOM only when it changes externally (e.g. on load)
  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      isInternalUpdate.current = true;
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (isInternalUpdate.current) { isInternalUpdate.current = false; return; }
    onChange(editorRef.current.innerHTML);
  };

  const exec = (command, val = null) => {
    editorRef.current.focus();
    document.execCommand(command, false, val);
    onChange(editorRef.current.innerHTML);
  };

  const FONT_SIZES = [
    { label: 'XS', value: '12px' },
    { label: 'S',  value: '16px' },
    { label: 'M',  value: '20px' },
    { label: 'L',  value: '28px' },
    { label: 'XL', value: '36px' },
    { label: 'XXL',value: '48px' },
  ];

  const COLORS = [
    '#ffffff', '#f5f5f7', '#cccccc', '#888888', '#333333', '#000000',
    '#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#007aff', '#af52de',
  ];

  // execCommand fontSize only accepts 1-7, so we wrap selected text in a span instead
  const applyFontSize = (px) => {
    editorRef.current.focus();
    const sel = window.getSelection();
    if (!sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return; // nothing selected
    const span = document.createElement('span');
    span.style.fontSize = px;
    range.surroundContents(span);
    onChange(editorRef.current.innerHTML);
  };

  const applyColor = (color) => {
    exec('foreColor', color);
  };

  const toolbarStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    alignItems: 'center',
    padding: '8px 10px',
    background: '#1c1c1e',
    border: '1px solid #3a3a3c',
    borderBottom: 'none',
    borderRadius: '8px 8px 0 0',
  };

  const btnStyle = {
    background: '#2c2c2e',
    border: '1px solid #3a3a3c',
    borderRadius: '5px',
    color: '#fff',
    cursor: 'pointer',
    padding: '3px 8px',
    fontSize: '12px',
    fontWeight: 'bold',
  };

  const editorStyle = {
    minHeight: `${rows * 24}px`,
    padding: '10px 12px',
    background: '#1c1c1e',
    border: '1px solid #3a3a3c',
    borderRadius: '0 0 8px 8px',
    color: '#fff',
    outline: 'none',
    lineHeight: 1.6,
    opacity: disabled ? 0.5 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
    overflowY: 'auto',
  };

  const dividerStyle = {
    width: '1px', height: '20px', background: '#3a3a3c', margin: '0 2px',
  };

  return (
    <div>
      {/* ── Toolbar ── */}
      <div style={toolbarStyle}>

        {/* Bold / Italic / Underline */}
        <button type="button" style={btnStyle} onMouseDown={e => { e.preventDefault(); exec('bold'); }} title="Bold">B</button>
        <button type="button" style={{ ...btnStyle, fontStyle: 'italic' }} onMouseDown={e => { e.preventDefault(); exec('italic'); }} title="Italic">I</button>
        <button type="button" style={{ ...btnStyle, textDecoration: 'underline' }} onMouseDown={e => { e.preventDefault(); exec('underline'); }} title="Underline">U</button>

        <div style={dividerStyle} />

        {/* Font size buttons */}
        {FONT_SIZES.map(s => (
          <button
            key={s.value}
            type="button"
            style={btnStyle}
            onMouseDown={e => { e.preventDefault(); applyFontSize(s.value); }}
            title={`Font size ${s.value}`}
          >
            {s.label}
          </button>
        ))}

        <div style={dividerStyle} />

        {/* Color swatches */}
        {COLORS.map(c => (
          <button
            key={c}
            type="button"
            onMouseDown={e => { e.preventDefault(); applyColor(c); }}
            title={c}
            style={{
              width: '20px', height: '20px',
              borderRadius: '50%',
              background: c,
              border: c === '#ffffff' ? '1px solid #555' : '1px solid transparent',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
            }}
          />
        ))}

        <div style={dividerStyle} />

        {/* Clear formatting */}
        <button
          type="button"
          style={{ ...btnStyle, fontSize: '11px', color: '#ff453a' }}
          onMouseDown={e => { e.preventDefault(); exec('removeFormat'); }}
          title="Clear formatting"
        >
          ✕
        </button>
      </div>

      {/* ── Editable area ── */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handleInput}
        style={editorStyle}
        data-placeholder={placeholder}
      />

      <small style={{ color: '#636366', fontSize: '0.72rem', marginTop: '4px', display: 'block' }}>
        მონიშნეთ ტექსტი, შემდეგ დააჭირეთ ზომის ან ფერის ღილაკს
      </small>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

function Admin() {
  const [activeTab, setActiveTab] = useState("products");

  // --- Product State ---
  const [mainImageFile, setMainImageFile] = useState(null);
  const [otherPhotosFiles, setOtherPhotosFiles] = useState([]);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [numeration, setNumeration] = useState("");
  const [description, setDescription] = useState("");
  const [classifications, setClassifications] = useState("");
  const [status, setStatus] = useState("available");
  const [statusNote, setStatusNote] = useState("");
  const [expectedArrival, setExpectedArrival] = useState("");

  // --- Settings State ---
  const [landingTitle, setLandingTitle] = useState("");
  const [landingDescription, setLandingDescription] = useState("");
  const [aboutText, setAboutText] = useState("");
  const [servicesText, setServicesText] = useState("");
  const [bannerFile, setBannerFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [currentBanner, setCurrentBanner] = useState("");
  const [currentLogo, setCurrentLogo] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // --- Shared State ---
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [serverStatus, setServerStatus] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const API_BASE_URL = "https://home-back-3lqs.onrender.com";

  const statusOptions = [
    { value: 'available', label: 'ხელმისაწვდომი', color: '#34c759' },
    { value: 'restoring', label: 'აღდგენის პროცესში', color: '#ff9500' },
    { value: 'on_the_way', label: 'გზაშია', color: '#007aff' },
    { value: 'out_of_stock', label: 'არ არის მარაგში', color: '#ff3b30' },
    { value: 'discontinued', label: 'შეწყვეტილი', color: '#8e8e93' }
  ];

  const tabs = [
    { id: "products", label: "პროდუქტები" },
    { id: "logo", label: "ლოგო" },
    { id: "landing", label: "მთავარი გვერდი" },
    { id: "about", label: "ჩვენს შესახებ" },
    { id: "services", label: "სერვისები" },
    { id: "banner", label: "მთავარი ფოტო" },
  ];

  const checkServerStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/`);
      const data = await res.json();
      setServerStatus(data);
      return data.database === 'connected';
    } catch (err) {
      setServerStatus({ database: 'error' });
      return false;
    }
  }, [API_BASE_URL]);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        const s = data.settings;
        setLandingTitle(s.landingTitle || "");
        setLandingDescription(s.landingDescription || "");
        setAboutText(s.aboutText || "");
        setServicesText(s.servicesText || "");
        setCurrentBanner(s.landingBanner || "");
        setCurrentLogo(s.logo || "");
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  }, [API_BASE_URL]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    setMainImageFile(file);
    setMessage(file ? `მთავარი სურათი: ${file.name}` : "");
  };

  const handleOtherPhotosChange = (e) => {
    const files = Array.from(e.target.files);
    setOtherPhotosFiles(files);
    setMessage(files.length > 0 ? `${files.length} დამატებითი სურათი` : "");
  };

  const clearForm = () => {
    setProductName(""); setPrice(""); setNumeration(""); setDescription(""); setClassifications("");
    setStatus("available"); setStatusNote(""); setExpectedArrival("");
    setMainImageFile(null); setOtherPhotosFiles([]); setMessage("");
    document.querySelectorAll('input[type="file"]').forEach(i => i.value = '');
  };

  const startEdit = (product) => {
    setIsEditing(true);
    setEditingProductId(product._id);
    setProductName(product.name || "");
    setPrice(product.price ? product.price.toString() : "");
    setNumeration(product.numeration !== undefined ? product.numeration.toString() : "");
    setDescription(product.description || "");
    setClassifications(product.classifications || "");
    setStatus(product.status || "available");
    setStatusNote(product.statusNote || "");
    setExpectedArrival(product.expectedArrival ? product.expectedArrival.split('T')[0] : "");
    setMessage(`რედაქტირება: "${product.name}"`);
    setActiveTab("products");
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingProductId(null);
    clearForm();
  };

  const handleUpload = async () => {
    if (!productName.trim()) { setMessage("გთხოვთ შეიყვანოთ პროდუქტის სახელი"); return; }
    if (!price.trim() || isNaN(parseFloat(price))) { setMessage("გთხოვთ შეიყვანოთ სწორი ფასი"); return; }
    if (!isEditing && !mainImageFile) { setMessage("გთხოვთ აირჩიოთ მთავარი სურათი"); return; }

    const isConnected = await checkServerStatus();
    if (!isConnected) { setMessage("ბაზასთან კავშირი არ არის."); return; }

    setIsUploading(true);
    setMessage(isEditing ? "განახლება..." : "ატვირთვა...");

    try {
      const endpoint = isEditing
        ? `${API_BASE_URL}/products/${editingProductId}`
        : `${API_BASE_URL}/products/upload`;

      const formData = new FormData();
      formData.append("name", productName.trim());
      formData.append("price", price.trim());
      if (numeration.trim()) formData.append("numeration", numeration.trim());
      formData.append("description", description);
      formData.append("classifications", classifications.trim());
      formData.append("status", status);
      if (statusNote.trim()) formData.append("statusNote", statusNote.trim());
      if (expectedArrival) formData.append("expectedArrival", expectedArrival);
      if (mainImageFile) formData.append("mainImage", mainImageFile);
      otherPhotosFiles.forEach(file => formData.append("otherPhotos", file));

      const res = await fetch(endpoint, { method: isEditing ? "PUT" : "POST", body: formData });
      const data = await res.json();

      if (res.ok) {
        setMessage(`"${productName}" ${isEditing ? 'განახლდა' : 'დაემატა'}`);
        if (data.product) {
          setProducts(prev => isEditing
            ? prev.map(p => p._id === editingProductId ? data.product : p)
            : [data.product, ...prev]
          );
        }
        if (isEditing) { setIsEditing(false); setEditingProductId(null); }
        clearForm();
        await loadProducts();
        await loadStats();
        setTimeout(() => setMessage(""), 5000);
      } else {
        setMessage(`შეცდომა: ${data.error || "უცნობი შეცდომა"}`);
      }
    } catch (err) {
      setMessage(`შეცდომა: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const loadProducts = useCallback(async (retryCount = 0) => {
    const maxRetries = 5;
    const retryDelay = 3000;
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) {
        if (res.status === 503 && retryCount < maxRetries) {
          await new Promise(r => setTimeout(r, retryDelay));
          return loadProducts(retryCount + 1);
        }
        setProducts([]); return;
      }
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      if (retryCount < maxRetries) {
        await new Promise(r => setTimeout(r, retryDelay));
        return loadProducts(retryCount + 1);
      }
      setProducts([]);
    }
  }, [API_BASE_URL]);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (res.ok) {
        const data = await res.json();
        const arr = data.products || [];
        setStats({ total: arr.length });
      }
    } catch (err) { setStats({}); }
  }, [API_BASE_URL]);

  const deleteProduct = async (productId, productName) => {
    if (!window.confirm(`წაიშალოს "${productName}"?`)) return;
    const isConnected = await checkServerStatus();
    if (!isConnected) { setMessage("ბაზასთან კავშირი არ არის."); return; }
    try {
      setMessage("იშლება...");
      const res = await fetch(`${API_BASE_URL}/products/${productId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setMessage(`"${productName}" წაიშალა`);
        setProducts(prev => prev.filter(p => p._id !== productId));
        if (editingProductId === productId) cancelEdit();
        await loadStats();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(`წაშლა ვერ მოხერხდა: ${data.error}`);
      }
    } catch (err) {
      setMessage("წაშლა ვერ მოხერხდა");
    }
  };

  // --- Settings Save Handlers ---
  const saveLanding = async () => {
    setIsSavingSettings(true);
    setSettingsMessage("ინახება...");
    try {
      const res = await fetch(`${API_BASE_URL}/settings/landing`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // landingTitle and landingDescription are now HTML strings
        body: JSON.stringify({ landingTitle, landingDescription })
      });
      const data = await res.json();
      setSettingsMessage(res.ok ? "მთავარი გვერდი შენახულია ✓" : `შეცდომა: ${data.error}`);
      setTimeout(() => setSettingsMessage(""), 4000);
    } catch (err) {
      setSettingsMessage("შეცდომა: " + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const saveAbout = async () => {
    setIsSavingSettings(true);
    setSettingsMessage("ინახება...");
    try {
      const res = await fetch(`${API_BASE_URL}/settings/about`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aboutText })
      });
      const data = await res.json();
      setSettingsMessage(res.ok ? "ჩვენს შესახებ შენახულია ✓" : `შეცდომა: ${data.error}`);
      setTimeout(() => setSettingsMessage(""), 4000);
    } catch (err) {
      setSettingsMessage("შეცდომა: " + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const saveServices = async () => {
    setIsSavingSettings(true);
    setSettingsMessage("ინახება...");
    try {
      const res = await fetch(`${API_BASE_URL}/settings/services`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servicesText })
      });
      const data = await res.json();
      setSettingsMessage(res.ok ? "სერვისები შენახულია ✓" : `შეცდომა: ${data.error}`);
      setTimeout(() => setSettingsMessage(""), 4000);
    } catch (err) {
      setSettingsMessage("შეცდომა: " + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const saveBanner = async () => {
    if (!bannerFile) { setSettingsMessage("გთხოვთ აირჩიოთ სურათი"); return; }
    setIsSavingSettings(true);
    setSettingsMessage("ატვირთვა...");
    try {
      const formData = new FormData();
      formData.append("landingBanner", bannerFile);
      const res = await fetch(`${API_BASE_URL}/settings/banner`, { method: "PATCH", body: formData });
      const data = await res.json();
      if (res.ok) {
        setSettingsMessage("ბანერი შენახულია ✓");
        setCurrentBanner(data.settings?.landingBanner || "");
        setBannerFile(null);
      } else {
        setSettingsMessage(`შეცდომა: ${data.error}`);
      }
      setTimeout(() => setSettingsMessage(""), 4000);
    } catch (err) {
      setSettingsMessage("შეცდომა: " + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const saveLogo = async () => {
    if (!logoFile) { setSettingsMessage("გთხოვთ აირჩიოთ სურათი"); return; }
    setIsSavingSettings(true);
    setSettingsMessage("ატვირთვა...");
    try {
      const formData = new FormData();
      formData.append("logo", logoFile);
      const res = await fetch(`${API_BASE_URL}/settings/logo`, { method: "PATCH", body: formData });
      const data = await res.json();
      if (res.ok) {
        setSettingsMessage("ლოგო შენახულია ✓");
        setCurrentLogo(data.settings?.logo || "");
        setLogoFile(null);
      } else {
        setSettingsMessage(`შეცდომა: ${data.error}`);
      }
      setTimeout(() => setSettingsMessage(""), 4000);
    } catch (err) {
      setSettingsMessage("შეცდომა: " + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const getStatusColor = (s) => statusOptions.find(o => o.value === s)?.color || '#8e8e93';
  const getStatusLabel = (s) => statusOptions.find(o => o.value === s)?.label || s;

  useEffect(() => {
    window.scrollTo(0, 0);
    const init = async () => {
      setIsLoadingInitial(true);
      await checkServerStatus();
      await loadProducts();
      await loadStats();
      await loadSettings();
      setIsLoadingInitial(false);
    };
    init();
  }, [loadProducts, loadStats, checkServerStatus, loadSettings]);

  return (
    <div className="admin-container">
      <header className="header">
        <div className="header-content">
          <h1 className="header-title">SmartHome Admin</h1>
          <button onClick={handleLogout} className="logout-btn">გასვლა</button>
        </div>
        <nav className="tab-nav">
          <div className="tab-nav-inner">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn ${activeTab === tab.id ? 'tab-btn-active' : ''}`}
              >
                {tab.label}
                {tab.id === 'products' && stats.total > 0 && (
                  <span className="tab-count">{stats.total}</span>
                )}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="main-content">
        {serverStatus && serverStatus.database !== 'connected' && (
          <div className="alert alert-error">
            <strong>ბაზა არ არის მიერთებული</strong>
            <p>MongoDB-სთან კავშირი არ არის.</p>
          </div>
        )}

        {isLoadingInitial && (
          <div className="alert alert-loading">
            <div className="spinner"></div>
            <p>იტვირთება...</p>
          </div>
        )}

        {/* ===== PRODUCTS TAB ===== */}
        {activeTab === "products" && !isLoadingInitial && (
          <>
            <div className="stats-bar">
              <div className="stat">
                <span className="stat-label">სულ პროდუქტი</span>
                <span className="stat-value">{stats.total || 0}</span>
              </div>
            </div>

            <section className="form-section">
              <div className="section-header">
                <h2 className="section-title">
                  {isEditing ? 'პროდუქტის რედაქტირება' : 'ახალი პროდუქტის დამატება'}
                </h2>
                {isEditing && (
                  <button onClick={cancelEdit} className="btn-text">გაუქმება</button>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="label">პროდუქტის სახელი</label>
                  <input type="text" value={productName} onChange={e => setProductName(e.target.value)}
                    disabled={isUploading} className="input" placeholder="შეიყვანეთ სახელი" maxLength={200} />
                </div>

                <div className="form-group">
                  <label className="label">ფასი</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                    disabled={isUploading} className="input" placeholder="0.00" step="0.01" min="0" />
                </div>

                <div className="form-group">
                  <label className="label">ნომერი (არასავალდებულო)</label>
                  <input type="number" value={numeration} onChange={e => setNumeration(e.target.value)}
                    disabled={isUploading} className="input" placeholder="1, 2, 3..." min="0" step="1" />
                  <small style={{ color: '#8e8e93', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                    გამოიყენეთ დალაგებისთვის მთავარ გვერდზე
                  </small>
                </div>

                <div className="form-group form-group-full">
                  <label className="label">აღწერა</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)}
                    disabled={isUploading} className="textarea" placeholder="შეიყვანეთ აღწერა"
                    rows="3" maxLength={1000} />
                </div>

                <div className="form-group form-group-full">
                  <label className="label">კლასიფიკაცია</label>
                  <input type="text" value={classifications} onChange={e => setClassifications(e.target.value)}
                    disabled={isUploading} className="input" placeholder="მაგ: Smart Home, Security" maxLength={200} />
                </div>

                <div className="form-group">
                  <label className="label">სტატუსი</label>
                  <select value={status} onChange={e => setStatus(e.target.value)}
                    disabled={isUploading} className="input select-input">
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">მოსალოდნელი თარიღი (არასავალდებულო)</label>
                  <input type="date" value={expectedArrival} onChange={e => setExpectedArrival(e.target.value)}
                    disabled={isUploading} className="input" />
                </div>

                <div className="form-group form-group-full">
                  <label className="label">სტატუსის შენიშვნა (არასავალდებულო)</label>
                  <input type="text" value={statusNote} onChange={e => setStatusNote(e.target.value)}
                    disabled={isUploading} className="input"
                    placeholder="მაგ: გზაშია, მალე იქნება მარაგში" maxLength={200} />
                </div>

                <div className="form-group">
                  <label className="label">მთავარი სურათი</label>
                  <div className="file-input-wrapper">
                    <input type="file" accept="image/*" onChange={handleMainImageChange}
                      disabled={isUploading} className="file-input" id="mainImage" />
                    <label htmlFor="mainImage" className="file-label">
                      {mainImageFile ? mainImageFile.name : 'აირჩიეთ ფაილი'}
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">დამატებითი სურათები</label>
                  <div className="file-input-wrapper">
                    <input type="file" accept="image/*" multiple onChange={handleOtherPhotosChange}
                      disabled={isUploading} className="file-input" id="otherPhotos" />
                    <label htmlFor="otherPhotos" className="file-label">
                      {otherPhotosFiles.length > 0 ? `${otherPhotosFiles.length} ფაილი` : 'აირჩიეთ ფაილები'}
                    </label>
                  </div>
                </div>
              </div>

              <button onClick={handleUpload} disabled={isUploading} className="btn-primary">
                {isUploading ? 'მუშავდება...' : isEditing ? 'განახლება' : 'დამატება'}
              </button>

              {message && (
                <div className={`message ${message.includes('წარმატებ') || message.includes('დაემატა') || message.includes('განახლდა') || message.includes('წაიშალა') ? 'message-success' : 'message-error'}`}>
                  {message}
                </div>
              )}
            </section>

            <section className="products-section">
              <h2 className="section-title">ყველა პროდუქტი ({products.length})</h2>
              {products.length > 0 ? (
                <div className="products-grid">
                  {products.map(product => (
                    <div key={product._id}
                      className={`product-card ${editingProductId === product._id ? 'product-card-editing' : ''}`}>
                      {product.mainImage && (
                        <div className="product-image-wrapper">
                          <img src={product.mainImage} alt={product.name || 'Product'}
                            className="product-image" onError={e => e.target.style.display = 'none'} />
                          <div className="product-status-badge"
                            style={{ backgroundColor: getStatusColor(product.status || 'available') }}>
                            {getStatusLabel(product.status || 'available')}
                          </div>
                          {product.numeration !== undefined && (
                            <div className="product-numeration-badge">#{product.numeration}</div>
                          )}
                        </div>
                      )}
                      <div className="product-content">
                        <div className="product-header">
                          <h3 className="product-name">{product.name || 'უსახელო'}</h3>
                          <span className="product-price">₾{product.price ? product.price.toFixed(2) : '0.00'}</span>
                        </div>
                        {product.classifications && <p className="product-classifications">{product.classifications}</p>}
                        {product.description && (
                          <p className="product-description">
                            {product.description.length > 100
                              ? `${product.description.substring(0, 100)}...`
                              : product.description}
                          </p>
                        )}
                        {(product.statusNote || product.expectedArrival) && (
                          <div className="product-status-info">
                            {product.statusNote && <p className="status-note">📌 {product.statusNote}</p>}
                            {product.expectedArrival && (
                              <p className="status-arrival">
                                📅 {new Date(product.expectedArrival).toLocaleDateString('ka-GE')}
                              </p>
                            )}
                          </div>
                        )}
                        <div className="product-meta">
                          {product.otherPhotos?.length > 0 && (
                            <span className="meta-badge">{product.otherPhotos.length} სურათი</span>
                          )}
                          <span className="meta-badge">
                            {new Date(product.uploadDate).toLocaleDateString('ka-GE')}
                          </span>
                        </div>
                        <div className="product-actions">
                          <button onClick={() => startEdit(product)} className="btn-secondary" disabled={isEditing}>
                            რედაქტირება
                          </button>
                          <button onClick={() => deleteProduct(product._id, product.name || 'ეს პროდუქტი')} className="btn-delete">
                            წაშლა
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state"><p>პროდუქტები ჯერ არ არის დამატებული</p></div>
              )}
            </section>
          </>
        )}

        {/* ===== LOGO TAB ===== */}
        {activeTab === "logo" && !isLoadingInitial && (
          <section className="form-section settings-section">
            <h2 className="section-title">ლოგო</h2>
            <p className="settings-hint">საიტის ლოგოს ატვირთვა</p>
            {currentLogo && (
              <div className="settings-preview">
                <p className="settings-preview-label">მიმდინარე ლოგო</p>
                <div className="logo-preview-wrapper">
                  <img src={currentLogo} alt="Current logo" className="logo-preview-img"
                    onError={e => e.target.style.display = 'none'} />
                </div>
              </div>
            )}
            <div className="form-group" style={{ marginTop: '24px' }}>
              <label className="label">ახალი ლოგო</label>
              <div className="file-input-wrapper">
                <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])}
                  disabled={isSavingSettings} className="file-input" id="logoUpload" />
                <label htmlFor="logoUpload" className="file-label">
                  {logoFile ? logoFile.name : 'აირჩიეთ სურათი'}
                </label>
              </div>
            </div>
            {logoFile && (
              <div className="settings-preview" style={{ marginTop: '16px' }}>
                <p className="settings-preview-label">არჩეული</p>
                <div className="logo-preview-wrapper">
                  <img src={URL.createObjectURL(logoFile)} alt="Preview" className="logo-preview-img" />
                </div>
              </div>
            )}
            <button onClick={saveLogo} disabled={isSavingSettings || !logoFile} className="btn-primary" style={{ marginTop: '24px' }}>
              {isSavingSettings ? 'ატვირთვა...' : 'შენახვა'}
            </button>
            {settingsMessage && (
              <div className={`message ${settingsMessage.includes('✓') ? 'message-success' : 'message-error'}`}>
                {settingsMessage}
              </div>
            )}
          </section>
        )}

        {/* ===== LANDING TAB — now uses RichEditor ===== */}
        {activeTab === "landing" && !isLoadingInitial && (
          <section className="form-section settings-section">
            <h2 className="section-title">მთავარი გვერდის ტექსტი</h2>
            <p className="settings-hint">მონიშნეთ ტექსტი და გამოიყენეთ ტულბარი ფერისა და ზომის შესაცვლელად</p>

            <div className="form-grid" style={{ marginTop: '24px' }}>
              <div className="form-group form-group-full">
                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>სათაური</label>
                <RichEditor
                  value={landingTitle}
                  onChange={setLandingTitle}
                  disabled={isSavingSettings}
                  placeholder="საიტის სათაური"
                  rows={3}
                />
              </div>

              <div className="form-group form-group-full">
                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>აღწერა</label>
                <RichEditor
                  value={landingDescription}
                  onChange={setLandingDescription}
                  disabled={isSavingSettings}
                  placeholder="მთავარი გვერდის ტექსტი"
                  rows={5}
                />
              </div>
            </div>

            <button onClick={saveLanding} disabled={isSavingSettings} className="btn-primary" style={{ marginTop: '16px' }}>
              {isSavingSettings ? 'ინახება...' : 'შენახვა'}
            </button>
            {settingsMessage && (
              <div className={`message ${settingsMessage.includes('✓') ? 'message-success' : 'message-error'}`}>
                {settingsMessage}
              </div>
            )}
          </section>
        )}

        {/* ===== ABOUT TAB ===== */}
        {activeTab === "about" && !isLoadingInitial && (
          <section className="form-section settings-section">
            <h2 className="section-title">ჩვენს შესახებ</h2>
            <p className="settings-hint">ტექსტი "ჩვენს შესახებ" გვერდისთვის</p>
            <div className="form-group" style={{ marginTop: '24px' }}>
              <label className="label">ტექსტი</label>
              <textarea value={aboutText} onChange={e => setAboutText(e.target.value)}
                disabled={isSavingSettings} className="textarea" placeholder="ჩვენს შესახებ ინფორმაცია..."
                rows="10" />
            </div>
            <button onClick={saveAbout} disabled={isSavingSettings} className="btn-primary" style={{ marginTop: '24px' }}>
              {isSavingSettings ? 'ინახება...' : 'შენახვა'}
            </button>
            {settingsMessage && (
              <div className={`message ${settingsMessage.includes('✓') ? 'message-success' : 'message-error'}`}>
                {settingsMessage}
              </div>
            )}
          </section>
        )}

        {/* ===== SERVICES TAB ===== */}
        {activeTab === "services" && !isLoadingInitial && (
          <section className="form-section settings-section">
            <h2 className="section-title">სერვისები</h2>
            <p className="settings-hint">ტექსტი "სერვისები" გვერდისთვის</p>
            <div className="form-group" style={{ marginTop: '24px' }}>
              <label className="label">ტექსტი</label>
              <textarea value={servicesText} onChange={e => setServicesText(e.target.value)}
                disabled={isSavingSettings} className="textarea" placeholder="სერვისების ინფორმაცია..."
                rows="10" />
            </div>
            <button onClick={saveServices} disabled={isSavingSettings} className="btn-primary" style={{ marginTop: '24px' }}>
              {isSavingSettings ? 'ინახება...' : 'შენახვა'}
            </button>
            {settingsMessage && (
              <div className={`message ${settingsMessage.includes('✓') ? 'message-success' : 'message-error'}`}>
                {settingsMessage}
              </div>
            )}
          </section>
        )}

        {/* ===== BANNER TAB ===== */}
        {activeTab === "banner" && !isLoadingInitial && (
          <section className="form-section settings-section">
            <h2 className="section-title">მთავარი გვერდის ფოტო</h2>
            <p className="settings-hint">ბანერი სურათი რომელიც გამოჩნდება მთავარ გვერდზე</p>
            {currentBanner && (
              <div className="settings-preview" style={{ marginTop: '24px' }}>
                <p className="settings-preview-label">მიმდინარე ბანერი</p>
                <div className="banner-preview-wrapper">
                  <img src={currentBanner} alt="Current banner" className="banner-preview-img"
                    onError={e => e.target.style.display = 'none'} />
                </div>
              </div>
            )}
            <div className="form-group" style={{ marginTop: '24px' }}>
              <label className="label">ახალი ბანერი</label>
              <div className="file-input-wrapper">
                <input type="file" accept="image/*" onChange={e => setBannerFile(e.target.files[0])}
                  disabled={isSavingSettings} className="file-input" id="bannerUpload" />
                <label htmlFor="bannerUpload" className="file-label">
                  {bannerFile ? bannerFile.name : 'აირჩიეთ სურათი'}
                </label>
              </div>
            </div>
            {bannerFile && (
              <div className="settings-preview" style={{ marginTop: '16px' }}>
                <p className="settings-preview-label">არჩეული</p>
                <div className="banner-preview-wrapper">
                  <img src={URL.createObjectURL(bannerFile)} alt="Preview" className="banner-preview-img" />
                </div>
              </div>
            )}
            <button onClick={saveBanner} disabled={isSavingSettings || !bannerFile} className="btn-primary" style={{ marginTop: '24px' }}>
              {isSavingSettings ? 'ატვირთვა...' : 'შენახვა'}
            </button>
            {settingsMessage && (
              <div className={`message ${settingsMessage.includes('✓') ? 'message-success' : 'message-error'}`}>
                {settingsMessage}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default Admin;