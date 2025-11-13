import { useAuth } from "@/contexts/AuthContext";
import { AdminDashboard } from "./AdminDashboard";
import { SalesExecutiveDashboard } from "./SalesExecutiveDashboard";
import { SalesRepresentativeDashboard } from "./SalesRepresentativeDashboard";

export const HomePage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to Mindspire Sales System</h1>
          <p className="text-xl text-muted-foreground">Please log in to access your dashboard</p>
        </div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (user.role) {
      case "admin":
        return <AdminDashboard />;
      case "sales_executive":
        return <SalesExecutiveDashboard />;
      case "sales_representative":
        return <SalesRepresentativeDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return <>{renderDashboard()}</>;
};

export default HomePage;
