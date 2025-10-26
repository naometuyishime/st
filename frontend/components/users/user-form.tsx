import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

interface FormProps {
  onClose: () => void
  onSubmit: (userData: any) => void
}

interface SubCluster {
  id: string
  name: string
  description?: string
  focalPersonId?: string
}

interface Organization {
  id: string
  name: string
  organizationName: string
  stakeholderCategoryId: string
  implementationLevel: string
  createdAt: string
  updatedAt: string
}

export function AddUserForm({ onClose, onSubmit }: FormProps) {
  const [role, setRole] = useState<string | undefined>(undefined)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [subClusters, setSubClusters] = useState<SubCluster[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)
  const { token } = useAuth()
  
  const [formData, setFormData] = useState<any>({ 
    username: '', 
    email: '', 
    phone: '', 
    fullName: '', 
    stakeholderId: '', 
    subClusterId: '',
    role: ''

  })

  // Fetch data based on selected role
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return
      
      setFetchingData(true)
      try {
        if (role === 'stakeholder_admin' || role === 'stakeholder_user') {
          // Fetch real organizations for stakeholder roles
          const orgs = await api.getStakeholders()
          console.log('Fetched organizations:', orgs)
          setOrganizations(Array.isArray(orgs) ? orgs : [])
          setSubClusters([]) // Clear sub-clusters when not needed
        } else if (role === 'subclusterfocalperson') {
          // Fetch real sub-clusters for focal person role
          const clusters = await api.getSubClusters(token)
          console.log('Fetched sub-clusters:', clusters)
          setSubClusters(Array.isArray(clusters) ? clusters : [])
          setOrganizations([]) // Clear organizations when not needed
        } else {
          // Clear both for admin role
          setOrganizations([])
          setSubClusters([])
        }
      } catch (error) {
        console.error("Failed to load data:", error)
        // Set empty arrays on error
        setOrganizations([])
        setSubClusters([])
      } finally {
        setFetchingData(false)
      }
    }

    if (role) {
      fetchData()
    }
  }, [role, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      alert("Authentication required. Please log in again.")
      return
    }
    
    setLoading(true)
    
    try {
      let userPayload: any = {
        username: formData.username,
        email: formData.email,
        password: "password", // Default password, should be changed by user
        role: role || 'stakeholder_user'
      }

      // Add role-specific data
      if (role === 'stakeholder_admin' || role === 'stakeholder_user') {
        if (!formData.organization_id) {
          alert("Please select an organization for stakeholder roles")
          setLoading(false)
          return
        }
        userPayload.stakeholderId = formData.organization_id
      } else if (role === 'subclusterfocalperson') {
        if (!formData.subClusterId) {
          alert("Please select a sub-cluster for focal person role")
          setLoading(false)
          return
        }
        userPayload.subClusterId = formData.subClusterId
      }

      console.log('Registering user with payload:', userPayload)

      // Register user
      const userResponse = await api.register(
        userPayload.username,
        userPayload.email,
        userPayload.password,
        userPayload.role,
        userPayload.stakeholderId,
        userPayload.subClusterId
      )

      console.log('User registration response:', userResponse)

      // Submit the form data
      onSubmit({
        ...formData,
        role,
        userId: userResponse.user?.id,
        stakeholderId: formData.stakeholderId,
        subClusterId: formData.subClusterId
      })
      
      onClose()
    } catch (error: any) {
      console.error("Failed to create user:", error)
      // Handle error (show notification, etc.)
      alert(`Failed to create user: ${error.message || "Please try again."}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const isStakeholderRole = role === 'stakeholder_admin' || role === 'stakeholder_user'
  const isFocalPersonRole = role === 'subclusterfocalperson'

  const getOrganizationName = (org: Organization) => {
    return org.organizationName || org.name || `Organization ${org.id}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Create New User</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select 
                value={role} 
                onValueChange={(v) => {
                  setRole(v)
                  // Reset role-specific fields when role changes
                  setFormData({
                    ...formData,
                    organization_id: '',
                    subClusterId: ''
                  })
                }} 
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="subclusterfocalperson">Sub-Cluster Focal Person</SelectItem>
                  <SelectItem value="stakeholder_admin">Stakeholder Admin</SelectItem>
                  <SelectItem value="stakeholder_user">Stakeholder User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Basic Information Section */}
            <div className="border-b pb-2">
              <h3 className="text-lg font-semibold">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input 
                  id="username" 
                  value={formData.username} 
                  onChange={(e) => handleInputChange('username', e.target.value)} 
                  placeholder="Enter username" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => handleInputChange('email', e.target.value)} 
                  placeholder="Enter email address" 
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  value={formData.fullName} 
                  onChange={(e) => handleInputChange('fullName', e.target.value)} 
                  placeholder="Full name" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={formData.phone} 
                  onChange={(e) => handleInputChange('phone', e.target.value)} 
                  placeholder="Enter phone number" 
                />
              </div>
            </div>

            {/* Organization Selection for Stakeholder Roles */}
            {isStakeholderRole && (
              <div className="space-y-2">
                <Label htmlFor="organization">Organization Name *</Label>
                <Select 
                  value={formData.organization_id} 
                  onValueChange={(v) => handleInputChange('organization_id', v)} 
                  required
                  disabled={fetchingData}
                >
                  <SelectTrigger id="organization">
                    {fetchingData ? (
                      <SelectValue placeholder="Loading organizations..." />
                    ) : (
                      <SelectValue placeholder="Select organization" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id.toString()}>
                        {getOrganizationName(org)}
                        {org.stakeholderCategoryId && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (Category: {org.stakeholderCategoryId})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fetchingData && (
                  <p className="text-sm text-muted-foreground">Loading organizations...</p>
                )}
                {!fetchingData && organizations.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No organizations available. Please add organizations first.
                  </p>
                )}
              </div>
            )}

            {/* Sub-Cluster Selection for Focal Person Role */}
            {isFocalPersonRole && (
              <div className="space-y-2">
                <Label htmlFor="subCluster">Sub-Cluster Assignment *</Label>
                <Select 
                  value={formData.subClusterId} 
                  onValueChange={(v) => handleInputChange('subClusterId', v)} 
                  required
                  disabled={fetchingData}
                >
                  <SelectTrigger id="subCluster">
                    {fetchingData ? (
                      <SelectValue placeholder="Loading sub-clusters..." />
                    ) : (
                      <SelectValue placeholder="Select sub-cluster" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {subClusters.map((cluster) => (
                      <SelectItem key={cluster.id} value={cluster.id.toString()}>
                        {cluster.name}
                        {cluster.description && (
                          <span className="text-xs text-muted-foreground ml-2">
                            - {cluster.description}
                          </span>
                        )}
                        {cluster.focalPersonId && (
                          <span className="text-xs text-orange-600 ml-2">
                            (Already has focal person)
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fetchingData && (
                  <p className="text-sm text-muted-foreground">Loading sub-clusters...</p>
                )}
                {!fetchingData && subClusters.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No sub-clusters available. Please contact administrator.
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  This user will be assigned as the focal person for the selected sub-cluster.
                </p>
              </div>
            )}

            {/* Role-specific Information Note */}
            {(isStakeholderRole || isFocalPersonRole) && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  {isStakeholderRole && 
                    "This user will be associated with the selected organization and will have access to organization-specific data."}
                  {isFocalPersonRole && 
                    "This user will be assigned as the focal person for the selected sub-cluster and will manage sub-cluster activities."}
                </p>
              </div>
            )}

            {/* Password Information */}
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
              <p className="text-sm text-amber-800">
                <strong>Default Password:</strong> "password" - The user will be required to change their password upon first login.
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || fetchingData}
                className="min-w-20"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  "Add User"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}