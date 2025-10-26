"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useKpi } from "@/contexts/kpi-context"
import { api } from "@/lib/api"

interface KPICategoryFormProps {
  onClose: () => void
  onSuccess: () => void
}

export function KPICategoryForm({ onClose, onSuccess }: KPICategoryFormProps) {
  const { user, token } = useAuth()
  const { subClusters, refresh } = useKpi()
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    subClusterId: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter available sub-clusters based on user role
  const getAvailableSubClusters = () => {
    if (user?.role === "admin") return subClusters
    if (user?.role === "subclusterfocalperson") {
      return user.subClusters || []
    }
    if (user?.role === "stakeholder_admin" || user?.role === "stakeholder_user") {
      return user.subClusters || []
    }
    return []
  }

  const availableSubClusters = getAvailableSubClusters()

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setError(null)

    if (!token) {
      setError("You must be logged in to create a KPI category")
      return
    }

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'))
      return
    }

    setIsSubmitting(true)

    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        subClusterId: formData.subClusterId,
      }

      const result = await api.createKpiCategory(token, categoryData)
      await refresh()
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to create KPI category:', error)
      setError(`Failed to create KPI category: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const validateForm = (): string[] => {
    const errors: string[] = []
    if (!formData.name.trim()) errors.push('Category name is required')
    if (!formData.subClusterId) errors.push('Sub-cluster is required')
    return errors
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between shrink-0 border-b">
          <CardTitle>Create New KPI Category</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-0 flex flex-col flex-1 min-h-0">
          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category Name <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter category name"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Category description (optional)"
                      rows={3}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Sub-cluster Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Categorization</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Sub-Cluster <span className="text-red-500">*</span></Label>
                    <Select
                      value={formData.subClusterId}
                      onValueChange={(value) => handleInputChange('subClusterId', value)}
                      disabled={isSubmitting || availableSubClusters.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue 
                          placeholder={
                            availableSubClusters.length === 0 
                              ? "No sub-clusters available" 
                              : "Select sub-cluster"
                          } 
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubClusters.map((subCluster) => (
                          <SelectItem key={subCluster.id} value={subCluster.id}>
                            {subCluster.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {availableSubClusters.length === 0 && (
                      <p className="text-sm text-gray-500">
                        You don't have access to any sub-clusters. Please contact an administrator.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose} 
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting || 
                    !formData.name.trim() || 
                    !formData.subClusterId ||
                    availableSubClusters.length === 0
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Category'
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