import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedProps) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}"); // store user after login

  if (!token) return <Navigate to="/signin" replace />;

  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  return children;
}
