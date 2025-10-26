"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ActionPlanForm } from "@/components/action-plans/action-plan-form"
import { ActionPlansList } from "@/components/action-plans/action-plans-list"
import { QuarterlyReportForm } from "@/components/reports/quarterly-report-form"
import { ReportsList } from "@/components/reports/reports-list"
import { StakeholderManagement } from "@/components/stakeholders/stakeholder-management"
import { KPIManagement } from "@/components/kpi/kpi-management"
import { UsersManagement } from "@/components/users/users-management"
import { SubClusters } from "@/components/subclusters/subclusters"
import { AuditLogs } from "@/components/audit-logs/audit-logs"
import { ExportCenter } from "@/components/export/export-center"
import { FinancialYearsManagement } from "@/components/financial-years/financial-years"
import { KPICategoryForm } from "../kpi/kpi-category-form"
import {
  BarChart3,
  FileText,
  Users,
  Target,
  Calendar,
  LogOut,
  Menu,
  X,
  Plus,
  TrendingUp,
  AlertCircle,
  Settings,
  Download,
  User,
  ChevronDown,
  Bell,
  Search,
  UserCog,
  UsersRound,
  Moon,
  Sun,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { KpiForm } from "../kpi/kpi-form"
import { DashboardCharts } from "@/components/dashboard/charts"
import { useKpi } from "@/contexts/kpi-context"
import { api } from "@/lib/api"
import { Settings as SettingsPage } from "@/components/settings/settings"
import Notifications from "@/components/notifications/notifications"
import { useNotifications } from "@/contexts/notification-context"
import { AddUserForm } from "../users/user-form"
import { OrganizationManagement } from "../organization/organization"
import { AddOrganizationForm } from "../organization/organization-form"
import { useTheme } from "@/contexts/Theme-context"
import { useToast } from "@/components/ui/use-toast" 

export function Dashboard() {
  const { user, token, logout, hasPermission } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const router = useRouter()
  const { unreadCount } = useNotifications()
  const { refresh, subClusters } = useKpi() // Add KPI context refresh and subClusters
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState("dashboard")
  const [showActionPlanForm, setShowActionPlanForm] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)
  const [showAddUserForm, setShowAddUserForm] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [showKPIForm, setShowKPIForm] = useState(false)
  const [showOrganizationForm, setShowOrganizationForm] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [actionPlans, setActionPlans] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [stakeholders, setStakeholders] = useState<any[]>([])
  const profileMenuRef = useRef<HTMLDivElement>(null)

  // Persist current view across reloads
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('smt-current-view') : null
    if (saved) setCurrentView(saved)
  }, [])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const plansRes = token ? await api.getActionPlans(token) : []
        const stakeholdersRes = await api.getStakeholders()
        if (!mounted) return
        setActionPlans(plansRes || [])
        setStakeholders(stakeholdersRes || [])
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      }
    }
    load()
    return () => { mounted = false }
  }, [token])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('smt-current-view', currentView)
    }
  }, [currentView])

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }

    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileMenuOpen])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "System administrator"
      case "stakeholder_user":
        return "Stakeholder User"
      case "stakeholder_admin":
        return "Stakeholder administrator"
      case "subclusterfocalperson":
        return "Sub-Cluster Focal Person"
      default:
        return role
    }
  }

  const menuItems = [
    { icon: BarChart3, label: "Dashboard", key: "dashboard", active: currentView === "dashboard" },
    { icon: Target, label: "Action Plans", key: "action-plans", active: currentView === "action-plans" },
    { icon: FileText, label: "Reports", key: "reports", active: currentView === "reports" },
    { icon: Calendar, label: "Financial Years", key: "financial-years", active: currentView === "financial-years" },
    { icon: UsersRound, label: "Organizations", key: "organizations", active: currentView === "organizations" },
    { icon: Settings, label: "Sub-Clusters", key: "subclusters", active: currentView === "subclusters" },
    { icon: Settings, label: "KPI Management", key: "kpis", active: currentView === "kpis" },
    { icon: Users, label: "Stakeholder Users", key: "stakeholder-users", active: currentView === "stakeholder-users" },
    { icon: UserCog, label: "Users Management", key: "users", active: currentView === "users" },
    { icon: FileText, label: "Audit Logs", key: "audit-logs", active: currentView === "audit-logs" },
    { icon: Download, label: "Export Data", key: "export", active: currentView === "export" },
  ]

  // Enhanced role permissions
  const rolePermissions: Record<string, string[]> = {
    admin: ["dashboard", "action-plans", "reports", "financial-years", "organizations", "users", "audit-logs", "kpis", "export", "subclusters", "focal-persons"],
    subclusterfocalperson: ["dashboard", "reports", "stakeholder-users", "export", "kpis", "focal-persons"],
    stakeholder_admin: ["dashboard", "action-plans", "reports", "stakeholder-users", "export"],
    stakeholder_user: ["dashboard", "action-plans", "reports", "export"],
  }

  const allowedKeys = rolePermissions[user?.role || "stakeholder_user"] || []
  const visibleMenuItems = menuItems.filter((m) => allowedKeys.includes(m.key))

  const handleCreateActionPlan = (planData: any) => {
    console.log("Creating action plan:", planData)
    setShowActionPlanForm(false)
    toast({
      title: "Success!",
      description: "Action plan created successfully",
      variant: "default",
    })
  }

  const handleCreateReport = (reportData: any) => {
    console.log("Creating report:", reportData)
    setShowReportForm(false)
    toast({
      title: "Success!",
      description: "Report created successfully",
      variant: "default",
    })
  }

  // Updated KPI creation handler
  const handleCreateKPISuccess = () => {
    console.log("KPI created successfully")
    setShowKPIForm(false)
    // Refresh KPI data in the context
    refresh()
    toast({
      title: "Success!",
      description: "KPI created successfully",
      variant: "default",
    })
  }

  // Fixed: Added missing closing brace and completed function
  const handleCreateKPICategory = () => {
    console.log("KPI Category created successfully")
    setShowCategoryForm(false)
    // Refresh KPI data to include new category
    refresh()
    toast({
      title: "Success!",
      description: "KPI Category created successfully",
      variant: "default",
    })
  }

  const handleCreateUser = (userData: any) => {
    console.log("Creating user:", userData)
    setShowAddUserForm(false)
    toast({
      title: "Success!",
      description: "User created successfully",
      variant: "default",
    })
  }

  const handleCreateOrganization = (organizationData: any) => {
    console.log("Creating organization:", organizationData)
    setShowOrganizationForm(false)
    toast({
      title: "Success!",
      description: "Organization created successfully",
      variant: "default",
    })
  }

  const handleSettingsClick = () => {
    setCurrentView("settings")
    setProfileMenuOpen(false)
  }

  const handleSignOut = () => {
    setProfileMenuOpen(false)
    logout()
  }

  const renderContent = () => {
    switch (currentView) {
      case "action-plans":
        return <ActionPlansList onCreateNew={() => setShowActionPlanForm(true)} />
      case "reports":
        return <ReportsList onCreateNew={() => setShowReportForm(true)} />
      case "users":
        return <UsersManagement onCreateNew={() => setShowAddUserForm(true)} />
      case "stakeholder-users":
        return <StakeholderManagement onCreateNew={() => setShowAddUserForm(true)} />
      case "audit-logs":
        return <AuditLogs />
      case "kpis":
        return (
          <KPIManagement 
            onCreateNew={() => setShowKPIForm(true)}
            onOpenCategoryForm={() => setShowCategoryForm(true)}
          />
        )
      case "export":
        return <ExportCenter />
      case "subclusters":
        return <SubClusters />
      case "financial-years":
        return <FinancialYearsManagement />
      case "settings":
        return <SettingsPage />
      case "notifications":
        return <Notifications />
      case "organizations":
        return <OrganizationManagement onCreateNew={() => setShowOrganizationForm(true)} />
      default:
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
                <p className="text-muted-foreground">Welcome back, {user?.username}</p>
              </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
                  <Target className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{actionPlans.filter(p => p.status === 'Active').length}</div>
                  <p className="text-xs text-muted-foreground">+2 from last quarter</p>
                </CardContent>
              </Card>

              <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reports Due</CardTitle>
                  <AlertCircle className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">{reports.filter(r => r.status === 'Due' || r.status === 'Overdue').length}</div>
                  <p className="text-xs text-muted-foreground">Due this week</p>
                </CardContent>
              </Card>

              <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Stakeholders</CardTitle>
                  <Users className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{stakeholders.length}</div>
                  <p className="text-xs text-muted-foreground">Across {stakeholders.reduce((s, sh) => s + (sh.subClusters?.length || 0), 0)} sub-clusters</p>
                </CardContent>
              </Card>

              <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Achievement Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{Math.round(reports.reduce((s, r) => s + (r.achievement || 0), 0) / (reports.length || 1))}%</div>
                  <p className="text-xs text-muted-foreground">+5% from last quarter</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div>
              <DashboardCharts />
            </div>

            {/* Recent activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Action Plans</CardTitle>
                  <CardDescription>Latest plans created by stakeholders</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: "GBV Prevention Training", org: "CARE Rwanda", status: "Active", level: "District" },
                    { title: "Women Empowerment Program", org: "UN Women", status: "Planning", level: "Province" },
                    { title: "Youth Leadership Initiative", org: "World Vision", status: "Active", level: "Country" },
                  ].map((plan, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                      <div>
                        <p className="font-medium">{plan.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {plan.org} • {plan.level} Level
                        </p>
                      </div>
                      <Badge variant={plan.status === "Active" ? "default" : "secondary"}>{plan.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Deadlines</CardTitle>
                  <CardDescription>Reports and planning deadlines</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { title: "Q1 Progress Report", due: "Due in 3 days", type: "Report", urgent: true },
                    { title: "Annual Plan Submission", due: "Due in 1 week", type: "Planning", urgent: false },
                    { title: "Mid-year Review", due: "Due in 2 weeks", type: "Review", urgent: false },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className={`text-sm ${item.urgent ? "text-secondary" : "text-muted-foreground"}`}>
                          {item.due}
                        </p>
                      </div>
                      <Badge variant={item.urgent ? "destructive" : "outline"}>{item.type}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )
    }
  }

  // Determine sidebar classes based on theme
  const sidebarClasses = theme === 'dark' 
    ? "bg-sidebar border-sidebar-border text-sidebar-foreground"
    : "bg-blue-900 border-blue-700 text-white"

  const sidebarButtonClasses = theme === 'dark'
    ? "text-sidebar-foreground hover:bg-sidebar-accent/10"
    : "text-white hover:bg-blue-700"

  const sidebarActiveButtonClasses = theme === 'dark'
    ? "bg-sidebar-primary text-sidebar-primary-foreground border-l-4 border-sidebar-accent"
    : "bg-blue-700 text-white border-l-4 border-blue-400"

  const headerClasses = theme === 'dark'
    ? "bg-header border-header-border text-header-foreground"
    : "bg-white border-border text-foreground"

  const headerButtonClasses = theme === 'dark'
    ? "text-header-foreground hover:bg-accent/10"
    : "text-foreground hover:bg-gray-100"

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - CONDITIONAL: Original blue for light, dark theme for dark mode */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarClasses}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`p-6 border-b ${theme === 'dark' ? 'border-sidebar-border' : 'border-blue-700'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">MIGEPROF SMT</h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-muted-foreground' : 'text-blue-200'}`}>
                  Stakeholder Mapping
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`lg:hidden ${sidebarButtonClasses}`}
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* User info */}
          <div className={`p-4 border-b ${theme === 'dark' ? 'border-sidebar-border' : 'border-blue-700'}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                theme === 'dark' ? 'bg-primary text-primary-foreground' : 'bg-blue-600 text-white'
              }`}>
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.username || "User"}</p>
                <Badge className={`text-xs ${
                  theme === 'dark' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-blue-500 text-white'
                }`}>
                  {getRoleLabel(user?.role || "")}
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {visibleMenuItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`w-full justify-start transition-all duration-200 ${
                  item.active
                    ? sidebarActiveButtonClasses
                    : theme === 'dark' 
                      ? "text-sidebar-foreground hover:bg-sidebar-accent/10" 
                      : "text-blue-100 hover:bg-blue-700 hover:text-white"
                }`}
                onClick={() => {
                  setCurrentView(item.key)
                  setSidebarOpen(false)
                }}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Logout in Sidebar */}
          <div className={`p-4 border-t ${theme === 'dark' ? 'border-sidebar-border' : 'border-blue-700'}`}>
            <Button
              variant="outline"
              className={`w-full justify-start bg-transparent ${
                theme === 'dark'
                  ? "text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20"
                  : "text-red-300 hover:bg-red-600 hover:text-white border-red-300/20"
              }`}
              onClick={logout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Fixed Top Navbar - CONDITIONAL: White for light, dark for dark mode */}
        <header className={`fixed top-0 right-0 left-0 lg:left-64 border-b z-30 ${headerClasses}`}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`lg:hidden ${headerButtonClasses}`}
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>

              <h1 className="text-sm font-semibold">Stakeholder Mapping Tool</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme toggle button */}
              <Button
                variant="ghost"
                size="sm"
                className={headerButtonClasses}
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>

              {/* Notification button */}
              <Button
                variant="ghost"
                size="sm"
                className={`relative ${headerButtonClasses}`}
                aria-label="Notifications"
                onClick={() => setCurrentView("notifications")}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs font-bold rounded-full px-1.5 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {/* Profile dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className={`flex items-center gap-3 rounded-lg p-2 transition-colors ${headerButtonClasses}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    theme === 'dark' ? 'bg-primary text-primary-foreground' : 'bg-blue-600 text-white'
                  }`}>
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col leading-none text-left">
                    <span className="text-sm font-medium">{user?.username || "User"}</span>
                    <span className="text-xs text-muted-foreground">{getRoleLabel(user?.role || "stakeholder_user")}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown menu */}
                {profileMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-1 z-50 ${
                    theme === 'dark' 
                      ? 'bg-popover border-border text-popover-foreground' 
                      : 'bg-white border-gray-200 text-foreground'
                  }`}>
                    <button
                      onClick={handleSettingsClick}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                        theme === 'dark'
                          ? 'hover:bg-accent hover:text-accent-foreground'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                        theme === 'dark'
                          ? 'text-destructive hover:bg-destructive hover:text-destructive-foreground'
                          : 'text-red-600 hover:bg-gray-100'
                      }`}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard content with padding for fixed navbar */}
        <main className="p-6 mt-16">
          {renderContent()}
        </main>
      </div>

      {/* Action Plan Form Modal */}
      {showActionPlanForm && (
        <ActionPlanForm onClose={() => setShowActionPlanForm(false)} onSubmit={handleCreateActionPlan} />
      )}

      {/* Report Form Modal */}
      {showReportForm && (
        <QuarterlyReportForm onClose={() => setShowReportForm(false)} onSubmit={handleCreateReport} />
      )}

      {/* KPI Form Modal */}
      {showKPIForm && (
        <KpiForm 
          onClose={() => setShowKPIForm(false)} 
          onSuccess={handleCreateKPISuccess} 
        />
      )}

      {/* KPI Category Form Modal */}
      {showCategoryForm && (
        <KPICategoryForm
          onClose={() => setShowCategoryForm(false)}
          onSuccess={handleCreateKPICategory}
        />
      )}

      {/* Add User Form Modal */}
      {showAddUserForm && (
        <AddUserForm onClose={() => setShowAddUserForm(false)} onSubmit={handleCreateUser} />
      )}

      {/* Add Organization Form Modal */}
      {showOrganizationForm && (
        <AddOrganizationForm onClose={() => setShowOrganizationForm(false)} onSubmit={handleCreateOrganization} />
      )}
    </div>
  )
}