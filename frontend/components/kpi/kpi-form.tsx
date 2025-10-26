"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Plus, Target, Trash2, Loader2, ChevronDown, ChevronRight, Save, Package } from "lucide-react"
import { useKpi } from "@/contexts/kpi-context"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"

interface Option {
  id: string
  name: string
}

interface OptionSet {
  id: string
  name: string
  options: Option[]
}

interface Disaggregate {
  id: string
  name: string
  options: string[]
  optionSetId?: string
  allOptionsSelected?: boolean
}

interface FormProps {
  onClose: () => void
  onSuccess: () => void
}

export function KpiForm({ onClose, onSuccess }: FormProps) {
  const { user, token } = useAuth()
  const { subClusters, categories: kpiCategories, refresh } = useKpi()
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    unit: "",
    subCluster: "",
    category: "",
    stakeholderCategory: "",
  })

  const [disaggregates, setDisaggregates] = useState<Disaggregate[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stakeholderCategories, setStakeholderCategories] = useState<any[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [optionSets, setOptionSets] = useState<OptionSet[]>([])
  const [isLoadingOptionSets, setIsLoadingOptionSets] = useState(false)
  const [expandedOptionSets, setExpandedOptionSets] = useState<Set<string>>(new Set())
  
  // State for creating new option set
  const [showCreateOptionSet, setShowCreateOptionSet] = useState(false)
  const [newOptionSet, setNewOptionSet] = useState({
    name: "",
    description: "",
    options: ""
  })
  const [isCreatingOptionSet, setIsCreatingOptionSet] = useState(false)

  // State for adding options to existing option set
  const [addingOptionsTo, setAddingOptionsTo] = useState<string | null>(null)
  const [newOptionsForSet, setNewOptionsForSet] = useState("")

  // Fetch stakeholder categories
  useEffect(() => {
    const fetchStakeholderCategories = async () => {
      setIsLoadingCategories(true)
      try {
        const categories = token 
          ? await api.getStakeholderCategories(token)
          : await api.getStakeholderCategories()
        setStakeholderCategories(categories || [])
      } catch (error) {
        console.error("Failed to fetch stakeholder categories:", error)
        setStakeholderCategories([
          { id: "implementing", name: "Implementing Partner" },
          { id: "developing", name: "Developing Partner" }
        ])
      } finally {
        setIsLoadingCategories(false)
      }
    }
    fetchStakeholderCategories()
  }, [token])

  // Fetch option sets
  const fetchOptionSets = async () => {
    setIsLoadingOptionSets(true)
    try {
      const optionSetsData = token 
        ? await api.getOptionSets(token)
        : await api.getOptionSets()

      if (optionSetsData && optionSetsData.length > 0) {
        const optionSetsWithOptions = await Promise.all(
          optionSetsData.map(async (set: any) => {
            try {
              const options = await api.getOptionsBySet(set.id, (token || undefined))
              return {
                id: set.id,
                name: set.name,
                options: options || []
              }
            } catch (error) {
              return {
                id: set.id,
                name: set.name,
                options: []
              }
            }
          })
        )
        setOptionSets(optionSetsWithOptions)
      }
    } catch (error) {
      console.error("Failed to fetch option sets:", error)
      setOptionSets([])
    } finally {
      setIsLoadingOptionSets(false)
    }
  }

  useEffect(() => {
    fetchOptionSets()
  }, [token])

  const filteredCategories = formData.subCluster
    ? kpiCategories.filter(cat => String(cat.subClusterId) === String(formData.subCluster))
    : []

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setError(null)

    if (!token) {
      setError("You must be logged in to create a KPI")
      return
    }

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'))
      return
    }

    setIsSubmitting(true)

    try {
      const kpiData = {
        name: formData.title,
        description: formData.description,
        subClusterId: formData.subCluster,
        kpiCategoryId: formData.category,
        stakeholderCategoryId: formData.stakeholderCategory,
        unit: formData.unit,
        targetValue: 0,
        currentValue: 0,
        disaggregation: disaggregates.map(d => ({
          name: d.name,
          options: d.options
        }))
      }

      const result = await api.createKPI(token, kpiData)
      await refresh()
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to create KPI:', error)
      setError(`Failed to create KPI: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const validateForm = (): string[] => {
    const errors: string[] = []
    if (!formData.title.trim()) errors.push('KPI title is required')
    if (!formData.stakeholderCategory) errors.push('Stakeholder category is required')
    if (!formData.subCluster) errors.push('Sub-cluster is required')
    if (!formData.category) errors.push('KPI category is required')
    if (!formData.unit.trim()) errors.push('Unit is required')
    return errors
  }

  const createNewOptionSet = async () => {
    if (!token) {
      setError("You must be logged in to create an option set")
      return
    }

    if (!newOptionSet.name.trim() || !newOptionSet.options.trim()) {
      setError("Please provide option set name and at least one option")
      return
    }

    setIsCreatingOptionSet(true)
    setError(null)

    try {
      // Create the option set
      const optionSetResult = await api.createOptionSet(token, {
        name: newOptionSet.name.trim(),
        description: newOptionSet.description.trim()
      })

      console.log("Created option set:", optionSetResult)

      // Parse and create options
      const optionNames = newOptionSet.options
        .split(",")
        .map(opt => opt.trim())
        .filter(opt => opt.length > 0)

      // Create each option - convert ID to number
      const optionSetId = Number(optionSetResult.id)
      
      for (const optionName of optionNames) {
        try {
          await api.createOption(token, {
            optionSetId: optionSetId,
            name: optionName
          })
        } catch (optError) {
          console.error(`Failed to create option "${optionName}":`, optError)
          // Continue with other options even if one fails
        }
      }

      // Refresh option sets list
      await fetchOptionSets()

      // Reset form
      setNewOptionSet({ name: "", description: "", options: "" })
      setShowCreateOptionSet(false)

      // Show success message
      setError(null)
    } catch (error) {
      console.error("Failed to create option set:", error)
      setError(`Failed to create option set: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCreatingOptionSet(false)
    }
  }

  const addOptionsToExistingSet = async (optionSetId: string) => {
    if (!token) {
      setError("You must be logged in to add options")
      return
    }

    if (!newOptionsForSet.trim()) {
      setError("Please enter at least one option")
      return
    }

    setIsCreatingOptionSet(true)
    setError(null)

    try {
      const optionNames = newOptionsForSet
        .split(",")
        .map(opt => opt.trim())
        .filter(opt => opt.length > 0)

      for (const optionName of optionNames) {
        await api.createOption(token, {
          optionSetId: Number(optionSetId),
          name: optionName
        })
      }

      await fetchOptionSets()
      setNewOptionsForSet("")
      setAddingOptionsTo(null)
      setError(null)
    } catch (error) {
      console.error("Failed to add options:", error)
      setError(`Failed to add options: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCreatingOptionSet(false)
    }
  }

  const toggleOptionSet = (optionSetId: string) => {
    setExpandedOptionSets(prev => {
      const newSet = new Set(prev)
      if (newSet.has(optionSetId)) {
        newSet.delete(optionSetId)
      } else {
        newSet.add(optionSetId)
      }
      return newSet
    })
  }

  const handleOptionSetSelect = (optionSet: OptionSet, selected: boolean) => {
    setDisaggregates(prev => {
      if (selected) {
        return [
          ...prev.filter(d => d.optionSetId !== optionSet.id),
          {
            id: Date.now().toString(),
            name: optionSet.name,
            options: optionSet.options.map(opt => opt.name),
            optionSetId: optionSet.id,
            allOptionsSelected: true
          }
        ]
      } else {
        return prev.filter(d => d.optionSetId !== optionSet.id)
      }
    })
  }

  const handleOptionSelect = (optionSet: OptionSet, option: Option, selected: boolean) => {
    setDisaggregates(prev => {
      const existingIndex = prev.findIndex(d => d.optionSetId === optionSet.id)
      
      if (selected) {
        if (existingIndex >= 0) {
          const updated = [...prev]
          if (!updated[existingIndex].options.includes(option.name)) {
            updated[existingIndex].options.push(option.name)
            updated[existingIndex].allOptionsSelected = 
              updated[existingIndex].options.length === optionSet.options.length
          }
          return updated
        } else {
          return [
            ...prev,
            {
              id: Date.now().toString(),
              name: optionSet.name,
              options: [option.name],
              optionSetId: optionSet.id,
              allOptionsSelected: false
            }
          ]
        }
      } else {
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex].options = updated[existingIndex].options.filter(
            opt => opt !== option.name
          )
          updated[existingIndex].allOptionsSelected = false
          
          if (updated[existingIndex].options.length === 0) {
            return updated.filter((_, i) => i !== existingIndex)
          }
          return updated
        }
      }
      return prev
    })
  }

  const isOptionSetSelected = (optionSetId: string): boolean => {
    const disaggregate = disaggregates.find(d => d.optionSetId === optionSetId)
    return disaggregate ? disaggregate.allOptionsSelected || false : false
  }

  const isOptionSetPartial = (optionSetId: string): boolean => {
    const disaggregate = disaggregates.find(d => d.optionSetId === optionSetId)
    return disaggregate ? !disaggregate.allOptionsSelected && disaggregate.options.length > 0 : false
  }

  const isOptionSelected = (optionSetId: string, optionName: string): boolean => {
    const disaggregate = disaggregates.find(d => d.optionSetId === optionSetId)
    return disaggregate ? disaggregate.options.includes(optionName) : false
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between shrink-0 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Create New KPI</CardTitle>
              <CardDescription>Define key performance indicators and disaggregation</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-0 flex flex-col flex-1 min-h-0">
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-red-700 text-sm font-medium whitespace-pre-line">{error}</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-8">
              {/* Categorization Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="h-8 w-1 bg-blue-500 rounded"></div>
                  <h3 className="text-lg font-semibold">Categorization</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      Stakeholder Category 
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.stakeholderCategory}
                      onValueChange={(value) => handleInputChange('stakeholderCategory', value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {stakeholderCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      Sub-Cluster 
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.subCluster}
                      onValueChange={(value) => setFormData({ ...formData, subCluster: value, category: "" })}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select sub-cluster" />
                      </SelectTrigger>
                      <SelectContent>
                        {subClusters.map((cluster) => (
                          <SelectItem key={cluster.id} value={cluster.id}>
                            {cluster.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      KPI Category 
                      <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                      disabled={!formData.subCluster || isSubmitting}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder={formData.subCluster ? "Select category" : "Select sub-cluster first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Basic Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <div className="h-8 w-1 bg-green-500 rounded"></div>
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      KPI Title 
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter KPI title"
                      disabled={isSubmitting}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="KPI description"
                      rows={3}
                      disabled={isSubmitting}
                      className="resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      Unit 
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.unit}
                      onChange={(e) => handleInputChange('unit', e.target.value)}
                      placeholder="e.g., people, %, number"
                      disabled={isSubmitting}
                      className="h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Disaggregates Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-1 bg-purple-500 rounded"></div>
                    <h3 className="text-lg font-semibold">Disaggregates</h3>
                  </div>
                  <Badge variant="secondary" className="text-xs">Optional</Badge>
                </div>

                {/* Create New Option Set */}
                <Card className="border-2 border-dashed border-purple-200 bg-purple-50/30">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-purple-600" />
                        <CardTitle className="text-base">Create New Option Set</CardTitle>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={showCreateOptionSet ? "ghost" : "default"}
                        onClick={() => setShowCreateOptionSet(!showCreateOptionSet)}
                        disabled={isCreatingOptionSet}
                      >
                        {showCreateOptionSet ? (
                          <>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            Create New
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  {showCreateOptionSet && (
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm">Option Set Name *</Label>
                          <Input
                            placeholder="e.g., Age Group, Gender"
                            value={newOptionSet.name}
                            onChange={(e) => setNewOptionSet({ ...newOptionSet, name: e.target.value })}
                            disabled={isCreatingOptionSet}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Description</Label>
                          <Input
                            placeholder="Optional description"
                            value={newOptionSet.description}
                            onChange={(e) => setNewOptionSet({ ...newOptionSet, description: e.target.value })}
                            disabled={isCreatingOptionSet}
                            className="h-9"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Options (comma separated) *</Label>
                        <Input
                          placeholder="e.g., 0-18, 19-35, 36-50, 50+"
                          value={newOptionSet.options}
                          onChange={(e) => setNewOptionSet({ ...newOptionSet, options: e.target.value })}
                          disabled={isCreatingOptionSet}
                          className="h-9"
                        />
                        <p className="text-xs text-muted-foreground">Separate multiple options with commas</p>
                      </div>
                      <Button 
                        type="button" 
                        onClick={createNewOptionSet}
                        disabled={isCreatingOptionSet || !newOptionSet.name.trim() || !newOptionSet.options.trim()}
                        size="sm"
                        className="w-full"
                      >
                        {isCreatingOptionSet ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Option Set
                          </>
                        )}
                      </Button>
                    </CardContent>
                  )}
                </Card>

                {/* Existing Option Sets */}
                {optionSets.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Select from existing option sets:</Label>
                    <div className="space-y-3 border rounded-lg divide-y max-h-96 overflow-y-auto">
                      {optionSets.map((optionSet) => (
                        <div key={optionSet.id} className="p-4 hover:bg-muted/30 transition-colors">
                          {/* Option Set Header */}
                          <div className="flex items-start gap-3 mb-3">
                            <Checkbox
                              checked={isOptionSetSelected(optionSet.id)}
                              onCheckedChange={(checked) => 
                                handleOptionSetSelect(optionSet, checked as boolean)
                              }
                              disabled={isSubmitting}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div 
                                className="flex items-center gap-2 cursor-pointer group"
                                onClick={() => toggleOptionSet(optionSet.id)}
                              >
                                {expandedOptionSets.has(optionSet.id) ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                )}
                                <span className="font-medium">{optionSet.name}</span>
                                <Badge variant="secondary" className="text-xs ml-auto">
                                  {optionSet.options.length} options
                                </Badge>
                                {isOptionSetPartial(optionSet.id) && (
                                  <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200">
                                    Partial
                                  </Badge>
                                )}
                                {isOptionSetSelected(optionSet.id) && (
                                  <Badge variant="default" className="text-xs bg-green-600">
                                    All Selected
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Expanded Options */}
                          {expandedOptionSets.has(optionSet.id) && (
                            <div className="ml-7 space-y-3 border-l-2 border-purple-200 pl-4">
                              <Label className="text-sm text-muted-foreground">Select specific options:</Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {optionSet.options.map((option) => (
                                  <div key={option.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 transition-colors">
                                    <Checkbox
                                      checked={isOptionSelected(optionSet.id, option.name)}
                                      onCheckedChange={(checked) => 
                                        handleOptionSelect(optionSet, option, checked as boolean)
                                      }
                                      disabled={isSubmitting || isOptionSetSelected(optionSet.id)}
                                    />
                                    <Label className="text-sm flex-1 cursor-pointer">{option.name}</Label>
                                  </div>
                                ))}
                              </div>

                              {/* Add more options to this set */}
                              {addingOptionsTo === optionSet.id ? (
                                <div className="space-y-2 pt-3 border-t">
                                  <Label className="text-sm">Add more options (comma separated)</Label>
                                  <div className="flex gap-2">
                                    <Input
                                      placeholder="e.g., New Option 1, New Option 2"
                                      value={newOptionsForSet}
                                      onChange={(e) => setNewOptionsForSet(e.target.value)}
                                      disabled={isCreatingOptionSet}
                                      className="h-9"
                                    />
                                    <Button
                                      type="button"
                                      size="sm"
                                      onClick={() => addOptionsToExistingSet(optionSet.id)}
                                      disabled={isCreatingOptionSet || !newOptionsForSet.trim()}
                                    >
                                      {isCreatingOptionSet ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Save className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setAddingOptionsTo(null)
                                        setNewOptionsForSet("")
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setAddingOptionsTo(optionSet.id)}
                                  className="w-full mt-2"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add More Options
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Disaggregates Summary */}
                {disaggregates.length > 0 && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Selected Disaggregates ({disaggregates.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {disaggregates.map((d) => (
                        <Badge key={d.id} variant="default" className="text-xs">
                          {d.name}: {d.options.length} option{d.options.length !== 1 ? 's' : ''}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="shrink-0 border-t bg-gray-50 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <span className="text-red-500">*</span> Required fields
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose} 
                  disabled={isSubmitting}
                  className="min-w-24"
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.title || !formData.stakeholderCategory ||
                    !formData.subCluster || !formData.category || !formData.unit}
                  className="min-w-32"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4 mr-2" />
                      Create KPI
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}