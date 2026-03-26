import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, expectedRole }) => {
  const { user } = useContext(AuthContext);

  // If no user is logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If a role is expected and doesn't match
  if (expectedRole && user.role !== expectedRole) {
    return <Navigate to="/" replace />;
  }

  // If everything is fine
  return children;
};

export default ProtectedRoute;
