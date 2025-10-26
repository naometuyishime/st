"use client"

import { useEffect, useMemo, useState } from "react"
import { Calendar as CalendarIcon, ChevronDown, ChevronRight, Edit, Plus, Trash2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { api } from "@/lib/api"
import type { FinancialYear, Quarter } from "@/types"

interface YearFormState {
  id?: string
  name: string
  startDate: string
  endDate: string
  planStartDate: string
  planEndDate: string
  reportStartDate: string
  reportEndDate: string
}

interface QuarterFormState {
  id?: string
  name: string
  startDate: string
  endDate: string
  reportDueDate: string
  yearId: string
}

export function FinancialYearsManagement() {
  const { token, user } = useAuth()
  const [years, setYears] = useState<FinancialYear[]>([])
  const [expandedYearIds, setExpandedYearIds] = useState<Record<string, boolean>>({})
  const [quartersByYear, setQuartersByYear] = useState<Record<string, Quarter[]>>({})
  const [loadingYears, setLoadingYears] = useState(false)
  const [loadingQuarters, setLoadingQuarters] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  const emptyYear: YearFormState = useMemo(() => ({
    name: "",
    startDate: "",
    endDate: "",
    planStartDate: "",
    planEndDate: "",
    reportStartDate: "",
    reportEndDate: "",
  }), [])

  const [yearForm, setYearForm] = useState<YearFormState>(emptyYear)
  const [yearDialogOpen, setYearDialogOpen] = useState(false)

  const emptyQuarter = (yearId: string): QuarterFormState => ({ id: undefined, name: "", startDate: "", endDate: "", reportDueDate: "", yearId })
  const [quarterForm, setQuarterForm] = useState<QuarterFormState | null>(null)
  const [quarterDialogOpen, setQuarterDialogOpen] = useState(false)

  const fetchYears = async () => {
    setLoadingYears(true)
    setError(null)
    try {
      const list = await api.getFinancialYears(token || undefined)
      console.log('Financial years received:', list)
      setYears(Array.isArray(list) ? list as FinancialYear[] : [])
    } catch (e) {
      console.error('Error fetching financial years:', e)
      setError(e instanceof Error ? e.message : "Failed to load financial years")
    } finally {
      setLoadingYears(false)
    }
  }

  const fetchQuarters = async (yearId: string) => {
    setLoadingQuarters(prev => ({ ...prev, [yearId]: true }))
    try {
      const list = await api.getQuartersByYear(yearId, token || undefined)
      console.log('Quarters received for year', yearId, ':', list)
      setQuartersByYear(prev => ({ ...prev, [yearId]: (Array.isArray(list) ? list : []) as Quarter[] }))
    } catch (e) {
      console.error('Error fetching quarters:', e)
    } finally {
      setLoadingQuarters(prev => ({ ...prev, [yearId]: false }))
    }
  }

  useEffect(() => {
    fetchYears()
  }, [token])

  const toggleYearExpand = (yearId: string) => {
    setExpandedYearIds(prev => {
      const next = { ...prev, [yearId]: !prev[yearId] }
      if (next[yearId] && !quartersByYear[yearId]) {
        fetchQuarters(yearId)
      }
      return next
    })
  }

  const openCreateYear = () => {
    setYearForm(emptyYear)
    setYearDialogOpen(true)
  }

  const openEditYear = (y: FinancialYear) => {
    setYearForm({
      id: y.id,
      name: y.name,
      startDate: y.startDate?.slice(0, 10) || "",
      endDate: y.endDate?.slice(0, 10) || "",
      planStartDate: y.planStartDate?.slice(0, 10) || "",
      planEndDate: y.planEndDate?.slice(0, 10) || "",
      reportStartDate: y.reportStartDate?.slice(0, 10) || "",
      reportEndDate: y.reportEndDate?.slice(0, 10) || "",
    })
    setYearDialogOpen(true)
  }

  const validateYearForm = (): string | null => {
    if (!yearForm.name) return "Name is required"
    const s = new Date(yearForm.startDate)
    const e = new Date(yearForm.endDate)
    const ps = new Date(yearForm.planStartDate)
    const pe = new Date(yearForm.planEndDate)
    const rs = new Date(yearForm.reportStartDate)
    const re = new Date(yearForm.reportEndDate)

    if (isNaN(s.getTime()) || isNaN(e.getTime())) return "Year start and end dates are required"
    if (s >= e) return "Year start date must be before year end date"

    if (isNaN(ps.getTime()) || isNaN(pe.getTime())) return "Plan start and end dates are required"
    if (ps > pe) return "Plan start must be on or before plan end"
    if (ps < s || pe > e) return "Plan period must be inside the financial year"

    if (isNaN(rs.getTime()) || isNaN(re.getTime())) return "Report start and end dates are required"
    if (rs > re) return "Report start must be on or before report end"
    if (rs < s || re > e) return "Report period must be inside the financial year"

    return null
  }

  const saveYear = async () => {
    if (!token) { alert("You must be logged in"); return }
    const validationError = validateYearForm()
    if (validationError) { alert(validationError); return }

    const payload: any = {
      name: yearForm.name,
      startDate: new Date(yearForm.startDate).toISOString(),
      endDate: new Date(yearForm.endDate).toISOString(),
      planStartDate: new Date(yearForm.planStartDate).toISOString(),
      planEndDate: new Date(yearForm.planEndDate).toISOString(),
      reportStartDate: new Date(yearForm.reportStartDate).toISOString(),
      reportEndDate: new Date(yearForm.reportEndDate).toISOString(),
    }

    try {
      if (yearForm.id) {
        await api.updateFinancialYear(token, yearForm.id, payload)
      } else {
        await api.createFinancialYear(token, payload)
      }
      setYearDialogOpen(false)
      await fetchYears()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save financial year")
    }
  }

  const removeYear = async (id: string) => {
    if (!token) { alert("You must be logged in"); return }
    if (!confirm("Are you sure you want to delete this financial year? This action cannot be undone.")) return
    try {
      await api.deleteFinancialYear(token, id)
      const { [id]: _, ...rest } = quartersByYear
      setQuartersByYear(rest)
      const { [id]: __, ...restExp } = expandedYearIds
      setExpandedYearIds(restExp)
      await fetchYears()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete financial year")
    }
  }

  const openCreateQuarter = (yearId: string) => {
    setQuarterForm(emptyQuarter(yearId))
    setQuarterDialogOpen(true)
  }

  const openEditQuarter = (q: Quarter) => {
    setQuarterForm({
      id: q.id,
      name: q.name,
      startDate: q.startDate?.slice(0, 10) || "",
      endDate: q.endDate?.slice(0, 10) || "",
      reportDueDate: q.reportDueDate?.slice(0, 10) || "",
      yearId: q.yearId,
    })
    setQuarterDialogOpen(true)
  }

  const validateQuarterForm = (): string | null => {
    if (!quarterForm) return "Invalid quarter data"
    if (!quarterForm.name) return "Quarter name is required"

    const qs = new Date(quarterForm.startDate)
    const qe = new Date(quarterForm.endDate)
    const qd = new Date(quarterForm.reportDueDate)

    if (isNaN(qs.getTime()) || isNaN(qe.getTime())) return "Quarter start and end dates are required"
    if (qs >= qe) return "Quarter start must be before quarter end"
    if (isNaN(qd.getTime())) return "Quarter report due date is required"

    const year = years.find(y => String(y.id) === String(quarterForm.yearId))
    if (!year) return "Parent financial year not found"

    const ys = new Date(year.startDate)
    const ye = new Date(year.endDate)

    if (qs < ys || qe > ye) return "Quarter period must be within the financial year"
    if (qd < qs) return "Quarter report due date cannot be before quarter start"
    if (qd > ye) return "Quarter report due date must be on or before the financial year's end"

    // Check overlap with existing quarters for the year
    const existing = quartersByYear[quarterForm.yearId] || []
    const newId = quarterForm.id
    for (const ex of existing) {
      if (newId && String(ex.id) === String(newId)) continue
      const exs = new Date(ex.startDate)
      const exe = new Date(ex.endDate)
      // overlapping if qs <= exe && exs <= qe
      if (qs <= exe && exs <= qe) return `Quarter overlaps with existing quarter ${ex.name}`
    }

    return null
  }

  const saveQuarter = async () => {
    if (!token || !quarterForm) { alert("You must be logged in"); return }
    const validationError = validateQuarterForm()
    if (validationError) { alert(validationError); return }

    const payload: any = {
      name: quarterForm.name,
      startDate: new Date(quarterForm.startDate).toISOString(),
      endDate: new Date(quarterForm.endDate).toISOString(),
      reportDueDate: new Date(quarterForm.reportDueDate).toISOString(),
      yearId: Number(quarterForm.yearId),
    }

    try {
      if (quarterForm.id) {
        await api.updateQuarter(token, quarterForm.id, payload)
      } else {
        await api.createQuarter(token, payload)
      }
      setQuarterDialogOpen(false)
      await fetchQuarters(quarterForm.yearId)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save quarter")
    }
  }

  const removeQuarter = async (yearId: string, id: string) => {
    if (!token) { alert("You must be logged in"); return }
    if (!confirm("Are you sure you want to delete this quarter? This action cannot be undone.")) return
    try {
      await api.deleteQuarter(token, id)
      await fetchQuarters(yearId)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete quarter")
    }
  }

  const formatDateRange = (start: string, end: string) => {
    return `${start?.slice(0,10)} → ${end?.slice(0,10)}`
  }

  const getQuarterStatus = (quarter: Quarter) => {
    const dueDate = new Date(quarter.reportDueDate)
    const today = new Date()
    return dueDate < today ? "overdue" : "active"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financial Years</h1>
          <p className="text-muted-foreground">Manage financial years and reporting quarters</p>
        </div>
        <Button onClick={openCreateYear} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" /> New Financial Year
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loadingYears ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : years.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CalendarIcon className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No financial years</h3>
            <p className="text-muted-foreground mb-6">Get started by creating your first financial year</p>
            <Button onClick={openCreateYear} size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-5 w-5" /> Create Financial Year
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {years.map((y) => {
            const expanded = !!expandedYearIds[y.id]
            const quarters = quartersByYear[y.id] || []
            const qLoading = !!loadingQuarters[y.id]
            return (
              <Card key={y.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="p-6 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20">
                    <div className="flex items-start justify-between gap-4">
                      <button
                        className="flex items-start gap-4 text-left flex-1 group"
                        onClick={() => toggleYearExpand(y.id)}
                        aria-expanded={expanded}
                      >
                        <div className="mt-1">
                          {expanded ? (
                            <ChevronDown className="h-5 w-5 text-blue-600" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-foreground group-hover:text-blue-600 transition-colors">
                              {y.name}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {quarters.length} {quarters.length === 1 ? 'Quarter' : 'Quarters'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
                              <div className="text-xs font-medium text-muted-foreground mb-1">Financial Year</div>
                              <div className="text-sm font-medium text-foreground">{formatDateRange(y.startDate, y.endDate)}</div>
                            </div>
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
                              <div className="text-xs font-medium text-muted-foreground mb-1">Planning Period</div>
                              <div className="text-sm font-medium text-foreground">{formatDateRange(y.planStartDate, y.planEndDate)}</div>
                            </div>
                            <div className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-800">
                              <div className="text-xs font-medium text-muted-foreground mb-1">Reporting Period</div>
                              <div className="text-sm font-medium text-foreground">{formatDateRange(y.reportStartDate, y.reportEndDate)}</div>
                            </div>
                          </div>
                        </div>
                      </button>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openEditYear(y)}
                          className="h-9 w-9 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeYear(y.id)}
                          className="h-9 w-9 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {expanded && (
                    <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-6">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h4 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" />
                            Quarterly Breakdown
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">Manage reporting quarters for this period</p>
                        </div>
                        <Button 
                          onClick={() => openCreateQuarter(y.id)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" /> Add Quarter
                        </Button>
                      </div>

                      {qLoading ? (
                        <div className="grid gap-3">
                          {[1, 2].map(i => (
                            <Skeleton key={i} className="h-24 w-full" />
                          ))}
                        </div>
                      ) : quarters.length === 0 ? (
                        <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                          <CalendarIcon className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
                          <p className="text-sm text-muted-foreground mb-4">No quarters defined yet</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openCreateQuarter(y.id)}
                          >
                            <Plus className="h-4 w-4 mr-2" /> Create First Quarter
                          </Button>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {quarters.map((q) => {
                            const status = getQuarterStatus(q)
                            return (
                              <div 
                                key={q.id} 
                                className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-sm transition-all"
                              >
                                <div className="flex items-center gap-4 flex-1">
                                  <div className={`w-1 h-16 rounded-full ${
                                    status === 'overdue' ? 'bg-red-500' : 'bg-green-500'
                                  }`} />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <span className="font-semibold text-foreground text-base">{q.name}</span>
                                      <Badge 
                                        variant={status === 'overdue' ? 'destructive' : 'default'}
                                        className="text-xs"
                                      >
                                        {status === 'overdue' ? 'Report Overdue' : 'Active'}
                                      </Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                      <span>
                                        <span className="font-medium">Period:</span> {formatDateRange(q.startDate, q.endDate)}
                                      </span>
                                      <span className="text-gray-300 dark:text-gray-700">|</span>
                                      <span>
                                        <span className="font-medium">Report Due:</span> {q.reportDueDate?.slice(0,10)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => openEditQuarter(q)}
                                    className="h-9"
                                  >
                                    <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => removeQuarter(y.id, q.id)}
                                    className="h-9 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                                  </Button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Financial Year Dialog */}
      <Dialog open={yearDialogOpen} onOpenChange={setYearDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>
              {yearForm.id ? 'Edit Financial Year' : 'Create New Financial Year'}
            </DialogTitle>
            <DialogDescription>
              {yearForm.id 
                ? 'Update the financial year details below.' 
                : 'Define a new financial year with its planning and reporting periods.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="year-name">Financial Year Name <span className="text-red-500">*</span></Label>
              <Input
                id="year-name"
                value={yearForm.name}
                onChange={(e) => setYearForm({...yearForm, name: e.target.value})}
                placeholder="e.g., FY 2024"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date <span className="text-red-500">*</span></Label>
                <Input
                  id="start-date"
                  type="date"
                  value={yearForm.startDate}
                  onChange={(e) => setYearForm({...yearForm, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date <span className="text-red-500">*</span></Label>
                <Input
                  id="end-date"
                  type="date"
                  value={yearForm.endDate}
                  onChange={(e) => setYearForm({...yearForm, endDate: e.target.value})}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Planning Period</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plan-start-date">Plan Start Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="plan-start-date"
                    type="date"
                    value={yearForm.planStartDate}
                    onChange={(e) => setYearForm({...yearForm, planStartDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan-end-date">Plan End Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="plan-end-date"
                    type="date"
                    value={yearForm.planEndDate}
                    onChange={(e) => setYearForm({...yearForm, planEndDate: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Reporting Period</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-start-date">Report Start Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="report-start-date"
                    type="date"
                    value={yearForm.reportStartDate}
                    onChange={(e) => setYearForm({...yearForm, reportStartDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="report-end-date">Report End Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="report-end-date"
                    type="date"
                    value={yearForm.reportEndDate}
                    onChange={(e) => setYearForm({...yearForm, reportEndDate: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setYearDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveYear} className="bg-blue-600 hover:bg-blue-700">
              {yearForm.id ? 'Update' : 'Create'} Financial Year
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quarter Dialog */}
      <Dialog open={quarterDialogOpen} onOpenChange={setQuarterDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {quarterForm?.id ? 'Edit Quarter' : 'Create New Quarter'}
            </DialogTitle>
            <DialogDescription>
              {quarterForm?.id 
                ? 'Update the quarter details below.' 
                : 'Define a new reporting quarter for this financial year.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {quarterForm && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="quarter-name">Quarter Name <span className="text-red-500">*</span></Label>
                <Input
                  id="quarter-name"
                  value={quarterForm.name}
                  onChange={(e) => setQuarterForm({...quarterForm, name: e.target.value})}
                  placeholder="e.g., Q1 2024"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quarter-start-date">Start Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="quarter-start-date"
                    type="date"
                    value={quarterForm.startDate}
                    onChange={(e) => setQuarterForm({...quarterForm, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quarter-end-date">End Date <span className="text-red-500">*</span></Label>
                  <Input
                    id="quarter-end-date"
                    type="date"
                    value={quarterForm.endDate}
                    onChange={(e) => setQuarterForm({...quarterForm, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-due-date">Report Due Date <span className="text-red-500">*</span></Label>
                <Input
                  id="report-due-date"
                  type="date"
                  value={quarterForm.reportDueDate}
                  onChange={(e) => setQuarterForm({...quarterForm, reportDueDate: e.target.value})}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setQuarterDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveQuarter} className="bg-blue-600 hover:bg-blue-700">
              {quarterForm?.id ? 'Update' : 'Create'} Quarter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FinancialYearsManagement