import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { GoogleAuthProvider } from "./contexts/GoogleAuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <GoogleAuthProvider>
        <App />
      </GoogleAuthProvider>
    </AuthProvider>
  </BrowserRouter>
);
