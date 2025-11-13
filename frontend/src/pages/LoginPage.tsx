import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ThreeDIllustration } from '@/components/3d-illustration';
import { Eye, EyeOff } from "lucide-react";
import { SalesIllustration } from '@/components/sales-illustration';

const quickUsers = [
  { label: "Admin", email: "mohsin", pwd: "123" },
  { label: "Sales Executive", email: "sarah@mindspire.com", pwd: "password" },
  { label: "Sales Rep (Demo)", email: "ali@gmail.com", pwd: "ali@gmail.com" },
];

const LoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('email') || '';
  });
  const [password, setPassword] = useState('');
  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    if(params.get('email')){
      setUsername(params.get('email')!);
    }
  },[]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    let dest = "/";
    switch (user.role) {
      case "admin":
        dest = "/dashboard";
        break;
      case "sales_executive":
        dest = "/executive";
        break;
      case "sales_representative":
        dest = "/representative";
        break;
      default:
        dest = "/";
    }
    navigate(dest, { replace: true });
  }, [user, navigate]);

  const handleQuickLogin = async (userEmail: string) => {
    const user = quickUsers.find(u => u.email === userEmail);
    setUsername(userEmail);
    setPassword(user ? user.pwd : "password");
  };

  return (
    <div className="grid md:grid-cols-2 min-h-screen">
      <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-12">
        <SalesIllustration className="max-w-md" />
      </div>
      
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <div className="text-center mb-6">
              <img 
                src="/mindspire-favicon.png"
                alt="Company Logo"
                className="mx-auto h-12 w-auto"
              />
              <h1 className="mt-4 text-2xl font-semibold text-gray-800">Sales Portal</h1>
              <p className="text-gray-500 mt-1">Track leads and boost performance</p>
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="sales.rep"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export { LoginPage };
export default LoginPage;
