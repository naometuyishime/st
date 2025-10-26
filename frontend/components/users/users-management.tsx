"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { UploadCloud, Plus, Edit, Save, X, Search, Filter, MoreVertical, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useUsers } from "@/contexts/users-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { User } from "@/types"
import { FileImportService, ImportedUser } from "@/lib/file-import"
import { api } from "@/lib/api"

interface UserProps {
  onCreateNew: () => void
}

interface EditFormData {
  username: string
  email: string
  phone?: string
  role: User['role']
  status: User['status']
  extra?: {
    fullName?: string
    organization_id?: string
    stakeholderCategoryId?: string
  }
}

export function UsersManagement({ onCreateNew }: UserProps) {
  const { user, token } = useAuth()
  const { users, create, update, remove, refresh } = useUsers()
  const [showImportPreview, setShowImportPreview] = useState(false)
  const [importPreview, setImportPreview] = useState<ImportedUser[]>([])
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<EditFormData>({
    username: '',
    email: '',
    phone: '',
    role: 'stakeholder_user',
    status: 'pending',
    extra: {}
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)

  const handleFile = async (file?: File) => {
    if (!file) return
    
    setImportError(null)
    setImportSuccess(null)
    
    try {
      // Use FileImportService to parse the file
      const parsedUsers = await FileImportService.parseFile(file)
      
      if (parsedUsers.length === 0) {
        setImportError("No valid users found in the file")
        return
      }
      
      setImportPreview(parsedUsers)
      setShowImportPreview(true)
      setImportSuccess(`Successfully parsed ${parsedUsers.length} users from file`)
    } catch (error) {
      console.error('File parsing error:', error)
      setImportError(error instanceof Error ? error.message : 'Failed to parse file')
    }
  }

  const handleBulkImport = async () => {
    if (!token || importPreview.length === 0) return
    
    setIsImporting(true)
    setImportError(null)
    setImportSuccess(null)
    
    try {
      // Use the bulk import API endpoint
      const result = await api.bulkImportUsers(token, importPreview)
      
      setImportSuccess(
        `Import completed: ${result.created} created, ${result.skipped} skipped out of ${result.total} total`
      )
      await refresh()
      setImportPreview([])
      setShowImportPreview(false)
    } catch (error) {
      console.error('Bulk import error:', error)
      setImportError(error instanceof Error ? error.message : 'Failed to import users')
    } finally {
      setIsImporting(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUserId(user.id)
    setEditFormData({
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      extra: { ...user.extra }
    })
  }

  const handleSave = async (userId: string) => {
    await update(userId, {
      username: editFormData.username,
      email: editFormData.email,
      role: editFormData.role,
      status: editFormData.status,
    })
    setEditingUserId(null)
    setEditFormData({
      username: '',
      email: '',
      phone: '',
      role: 'stakeholder_user',
      status: 'pending',
      extra: {}
    })
  }

  const handleCancel = () => {
    setEditingUserId(null)
    setEditFormData({
      username: '',
      email: '',
      phone: '',
      role: 'stakeholder_user',
      status: 'pending',
      extra: {}
    })
  }

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await remove(userId)
    }
  }

  const handleInputChange = (field: string, value: string, isExtraField = false) => {
    if (isExtraField) {
      setEditFormData({
        ...editFormData,
        extra: {
          ...editFormData.extra,
          [field]: value
        }
      })
    } else {
      setEditFormData({
        ...editFormData,
        [field]: value
      } as EditFormData)
    }
  }

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.extra?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.extra?.organization_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesStatus = statusFilter === "all" || user.status === statusFilter
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getStatusBadgeVariant = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'pending':
        return 'destructive'
      case 'inactive':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3 mr-1" />
      case 'pending':
        return <Clock className="h-3 w-3 mr-1" />
      case 'inactive':
        return <X className="h-3 w-3 mr-1" />
      default:
        return null
    }
  }

  const formatRoleName = (role: User['role']) => {
    const roleMap: Record<User['role'], string> = {
      admin: "Admin",
      subclusterfocalperson: "Focal Person",
      stakeholder_admin: "Stakeholder Admin",
      stakeholder_user: "Stakeholder User"
    }
    return roleMap[role] || role
  }

  // Count users by status for summary cards
  const activeCount = users.filter(u => u.status === 'active').length
  const pendingCount = users.filter(u => u.status === 'pending').length
  const inactiveCount = users.filter(u => u.status === 'inactive').length

  // Count users by role for summary cards
  const adminCount = users.filter(u => u.role === 'admin').length
  const focalPersonCount = users.filter(u => u.role === 'subclusterfocalperson').length
  const stakeholderAdminCount = users.filter(u => u.role === 'stakeholder_admin').length
  const stakeholderUserCount = users.filter(u => u.role === 'stakeholder_user').length
  const totalStakeholders = stakeholderAdminCount + stakeholderUserCount

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
          <p className="text-foreground">Manage admin, focal persons and stakeholder users</p>
        </div>

        <div className="flex gap-2">
          {user?.role === 'admin' && (
            <>
              <label className="inline-flex">
                <input 
                  type="file" 
                  accept=".csv,.xlsx,.xls,.docx" 
                  className="hidden" 
                  onChange={(e) => handleFile(e.target.files?.[0])} 
                />
                <Button variant="outline" asChild>
                  <span className="flex items-center gap-2">
                    <UploadCloud className="h-4 w-4"/> Bulk Import
                  </span>
                </Button>
              </label>

              <Button onClick={onCreateNew} className="transition-all duration-200 hover:scale-[1.02]">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {importError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{importError}</AlertDescription>
        </Alert>
      )}

      {importSuccess && (
        <Alert className="border-green-500 bg-green-50 text-green-900">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>{importSuccess}</AlertDescription>
        </Alert>
      )}

      {/* Role Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Focal Persons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{focalPersonCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stakeholders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStakeholders}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {stakeholderAdminCount} Admin, {stakeholderUserCount} User
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader >
            <CardTitle className="text-sm font-medium">Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="flex justify-between">
                <span>Total users</span>
                <span className="font-medium">{users.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Active</span>
                <span className="font-medium">{activeCount}</span>
              </div>
         
              <div className="flex justify-between">
                <span>Pending</span>
                <span className="font-medium">{pendingCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Inactive</span>
                <span className="font-medium">{inactiveCount}</span>
              </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="subclusterfocalperson">Focal Person</SelectItem>
                  <SelectItem value="stakeholder_admin">Stakeholder Admin</SelectItem>
                  <SelectItem value="stakeholder_user">Stakeholder User</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import preview */}
      {showImportPreview && (
        <Card className="border-blue-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Import Preview ({importPreview.length} users)</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setImportPreview([])
                  setShowImportPreview(false)
                  setImportSuccess(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {importPreview.map((row, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 border rounded text-sm bg-muted/20">
                  <div className="flex-1">
                    <div className="font-medium">{row.username}</div>
                    <div className="text-xs text-muted-foreground">{row.email}</div>
                    {row.extra?.fullName && (
                      <div className="text-xs text-muted-foreground">Name: {row.extra.fullName}</div>
                    )}
                    {row.phone && (
                      <div className="text-xs text-muted-foreground">Phone: {row.phone}</div>
                    )}
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant="outline" className="text-xs capitalize">
                      {formatRoleName(row.role as any || 'stakeholder_user')}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(row.status as any || 'pending')} className="text-xs">
                      {getStatusIcon(row.status as any || 'pending')}
                      {row.status || 'pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => { 
                  setImportPreview([])
                  setShowImportPreview(false)
                  setImportSuccess(null)
                }} 
                className="text-xs h-8"
                disabled={isImporting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleBulkImport} 
                className="text-xs h-8"
                disabled={isImporting}
              >
                {isImporting ? 'Importing...' : `Import ${importPreview.length} Users`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>All Users ({filteredUsers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left p-2 font-medium">Username</th>
                  <th className="text-left p-2 font-medium">Full Name</th>
                  <th className="text-left p-2 font-medium">Organization</th>
                  <th className="text-left p-2 font-medium">Email</th>
                  <th className="text-left p-2 font-medium">Phone</th>
                  <th className="text-left p-2 font-medium">Role</th>
                  <th className="text-left p-2 font-medium">Status</th>
                  <th className="text-left p-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className={`border-t transition-colors ${
                      index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                    } hover:bg-muted/30`}
                  >
                    <td className="p-2">
                      {editingUserId === user.id ? (
                        <Input
                          value={editFormData.username}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          placeholder="Username"
                          className="h-7 text-xs"
                        />
                      ) : (
                        <div className="font-medium">{user.username}</div>
                      )}
                    </td>

                    <td className="p-2">
                      {editingUserId === user.id ? (
                        <Input
                          value={editFormData.extra?.fullName || ''}
                          onChange={(e) => handleInputChange('fullName', e.target.value, true)}
                          placeholder="Full Name"
                          className="h-7 text-xs"
                        />
                      ) : (
                        <div>{user.extra?.fullName || '-'}</div>
                      )}
                    </td>

                    <td className="p-2">
                      {editingUserId === user.id ? (
                        <Input
                          value={editFormData.extra?.organization_id || ''}
                          onChange={(e) => handleInputChange('organization_name', e.target.value, true)}
                          placeholder="Organization"
                          className="h-7 text-xs"
                        />
                      ) : (
                        <div>{user.extra?.organization_name || '-'}</div>
                      )}
                    </td>

                    <td className="p-2">
                      {editingUserId === user.id ? (
                        <Input
                          type="email"
                          value={editFormData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Email"
                          className="h-7 text-xs"
                        />
                      ) : (
                        <div>{user.email}</div>
                      )}
                    </td>

                    <td className="p-2">
                      {editingUserId === user.id ? (
                        <Input
                          value={editFormData.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="Phone"
                          className="h-7 text-xs"
                        />
                      ) : (
                        <div>{user.phone || '-'}</div>
                      )}
                    </td>

                    <td className="p-2">
                      {editingUserId === user.id ? (
                        <Select
                          value={editFormData.role}
                          onValueChange={(value) => handleInputChange('role', value)}
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="subclusterfocalperson">Focal Person</SelectItem>
                            <SelectItem value="stakeholder_admin">Stakeholder Admin</SelectItem>
                            <SelectItem value="stakeholder_user">Stakeholder User</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline" className="text-xs capitalize">
                          {formatRoleName(user.role)}
                        </Badge>
                      )}
                    </td>

                    <td className="p-2">
                      {editingUserId === user.id ? (
                        <Select
                          value={editFormData.status}
                          onValueChange={(value) => handleInputChange('status', value)}
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={getStatusBadgeVariant(user.status)} className="text-xs flex items-center gap-1">
                          {getStatusIcon(user.status)}
                          {user.status}
                        </Badge>
                      )}
                    </td>

                    <td className="p-2">
                      {editingUserId === user.id ? (
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            onClick={() => handleSave(user.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleCancel}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEdit(user)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="outline" className="h-6 w-6 p-0">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="text-xs">
                              <DropdownMenuItem onClick={() => handleEdit(user)}>
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(user.id)}
                                className="text-destructive"
                              >
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No users found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}