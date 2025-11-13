export { HomePage as default } from "./HomePage";

/*
import { AdminDashboard } from './AdminDashboard';
import { SalesExecutiveDashboard } from './SalesExecutiveDashboard';
import { SalesRepresentativeDashboard } from './SalesRepresentativeDashboard';

const Index = () => {
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
      case 'admin':
        return <AdminDashboard />;
      case 'sales_executive':
        return <SalesExecutiveDashboard />;
      case 'sales_representative':
        return <SalesRepresentativeDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    
      
        
        
          
            <div className="flex items-center space-x-4">
              
              <div>
                <h2 className="text-lg font-semibold font-poppins">Welcome back, {user.name}</h2>
                <p className="text-sm text-muted-foreground capitalize">
                  {user.role.replace('_', ' ')} Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <button
                onClick={logout}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Logout
              </button>
            </div>
          
          
            return (
    <div className="p-0">
      {renderDashboard()}
    </div>
  );
          
        </div>
      </div>
    
  );
};

export default Index;
*/
