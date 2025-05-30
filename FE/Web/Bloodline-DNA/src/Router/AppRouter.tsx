import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { NotFound } from "../components";
import { ForgotPassword, Login, Register } from "../features";
import HomePage from "../features/home/pages/HomePage";
import AdminRouter from "./AdminRouter";
import StaffRouter from "./StaffRouter";


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* router auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route path="/" element={<HomePage />} />

        {/* Not found */}
        <Route path="*" element={<NotFound />} />

        {/* Các route khác */}
        <Route path="/staff/*" element={<StaffRouter />} />
        <Route path="/admin/*" element={<AdminRouter />} />
      </Routes>
    </Router>
  );
};

export default App;
