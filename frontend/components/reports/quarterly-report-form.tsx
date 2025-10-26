"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { X, Upload, FileText, Target, Calendar, TrendingUp, AlertCircle, RefreshCw } from "lucide-react"

interface QuarterlyReportFormProps {
  onClose: () => void
  onSubmit: (report: any) => void
  actionPlan?: any
}

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context" // Import the auth context

export function QuarterlyReportForm({ onClose, onSubmit, actionPlan }: QuarterlyReportFormProps) {
  const { user, token } = useAuth() // Use the auth context like in KPI form
  
  const [formData, setFormData] = useState({
    actionPlanId: actionPlan?.id?.toString() || "",
    yearId: "",
    actualValue: "",
    kpiPlanId: "",
    quarterId: "",
    progressSummary: "",
    reportDocument: null as File | null,
  })

  const [dragActive, setDragActive] = useState(false)
  const [quartersState, setQuartersState] = useState<any[]>([])
  const [actionPlansState, setActionPlansState] = useState<any[]>([])
  const [financialYears, setFinancialYears] = useState<any[]>([])
  const [kpiPlans, setKpiPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const loadData = async () => {
      if (!token) {
        setError("Authentication required. Please log in again.")
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        setError(null)
        
        console.log('Loading financial years and action plans...')
        
        // Load financial years and action plans in parallel
        const [yearsResponse, plansResponse] = await Promise.allSettled([
          api.getFinancialYears(token),
          api.getActionPlans(token)
        ])

        if (!mounted) return

        // Handle financial years response
        if (yearsResponse.status === 'fulfilled') {
          const years = yearsResponse.value || []
          setFinancialYears(years)
          console.log('Loaded financial years:', years.length)
          
          // Set default year if available
          if (years.length > 0 && !formData.yearId) {
            const defaultYear = years[0]
            setFormData(prev => ({
              ...prev,
              yearId: defaultYear.id.toString()
            }))

            // Load quarters for the default year
            try {
              console.log('Loading quarters for year:', defaultYear.id)
              const quarters = await api.getQuartersByYear(defaultYear.id.toString(), token)
              setQuartersState(quarters || [])
              console.log('Loaded quarters:', quarters?.length || 0)
              
              // Set default quarter if available
              if (quarters && quarters.length > 0) {
                setFormData(prev => ({
                  ...prev,
                  quarterId: quarters[0].id.toString()
                }))
              }
            } catch (quarterError) {
              console.error('Failed to load quarters:', quarterError)
              setQuartersState([])
            }
          }
        } else {
          console.error('Failed to load financial years:', yearsResponse.reason)
          setFinancialYears([])
        }

        // Handle action plans response
        if (plansResponse.status === 'fulfilled') {
          const plans = plansResponse.value || []
          setActionPlansState(plans)
          console.log('Loaded action plans:', plans.length)
          
          // Set default action plan if not already set
          if (plans.length > 0 && !formData.actionPlanId) {
            const defaultPlan = actionPlan || plans[0]
            setFormData(prev => ({
              ...prev,
              actionPlanId: defaultPlan.id.toString()
            }))

            // Load KPI plans for the default action plan
            try {
              console.log('Loading KPI plans for action plan:', defaultPlan.id)
              const kpiPlansData = await loadKpiPlans(defaultPlan.id)
              setKpiPlans(kpiPlansData || [])
              console.log('Loaded KPI plans:', kpiPlansData?.length || 0)
              
              // Set default KPI plan if available
              if (kpiPlansData && kpiPlansData.length > 0) {
                setFormData(prev => ({
                  ...prev,
                  kpiPlanId: kpiPlansData[0].id.toString()
                }))
              }
            } catch (kpiError) {
              console.error('Failed to load KPI plans:', kpiError)
              setKpiPlans([])
            }
          }
        } else {
          console.error('Failed to load action plans:', plansResponse.reason)
          setActionPlansState([])
        }

      } catch (err) {
        console.error('Failed to load report form data', err)
        setError('Failed to load form data. Please try again.')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadData()
    return () => { mounted = false }
  }, [token, actionPlan]) // Add token and actionPlan as dependencies

  // Simplified KPI plans loader
  const loadKpiPlans = async (actionPlanId: number) => {
    if (!token) return []
    
    try {
      // For now, create a mock KPI plan based on the action plan
      // In a real implementation, you would call an API endpoint
      return [{
        id: 1,
        kpiId: actionPlanId,
        actionPlanId: actionPlanId,
        plannedValue: 100, // Default value
        kpiName: "Default KPI"
      }]
    } catch (error) {
      console.error('Failed to load KPI plans:', error)
      return []
    }
  }

  // Handle action plan change
  const handleActionPlanChange = async (actionPlanId: string) => {
    setFormData(prev => ({ ...prev, actionPlanId, kpiPlanId: "" }))
    
    if (!token) return

    try {
      const kpiPlansData = await loadKpiPlans(parseInt(actionPlanId))
      setKpiPlans(kpiPlansData || [])
      
      if (kpiPlansData && kpiPlansData.length > 0) {
        setFormData(prev => ({
          ...prev,
          kpiPlanId: kpiPlansData[0].id.toString()
        }))
      }
    } catch (error) {
      console.error('Failed to load KPI plans:', error)
      setKpiPlans([])
    }
  }

  // Handle year change
  const handleYearChange = async (yearId: string) => {
    setFormData(prev => ({ ...prev, yearId, quarterId: "" }))
    
    if (!token) return

    try {
      const quarters = await api.getQuartersByYear(yearId, token)
      setQuartersState(quarters || [])
      
      if (quarters && quarters.length > 0) {
        setFormData(prev => ({
          ...prev,
          quarterId: quarters[0].id.toString()
        }))
      }
    } catch (error) {
      console.error('Failed to load quarters:', error)
      setQuartersState([])
    }
  }

  // Retry loading data
  const handleRetry = () => {
    setLoading(true)
    setError(null)
    // The useEffect will automatically re-run when loading state changes
  }

  // Get current action plan data
  const currentActionPlan = actionPlansState.find(plan => 
    plan.id.toString() === formData.actionPlanId
  ) || actionPlan || actionPlansState[0] || {
    title: "No Action Plan Available",
    kpi: "N/A",
    plannedValue: 0,
    actualValue: 0,
    stakeholder: "N/A",
    location: "N/A",
    subCluster: "N/A",
  }

  // Get current KPI plan data
  const currentKpiPlan = kpiPlans.find(plan => 
    plan.id.toString() === formData.kpiPlanId
  ) || kpiPlans[0] || {
    plannedValue: currentActionPlan.plannedValue || 0,
    kpiName: "Default KPI"
  }

  const progressPercentage = currentActionPlan.actualValue && currentKpiPlan.plannedValue
    ? Math.round((currentActionPlan.actualValue / currentKpiPlan.plannedValue) * 100)
    : 0

  const newProgressPercentage = formData.actualValue && currentKpiPlan.plannedValue
    ? Math.round((Number(formData.actualValue) / currentKpiPlan.plannedValue) * 100)
    : progressPercentage

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData({ ...formData, reportDocument: e.dataTransfer.files[0] })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, reportDocument: e.target.files[0] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      setError("Authentication required. Please log in again.")
      return
    }

    try {
      // Prepare form data for submission
      const submitData = new FormData()
      submitData.append('actionPlanId', formData.actionPlanId)
      submitData.append('yearId', formData.yearId)
      submitData.append('actualValue', formData.actualValue)
      submitData.append('kpiPlanId', formData.kpiPlanId)
      submitData.append('quarterId', formData.quarterId)
      submitData.append('progressSummary', formData.progressSummary)
      
      if (formData.reportDocument) {
        submitData.append('reportDocument', formData.reportDocument)
      }

      // Submit via API
      const result = await api.createReport(token, submitData)
      
      // Call the onSubmit callback with the result
      onSubmit({
        ...formData,
        id: result.id,
        actionPlanId: parseInt(formData.actionPlanId),
        yearId: parseInt(formData.yearId),
        kpiPlanId: parseInt(formData.kpiPlanId),
        quarterId: parseInt(formData.quarterId),
        actualValue: parseFloat(formData.actualValue),
        reportDocument: formData.reportDocument?.name || null
      })
      
    } catch (error) {
      console.error('Failed to submit report:', error)
      setError('Failed to submit report. Please try again.')
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-4xl">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-lg font-medium">Loading report form...</p>
              <p className="text-sm text-muted-foreground">Please wait while we load the necessary data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Unable to Load Form
            </CardTitle>
            <CardDescription>
              There was a problem loading the report form data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleRetry} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Quarterly Progress Report
            </CardTitle>
            <CardDescription>Submit your quarterly progress against the planned targets</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Action Plan Summary */}
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Action Plan Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground">Plan Title</Label>
                  <p className="font-medium">{currentActionPlan.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">Stakeholder</Label>
                  <p className="font-medium">{currentActionPlan.stakeholder}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">KPI</Label>
                  <p className="font-medium">{currentActionPlan.kpi}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">Location</Label>
                  <p className="font-medium">{currentActionPlan.location}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium text-foreground">Current Progress</Label>
                  <span className="text-sm font-medium">
                    {currentActionPlan.actualValue || 0} / {currentKpiPlan.plannedValue} ({progressPercentage}%)
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              <Badge variant="outline" className="w-fit">
                {currentActionPlan.subCluster}
              </Badge>
            </CardContent>
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reporting Period */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="text-lg font-semibold">Reporting Period</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="actionPlan">Action Plan *</Label>
                  <Select
                    value={formData.actionPlanId}
                    onValueChange={handleActionPlanChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {actionPlansState.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Financial Year *</Label>
                  <Select
                    value={formData.yearId}
                    onValueChange={handleYearChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select financial year" />
                    </SelectTrigger>
                    <SelectContent>
                      {financialYears.map((year) => (
                        <SelectItem key={year.id} value={year.id.toString()}>
                          {year.name} - {year.period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quarter">Quarter *</Label>
                  <Select
                    value={formData.quarterId}
                    onValueChange={(value) => setFormData({ ...formData, quarterId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reporting quarter" />
                    </SelectTrigger>
                    <SelectContent>
                      {quartersState.map((quarter) => (
                        <SelectItem key={quarter.id} value={quarter.id.toString()}>
                          {quarter.name} - {quarter.period}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="kpiPlan">KPI Plan *</Label>
                  <Select
                    value={formData.kpiPlanId}
                    onValueChange={(value) => setFormData({ ...formData, kpiPlanId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select KPI plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {kpiPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.kpiName || `KPI Plan ${plan.id}`} - Target: {plan.plannedValue}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Achievement Data */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <h3 className="text-lg font-semibold">Achievement Data</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="actualValue">Actual Achievement *</Label>
                  <Input
                    id="actualValue"
                    type="number"
                    step="0.01"
                    value={formData.actualValue}
                    onChange={(e) => setFormData({ ...formData, actualValue: e.target.value })}
                    placeholder="Enter actual number achieved"
                    required
                  />
                  <p className="text-sm text-foreground">
                    Planned target: {currentKpiPlan.plannedValue} {currentActionPlan.kpi?.toLowerCase() || 'units'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Updated Progress</Label>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        {formData.actualValue || currentActionPlan.actualValue || 0} / {currentKpiPlan.plannedValue}
                      </span>
                      <span className="text-sm font-medium">{newProgressPercentage}%</span>
                    </div>
                    <Progress value={newProgressPercentage} className="h-2" />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Progress Summary */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h3 className="text-lg font-semibold">Progress Summary</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="progressSummary">Progress Summary *</Label>
                  <Textarea
                    id="progressSummary"
                    value={formData.progressSummary}
                    onChange={(e) => setFormData({ ...formData, progressSummary: e.target.value })}
                    placeholder="Describe the key achievements, activities completed, and progress made during this quarter..."
                    rows={4}
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Supporting Documents */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                <h3 className="text-lg font-semibold">Supporting Documents</h3>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {formData.reportDocument ? (
                  <div className="space-y-2">
                    <FileText className="h-8 w-8 text-primary mx-auto" />
                    <p className="font-medium">{formData.reportDocument.name}</p>
                    <p className="text-sm text-foreground">
                      {(formData.reportDocument.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, reportDocument: null })}
                    >
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-foreground mx-auto" />
                    <p className="font-medium">Upload Supporting Document</p>
                    <p className="text-sm text-foreground">Drag and drop your file here, or click to browse</p>
                    <p className="text-xs text-foreground">PDF, Word, Excel files up to 10MB</p>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button type="button" variant="outline" size="sm" asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Browse Files
                      </label>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Performance Alert */}
            {formData.actualValue && Number(formData.actualValue) < currentKpiPlan.plannedValue * 0.5 && (
              <Alert className="border-secondary/20 bg-secondary/5">
                <AlertCircle className="h-4 w-4 text-secondary" />
                <AlertDescription>
                  <p className="font-medium text-secondary">Low Performance Alert</p>
                  <p className="text-sm text-foreground mt-1">
                    Achievement is significantly below target. Consider providing detailed explanation in the progress summary
                    section and outlining corrective measures.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="transition-all duration-200 hover:scale-[1.02]"
                disabled={!formData.actionPlanId || !formData.yearId || !formData.quarterId || !formData.kpiPlanId || !formData.actualValue || !formData.progressSummary}
              >
                Submit Report
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}