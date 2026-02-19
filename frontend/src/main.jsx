import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ClientInfo from "./pages/ClientInfo.jsx";
import ClientInfoSubmitted from "./pages/ClientInfoSubmitted.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientInfo />} />
        <Route path="/edit/:token" element={<ClientInfo />} />
        <Route path="/submitted/:token" element={<ClientInfoSubmitted />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
