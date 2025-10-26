"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Search, MoreHorizontal, Edit, Trash2, Eye, Calendar, MapPin, Target, TrendingUp, Plus, Building, CheckCircle2, ChevronDown, ChevronRight, User, FileText, BarChart3, Save, X, AlertTriangle } from "lucide-react"
import { useKpi } from "@/contexts/kpi-context"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"

interface ActionPlansListProps {
  onCreateNew: () => void
}

interface ExpandedPlans {
  [key: string]: boolean
}

interface SelectedKpi {
  actionPlanId: string
  kpiPlanId: string
}

interface EditingKpi {
  actionPlanId: string
  kpiPlanId: string
  plannedValue: number
}

interface DisaggregationValue {
  [key: string]: number
}

interface EditingDisaggregation {
  actionPlanId: string
  kpiPlanId: string
  values: DisaggregationValue
}

// Safe value extraction helper
function safeString(value: any, defaultValue: string = ''): string {
  if (value === null || value === undefined) return defaultValue
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function safeNumber(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined) return defaultValue
  if (typeof value === 'number' && !isNaN(value)) return value
  const parsed = Number(value)
  return isNaN(parsed) ? defaultValue : parsed
}

// Delete Confirmation Modal Component
function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  plan, 
  isLoading 
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  plan: any
  isLoading: boolean
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-red-800">Delete Action Plan</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">
                  Are you sure you want to delete the action plan{" "}
                  <span className="font-semibold">"{safeString(plan?.title)}"</span>?
                  This will permanently remove the action plan and all associated KPI targets.
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={onConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Plan
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function ActionPlansList({ onCreateNew }: ActionPlansListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterSubCluster, setFilterSubCluster] = useState("all")
  const [expandedPlans, setExpandedPlans] = useState<ExpandedPlans>({})
  const [selectedKpi, setSelectedKpi] = useState<SelectedKpi | null>(null)
  const [editingKpi, setEditingKpi] = useState<EditingKpi | null>(null)
  const [editingDisaggregation, setEditingDisaggregation] = useState<EditingDisaggregation | null>(null)
  const [savingKpi, setSavingKpi] = useState<string | null>(null)
  const [deletingPlan, setDeletingPlan] = useState<string | null>(null)
  const [planToDelete, setPlanToDelete] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { subClusters } = useKpi()
  const { user, token } = useAuth()
  const [actionPlans, setActionPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Enhanced user data extraction
  function extractUserRole(user: any): string {
    if (!user) return 'guest'
    if (typeof user === 'string') return user
    if (typeof user === 'object' && user !== null) {
      if (user.role && typeof user.role === 'string') return user.role
      if (user.organizationName) return 'stakeholder_admin'
      if (user.id) return 'user'
    }
    return 'guest'
  }

  function extractUserDisplayName(user: any): string {
    if (!user) return 'Guest'
    if (typeof user === 'object' && user !== null && user.organizationName) {
      return safeString(user.organizationName)
    }
    const role = extractUserRole(user)
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  function extractStakeholderId(user: any): string | null {
    if (!user || typeof user !== 'object') return null
    if (user.stakeholderId) return safeString(user.stakeholderId)
    if (user.organizationName && user.id) return safeString(user.id)
    return null
  }

  function extractSubClusterIds(user: any): string[] {
    if (!user || typeof user !== 'object') return []
    if (user.subClusterId) {
      return [safeString(user.subClusterId)]
    }
    if (Array.isArray(user.subClusters)) {
      return user.subClusters
        .map((sc: any) => {
          if (typeof sc === 'string' || typeof sc === 'number') return safeString(sc)
          if (typeof sc === 'object' && sc !== null && sc.id) return safeString(sc.id)
          return null
        })
        .filter((id): id is string => id !== null)
    }
    return []
  }

  const safeUser = {
    exists: !!user,
    role: extractUserRole(user),
    displayName: extractUserDisplayName(user),
    stakeholderId: extractStakeholderId(user),
    subClusterIds: extractSubClusterIds(user)
  }

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        if (!token) {
          setActionPlans([])
          return
        }
        
        const plans = await api.getActionPlans(token)
        console.log("Raw action plans from API:", plans)
        
        if (!mounted) return
        
        // Transform the plans to match expected structure
        const validatedPlans = (plans || []).map((plan: any) => {
          const planId = safeString(plan.id)
          const stakeholderId = safeString(plan.stakeholderId)
          
          return {
            id: planId,
            title: safeString(plan.description || plan.comment, 'Untitled Action Plan'),
            description: safeString(plan.description),
            comment: safeString(plan.comment),
            stakeholderId: stakeholderId,
            stakeholder: safeString(plan.stakeholder?.organizationName, 'Unknown Organization'),
            location: getLocationDisplay(plan),
            subCluster: safeString(plan.stakeholderSubcluster?.id),
            subClusterName: safeString(plan.stakeholderSubcluster?.name),
            status: 'active',
            progress: calculateProgress(plan),
            level: safeString(plan.planLevel, 'district'),
            financialYear: safeString(plan.financialYear?.name),
            districtId: safeString(plan.districtId),
            provinceId: safeString(plan.provinceId),
            countryId: safeString(plan.countryId),
            document: safeString(plan.document),
            createdAt: safeString(plan.createdAt),
            updatedAt: safeString(plan.updatedAt),
            kpiPlans: plan.kpiPlans || []
          }
        })
        
        console.log("Validated action plans:", validatedPlans)
        setActionPlans(validatedPlans)
      } catch (err) {
        console.error('Failed to load action plans', err)
        setError('Failed to load action plans. Please try again.')
        if (mounted) {
          setActionPlans([])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    load()
    return () => { mounted = false }
  }, [token])

  function getLocationDisplay(plan: any): string {
    const level = safeString(plan.planLevel, '').toLowerCase()
    const districtId = safeNumber(plan.districtId)
    const provinceId = safeNumber(plan.provinceId)
    const countryId = safeNumber(plan.countryId)
    
    if (level === 'country' && countryId > 0) return 'Rwanda (National)'
    if (level === 'province' && provinceId > 0) return `Province ${provinceId}`
    if (level === 'district' && districtId > 0) return `District ${districtId}`
    return 'Not specified'
  }

  function calculateProgress(plan: any): number {
    if (plan.kpiPlans && Array.isArray(plan.kpiPlans) && plan.kpiPlans.length > 0) {
      const totalPlanned = plan.kpiPlans.reduce((sum: number, kpiPlan: any) => 
        sum + safeNumber(kpiPlan.plannedValue), 0)
      const totalActual = plan.kpiPlans.reduce((sum: number, kpiPlan: any) => 
        sum + safeNumber(kpiPlan.kpi?.currentValue), 0)
      
      if (totalPlanned > 0) {
        return Math.min(100, Math.round((totalActual / totalPlanned) * 100))
      }
    }
    
    return 0
  }

  // Parse disaggregation from KPI
  function parseDisaggregation(kpi: any): Array<{ name: string; options: string[] }> {
    if (!kpi || !kpi.disaggregation) return []
    
    try {
      // If disaggregation is a string, parse it
      const disaggregationData = typeof kpi.disaggregation === 'string' 
        ? JSON.parse(kpi.disaggregation)
        : kpi.disaggregation
      
      // Ensure it's an array
      if (Array.isArray(disaggregationData)) {
        interface DisaggregationOption {
          name: string;
          options: string[];
        }

        interface RawDisaggregation {
          name: any;
          options: any[];
        }

        return disaggregationData.map((d: RawDisaggregation): DisaggregationOption => ({
          name: safeString(d.name),
          options: Array.isArray(d.options) ? d.options.map(o => safeString(o)) : []
        }))
      }
    } catch (error) {
      console.error("Failed to parse disaggregation:", error)
    }
    
    return []
  }

  // Get disaggregation values from KPI plan
  function getDisaggregationValues(kpiPlan: any): DisaggregationValue {
    if (!kpiPlan || !kpiPlan.disaggregatedValues) return {}
    
    try {
      const values = typeof kpiPlan.disaggregatedValues === 'string'
        ? JSON.parse(kpiPlan.disaggregatedValues)
        : kpiPlan.disaggregatedValues
      
      return values || {}
    } catch (error) {
      console.error("Failed to parse disaggregated values:", error)
      return {}
    }
  }

  // Calculate total from disaggregated values
  function calculateDisaggregatedTotal(values: DisaggregationValue): number {
    return Object.values(values).reduce((sum, val) => sum + safeNumber(val), 0)
  }

  // Filter action plans based on user role and permissions
  const getUserFilteredPlans = () => {
    if (!safeUser.exists) return []

    const safePlans = actionPlans.filter(plan => plan && typeof plan === 'object')

    switch (safeUser.role) {
      case 'admin':
        return safePlans

      case 'stakeholder_admin':
      case 'stakeholder_user':
        if (safeUser.stakeholderId) {
          return safePlans.filter(plan => 
            plan.stakeholderId === safeUser.stakeholderId
          )
        }
        return []

      case 'subclusterfocalperson':
        if (safeUser.subClusterIds.length > 0) {
          return safePlans.filter(plan => 
            plan.subCluster && safeUser.subClusterIds.includes(plan.subCluster)
          )
        }
        return []

      default:
        return safePlans
    }
  }

  const userFilteredPlans = getUserFilteredPlans()

  const toggleExpand = (planId: string) => {
    setExpandedPlans(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }))
    if (expandedPlans[planId]) {
      setSelectedKpi(null)
      setEditingKpi(null)
      setEditingDisaggregation(null)
    }
  }

  const filteredPlans = userFilteredPlans.filter((plan) => {
    const title = safeString(plan.title).toLowerCase()
    const stakeholder = safeString(plan.stakeholder).toLowerCase()
    const status = safeString(plan.status).toLowerCase()
    const subCluster = safeString(plan.subCluster)

    const matchesSearch = title.includes(searchTerm.toLowerCase()) || stakeholder.includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || status === filterStatus
    const matchesSubCluster = filterSubCluster === "all" || subCluster === filterSubCluster

    return matchesSearch && matchesStatus && matchesSubCluster
  })

  const getSubClusterName = (subClusterId: string) => {
    if (!subClusterId) return 'Unknown Sub-Cluster'
    const subCluster = subClusters.find(sc => safeString(sc.id) === subClusterId)
    return subCluster ? safeString(subCluster.name) : safeString(subClusterId)
  }

  const getAvailableSubClusters = () => {
    if (!safeUser.exists) return []

    switch (safeUser.role) {
      case 'admin':
        return subClusters

      case 'subclusterfocalperson':
        return subClusters.filter(sc => safeUser.subClusterIds.includes(safeString(sc.id)))

      case 'stakeholder_admin':
      case 'stakeholder_user':
        const userOrgSubClusters = userFilteredPlans
          .map(plan => safeString(plan.subCluster))
          .filter((value, index, self) => value && self.indexOf(value) === index)
        return subClusters.filter(sc => userOrgSubClusters.includes(safeString(sc.id)))

      default:
        return subClusters
    }
  }

  const availableSubClusters = getAvailableSubClusters()

  const selectKpi = (actionPlanId: string, kpiPlanId: string) => {
    setSelectedKpi({ actionPlanId, kpiPlanId })
    setEditingKpi(null)
    setEditingDisaggregation(null)
  }

  const startEditingKpi = (actionPlanId: string, kpiPlanId: string, plannedValue: number) => {
    setEditingKpi({ actionPlanId, kpiPlanId, plannedValue })
    setEditingDisaggregation(null)
  }

  const cancelEditingKpi = () => {
    setEditingKpi(null)
  }

  const saveKpiEditing = async () => {
    if (!editingKpi || !token) return

    setSavingKpi(editingKpi.kpiPlanId)
    setError(null)
    
    try {
      await api.updateActionPlan(token, editingKpi.actionPlanId, {
        kpiPlans: [{
          id: editingKpi.kpiPlanId,
          plannedValue: editingKpi.plannedValue
        }]
      })
      
      setActionPlans(prev => prev.map(plan => 
        plan.id === editingKpi.actionPlanId 
          ? {
              ...plan,
              kpiPlans: plan.kpiPlans.map((kpiPlan: any) =>
                kpiPlan.id === editingKpi.kpiPlanId
                  ? { ...kpiPlan, plannedValue: editingKpi.plannedValue }
                  : kpiPlan
              )
            }
          : plan
      ))
      
      setEditingKpi(null)
      setSuccess('KPI target value updated successfully!')
    } catch (err) {
      console.error('Failed to update KPI plan', err)
      setError('Failed to update KPI target value. Please try again.')
    } finally {
      setSavingKpi(null)
    }
  }

  // Start editing disaggregation
  const startEditingDisaggregation = (actionPlanId: string, kpiPlanId: string, currentValues: DisaggregationValue) => {
    setEditingDisaggregation({
      actionPlanId,
      kpiPlanId,
      values: { ...currentValues }
    })
    setEditingKpi(null)
  }

  // Update disaggregation value
  const updateDisaggregationValue = (option: string, value: number) => {
    if (!editingDisaggregation) return
    
    setEditingDisaggregation({
      ...editingDisaggregation,
      values: {
        ...editingDisaggregation.values,
        [option]: value
      }
    })
  }

  // Save disaggregation values
  const saveDisaggregationEditing = async () => {
    if (!editingDisaggregation || !token) return

    setSavingKpi(editingDisaggregation.kpiPlanId)
    setError(null)
    
    try {
      await api.updateActionPlan(token, editingDisaggregation.actionPlanId, {
        kpiPlans: [{
          id: editingDisaggregation.kpiPlanId,
          disaggregatedValues: editingDisaggregation.values
        }]
      })
      
      setActionPlans(prev => prev.map(plan => 
        plan.id === editingDisaggregation.actionPlanId 
          ? {
              ...plan,
              kpiPlans: plan.kpiPlans.map((kpiPlan: any) =>
                kpiPlan.id === editingDisaggregation.kpiPlanId
                  ? { ...kpiPlan, disaggregatedValues: editingDisaggregation.values }
                  : kpiPlan
              )
            }
          : plan
      ))
      
      setEditingDisaggregation(null)
      setSuccess('Disaggregated values updated successfully!')
    } catch (err) {
      console.error('Failed to update disaggregated values', err)
      setError('Failed to update disaggregated values. Please try again.')
    } finally {
      setSavingKpi(null)
    }
  }

  const cancelEditingDisaggregation = () => {
    setEditingDisaggregation(null)
  }

  const confirmDelete = (plan: any) => {
    setPlanToDelete(plan)
  }

  const cancelDelete = () => {
    setPlanToDelete(null)
  }

  const deleteActionPlan = async () => {
    if (!planToDelete || !token) return

    setDeletingPlan(planToDelete.id)
    setError(null)
    
    try {
      await api.deleteActionPlan(token, planToDelete.id)
      
      setActionPlans(prev => prev.filter(plan => plan.id !== planToDelete.id))
      
      setPlanToDelete(null)
      setSuccess('Action plan deleted successfully!')
      
      setExpandedPlans(prev => {
        const newExpanded = { ...prev }
        delete newExpanded[planToDelete.id]
        return newExpanded
      })
    } catch (err) {
      console.error('Failed to delete action plan', err)
      setError('Failed to delete action plan. Please try again.')
    } finally {
      setDeletingPlan(null)
    }
  }

  const getSelectedKpiData = () => {
    if (!selectedKpi) return null
    
    const plan = actionPlans.find(p => p.id === selectedKpi.actionPlanId)
    if (!plan) return null
    
    const kpiPlan = plan.kpiPlans.find((kp: any) => kp.id === selectedKpi.kpiPlanId)
    return kpiPlan || null
  }

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading action plans...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <DeleteConfirmationModal
        isOpen={!!planToDelete}
        onClose={cancelDelete}
        onConfirm={deleteActionPlan}
        plan={planToDelete}
        isLoading={deletingPlan === planToDelete?.id}
      />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Action Plans</h1>
            <p className="text-muted-foreground">
              {safeUser.exists ? `Viewing plans for ${safeUser.displayName}` : 'Manage and monitor organizational action plans'}
            </p>
          </div>
          <Button onClick={onCreateNew} disabled={!safeUser.exists}>
            <Plus className="mr-2 h-4 w-4" />
            New Action Plan
          </Button>
        </div>

        {/* Success Message */}
        {success && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">{success}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSuccess(null)}
                  className="ml-auto text-green-700 hover:text-green-800 hover:bg-green-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-700 hover:text-red-800 hover:bg-red-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Plans</p>
                  <p className="text-2xl font-bold mt-1">{userFilteredPlans.length}</p>
                </div>
                <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">On Track</p>
                  <p className="text-2xl font-bold mt-1">
                    {userFilteredPlans.filter(p => safeNumber(p.progress) >= 75).length}
                  </p>
                </div>
                <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold mt-1">
                    {userFilteredPlans.filter(p => safeString(p.status).toLowerCase() === 'completed').length}
                  </p>
                </div>
                <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1 w-full">
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search action plans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="flex-1 sm:flex-none">
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="All status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {availableSubClusters.length > 0 && (
                  <div className="flex-1 sm:flex-none">
                    <label className="text-sm font-medium mb-2 block">Sub-cluster</label>
                    <Select value={filterSubCluster} onValueChange={setFilterSubCluster}>
                      <SelectTrigger className="w-full sm:w-[160px]">
                        <SelectValue placeholder="All clusters" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All clusters</SelectItem>
                        {availableSubClusters.map(sc => (
                          <SelectItem key={safeString(sc.id)} value={safeString(sc.id)}>
                            {safeString(sc.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Plans */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Action Plans <span className="text-muted-foreground">({filteredPlans.length})</span>
            </h2>
            {safeUser.exists && (
              <Badge variant="outline">
                {safeUser.displayName}
              </Badge>
            )}
          </div>

          {filteredPlans.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No action plans found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || filterStatus !== "all" || filterSubCluster !== "all"
                    ? "Try adjusting your search or filters"
                    : safeUser.role !== 'admin' 
                      ? "No action plans available for your access level"
                      : "Get started by creating your first action plan"}
                </p>
                <Button onClick={onCreateNew} disabled={!safeUser.exists}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Action Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredPlans.map((plan) => {
                const isExpanded = expandedPlans[safeString(plan.id)]
                const progress = safeNumber(plan.progress)
                const planKpiPlans = plan.kpiPlans || []
                const selectedKpiData = selectedKpi?.actionPlanId === plan.id ? getSelectedKpiData() : null

                return (
                  <Card key={safeString(plan.id)} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div 
                        className="p-6 cursor-pointer hover:bg-muted/5 transition-colors"
                        onClick={() => toggleExpand(safeString(plan.id))}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center gap-2 mt-1">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-2">
                                    <h3 className="font-semibold text-base leading-tight">
                                      {safeString(plan.title, 'Untitled Action Plan')}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                      <div className="flex items-center gap-1">
                                        <Building className="h-4 w-4" />
                                        <span>{safeString(plan.stakeholder, 'Unknown Organization')}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        <span>{safeString(plan.location, 'Unknown Location')}</span>
                                      </div>
                                      {plan.subClusterName && (
                                        <div className="flex items-center gap-1">
                                          <Badge variant="outline" className="text-xs">
                                            {safeString(plan.subClusterName)}
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toggleExpand(safeString(plan.id)); }}>
                                          <Eye className="mr-2 h-4 w-4" />
                                          {isExpanded ? 'Collapse' : 'Expand'} details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                          <Edit className="mr-2 h-4 w-4" />
                                          Edit plan
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          className="text-destructive" 
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            confirmDelete(plan)
                                          }}
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete plan
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                  <div className="flex items-center justify-between text-sm flex-wrap gap-2">
                                    <div className="flex items-center gap-4">
                                      <span className="font-medium">{progress}% complete</span>
                                      <span className="text-muted-foreground">
                                        {planKpiPlans.length} KPI{planKpiPlans.length !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <Calendar className="h-4 w-4" />
                                      <span>
                                        Created: {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                  <Progress value={progress} className="h-2" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="border-t bg-muted/10 p-6">
                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* Left Sidebar - KPI List */}
                            <div className="lg:w-1/3 space-y-4">
                              <h4 className="font-semibold flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                KPI Targets ({planKpiPlans.length})
                              </h4>
                              <div className="space-y-2">
                                {planKpiPlans.map((kpiPlan: any) => (
                                  <div
                                    key={kpiPlan.id}
                                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                      selectedKpi?.kpiPlanId === kpiPlan.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:bg-gray-50'
                                    }`}
                                    onClick={() => selectKpi(plan.id, kpiPlan.id)}
                                  >
                                    <h5 className="font-medium text-sm">
                                      {safeString(kpiPlan.kpi?.name, 'Unknown KPI')}
                                    </h5>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-xs text-muted-foreground">
                                        Target: {safeNumber(kpiPlan.plannedValue)} {safeString(kpiPlan.kpi?.unit)}
                                      </span>
                                      <Edit className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Right Panel - KPI Details */}
                            <div className="lg:w-2/3">
                              {selectedKpiData ? (
                                <Card className="border-l-4 border-l-blue-500">
                                  <CardContent className="p-6">
                                    <div className="space-y-6">
                                      {/* KPI Header */}
                                      <div className="space-y-2">
                                        <h5 className="font-semibold text-lg">
                                          {safeString(selectedKpiData.kpi?.name, 'Unknown KPI')}
                                        </h5>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                          <span>Unit: {safeString(selectedKpiData.kpi?.unit, 'N/A')}</span>
                                        </div>
                                        {selectedKpiData.kpi?.description && (
                                          <p className="text-sm text-muted-foreground">
                                            {safeString(selectedKpiData.kpi?.description)}
                                          </p>
                                        )}
                                      </div>

                                      {/* Planned Target Value Section */}
                                      <div className="space-y-3 pb-4 border-b">
                                        <div className="flex items-center justify-between">
                                          <label className="text-sm font-medium">
                                            Planned Target Value *
                                          </label>
                                        </div>
                                        
                                        {editingKpi?.actionPlanId === plan.id && editingKpi.kpiPlanId === selectedKpiData.id ? (
                                          <div className="space-y-3">
                                            <Input
                                              type="number"
                                              value={editingKpi.plannedValue}
                                              onChange={(e) => setEditingKpi({...editingKpi, plannedValue: Number(e.target.value)})}
                                              placeholder="Enter target number"
                                              className="w-full max-w-xs"
                                            />
                                            <div className="flex gap-2">
                                              <Button 
                                                size="sm" 
                                                onClick={saveKpiEditing}
                                                disabled={savingKpi === selectedKpiData.id}
                                              >
                                                {savingKpi === selectedKpiData.id ? (
                                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                ) : (
                                                  <Save className="h-4 w-4" />
                                                )}
                                              </Button>
                                              <Button size="sm" variant="outline" onClick={cancelEditingKpi}>
                                                <X className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div 
                                            className="flex items-center justify-between p-3 border rounded-lg bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors group max-w-xs"
                                            onClick={() => startEditingKpi(plan.id, selectedKpiData.id, safeNumber(selectedKpiData.plannedValue))}
                                          >
                                            <div className="flex items-center gap-2">
                                              <span className="text-xl font-bold">
                                                {safeNumber(selectedKpiData.plannedValue)}
                                              </span>
                                              <span className="text-sm text-muted-foreground">
                                                {safeString(selectedKpiData.kpi?.unit)}
                                              </span>
                                            </div>
                                            <Edit className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                          </div>
                                        )}
                                      </div>

                                      {/* Disaggregated Targets Section */}
                                      {(() => {
                                        const disaggregations = parseDisaggregation(selectedKpiData.kpi)
                                        const currentValues = getDisaggregationValues(selectedKpiData)
                                        const isEditingDisagg = editingDisaggregation?.actionPlanId === plan.id && 
                                                               editingDisaggregation.kpiPlanId === selectedKpiData.id

                                        if (disaggregations.length === 0) {
                                          return (
                                            <div className="text-sm text-muted-foreground italic py-4">
                                              No disaggregations defined for this KPI
                                            </div>
                                          )
                                        }

                                        return (
                                          <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                              <label className="text-sm font-medium">
                                                Disaggregated Targets (Optional)
                                              </label>
                                              {!isEditingDisagg && Object.keys(currentValues).length > 0 && (
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() => startEditingDisaggregation(plan.id, selectedKpiData.id, currentValues)}
                                                >
                                                  <Edit className="h-4 w-4 mr-1" />
                                                  Edit
                                                </Button>
                                              )}
                                            </div>
                                            
                                            {disaggregations.map((disagg, idx) => (
                                              <div key={idx} className="space-y-3 p-4 border rounded-lg bg-muted/10">
                                                <h6 className="font-medium text-sm">{disagg.name}</h6>
                                                
                                                {isEditingDisagg ? (
                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {disagg.options.map((option) => (
                                                      <div key={option} className="space-y-2">
                                                        <label className="text-sm font-medium">{option}</label>
                                                        <Input
                                                          type="number"
                                                          value={editingDisaggregation?.values[option] || 0}
                                                          onChange={(e) => updateDisaggregationValue(option, Number(e.target.value))}
                                                          placeholder="Enter number"
                                                          className="w-full"
                                                        />
                                                      </div>
                                                    ))}
                                                  </div>
                                                ) : (
                                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {disagg.options.map((option) => (
                                                      <div key={option} className="flex items-center justify-between p-2 border rounded bg-background">
                                                        <span className="text-sm">{option}</span>
                                                        <Badge variant="secondary">
                                                          {safeNumber(currentValues[option])}
                                                        </Badge>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            ))}

                                            {isEditingDisagg && (
                                              <div className="flex gap-2 pt-2">
                                                <Button 
                                                  size="sm" 
                                                  onClick={saveDisaggregationEditing}
                                                  disabled={savingKpi === selectedKpiData.id}
                                                >
                                                  {savingKpi === selectedKpiData.id ? (
                                                    <>
                                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                      Saving...
                                                    </>
                                                  ) : (
                                                    <>
                                                      <Save className="h-4 w-4 mr-2" />
                                                      Save Changes
                                                    </>
                                                  )}
                                                </Button>
                                                <Button 
                                                  size="sm" 
                                                  variant="outline" 
                                                  onClick={cancelEditingDisaggregation}
                                                >
                                                  Cancel
                                                </Button>
                                              </div>
                                            )}

                                            {!isEditingDisagg && Object.keys(currentValues).length === 0 && (
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => startEditingDisaggregation(plan.id, selectedKpiData.id, {})}
                                                className="w-full"
                                              >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Disaggregated Values
                                              </Button>
                                            )}

                                            {Object.keys(currentValues).length > 0 && (
                                              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <span className="text-sm font-medium">Total Disaggregated:</span>
                                                <Badge variant="default">
                                                  {calculateDisaggregatedTotal(currentValues)} {safeString(selectedKpiData.kpi?.unit)}
                                                </Badge>
                                              </div>
                                            )}
                                          </div>
                                        )
                                      })()}
                                    </div>
                                  </CardContent>
                                </Card>
                              ) : (
                                <Card>
                                  <CardContent className="p-12 text-center">
                                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Select a KPI</h3>
                                    <p className="text-muted-foreground">
                                      Click on a KPI from the list to view and edit its details
                                    </p>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-4 border-t mt-6">
                            <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Full Plan
                            </Button>
                            <Button size="sm" onClick={(e) => e.stopPropagation()}>
                              <TrendingUp className="mr-2 h-4 w-4" />
                              Update Progress
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}