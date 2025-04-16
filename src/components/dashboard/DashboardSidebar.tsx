
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '@/types';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Home, ImagePlus, User as UserIcon, Settings } from 'lucide-react';

interface DashboardSidebarProps {
  user: User;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ user }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(`/${user.role}-dashboard`)}
                    tooltip="Dashboard Home"
                  >
                    <Link to={`/${user.role}-dashboard`}>
                      <Home className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive('/profile')}
                    tooltip="Profile"
                  >
                    <Link to="/profile">
                      <UserIcon className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(`/${user.role}-dashboard/ai-generator`)}
                    tooltip="AI Design Generator"
                  >
                    <Link to={`/${user.role}-dashboard/ai-generator`}>
                      <ImagePlus className="h-4 w-4" />
                      <span>AI Design Generator</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-3 py-2">
            <p className="text-xs text-slate-500">
              Logged in as: {user.username}
            </p>
          </div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
};

export default DashboardSidebar;
