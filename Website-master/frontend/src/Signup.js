import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiService from "./apiService";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await apiService.signup({
        email,
        password,
        first_name: first,
        last_name: last
      });
  
      // ✅ Trigger UI to update
      window.dispatchEvent(new Event("loginStatusChanged"));
  
      // ✅ Redirect to home
      navigate("/");
    } catch (err) {
      alert(err?.response?.data || err.message || "Signup failed");
    }
  };  

  return (
    <div className="container form-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup}>
        <div className="form-group">
          <label>First Name</label>
          <input
            value={first}
            onChange={(e) => setFirst(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input
            value={last}
            onChange={(e) => setLast(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

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
          <button type="submit" className="primary-button">Create Account</button>
        </div>
      </form>

      <div className="form-group" style={{ marginTop: "1rem", textAlign: "center" }}>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}

export default Signup;