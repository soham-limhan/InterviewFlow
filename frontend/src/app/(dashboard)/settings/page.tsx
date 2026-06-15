"use client";

import { useState } from "react";
import {
  User,
  Building2,
  Mail,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      setIsUpdating(true);
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, { displayName });
        toast.success("Profile updated successfully!");
      }
    } catch {
      toast.error("Failed to update profile name");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account information.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Account Information</CardTitle>
          <CardDescription className="text-xs">Update your personal details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Role & Status */}
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-[10px] font-normal uppercase">
                {user?.role || "user"}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-normal">
                Active
              </Badge>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="pl-9 bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="name">Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {user?.company && (
              <div className="space-y-1">
                <Label htmlFor="company">Company</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    id="company"
                    value={user.company}
                    disabled
                    className="pl-9 bg-muted text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" size="sm" disabled={isUpdating}>
              {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : null}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
