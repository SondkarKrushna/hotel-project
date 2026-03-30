import { Navigate } from "react-router-dom";
import { getToken, getUser } from "../utils/auth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
