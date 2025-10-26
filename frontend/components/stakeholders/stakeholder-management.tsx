"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, Edit, Trash2, Ban, CheckCircle, Mail, Building, Users, UserCog } from "lucide-react"
import { useUsers } from '@/contexts/users-context'
import { api } from '@/lib/api'

export function StakeholderManagement({ onCreateNew }: { onCreateNew: () => void }) {
  const { user, hasPermission, canManageStakeholder } = useAuth()
  const { users: ctxUsers } = useUsers()
  const [users, setUsers] = useState(ctxUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredUsers, setFilteredUsers] = useState(ctxUsers)
  const [stakeholders, setStakeholders] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const sh = await api.getStakeholders()
        if (!mounted) return
        setStakeholders(sh || [])
      } catch (err) {
        console.error('Failed to load stakeholders', err)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    setUsers(ctxUsers)
    setFilteredUsers(ctxUsers)
  }, [ctxUsers])

  // Helper function to get stakeholder by ID
  const getStakeholderById = (stakeholderId?: string) => {
    if (!stakeholderId) return null
    return stakeholders.find(s => s.id === stakeholderId)
  }

  // Helper function to check if stakeholder has matching subclusters with current user
  const hasMatchingSubClusters = (stakeholderId?: string) => {
    if (!stakeholderId || user?.role !== "subclusterfocalperson") return false
    
    const stakeholder = getStakeholderById(stakeholderId)
    if (!stakeholder?.subClusters) return false
    
    const currentUserSubClusterIds = user?.subClusters?.map(sc => sc.id) || []
    const stakeholderSubClusterIds = stakeholder.subClusters.map((sc: any) => sc.id)
    
    return stakeholderSubClusterIds.some((id: string) => currentUserSubClusterIds.includes(id))
  }

  useEffect(() => {
    // Filter users based on current user's permissions
    let filtered = (ctxUsers || []).filter(u => {
      if (u.role === "admin") return false
      
      if (user?.role === "stakeholder_admin") {
        return u.stakeholderId === user.stakeholderId && 
               (u.role === "stakeholder_user" || u.role === "stakeholder_admin")
      }
      
      if (user?.role === "subclusterfocalperson") {
        // Check if user's stakeholder has matching subclusters with current user
        return (u.role === "stakeholder_admin" || u.role === "stakeholder_user") && 
               hasMatchingSubClusters(u.stakeholderId)
      }
      
      if (user?.role === "admin") {
        return u.role === "stakeholder_user" || u.role === "stakeholder_admin"
      }
      
      return false
    })

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getStakeholderName(u.stakeholderId).toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }, [searchTerm, user, ctxUsers, stakeholders])

  const handleDeleteUser = (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(u => u.id !== userId))
    }
  }

  const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, isActive: !currentStatus, status: !currentStatus ? "active" : "inactive" } : u
    ))
  }

  const getStakeholderName = (stakeholderId?: string) => {
    if (!stakeholderId) return "N/A"
    const stakeholder = getStakeholderById(stakeholderId)
    return stakeholder?.organizationName || stakeholderId
  }

  // Helper function to get stakeholder subclusters
  const getStakeholderSubClusters = (stakeholderId?: string) => {
    if (!stakeholderId) return []
    const stakeholder = getStakeholderById(stakeholderId)
    return stakeholder?.subClusters || []
  }

  // Helper function to check if current user can manage a specific user
  const canManageUser = (targetUser: any) => {
    if (!hasPermission("manage_stakeholder_users")) return false
    
    if (user?.role === "subclusterfocalperson") {
      // Check if target user's stakeholder has matching subclusters
      return hasMatchingSubClusters(targetUser.stakeholderId) && 
             canManageStakeholder(targetUser.stakeholderId || "")
    }
    
    return canManageStakeholder(targetUser.stakeholderId || "")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Stakeholder Users Management</h2>
          <p className="text-muted-foreground">
            {user?.role === "stakeholder_admin" 
              ? "Manage users in your stakeholder organization"
              : user?.role === "subclusterfocalperson"
              ? "Manage stakeholder users in your sub-cluster"
              : "Manage stakeholder users"
            }
          </p>
        </div>
        {hasPermission("manage_stakeholder_users") && (
          <Button onClick={onCreateNew}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      {/* Search Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or stakeholder..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Cards - Table-like layout */}
      <div className="space-y-4">
        {filteredUsers.map((userItem) => {
          const canManage = canManageUser(userItem)
          const stakeholderSubClusters = getStakeholderSubClusters(userItem.stakeholderId)
          
          return (
            <Card key={userItem.id} className="transition-all duration-200 hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {/* User Info Section */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <UserCog className="h-6 w-6 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg truncate">{userItem.username}</h3>
                        <Badge variant={
                          userItem.role === "stakeholder_admin" ? "default" : "secondary"
                        }>
                          {userItem.role === "stakeholder_admin" ? "Admin" : "User"}
                        </Badge>
                        <Badge variant={userItem.status === "active" ? "default" : "secondary"}>
                          {userItem.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{userItem.email}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{getStakeholderName(userItem.stakeholderId)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">
                            {stakeholderSubClusters.length} sub-cluster{stakeholderSubClusters.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      
                      {/* Sub-clusters list from stakeholder */}
                      {stakeholderSubClusters.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {stakeholderSubClusters.slice(0, 3).map((sc: any) => (
                            <Badge key={sc.id} variant="outline" className="text-xs">
                              {sc.name}
                            </Badge>
                          ))}
                          {stakeholderSubClusters.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{stakeholderSubClusters.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="flex items-center gap-2 ml-4">
                    {canManage ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleUserStatus(userItem.id, userItem.status === "active")}
                          title={userItem.status === "active" ? "Deactivate user" : "Activate user"}
                        >
                          {userItem.status === "active" ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="sm" title="Edit user">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(userItem.id)}
                          title="Delete user"
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground px-2 py-1 border rounded">
                        Read-only
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
            <p className="text-foreground mb-4">
              {searchTerm
                ? "No users match your search criteria. Try adjusting your search term."
                : user?.role === "stakeholder_admin"
                ? "No users found in your stakeholder organization."
                : user?.role === "subclusterfocalperson"
                ? "No stakeholder users found in your sub-cluster."
                : "No stakeholder users found."
              }
            </p>
            {hasPermission("manage_stakeholder_users") && (
              <Button onClick={onCreateNew}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}