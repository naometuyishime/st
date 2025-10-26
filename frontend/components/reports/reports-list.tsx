"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  MoreHorizontal,
  Edit,
  Download,
  Eye,
  Calendar,
  FileText,
  Target,
  TrendingUp,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

interface ReportsListProps {
  onCreateNew: () => void
}

export function ReportsList({ onCreateNew }: ReportsListProps) {
  const { user, token } = useAuth()
  const [commentText, setCommentText] = useState<Record<string, string>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterQuarter, setFilterQuarter] = useState("all")

  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        // Fetch action plans then fetch reports for each plan
        const plans = await api.getActionPlans(token || "")
        const allReports: any[] = []
        for (const p of plans || []) {
          try {
            const res = await api.getReportsByActionPlan(String(p.id), token || "")
            if (Array.isArray(res)) allReports.push(...res)
          } catch (e) {
            // ignore individual plan failures
          }
        }
        if (!mounted) return
        setReports(allReports)
      } catch (err) {
        console.error('Failed to load reports', err)
      }
    }
    load()
    return () => { mounted = false }
  }, [token])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Submitted":
        return "bg-accent text-accent-foreground"
      case "Due":
        return "bg-primary text-primary-foreground"
      case "Overdue":
        return "bg-secondary text-secondary-foreground"
      case "Draft":
        return "bg-muted text-foreground"
      default:
        return "bg-muted text-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Submitted":
        return <CheckCircle className="h-4 w-4" />
      case "Due":
        return <Clock className="h-4 w-4" />
      case "Overdue":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getAchievementColor = (achievement: number) => {
    if (achievement >= 80) return "text-accent"
    if (achievement >= 50) return "text-primary"
    if (achievement >= 25) return "text-secondary"
    return "text-foreground"
  }

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.actionPlanTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.stakeholder.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || report.status.toLowerCase() === filterStatus
    const matchesQuarter = filterQuarter === "all" || report.quarter === filterQuarter

    return matchesSearch && matchesStatus && matchesQuarter
  })

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quarterly Reports</h1>
          <p className="text-foreground">Submit and track your quarterly progress reports</p>
        </div>
        <Button onClick={onCreateNew} className="transition-all duration-200 hover:scale-[1.02]">
          <Plus className="mr-2 h-4 w-4" />
          New Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Submitted</p>
                <p className="text-2xl font-bold text-accent">{reports.filter(r => r.status === 'Submitted').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Due Soon</p>
                <p className="text-2xl font-bold text-primary">{reports.filter(r => r.status === 'Due').length}</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Overdue</p>
                <p className="text-2xl font-bold text-secondary">{reports.filter(r => r.status === 'Overdue').length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Avg Achievement</p>
                <p className="text-2xl font-bold text-accent">{Math.round(reports.reduce((s, r) => s + (r.achievement || 0), 0) / (reports.length || 1))}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="due">Due</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterQuarter} onValueChange={setFilterQuarter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Quarter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quarters</SelectItem>
                  <SelectItem value="Q1 2024">Q1 2024</SelectItem>
                  <SelectItem value="Q2 2024">Q2 2024</SelectItem>
                  <SelectItem value="Q3 2024">Q3 2024</SelectItem>
                  <SelectItem value="Q4 2024">Q4 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <Card key={report.id} className="transition-all duration-200 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold line-clamp-1">{report.actionPlanTitle}</h3>
                      <p className="text-sm text-foreground">{report.stakeholder}</p>
                    </div>
                    <Badge className={`${getStatusColor(report.status)} flex items-center gap-1`}>
                      {getStatusIcon(report.status)}
                      {report.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {report.quarter} ({report.quarterPeriod})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Target className="h-4 w-4" />
                        <span>{report.kpi}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-foreground">Achievement</span>
                        <span className={`text-sm font-medium ${getAchievementColor(report.achievement)}`}>
                          {report.actualValue !== null ? `${report.actualValue}/${report.plannedValue}` : "Pending"}
                        </span>
                      </div>
                      {report.actualValue !== null && <Progress value={report.achievement} className="h-2" />}
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-foreground">
                        Due: {new Date(report.dueDate).toLocaleDateString()}
                      </p>
                      {report.status === "Due" && (
                        <p className="text-sm text-primary">
                          {getDaysUntilDue(report.dueDate) > 0
                            ? `${getDaysUntilDue(report.dueDate)} days remaining`
                            : "Due today"}
                        </p>
                      )}
                      {report.status === "Overdue" && (
                        <p className="text-sm text-secondary">
                          {Math.abs(getDaysUntilDue(report.dueDate))} days overdue
                        </p>
                      )}
                      {report.submittedDate && (
                        <p className="text-sm text-accent">
                          Submitted: {new Date(report.submittedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {report.progressSummary && (
                    <p className="text-sm text-foreground line-clamp-2">{report.progressSummary}</p>
                  )}

                  {user?.role === 'subclusterfocalperson' && (
                    <div className="mt-3 space-y-2">
                      <label className="text-sm text-foreground">Add Comment</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Textarea
                          rows={2}
                          value={commentText[report.id] || ''}
                          onChange={(e) => setCommentText({ ...commentText, [report.id]: e.target.value })}
                          placeholder="Write your comment..."
                        />
                        <Button
                          type="button"
                          onClick={async () => {
                            const text = (commentText[report.id] || '').trim()
                            if (!text) return
                            await fetch('/api/comments', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ reportId: report.id, commentText: text })
                            })
                            setCommentText({ ...commentText, [report.id]: '' })
                          }}
                          className="self-start"
                        >
                          Add Comment
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {report.hasDocument && (
                    <Badge variant="outline" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      Document
                    </Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Report
                      </DropdownMenuItem>
                      {report.status !== "Submitted" && (
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Report
                        </DropdownMenuItem>
                      )}
                      {report.hasDocument && (
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download Document
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
            <p className="text-foreground mb-4">
              {searchTerm || filterStatus !== "all" || filterQuarter !== "all"
                ? "Try adjusting your search or filters"
                : "No quarterly reports available yet"}
            </p>
            <Button onClick={onCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              Create Report
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
