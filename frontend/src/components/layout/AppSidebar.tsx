import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Calendar, 
  FileText, 
  Settings, 
  UserCheck,
  Target,
  TrendingUp,
  ClipboardList,
  ShoppingBag,
  IdCard
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import mindspireLogo from '@/assets/mindspire-logo.png';


const adminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Leads", url: "/leads", icon: Target },
  { title: "Sales", url: "/sales", icon: DollarSign },
  { title: "Performance", url: "/admin/performance", icon: TrendingUp },
  { title: "Payroll", url: "/payroll", icon: Users },
  { title: "Attendance", url: "/attendance", icon: Calendar },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Settings", url: "/settings", icon: Settings },

  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Profile", url: "/profile", icon: UserCheck },
];

const executiveItems = [
  { title: "Dashboard", url: "/executive", icon: LayoutDashboard },
  { title: "Sales", url: "/executive/sales", icon: DollarSign },
  { title: "Leads", url: "/executive/leads", icon: Target },
  { title: "Attendance", url: "/attendance", icon: Calendar },
  { title: "Reports", url: "/reports", icon: FileText },
  { title: "Profile", url: "/profile", icon: UserCheck },
];

const representativeItems = [
  { title: "Dashboard", url: "/representative", icon: LayoutDashboard },
  { title: "Leads", url: "/leads", icon: Target },
  { title: "Sales", url: "/sales", icon: DollarSign },
  { title: "Performance", url: "/performance", icon: TrendingUp },
  { title: "Profile", url: "/profile", icon: UserCheck },
];

export function AppSidebar() {
  const { user } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return adminItems;
      case 'sales_executive':
        return executiveItems;
      case 'sales_representative':
        return representativeItems;
      default:
        return adminItems;
    }
  };

  const items = getMenuItems();
  const isActive = (path: string) => currentPath === path;
  const collapsed = state === "collapsed";

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center space-x-3">
          <img src={mindspireLogo} alt="Mindspire" className="h-8 w-8" />
          {!collapsed && (
            <span className="text-lg font-bold text-foreground font-poppins">
              Mindspire
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-poppins font-medium">
            {!collapsed ? "Main Navigation" : ""}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={isActive(item.url)}
                  >
                    <NavLink 
                      to={item.url} 
                      end 
                      className="flex items-center space-x-3 font-poppins font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}