import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiService from "./apiService";

function Login() {
  const [isStaff, setIsStaff] = useState(false);
  const [email, setEmail] = useState("");
  const [staffid, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log("🚀 Sending login request as", isStaff ? "staff" : "customer");

      const res = isStaff
        ? await apiService.staffLogin({ staffid, password })
        : await apiService.login({ email, password });

      console.log("✅ Login success:", res.data);

      // Fetch session info and redirect accordingly
      const session = await apiService.getSessionInfo();
      if (session.data.type === "staff") {
        navigate("/admin/products");
      } else {
        navigate("/");
      }

      window.dispatchEvent(new Event("loginStatusChanged"));
      
    } catch (err) {
      console.error("❌ Login failed:", err);
      alert(err?.response?.data || err.message || "Login failed");
    }
  };

  return (
    <div className="container form-container">
      <h2>{isStaff ? "Staff Login" : "Customer Login"}</h2>
      <form onSubmit={handleLogin}>
        {isStaff ? (
          <div className="form-group">
            <label>Staff ID</label>
            <input
              type="text"
              value={staffid}
              onChange={(e) => setStaffId(e.target.value)}
              required
            />
          </div>
        ) : (
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="primary-button">
            Login
          </button>
        </div>
      </form>

      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <button
          className="secondary-button"
          onClick={() => setIsStaff(!isStaff)}
        >
          Switch to {isStaff ? "Customer" : "Staff"} Login
        </button>
      </div>

      {!isStaff && (
        <div className="form-group" style={{ marginTop: "1rem", textAlign: "center" }}>
          <p>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      )}
    </div>
  );
}

export default Login;