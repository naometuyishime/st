"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, FileText, Table, BarChart3, Users } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ExportOptions {
  dataType: string
  format: string
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  filters: {
    status?: string[]
    province?: string[]
    district?: string[]
    stakeholder?: string[]
  }
}

export function ExportCenter() {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    dataType: "",
    format: "",
    dateRange: { from: undefined, to: undefined },
    filters: {},
  })
  const [isExporting, setIsExporting] = useState(false)

  const dataTypes = [
    { value: "action-plans", label: "Action Plans" },
    { value: "reports", label: "Quarterly Reports"},
    { value: "stakeholders", label: "Stakeholder Data"},
    { value: "kpis", label: "KPI Data"},
  ]

  const formats = [
    { value: "excel", label: "Excel (.xlsx)", description: "Spreadsheet format with multiple sheets" },
    { value: "pdf", label: "PDF (.pdf)", description: "Formatted document for printing" },
    { value: "csv", label: "CSV (.csv)", description: "Comma-separated values for data analysis" },
  ]

  const handleExport = async () => {
    if (!exportOptions.dataType || !exportOptions.format) return

    setIsExporting(true)

    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In a real app, this would call an API endpoint
    const filename = `${exportOptions.dataType}-${format(new Date(), "yyyy-MM-dd")}.${exportOptions.format === "excel" ? "xlsx" : exportOptions.format}`

    // Create a mock download
    const element = document.createElement("a")
    element.href = "#"
    element.download = filename
    element.click()

    setIsExporting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-migeprof-navy">Export Center</h2>
          <p className="text-gray-600">Export data in various formats for analysis and reporting</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Data Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-migeprof-blue" />
              Data Selection
            </CardTitle>
            <CardDescription>Choose what data to export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Data Type</label>
              <Select
                value={exportOptions.dataType}
                onValueChange={(value) => setExportOptions((prev) => ({ ...prev, dataType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  {dataTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Export Format</label>
              <div className="space-y-2">
                {formats.map((format) => (
                  <div key={format.value} className="flex items-start space-x-2">
                    <Checkbox
                      id={format.value}
                      checked={exportOptions.format === format.value}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setExportOptions((prev) => ({ ...prev, format: format.value }))
                        }
                      }}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={format.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {format.label}
                      </label>
                      <p className="text-xs text-foreground">{format.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters and Options */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Options</CardTitle>
            <CardDescription>Customize your export</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !exportOptions.dateRange.from && "text-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {exportOptions.dateRange.from ? (
                        format(exportOptions.dateRange.from, "PPP")
                      ) : (
                        <span>From date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={exportOptions.dateRange.from}
                      onSelect={(date) =>
                        setExportOptions((prev) => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, from: date },
                        }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "flex-1 justify-start text-left font-normal",
                        !exportOptions.dateRange.to && "text-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {exportOptions.dateRange.to ? format(exportOptions.dateRange.to, "PPP") : <span>To date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={exportOptions.dateRange.to}
                      onSelect={(date) =>
                        setExportOptions((prev) => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, to: date },
                        }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {exportOptions.dataType && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Additional Filters</label>

                {exportOptions.dataType === "action-plans" && (
                  <div className="space-y-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {exportOptions.dataType === "reports" && (
                  <div className="space-y-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by quarter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="q1">Q1 2024</SelectItem>
                        <SelectItem value="q2">Q2 2024</SelectItem>
                        <SelectItem value="q3">Q3 2024</SelectItem>
                        <SelectItem value="q4">Q4 2024</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kigali">Kigali City</SelectItem>
                    <SelectItem value="eastern">Eastern Province</SelectItem>
                    <SelectItem value="western">Western Province</SelectItem>
                    <SelectItem value="northern">Northern Province</SelectItem>
                    <SelectItem value="southern">Southern Province</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Export Summary */}
      {exportOptions.dataType && exportOptions.format && (
        <Card className="border-migeprof-blue/20 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-migeprof-blue">Export Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Data Type:</span>
                <span className="font-medium">{dataTypes.find((t) => t.value === exportOptions.dataType)?.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Format:</span>
                <span className="font-medium">{formats.find((f) => f.value === exportOptions.format)?.label}</span>
              </div>
              {exportOptions.dateRange.from && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Date Range:</span>
                  <span className="font-medium">
                    {format(exportOptions.dateRange.from, "MMM dd, yyyy")} -{" "}
                    {exportOptions.dateRange.to ? format(exportOptions.dateRange.to, "MMM dd, yyyy") : "Present"}
                  </span>
                </div>
              )}
            </div>

            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full mt-4 bg-migeprof-blue hover:bg-migeprof-blue/90"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
