"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, MoreHorizontal, Edit, Trash2, Eye, Plus, Users, Target, Mail, Phone, BarChart3, Building, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { useKpi } from "@/contexts/kpi-context"
import { useUsers } from "@/contexts/users-context"
import { api } from "@/lib/api"

export function SubClusters() {
  const { user, hasPermission, token } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const { subClusters, categories: kpiCategories, kpis, refresh } = useKpi()
  const { users: allUsers } = useUsers()
  const [stakeholders, setStakeholders] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    const loadStakeholders = async () => {
      try {
        const res = await api.getStakeholders()
        if (!mounted) return
        setStakeholders(res || [])
      } catch (e) {
        console.error('Failed to load stakeholders', e)
      }
    }
    loadStakeholders()
    return () => { mounted = false }
  }, [])

  // Get focal persons from users with subclusterfocalperson role
  const focalPersons = allUsers.filter(u => u.role === "subclusterfocalperson")

  // Filter sub-clusters based on user role
  const getAvailableSubClusters = () => {
    if (user?.role === "admin") return subClusters
    if (user?.role === "subclusterfocalperson") {
      const userSubClusterIds = user.subClusters?.map(sc => sc.id) || []
      return subClusters.filter(cluster => userSubClusterIds.includes(cluster.id))
    }
    if (user?.role === "stakeholder_admin" || user?.role === "stakeholder_user") {
      const userSubClusterIds = user.subClusters?.map(sc => sc.id) || []
      return subClusters.filter(cluster => userSubClusterIds.includes(cluster.id))
    }
    return []
  }

  // Get stakeholders for each sub-cluster
  const getStakeholdersForSubCluster = (subClusterId: string) => {
    let list = stakeholders.filter(stakeholder =>
      (stakeholder.subClusters || []).some((sc: any) => (sc.id || sc) === subClusterId)
    )

    if (user?.role === "stakeholder_admin") {
      list = list.filter((stakeholder: any) => stakeholder.id === user.stakeholderId)
    }

    return list
  }

  // Get KPIs for each sub-cluster
  const getKPIsForSubCluster = (subClusterId: string) => {
    return kpis.filter(kpi => String(kpi.subCluster) === String(subClusterId))
  }

  // Get KPI categories for each sub-cluster
  const getKPICategoriesForSubCluster = (subClusterId: string) => {
    return kpiCategories.filter(category => String(category.subClusterId) === String(subClusterId))
  }

  // Get focal person for a sub-cluster by focalPersonId
  const getFocalPersonForSubCluster = (cluster: any) => {
    console.log('Getting focal person for cluster:', cluster)
    console.log('Available focal persons:', focalPersons)
    
    // Check if cluster has focalPersonId
    if (cluster.focalPersonId) {
      const focalPerson = allUsers.find(u => String(u.id) === String(cluster.focalPersonId))
      console.log('Found focal person by focalPersonId:', focalPerson)
      return focalPerson ? [focalPerson] : []
    }
    
    // Fallback to checking subClusters array in user object
    const personsFromSubClusters = focalPersons.filter((person: any) => 
      person.subClusters?.some((sc: any) => String(sc.id) === String(cluster.id))
    )
    console.log('Found focal persons from subClusters:', personsFromSubClusters)
    
    return personsFromSubClusters
  }

  const filteredSubClusters = getAvailableSubClusters().filter(cluster =>
    cluster.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleCluster = (clusterId: string) => {
    setExpandedCluster(expandedCluster === clusterId ? null : clusterId)
  }

  const handleSubClusterCreated = () => {
    if (refresh) {
      refresh()
    }
    setIsAddDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Sub-Clusters</h1>
          <p className="text-muted-foreground">Manage and organize your sub-clusters, stakeholders, and KPIs</p>
        </div>
        {hasPermission("manage_all_kpis") && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full lg:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Sub-Cluster
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Sub-Cluster</DialogTitle>
                <DialogDescription>
                  Add a new sub-cluster to organize stakeholders and KPIs.
                </DialogDescription>
              </DialogHeader>
              <AddSubClusterForm 
                onClose={() => setIsAddDialogOpen(false)}
                onSuccess={handleSubClusterCreated}
                token={token}
                loading={loading}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sub-Clusters"
          value={getAvailableSubClusters().length}
          icon={Target}
        />
        <StatCard
          title="Total KPIs"
          value={kpis.filter(kpi => 
            getAvailableSubClusters().some(sc => sc.id === kpi.subCluster)
          ).length}
          icon={BarChart3}
        />
        <StatCard
          title="Active Stakeholders"
          value={stakeholders.filter((s: any) =>
            s.status === 'Active' &&
            (s.subClusters || []).some((sc: any) => getAvailableSubClusters().some(availableSc => availableSc.id === (sc.id || sc)))
          ).length}
          icon={Building}
        />
        <StatCard
          title="Focal Persons"
          value={focalPersons.filter(person => 
            person.subClusters?.some(sc => 
              getAvailableSubClusters().some((availableSc: { id: string }) => availableSc.id === sc.id)
            ) || getAvailableSubClusters().some(sc => String(sc.focalPersonId) === String(person.id))
          ).length}
          icon={Users}
        />
      </div>

      {/* Search and Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            <div className="flex-1 w-full">
              <label className="text-sm font-medium mb-2 block">Search Sub-Clusters</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full lg:w-auto">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="All status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sub-Clusters</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" className="w-full lg:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sub-Clusters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredSubClusters.map((cluster) => {
          const stakeholders = getStakeholdersForSubCluster(cluster.id)
          const clusterKPIs = getKPIsForSubCluster(cluster.id)
          const categories = getKPICategoriesForSubCluster(cluster.id)
          const clusterFocalPersons = getFocalPersonForSubCluster(cluster)
          const isExpanded = expandedCluster === cluster.id

          return (
            <SubClusterCard
              key={cluster.id}
              cluster={cluster}
              stakeholders={stakeholders}
              clusterKPIs={clusterKPIs}
              categories={categories}
              clusterFocalPersons={clusterFocalPersons}
              isExpanded={isExpanded}
              onToggle={() => toggleCluster(cluster.id)}
              canManage={hasPermission("manage_subcluster_kpis") || hasPermission("manage_all_kpis")}
            />
          )
        })}
      </div>

      {filteredSubClusters.length === 0 && (
        <EmptyState 
          title="No sub-clusters found"
          description="No sub-clusters match your search criteria or you don't have access to any sub-clusters."
          action={
            hasPermission("manage_all_kpis") ? (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Sub-Cluster
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Sub-Cluster</DialogTitle>
                    <DialogDescription>
                      Add a new sub-cluster to organize stakeholders and KPIs.
                    </DialogDescription>
                  </DialogHeader>
                  <AddSubClusterForm 
                    onClose={() => setIsAddDialogOpen(false)}
                    onSuccess={handleSubClusterCreated}
                    token={token}
                    loading={loading}
                  />
                </DialogContent>
              </Dialog>
            ) : null
          }
        />
      )}
    </div>
  )
}

function AddSubClusterForm({ onClose, onSuccess, token, loading }: { 
  onClose: () => void, 
  onSuccess: () => void,
  token: string | null,
  loading: boolean
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!formData.name.trim()) {
      setError("Sub-cluster name is required")
      return
    }

    if (!token) {
      setError("Authentication required")
      return
    }

    setSubmitLoading(true)

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        // Removed focalPersonId assignment
      }

      console.log('Creating sub-cluster with payload:', payload)
      
      const result = await api.createSubCluster(token, payload)
      console.log('Sub-cluster created successfully:', result)
      
      setFormData({
        name: "",
        description: "",
      })
      setError(null)
      onSuccess()
    } catch (err: any) {
      console.error('Failed to create sub-cluster:', err)
      const errorMessage = err.message || "Failed to create sub-cluster. Please try again."
      setError(errorMessage)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
    })
    setError(null)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Sub-Cluster Name *
        </label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter sub-cluster name"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter sub-cluster description"
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={handleCancel} disabled={submitLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitLoading || !formData.name.trim()}>
          {submitLoading ? "Creating..." : "Create Sub-Cluster"}
        </Button>
      </div>
    </form>
  )
}

function SubClusterCard({ cluster, stakeholders, clusterKPIs, categories, clusterFocalPersons, isExpanded, onToggle, canManage }: any) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold">{cluster.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <span>{categories.length} categories</span>
              <span>•</span>
              <span>{clusterKPIs.length} KPIs</span>
              <span>•</span>
              <span>{stakeholders.length} stakeholders</span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Sub-Cluster
                  </DropdownMenuItem>
                  {/* Removed "Manage Focal Persons" menu item */}
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Sub-Cluster
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button variant="ghost" size="sm" onClick={onToggle} className="h-8 w-8 p-0">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main Content - Always Visible */}
        <div className="grid grid-cols-2 gap-4">
          {/* Focal Persons Column - Now just displays existing assignment */}
          <div>
            <label className="text-sm font-medium mb-3 block">Focal Person</label>
            <div className="space-y-2">
              {clusterFocalPersons.length > 0 ? (
                clusterFocalPersons.slice(0, 1).map((person: any) => (
                  <div key={person.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{person.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{person.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-3 border border-dashed rounded-lg bg-muted/20">
                  <Users className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">No focal person assigned</p>
                </div>
              )}
            </div>
          </div>

          {/* Stakeholders Column */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              Stakeholder
            </label>
            <div className="space-y-2">
              {stakeholders.slice(0, 1).map((stakeholder: any) => (
                <div key={stakeholder.id} className="flex items-center justify-between text-sm p-3 bg-muted/30 rounded-lg">
                  <span className="truncate font-medium">{stakeholder.organizationName}</span>
                  <Badge 
                    variant={stakeholder.status === 'Active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {stakeholder.status}
                  </Badge>
                </div>
              ))}
              {stakeholders.length === 0 && (
                <div className="text-center p-3 border border-dashed rounded-lg bg-muted/20">
                  <Building className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">No stakeholders</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="pt-4 border-t space-y-4">
            {/* Additional Focal Persons */}
            {clusterFocalPersons.length > 1 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Additional Focal Persons</label>
                <div className="space-y-2">
                  {clusterFocalPersons.slice(1).map((person: any) => (
                    <div key={person.id} className="flex items-center gap-3 p-2 text-sm">
                      <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{person.username}</p>
                        <p className="text-xs text-muted-foreground truncate">{person.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Stakeholders */}
            {stakeholders.length > 1 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Additional Stakeholders ({stakeholders.length - 1})</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {stakeholders.slice(1).map((stakeholder: any) => (
                    <div key={stakeholder.id} className="flex items-center justify-between text-sm p-2 hover:bg-muted/30 rounded">
                      <span className="truncate">{stakeholder.organizationName}</span>
                      <Badge 
                        variant={stakeholder.status === 'Active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {stakeholder.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KPI Categories */}
            {categories.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">KPI Categories ({categories.length})</label>
                <div className="space-y-1">
                  {categories.map((category: any) => (
                    <div key={category.id} className="flex items-center justify-between text-sm p-2 hover:bg-muted/30 rounded">
                      <span className="truncate">{category.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {category.kpis || 0} KPIs
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KPIs Summary */}
            {clusterKPIs.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">KPIs Summary</label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-muted/30 rounded text-center">
                    <div className="font-semibold">{clusterKPIs.filter((kpi: any) => kpi.status === 'Active').length}</div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                  <div className="p-2 bg-muted/30 rounded text-center">
                    <div className="font-semibold">{clusterKPIs.filter((kpi: any) => kpi.status === 'Inactive').length}</div>
                    <div className="text-xs text-muted-foreground">Inactive</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Show More/Less Indicator */}
        {(stakeholders.length > 1 || clusterFocalPersons.length > 1 || categories.length > 0) && (
          <div className="pt-2 text-center">
            <button
              onClick={onToggle}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 mx-auto"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Show more details
                </>
              )}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatCard({ title, value, icon: Icon }: any) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ title, description, action }: any) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-12 text-center">
        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          {description}
        </p>
        {action}
      </CardContent>
    </Card>
  )
}