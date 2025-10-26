"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Target, TrendingUp, Users, FileText, Search, Edit, Trash2, FolderPlus } from "lucide-react"

import { useKpi, KpiItem, getCategoryName, getSubClusterName, safeString } from "@/contexts/kpi-context"
import { api } from "@/lib/api"

interface KPIManagementProps {
  onCreateNew: () => void
  onOpenCategoryForm?: () => void
}

export function KPIManagement({ onCreateNew, onOpenCategoryForm }: KPIManagementProps) {
  const { user, token, hasPermission } = useAuth()
  const { subClusters, categories: kpiCategories, kpis: contextKpis } = useKpi()
  const [selectedSubCluster, setSelectedSubCluster] = useState("All Sub-Clusters")
  const [selectedCategory, setSelectedCategory] = useState("all-categories")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedKPI, setSelectedKPI] = useState<KpiItem | null>(contextKpis[0] ?? null)
  const [allKPIs, setAllKPIs] = useState(contextKpis)
  const [activePlansCount, setActivePlansCount] = useState(0)

  // Debug logging to see what data we have
  useEffect(() => {
    console.log("Available subClusters:", subClusters)
    console.log("Available KPIs:", contextKpis)
    console.log("Selected Sub-Cluster:", selectedSubCluster)
  }, [subClusters, contextKpis, selectedSubCluster])

  // Filter KPIs based on user's permissions
  useEffect(() => {
    let base = contextKpis

    if (user?.role === "stakeholder_admin" || user?.role === "stakeholder_user") {
      const userSubClusterIds = user.subClusters?.map(sc => sc.id) || []
      base = contextKpis.filter(kpi => userSubClusterIds.includes(kpi.subCluster))
    }

    if (user?.role === "subclusterfocalperson") {
      const userSubClusterIds = user.subClusters?.map(sc => sc.id) || []
      base = contextKpis.filter(kpi => userSubClusterIds.includes(kpi.subCluster))
    }

    setAllKPIs(base)
    if (base.length > 0) setSelectedKPI(base[0])
    else setSelectedKPI(null)
  }, [user, contextKpis])

  // Load active plans count from API
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        if (!token) return
        const plans = await api.getActionPlans(token)
        if (!mounted) return
        const active = Array.isArray(plans) ? plans.filter((p: any) => (p.status || '').toLowerCase() === 'active').length : 0
        setActivePlansCount(active || (Array.isArray(plans) ? plans.length : 0))
      } catch (e) {
        console.error("Error loading action plans:", e)
        // fallback silently
      }
    }
    load()
    return () => { mounted = false }
  }, [token])

  // FIXED: Filter KPIs based on selected filters
  const filteredKPIs = allKPIs.filter(kpi => {
    // Debug each KPI
    console.log("Checking KPI:", {
      id: kpi.id,
      title: kpi.title,
      subCluster: kpi.subCluster,
      subClusterName: kpi.subClusterName,
      selectedSubCluster: selectedSubCluster
    })

    // Cluster matching - compare names, not IDs
    const matchesCluster = selectedSubCluster === "All Sub-Clusters" || 
                          kpi.subClusterName === selectedSubCluster
    
    // Category matching
    const matchesCategory = selectedSubCluster === "All Sub-Clusters" ? 
                           true : 
                           (selectedCategory === "all-categories" || kpi.category === selectedCategory)
    
    // Search matching
    const matchesSearch = searchTerm === "" || 
                         kpi.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         kpi.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matches = matchesCluster && matchesCategory && matchesSearch
    console.log(`KPI ${kpi.title} matches:`, { matchesCluster, matchesCategory, matchesSearch, matches })
    
    return matches
  })

  // Get available sub-clusters based on user role
  const getAvailableSubClusters = () => {
    if (user?.role === "admin") return ["All Sub-Clusters", ...subClusters.map(sc => sc.name)]
    if (user?.role === "subclusterfocalperson") {
      const userSubClusters = user.subClusters?.map(sc => sc.name) || []
      return ["All Sub-Clusters", ...userSubClusters]
    }
    if (user?.role === "stakeholder_admin" || user?.role === "stakeholder_user") {
      const userSubClusters = user.subClusters?.map(sc => sc.name) || []
      return ["All Sub-Clusters", ...userSubClusters]
    }
    return ["All Sub-Clusters"]
  }

  // Get categories for the selected sub-cluster
  const filteredCategories = kpiCategories.filter(category => {
    if (selectedSubCluster === "All Sub-Clusters") return true
    
    // Find the subcluster ID for the selected name
    const selectedSubClusterObj = subClusters.find(sc => sc.name === selectedSubCluster)
    if (!selectedSubClusterObj) return false
    
    return category.subClusterId === selectedSubClusterObj.id
  })

  const stats = {
    totalKPIs: allKPIs.length,
    activePlans: activePlansCount,
    targetValues: allKPIs.reduce((sum, kpi) => sum + kpi.targetValue, 0)
  }

  // Reset category when sub-cluster changes
  const handleSubClusterChange = (value: string) => {
    setSelectedSubCluster(value)
    setSelectedCategory("all-categories")
  }

  // Handle category form actions
  const handleCategoryAdded = () => {
    // Refresh categories or show success message
    console.log("Category added successfully")
    // You might want to refresh your categories data here
  }

  // Calculate progress percentage
  const calculateProgress = (current: number, target: number): number => {
    if (target === 0) return 0
    return Math.min(100, Math.max(0, (current / target) * 100))
  }

  // Format progress text
  const formatProgressText = (current: number, target: number): string => {
    if (target === 0) return "0.0% complete"
    const percentage = (current / target) * 100
    return `${percentage.toFixed(1)}% complete`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">KPI Management</h1>
          <p className="text-foreground">Manage and track Key Performance Indicators</p>
        </div>
        <div className="flex gap-2">
          {(hasPermission("manage_all_kpis") || hasPermission("manage_stakeholder_kpis") || hasPermission("manage_subcluster_kpis")) && (
            <>
              <Button 
                onClick={onOpenCategoryForm} 
                variant="outline" 
                className="transition-all duration-200 hover:scale-[1.02]"
              >
                <FolderPlus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
              <Button onClick={onCreateNew} className="transition-all duration-200 hover:scale-[1.02]">
                <Plus className="mr-2 h-4 w-4" />
                Add KPI
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total KPIs</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalKPIs}</div>
            <p className="text-xs text-muted-foreground">Across all sub-clusters</p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <FileText className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.activePlans}</div>
            <p className="text-xs text-muted-foreground">Using these KPIs</p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Targets</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.targetValues.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Combined targets</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter KPIs</CardTitle>
          <CardDescription>
            Search & filter KPIs by sub-cluster and category
            {selectedSubCluster !== "All Sub-Clusters" && (
              <span className="block text-xs mt-1">
                Showing sub-cluster: <strong>{selectedSubCluster}</strong>
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Input 
              placeholder="Search KPIs by title or description..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="sm:w-48">
            <Select value={selectedSubCluster} onValueChange={handleSubClusterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Sub-Cluster" />
              </SelectTrigger>
              <SelectContent>
                {getAvailableSubClusters().map(cluster => (
                  <SelectItem key={cluster} value={cluster}>
                    {cluster}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* KPI Category Tabs - Show above both panels when a specific sub-cluster is selected */}
      {selectedSubCluster !== "All Sub-Clusters" && filteredCategories.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="w-full overflow-x-auto border-b rounded-none bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="all-categories"
                  className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
                >
                  <span>All Categories</span>
                  <Badge variant="default" className="ml-1">
                    {allKPIs.filter(kpi => kpi.subClusterName === selectedSubCluster).length}
                  </Badge>
                </TabsTrigger>
                {filteredCategories.map((category) => {
                  const kpiCount = allKPIs.filter(kpi =>
                    kpi.subClusterName === selectedSubCluster && 
                    kpi.category === category.id
                  ).length
                  
                  return (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id} 
                      className="flex items-center gap-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
                    >
                      <span>{safeString(category.name)}</span>
                      <Badge variant="default" className="ml-1">
                        {kpiCount}
                      </Badge>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* KPI List & Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KPI List Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              KPIs List 
              <Badge variant="default" className="ml-2">
                {filteredKPIs.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              {selectedSubCluster === "All Sub-Clusters" 
                ? "All KPIs across all sub-clusters" 
                : `KPIs for ${selectedSubCluster}`
              }
              {selectedCategory !== "all-categories" && (
                <span> in {safeString(kpiCategories.find(cat => cat.id === selectedCategory)?.name)}</span>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {filteredKPIs.length > 0 ? (
              filteredKPIs.map(kpi => (
                <div 
                  key={kpi.id} 
                  className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                    (selectedKPI && selectedKPI.id === kpi.id)
                      ? "bg-primary/10 border-primary shadow-md"
                      : "bg-card border-border hover:bg-accent/5 hover:border-accent/50"
                  }`}
                  onClick={() => setSelectedKPI(kpi)}
                >
                  <h4 className="font-medium text-sm mb-2 line-clamp-2">
                    {safeString(kpi.title)}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-3">
                    {safeString(kpi.description) || "No description provided"}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">No KPIs found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedSubCluster !== "All Sub-Clusters" 
                    ? `No KPIs found in ${selectedSubCluster}`
                    : "Try adjusting your search or filters"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* KPI Detail Panel */}
        {selectedKPI ? (
          <Card className="lg:col-span-2">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{safeString(selectedKPI.title)}</CardTitle>
                  <CardDescription className="text-base">
                    {safeString(selectedKPI.description) || "No description provided"}
                  </CardDescription>
                </div>
                {(hasPermission("manage_all_kpis") || hasPermission("manage_stakeholder_kpis") || hasPermission("manage_subcluster_kpis")) && (
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Sub-Cluster</Label>
                    <p className="text-sm mt-1 p-2 bg-muted/50 rounded-md">
                      {safeString(selectedKPI.subClusterName)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <p className="text-sm mt-1 p-2 bg-muted/50 rounded-md">
                      {safeString(getCategoryName(selectedKPI.category, kpiCategories))}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Stakeholder Type</Label>
                    <p className="text-sm mt-1 p-2 bg-muted/50 rounded-md">
                      {safeString(selectedKPI.stakeholderCategory)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Units</Label>
                    <p className="text-sm mt-1 p-2 bg-muted/50 rounded-md">
                      {safeString(selectedKPI.units) || "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Progress & Metrics */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Progress</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current Value</span>
                        <span className="font-medium">{selectedKPI.currentValue}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Target Value</span>
                        <span className="font-medium">{selectedKPI.targetValue}</span>
                      </div>
                      <div className="pt-2">
                        <div className="w-full bg-muted rounded-full h-3">
                          <div
                            className="bg-primary h-3 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${calculateProgress(selectedKPI.currentValue, selectedKPI.targetValue)}%` 
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                          {formatProgressText(selectedKPI.currentValue, selectedKPI.targetValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Completion Status</Label>
                    <div className="mt-2">
                      <Badge 
                        variant={
                          selectedKPI.currentValue >= selectedKPI.targetValue ? "default" :
                          selectedKPI.currentValue >= selectedKPI.targetValue * 0.7 ? "default" :
                          "outline"
                        }
                        className="w-full justify-center py-2"
                      >
                        {selectedKPI.currentValue >= selectedKPI.targetValue ? "Target Achieved" :
                         selectedKPI.currentValue >= selectedKPI.targetValue * 0.7 ? "On Track" :
                         "Needs Improvement"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Disaggregation Categories */}
              <div>
                <Label className="text-sm font-medium">Disaggregation Categories</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedKPI.disaggregation && selectedKPI.disaggregation.length > 0 ? (
                    selectedKPI.disaggregation.map((d, i) => (
                      <Badge key={i} variant="outline" className="text-xs py-1">
                        {safeString(d)}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground italic">
                      No disaggregation categories defined
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="lg:col-span-2">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Target className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <CardTitle className="text-lg mb-2">Select a KPI</CardTitle>
              <CardDescription>
                Choose a KPI from the list to view detailed information
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}