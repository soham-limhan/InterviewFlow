"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Zap,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
  Bell,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";
import { mainNavItems, bottomNavItems } from "@/config/navigation";
import { getInitials, cn } from "@/lib/utils";

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredMain = mainNavItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role || "")
  );
  const filteredBottom = bottomNavItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role || "")
  );

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2 px-4 border-b border-border shrink-0">
        <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center">
          <Zap className="w-3.5 h-3.5 text-background" />
        </div>
        <span className="text-sm font-semibold tracking-tight">
          InterviewFlow
        </span>
      </div>

      {/* Main Nav */}
      <ScrollArea className="flex-1 py-3 px-2">
        <nav className="space-y-0.5">
          {filteredMain.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.children?.some((c) => pathname === c.href));
            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.title}
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="ml-auto text-[10px] px-1.5 py-0 font-normal"
                    >
                      {item.badge}
                    </Badge>
                  )}
                  {item.children && (
                    <ChevronDown className="w-3 h-3 ml-auto text-muted-foreground" />
                  )}
                </Link>
                {/* Sub-items */}
                {isActive && item.children && (
                  <div className="ml-6 mt-0.5 space-y-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onNavigate}
                        className={cn(
                          "block px-2.5 py-1.5 rounded-md text-[13px] transition-colors",
                          pathname === child.href
                            ? "text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Bottom Nav */}
      <div className="border-t border-border px-2 py-2 space-y-0.5 shrink-0">
        {filteredBottom.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.title}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-56 border-r border-border bg-sidebar-background shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-56">
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 lg:px-6 bg-background shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="w-4 h-4" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "gap-2 h-8 px-2 flex items-center cursor-pointer select-none"
                )}
              >
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-[10px] bg-muted text-foreground font-medium">
                    {getInitials(user?.displayName || "U")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[13px] font-medium hidden sm:block">
                  {user?.displayName || "User"}
                </span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.displayName || "User"}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="p-0">
                  <Link href="/settings" className="px-1.5 py-1 text-sm block w-full">
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={signOut}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
