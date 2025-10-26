"use client"

import { useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Camera,
  Save,
  Key,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/Theme-context";
import { Badge } from "@/components/ui/badge";

type ThemeMode = 'light' | 'dark' | 'system';

export function Settings() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const { user, hasPermission } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [profileData, setProfileData] = useState({
    fullName: user?.username || "",
    email: user?.email || "",
    phone: "",
    organization: (user as any)?.organization || "",
    jobTitle: "",
    bio: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowRegistration: true,
    requireApproval: true,
    sessionTimeout: "30",
    maxFileSize: "10",
    allowedFileTypes: "pdf,doc,docx,xls,xlsx,jpg,png"
  });

  const handleProfileUpdate = () => {
    console.log("Profile updated:", profileData);
    // Add your profile update logic here
  };

  const handlePasswordChange = () => {
    console.log("Password change requested");
    // Add your password change logic here
  };

  const handleSystemUpdate = () => {
    console.log("System settings updated:", systemSettings);
    // Add your system settings update logic here
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
  };

  const getRoleDisplayName = (role: string) => {
     switch (role) {
      case "admin":
        return "System Administrator"
      case "stakeholder_user":
        return "Stakeholder User"
      case "stakeholder_admin":
        return "Stakeholder Administrator"
      case "subclusterfocalperson":
        return "Sub-Cluster Focal Person"
      default:
        return role
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and platform configuration</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
          {hasPermission('manage_system') && (
            <TabsTrigger value="system" className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              System
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information and account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <Button variant="outline" size="sm">
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              <Separator />

              <div className="bg-primary/10 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">Current Role & Access</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Role:</span>
                    <Badge variant="outline">{getRoleDisplayName(user?.role || '')}</Badge>
                  </div>
                  { (user as any)?.organization && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Organization:</span>
                      <span className="text-sm font-medium">{(user as any).organization}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={profileData.fullName} onChange={(e) => setProfileData({...profileData, fullName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input id="jobTitle" value={profileData.jobTitle} onChange={(e) => setProfileData({...profileData, jobTitle: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" placeholder="Tell us about yourself..." value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} />
              </div>

              <Button onClick={handleProfileUpdate}>
                <Save className="w-4 h-4 mr-2" />
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Change Password
              </CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input id="currentPassword" type={showCurrentPassword ? "text" : "password"} value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input id="newPassword" type={showNewPassword ? "text" : "password"} value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} />
              </div>

              <Button onClick={handlePasswordChange}>
                <Shield className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Login Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified of new sign-ins</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {hasPermission('manage_system') && (
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  System Configuration
                </CardTitle>
                <CardDescription>Manage platform-wide settings and configurations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold">General Settings</h4>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">Temporarily disable public access</p>
                      </div>
                      <Switch checked={systemSettings.maintenanceMode} onCheckedChange={(checked) => setSystemSettings({...systemSettings, maintenanceMode: checked})} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Allow User Registration</Label>
                        <p className="text-sm text-muted-foreground">Enable new user sign-ups</p>
                      </div>
                      <Switch checked={systemSettings.allowRegistration} onCheckedChange={(checked) => setSystemSettings({...systemSettings, allowRegistration: checked})} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require Admin Approval</Label>
                        <p className="text-sm text-muted-foreground">New users need admin approval</p>
                      </div>
                      <Switch checked={systemSettings.requireApproval} onCheckedChange={(checked) => setSystemSettings({...systemSettings, requireApproval: checked})} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold">Security & Limits</h4>

                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input id="sessionTimeout" type="number" value={systemSettings.sessionTimeout} onChange={(e) => setSystemSettings({...systemSettings, sessionTimeout: e.target.value})} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                      <Input id="maxFileSize" type="number" value={systemSettings.maxFileSize} onChange={(e) => setSystemSettings({...systemSettings, maxFileSize: e.target.value})} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                      <Input id="allowedFileTypes" placeholder="pdf,doc,docx,xls,xlsx" value={systemSettings.allowedFileTypes} onChange={(e) => setSystemSettings({...systemSettings, allowedFileTypes: e.target.value})} />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSystemUpdate}>
                  <Save className="w-4 h-4 mr-2" />
                  Update System Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}