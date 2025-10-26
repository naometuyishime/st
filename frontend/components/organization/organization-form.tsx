import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Search, ChevronRight, ChevronDown, Loader2 } from "lucide-react"
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"

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
  stakeholderDistricts?: any[]
  stakeholderSubClusters?: any[]
}

interface FormProps {
  organization?: Organization // Add this optional prop for editing
  onClose: () => void
  onSubmit: (organizationData: any) => void
}

// Implementation level options
const implementationLevels = [
  { value: 'national', label: 'National Level' },
  { value: 'province', label: 'Province Level' },
  { value: 'district', label: 'District Level' }
]

function ProvinceTreeItem({ province, formData, toggleDistrict, setFormData, implementationLevel }: any) {
  const [isExpanded, setIsExpanded] = useState(false)
  const provinceDistricts = (province?.districts as any[]) || []
  
  // Only show districts if implementation level is district
  const shouldShowDistricts = implementationLevel === 'district'
  
  const allDistrictsSelected = provinceDistricts.every((district: any) =>
    formData.selectedDistricts.includes(district.id)
  )
  const someDistrictsSelected = provinceDistricts.some((district: any) =>
    formData.selectedDistricts.includes(district.id)
  )

  const handleToggleAll = () => {
    if (allDistrictsSelected) {
      setFormData({
        ...formData,
        selectedDistricts: formData.selectedDistricts.filter(
          (id: string) => !provinceDistricts.some((d: any) => d.id === id)
        )
      })
    } else {
      setFormData({
        ...formData,
        selectedDistricts: [
          ...formData.selectedDistricts,
          ...provinceDistricts.filter((d: any) => !formData.selectedDistricts.includes(d.id)).map((d: any) => d.id)
        ]
      })
    }
  }

  const handleToggleProvince = () => {
    if (shouldShowDistricts) {
      handleToggleAll()
    } else {
      // For province level, select all districts in the province
      if (formData.selectedProvinces.includes(province.id)) {
        setFormData({
          ...formData,
          selectedProvinces: formData.selectedProvinces.filter((id: string) => id !== province.id),
          selectedDistricts: formData.selectedDistricts.filter(
            (id: string) => !provinceDistricts.some((d: any) => d.id === id)
          )
        })
      } else {
        setFormData({
          ...formData,
          selectedProvinces: [...formData.selectedProvinces, province.id],
          selectedDistricts: [
            ...formData.selectedDistricts,
            ...provinceDistricts.map((d: any) => d.id)
          ]
        })
      }
    }
  }

  // Check if province is selected (for province level)
  const isProvinceSelected = formData.selectedProvinces.includes(province.id)

  return (
    <div className="border-b last:border-b-0">
      <div className="flex items-center hover:bg-muted/50 transition-colors">
        {shouldShowDistricts && (
          <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="p-3 hover:bg-muted transition-colors">
            {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </button>
        )}
        <div className="flex items-center space-x-2 flex-1 py-3">
          <input 
            type="checkbox" 
            id={`province-tree-${province.id}`} 
            checked={shouldShowDistricts ? allDistrictsSelected : isProvinceSelected}
            ref={(input) => { 
              if (input && shouldShowDistricts) { 
                input.indeterminate = someDistrictsSelected && !allDistrictsSelected 
              } 
            }}
            onChange={handleToggleProvince} 
            className="rounded border-border" 
          />
          <Label htmlFor={`province-tree-${province.id}`} className="text-sm font-medium cursor-pointer flex-1">
            {province.name}
          </Label>
          {shouldShowDistricts && (
            <span className="text-xs text-muted-foreground pr-3">{provinceDistricts.length} districts</span>
          )}
        </div>
      </div>
      {shouldShowDistricts && isExpanded && (
        <div className="bg-muted/20">
          {provinceDistricts.map((district: any) => (
            <div key={district.id} className="flex items-center space-x-2 py-2 px-3 pl-12 hover:bg-muted/50 transition-colors">
              <input 
                type="checkbox" 
                id={`district-tree-${district.id}`}
                checked={formData.selectedDistricts.includes(district.id)}
                onChange={() => toggleDistrict(district.id)} 
                className="rounded border-border" 
              />
              <Label htmlFor={`district-tree-${district.id}`} className="text-sm cursor-pointer flex-1">
                {district.name}
              </Label>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function AddOrganizationForm({ organization, onClose, onSubmit }: FormProps) {
  const { token } = useAuth()
  const [provinces, setProvinces] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [subClusters, setSubClusters] = useState<any[]>([])
  const [stakeholderCategories, setStakeholderCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Use the organization prop to initialize formData for editing
  const [formData, setFormData] = useState<any>({ 
    organizationName: organization?.organizationName || '',
    stakeholderCategoryId: organization?.stakeholderCategoryId || '',
    implementationLevel: organization?.implementationLevel || '',
    selectedProvinces: [],
    selectedDistricts: organization?.stakeholderDistricts?.map((sd: any) => sd.districtId.toString()) || [], 
    subClusters: organization?.stakeholderSubClusters?.map((ssc: any) => ssc.subClusterId.toString()) || []
  })

  // Update the form title based on whether we're adding or editing
  const formTitle = organization ? "Edit Organization" : "Create New Organization"
  const submitButtonText = organization ? "Update Organization" : "Create Organization"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    
    try {
      // Prepare organization data based on implementation level
      let geographicData = {}
      
      if (formData.implementationLevel === 'national') {
        // For national level, select all districts
        geographicData = {
          selectedProvinces: provinces.map(p => p.id),
          selectedDistricts: districts.map(d => d.id)
        }
      } else if (formData.implementationLevel === 'province') {
        // For province level, use selected provinces and all their districts
        geographicData = {
          selectedProvinces: formData.selectedProvinces,
          selectedDistricts: formData.selectedDistricts
        }
      } else if (formData.implementationLevel === 'district') {
        // For district level, use selected districts
        geographicData = {
          selectedProvinces: [...new Set(formData.selectedDistricts.map((districtId: string) => {
            const district = districts.find(d => d.id === districtId)
            return district?.provinceId
          }).filter(Boolean))],
          selectedDistricts: formData.selectedDistricts
        }
      }

      const organizationPayload = {
        organizationName: formData.organizationName,
        stakeholderCategoryId: formData.stakeholderCategoryId,
        implementationLevel: formData.implementationLevel,
        districts: formData.implementationLevel === 'national' 
          ? districts.map(d => d.id) 
          : formData.selectedDistricts,
        subClusters: formData.subClusters.map((id: string) => Number(id)), // Ensure numbers
      }

      console.log("Organization payload:", organizationPayload)

      if (!token) {
        throw new Error("Authentication token is required")
      }

      let result
      if (organization) {
        // Update existing organization
        result = await api.updateStakeholder(token, organization.id, organizationPayload)
        console.log("Stakeholder updated:", result)
      } else {
        // Create new organization
        result = await api.createStakeholder(token, organizationPayload)
        console.log("Stakeholder created:", result)
      }
      
      // Call the onSubmit callback with the organization data
      onSubmit(result)
      
    } catch (error) {
      console.error("Failed to create/update organization:", error)
      setError(`Failed to ${organization ? 'update' : 'create'} organization: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleSubCluster = (clusterId: string) => {
    setFormData({ 
      ...formData, 
      subClusters: formData.subClusters.includes(clusterId) 
        ? formData.subClusters.filter((id: string) => id !== clusterId) 
        : [...formData.subClusters, clusterId] 
    })
  }

  const toggleDistrict = (districtId: string) => {
    setFormData({ 
      ...formData, 
      selectedDistricts: formData.selectedDistricts.includes(districtId) 
        ? formData.selectedDistricts.filter((id: string) => id !== districtId) 
        : [...formData.selectedDistricts, districtId] 
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    if (error) setError(null)
  }

  const handleSelectChange = (field: string, value: string) => {
    if (field === 'implementationLevel') {
      setFormData({ 
        ...formData, 
        [field]: value,
        selectedProvinces: [],
        selectedDistricts: [] 
      })
    } else {
      setFormData({ ...formData, [field]: value })
    }
    if (error) setError(null)
  }

  useEffect(() => {
    let mounted = true
    
    const loadData = async () => {
      if (!token) {
        console.log("No token available, skipping data load")
        return
      }
      
      try {
        setLoading(true)
        setError(null)
        
        console.log("Starting data load with token:", token ? "Token exists" : "No token")
        
        // Load provinces and districts first (they don't need token)
        const [provRes, distRes] = await Promise.all([
          api.getProvinces().catch(err => {
            console.error("Failed to load provinces:", err)
            return []
          }),
          api.getDistricts().catch(err => {
            console.error("Failed to load districts:", err)
            return []
          })
        ])
        
        if (!mounted) return
        
        setProvinces(provRes || [])
        setDistricts(distRes || [])
        
        // Now load token-dependent data
        try {
          const [clustersRes, categoriesRes] = await Promise.all([
            api.getSubClusters(token).catch(err => {
              console.error("Failed to load sub-clusters:", err)
              return []
            }),
            api.getStakeholderCategories().catch(err => {
              console.error("Failed to load stakeholder categories:", err)
              console.error("Categories error details:", err.message)
              return []
            })
          ])
          
          if (!mounted) return
          
          setSubClusters(clustersRes || [])
          setStakeholderCategories(categoriesRes || [])
          
          console.log("Data loaded successfully:", {
            provinces: provRes?.length || 0,
            districts: distRes?.length || 0,
            subClusters: clustersRes?.length || 0,
            categories: categoriesRes?.length || 0
          })
          
        } catch (tokenDependentError) {
          console.error("Failed to load token-dependent data:", tokenDependentError)
          if (!mounted) return
          setSubClusters([])
          setStakeholderCategories([])
        }
        
      } catch (err) {
        console.error("Failed to load data:", err)
        if (!mounted) return
        setError("Failed to load required data. Please try again.")
        setProvinces([])
        setDistricts([])
        setSubClusters([])
        setStakeholderCategories([])
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    
    // Add a small delay to ensure token is ready
    const timer = setTimeout(() => {
      loadData()
    }, 100)
    
    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [token])

  const districtsByProvince = provinces.map(province => ({
    ...province, 
    districts: districts.filter(district => district.provinceId === province.id)
  }))

  // Filter provinces and districts based on search term
  const filteredProvinces = districtsByProvince.filter(province => 
    province.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    province.districts.some((district: any) => 
      district.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{formTitle}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          {loading && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-blue-700 text-sm">Loading organization data...</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="adminLevel" disabled={!formData.stakeholderCategoryId}>
                  Implementation level
                </TabsTrigger>
                <TabsTrigger value="subClusters" disabled={!formData.implementationLevel}>
                  Sub-Clusters
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name *</Label>
                  <Input 
                    id="organizationName" 
                    value={formData.organizationName} 
                    onChange={(e) => handleInputChange('organizationName', e.target.value)} 
                    placeholder="Enter organization name" 
                    required 
                    disabled={submitting || loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stakeholderCategory">Stakeholder Category *</Label>
                  <Select
                    value={formData.stakeholderCategoryId}
                    onValueChange={(value) => handleSelectChange('stakeholderCategoryId', value)}
                    disabled={loading || submitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        loading ? "Loading categories..." : 
                        stakeholderCategories.length === 0 ? "No categories available" : 
                        "Select category"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {stakeholderCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                      {stakeholderCategories.length === 0 && !loading && (
                        <SelectItem value="no-categories" disabled>
                          No categories available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {stakeholderCategories.length === 0 && !loading && (
                    <p className="text-sm text-amber-600">
                      No stakeholder categories available. Please check your connection or contact support.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="adminLevel" className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="implementationLevel">Implementation Level *</Label>
                    <Select
                      value={formData.implementationLevel}
                      onValueChange={(value) => handleSelectChange('implementationLevel', value)}
                      disabled={submitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select implementation level" />
                      </SelectTrigger>
                      <SelectContent>
                        {implementationLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.implementationLevel && (
                    <>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">Implementation Areas</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Implementation Areas *</Label>
                          <p className="text-sm text-muted-foreground">
                            {formData.implementationLevel === 'national' 
                              ? 'Organization will work at national level (all districts automatically selected)'
                              : formData.implementationLevel === 'province'
                              ? 'Select the provinces where this organization will work'
                              : 'Select the specific districts where this organization will work'
                            }
                          </p>
                        </div>
                        
                        {formData.implementationLevel !== 'national' && (
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                              placeholder="Search provinces or districts..." 
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)} 
                              className="pl-9" 
                              disabled={submitting}
                            />
                          </div>
                        )}

                        {formData.implementationLevel === 'national' ? (
                          <div className="p-4 border rounded-lg bg-muted/20">
                            <p className="text-sm text-muted-foreground">
                              All provinces and districts in Rwanda will be selected for national level implementation.
                            </p>
                            <div className="mt-2 text-sm">
                              <strong>Provinces:</strong> {provinces.length}<br />
                              <strong>Districts:</strong> {districts.length}
                            </div>
                          </div>
                        ) : (
                          <div className="border rounded-lg max-h-96 overflow-y-auto">
                            {filteredProvinces.map((province) => (
                              <ProvinceTreeItem 
                                key={province.id} 
                                province={province} 
                                formData={formData}
                                toggleDistrict={toggleDistrict} 
                                setFormData={setFormData}
                                implementationLevel={formData.implementationLevel}
                              />
                            ))}
                            {filteredProvinces.length === 0 && (
                              <div className="p-4 text-center text-muted-foreground">
                                {provinces.length === 0 ? 'No provinces loaded' : 'No provinces or districts found matching your search.'}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="subClusters" className="space-y-4">
                <div className="space-y-2">
                  <Label>Sub-Clusters *</Label>
                  <p className="text-sm text-muted-foreground">
                    Select the sub-clusters this organization will work in
                  </p>
                  {loading ? (
                    <div className="border rounded-lg p-4 text-center text-muted-foreground flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading sub-clusters...
                    </div>
                  ) : (
                    <div className="space-y-2 border rounded-lg p-4">
                      {subClusters.map((cluster) => (
                        <div key={cluster.id} className="flex items-center space-x-2 py-2 hover:bg-muted/50 rounded px-2 transition-colors">
                          <input 
                            type="checkbox" 
                            id={cluster.id} 
                            checked={formData.subClusters.includes(cluster.id.toString())}
                            onChange={() => toggleSubCluster(cluster.id.toString())} 
                            className="rounded border-border" 
                            disabled={submitting}
                          />
                          <Label htmlFor={cluster.id} className="text-sm cursor-pointer flex-1">
                            {cluster.name}
                          </Label>
                        </div>
                      ))}
                      {subClusters.length === 0 && !loading && (
                        <div className="text-center text-amber-600 py-4">
                          No sub-clusters available. Please check your connection.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={
                  submitting || 
                  loading ||
                  !formData.organizationName || 
                  !formData.stakeholderCategoryId || 
                  !formData.implementationLevel || 
                  formData.subClusters.length === 0
                }
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {organization ? "Updating..." : "Creating..."}
                  </>
                ) : submitButtonText}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}