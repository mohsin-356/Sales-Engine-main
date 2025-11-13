import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface RequireAuthProps {
  children: ReactNode;
}

// Simple auth guard. Wrap protected route elements with this component.
const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect unauthenticated users to login, preserving intended path
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export { RequireAuth };
export default RequireAuth;
