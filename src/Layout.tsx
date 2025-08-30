
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createPageUrl } from "@/utils";
import { Database, History, PanelLeft, Terminal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

const navigationItems = [
  {
    title: "Query Editor",
    url: createPageUrl("QueryEditor"),
    icon: Terminal,
  },
  {
    title: "Connections",
    url: createPageUrl("Connections"),
    icon: Database,
  },
  {
    title: "History",
    url: createPageUrl("History"),
    icon: History,
  },
];

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;
    const newWidth = Math.max(200, Math.min(400, e.clientX));
    setSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);
  
  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (!isCollapsed) {
        // when collapsing, if width is small, reset to default
        if (sidebarWidth < 200) setSidebarWidth(256);
    }
  }

  const handleCollapsedLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <TooltipProvider>
      <style>
        {`
          :root {
            --radius: 0.75rem;
          }
          .bg-muted {
            background-color: #f8fafc;
          }
          .border-subtle {
            border-color: #f1f5f9;
          }
          .resize-handle {
            position: absolute;
            right: -2px;
            top: 0;
            bottom: 0;
            width: 4px;
            cursor: col-resize;
            background: transparent;
            z-index: 10;
          }
          .resize-handle:hover {
            background: #e2e8f0;
          }
          .resize-handle.resizing {
            background: #3b82f6;
          }
          
          /* Override sidebar default styles */
          [data-sidebar] {
            --sidebar-background: white;
            --sidebar-foreground: hsl(240 5.9% 10%);
            --sidebar-primary: hsl(240 5.9% 10%);
            --sidebar-primary-foreground: hsl(0 0% 98%);
            --sidebar-accent: hsl(240 4.8% 95.9%);
            --sidebar-accent-foreground: hsl(240 5.9% 10%);
            --sidebar-border: hsl(240 5.9% 90%);
            --sidebar-ring: hsl(240 5% 64.9%);
          }
          
          /* Remove any unwanted borders from sidebar menu items */
          [data-sidebar] button {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
          }
          
          [data-sidebar] a {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
          }
          
          /* Remove focus outlines and rings */
          [data-sidebar] button:focus {
            outline: none !important;
            box-shadow: none !important;
            ring: none !important;
          }
          
          [data-sidebar] a:focus {
            outline: none !important;
            box-shadow: none !important;
            ring: none !important;
          }
          
          /* Ensure sidebar menu buttons are clean */
          .sidebar-menu-button {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
          }
        `}
      </style>
      <div className="h-screen flex w-full bg-white overflow-hidden">
        <div 
            className="relative transition-all duration-300 ease-in-out" 
            style={{ width: isCollapsed ? 80 : sidebarWidth }}
        >
          {isCollapsed ? (
            // Collapsed sidebar without SidebarProvider
            <div className="border-r border-subtle bg-white h-full" style={{ width: 80 }}>
              <div className="p-4 h-[81px] flex items-center justify-center">
                <Button variant="ghost" size="icon" onClick={handleToggleCollapse} className="flex-shrink-0">
                  <PanelLeft className="w-5 h-5 text-gray-500" />
                </Button>
              </div>
              
              <div className="p-4">
                <div className="space-y-1">
                  {navigationItems.map((item) => (
                    <Tooltip key={item.title}>
                      <TooltipTrigger asChild>
                        <Link 
                          to={item.url}
                          onClick={handleCollapsedLinkClick}
                          className={`h-11 w-11 transition-colors duration-200 rounded-lg flex items-center justify-center ${
                            location.pathname === item.url 
                              ? 'bg-gray-100 text-gray-900' 
                              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {item.title}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Expanded sidebar with SidebarProvider
            <SidebarProvider>
              <Sidebar ref={sidebarRef} className="border-r border-subtle bg-white transition-all duration-300 ease-in-out" style={{ width: sidebarWidth }}>
                <SidebarHeader className="p-4 h-[81px] flex items-center">
                   <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Database className="w-5 h-5 text-white" />
                        </div>
                        <div className="overflow-hidden">
                          <h2 className="text-lg font-semibold text-gray-900 truncate">QueryCraft</h2>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={handleToggleCollapse} className="flex-shrink-0">
                        <PanelLeft className="w-5 h-5 text-gray-500" />
                      </Button>
                    </div>
                </SidebarHeader>
                
                <SidebarContent className="p-4">
                  <SidebarGroup>
                    <SidebarGroupContent>
                      <SidebarMenu className="space-y-1">
                        {navigationItems.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton 
                              asChild 
                              className={`sidebar-menu-button h-11 px-3 transition-colors duration-200 rounded-lg border-0 ${
                                location.pathname === item.url 
                                  ? 'bg-gray-100 text-gray-900' 
                                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                            >
                              <Link to={item.url} className="flex items-center gap-3">
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                <span className="font-medium text-sm">{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                </SidebarContent>
              </Sidebar>
            </SidebarProvider>
          )}
          
          {!isCollapsed && (
            <div
              className={`resize-handle ${isResizing ? 'resizing' : ''}`}
              onMouseDown={handleMouseDown}
            />
          )}
        </div>

        <main className="flex-1 flex flex-col min-w-0 h-full">
          <div className="flex-1 h-full">
            {children}
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
