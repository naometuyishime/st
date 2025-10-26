import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Building, MapPin, Users, Users2, Target, Activity, Globe, Edit, Trash2, Eye } from "lucide-react"
import { AddOrganizationForm } from "@/components/organization/organization-form"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface OrganizationProps {
  onCreateNew: () => void
}

interface Organization {
  id: string
  name: string
  organizationName: string
  stakeholderCategoryId: string
  implementationLevel: string
  districtId: string
  provinceId: string
  countryId: string
  subClusterId: string
  createdAt: string
  updatedAt: string
  stakeholderCategory?: {
    id: string
    name: string
  }
  districts?: any[]
  provinces?: any[]
  subClusters?: any[]
  // Added fields based on your schema
  stakeholderDistricts?: any[]
  stakeholderSubClusters?: any[]
}

interface StakeholderCategory {
  id: string
  name: string
  description: string
}

export function OrganizationManagement({ onCreateNew }: OrganizationProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [stakeholderCategories, setStakeholderCategories] = useState<StakeholderCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [organizationToDelete, setOrganizationToDelete] = useState<Organization | null>(null)
  const { token } = useAuth()

  // Fetch organizations and stakeholder categories data
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Fetch organizations (stakeholders)
        const stakeholders = await api.getStakeholders()
        console.log('Fetched organizations:', stakeholders)
        
        // Fetch stakeholder categories to get proper names
        const categories = await api.getStakeholderCategories()
        console.log('Fetched categories:', categories)
        
        setOrganizations(stakeholders || [])
        setStakeholderCategories(categories || [])
      } catch (err) {
        console.error('Failed to fetch data:', err)
        setError('Failed to load organizations')
        setOrganizations([])
        setStakeholderCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  const handleFormSubmit = async (organizationData: any) => {
    console.log("Organization data:", organizationData)
    setShowForm(false)
    setEditingOrganization(null)
    onCreateNew()
    
    // Refresh the organizations list
    await refreshOrganizations()
  }

  const handleEditOrganization = (org: Organization) => {
    setEditingOrganization(org)
    setShowForm(true)
  }

  const handleDeleteOrganization = (org: Organization) => {
    setOrganizationToDelete(org)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!organizationToDelete || !token) return
    
    try {
      await api.deleteStakeholder(token, organizationToDelete.id)
      await refreshOrganizations()
      setDeleteDialogOpen(false)
      setOrganizationToDelete(null)
    } catch (error) {
      console.error('Failed to delete organization:', error)
      setError('Failed to delete organization')
    }
  }

  const refreshOrganizations = async () => {
    if (!token) return
    
    try {
      const stakeholders = await api.getStakeholders()
      const categories = await api.getStakeholderCategories()
      setOrganizations(stakeholders || [])
      setStakeholderCategories(categories || [])
    } catch (err) {
      console.error('Failed to refresh data:', err)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingOrganization(null)
  }

  // Filter organizations based on search term and category
  const filteredOrganizations = organizations.filter(org => {
    const orgName = org.organizationName || org.name || ''
    const matchesSearch = orgName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === "all" || 
      (org.stakeholderCategoryId && filterCategory === org.stakeholderCategoryId.toString())
    
    return matchesSearch && matchesCategory
  })

  // Calculate stats from real data with proper category mapping
  const totalOrganizations = organizations.length
  const activeOrganizations = organizations.length // All are considered active for now
  
  // Count organizations by stakeholder category ID
  const implementingPartners = organizations.filter(org => 
    org.stakeholderCategoryId === "1"
  ).length
  
  const developingPartners = organizations.filter(org => 
    org.stakeholderCategoryId === "2"
  ).length

  // Get category name from stakeholderCategories data
  const getCategoryName = (categoryId: string) => {
    if (!stakeholderCategories.length) {
      // Fallback if categories not loaded
      switch(categoryId) {
        case "1": return "Implementing Partner"
        case "2": return "Developing Partner"
        default: return "Other"
      }
    }
    
    const category = stakeholderCategories.find(cat => cat.id === categoryId)
    return category ? category.name : "Unknown Category"
  }

  const getCategoryVariant = (categoryId: string) => {
    return categoryId === "1" ? "default" : "secondary"
  }

  const getImplementationLevel = (level: string) => {
    switch(level?.toLowerCase()) {
      case "country": return "Country Level"
      case "province": return "Province Level"
      case "district": return "District Level"
      default: return level || "Not specified"
    }
  }

  // Get location information from related data
  const getLocationInfo = (org: Organization) => {
    const districts = org.stakeholderDistricts || []
    const subClusters = org.stakeholderSubClusters || []
    
    return {
      districtCount: districts.length,
      subClusterCount: subClusters.length,
      hasLocationData: districts.length > 0 || subClusters.length > 0,
      districtNames: districts.map((sd: any) => sd.district?.name).filter(Boolean),
      subClusterNames: subClusters.map((ssc: any) => ssc.subCluster?.name).filter(Boolean)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organization Management</h1>
            <p className="text-muted-foreground">Loading organizations...</p>
          </div>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Organization
          </Button>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organization Management</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Organization
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Failed to load organizations</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Management</h1>
          <p className="text-muted-foreground">
            Manage organizations and their implementation level
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Organization
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Organizations */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Organizations</p>
                <p className="text-3xl font-bold">{totalOrganizations}</p>
                <p className="text-xs text-muted-foreground mt-1">All registered partners</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Building className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Organizations */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Active Organizations</p>
                <p className="text-3xl font-bold">{activeOrganizations}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalOrganizations > 0 ? ((activeOrganizations / totalOrganizations) * 100).toFixed(0) : 0}% of total
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partner Types */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Partner Types</p>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xl font-bold">{implementingPartners}</p>
                    <p className="text-xs text-muted-foreground">
                      {stakeholderCategories.find(cat => cat.id === "1")?.name || "Implementing"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{developingPartners}</p>
                    <p className="text-xs text-muted-foreground">
                      {stakeholderCategories.find(cat => cat.id === "2")?.name || "Developing"}
                    </p>
                  </div>
                  {totalOrganizations > implementingPartners + developingPartners && (
                    <div>
                      <p className="text-xl font-bold">
                        {totalOrganizations - implementingPartners - developingPartners}
                      </p>
                      <p className="text-xs text-muted-foreground">Other</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
          <CardDescription>
            Find organizations by name or filter by category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Input */}
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">Category</label>
              <select
                id="category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Categories</option>
                {stakeholderCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizations Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Organizations
            <Badge variant="outline" className="ml-2">
              {filteredOrganizations.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            List of all registered organizations with their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrganizations.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No organizations found</h3>
              <p className="text-muted-foreground mb-4">
                {organizations.length === 0 
                  ? "No organizations have been registered yet." 
                  : "Try adjusting your search criteria."
                }
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Organization
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrganizations.map((org) => {
                const locationInfo = getLocationInfo(org)
                
                return (
                  <Card key={org.id} className="hover:shadow-md transition-shadow group">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Building className="h-5 w-5 text-primary" />
                            {org.organizationName || org.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={getCategoryVariant(org.stakeholderCategoryId)}>
                              {getCategoryName(org.stakeholderCategoryId)}
                            </Badge>
                            <Badge variant="default">
                              Active
                            </Badge>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditOrganization(org)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteOrganization(org)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Implementation Level */}
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Level:</span>
                        <span className="font-medium">{getImplementationLevel(org.implementationLevel)}</span>
                      </div>

                      {/* Geographic Information */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Coverage:</span>
                        </div>
                        
                        {/* Districts */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {locationInfo.districtCount} Districts
                            </Badge>
                          </div>
                          {locationInfo.districtNames.length > 0 && (
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {locationInfo.districtNames.slice(0, 3).join(', ')}
                              {locationInfo.districtNames.length > 3 && '...'}
                            </div>
                          )}
                        </div>

                        {/* Sub-clusters */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {locationInfo.subClusterCount} Sub-clusters
                            </Badge>
                          </div>
                          {locationInfo.subClusterNames.length > 0 && (
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {locationInfo.subClusterNames.slice(0, 3).join(', ')}
                              {locationInfo.subClusterNames.length > 3 && '...'}
                            </div>
                          )}
                        </div>

                        {!locationInfo.hasLocationData && (
                          <div className="text-muted-foreground italic text-xs">
                            No location data specified
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleEditOrganization(org)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organization Form Modal (used for both Add and Edit) */}
      {showForm && (
        <AddOrganizationForm
          organization={editingOrganization || undefined}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the organization{" "}
              <strong>{organizationToDelete?.organizationName}</strong> and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete Organization
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// AlertCircle component for error state
function AlertCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}