import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import RequireAuth from "@/components/auth/RequireAuth";
import { AuthProvider } from "@/contexts/AuthContext";
import { LeadsProvider } from "@/contexts/LeadsContext";
import { EmployeesProvider } from '@/contexts/EmployeesContext';
import { SettingsProvider } from "@/contexts/SettingsContext";
import { AttendanceProvider } from '@/contexts/AttendanceContext';
import { SalesProvider } from "@/contexts/SalesContext";
import Index from "./pages/Index";
import { AdminDashboard } from "./pages/AdminDashboard";
import SalesExecutiveDashboard from "./pages/SalesExecutiveDashboard";
import { SalesRepresentativeDashboard } from "./pages/SalesRepresentativeDashboard";
import { LeadsPage } from "./pages/LeadsPage";
import { SettingsPage } from "./pages/SettingsPage";
import SalesPage from "./pages/SalesPage";
import PayrollPage from "./pages/PayrollPage";
import AttendancePage from "./pages/AttendancePage";
import ReportsPage from "./pages/ReportsPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import SalesRepDashboard from '@/pages/dashboards/SalesRepDashboard';
import UsersPage from './pages/admin/UsersPage';
import TeamPerformancePage from './pages/admin/TeamPerformancePage';

import UserDetailPage from './pages/admin/UserDetailPage';
import RepSettingsPage from './pages/admin/RepSettingsPage';
import ProfilePage from './pages/ProfilePage';
import LeadDetailPage from './pages/LeadDetailPage';
import SaleDetailPage from './pages/SaleDetailPage';
import PayrollDetailPage from './pages/PayrollDetailPage';
import SalesPerformancePage from './pages/SalesPerformancePage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <EmployeesProvider>
        <AttendanceProvider>
      <LeadsProvider>
        <SettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <SalesProvider>
              <BrowserRouter>
                <Routes>
                  {/* Protected routes */}
                  <Route element={
                    <RequireAuth>
                      <PageLayout>
                        <Outlet />
                      </PageLayout>
                    </RequireAuth>
                  }>

                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/performance" element={<TeamPerformancePage />} />
                    <Route path="/admin/users" element={<UsersPage />} />
                    <Route path="/admin/users/:id" element={<UserDetailPage />} />
                    
                    <Route path="/admin/rep-settings" element={<RepSettingsPage />} />
                    <Route path="/executive" element={<SalesExecutiveDashboard />} />
                    <Route path="/executive/sales" element={<SalesPage />} />
                    <Route path="/executive/leads" element={<LeadsPage />} />
                    <Route path="/representative" element={<SalesRepDashboard />} />
                    <Route path="/sales" element={<SalesPage />} />
                    <Route path="/sales/:id" element={<SaleDetailPage />} />
                    <Route path="/payroll" element={<PayrollPage />} />
                    <Route path="/payroll/:employeeId" element={<PayrollDetailPage />} />
                    <Route path="/attendance" element={<AttendancePage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/performance" element={<SalesPerformancePage />} />
                    <Route path="/leads" element={<LeadsPage />} />
                    <Route path="/leads/:id" element={<LeadDetailPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/dashboard" element={<AdminDashboard />} />
                  </Route>
                  {/* Catch-all without sidebar */}
                  <Route path="/" element={<LoginPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </SalesProvider>
          </TooltipProvider>
        </SettingsProvider>
      </LeadsProvider>
    </AttendanceProvider>
      </EmployeesProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
