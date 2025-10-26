"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

// Define the audit log interface based on your database schema
interface AuditLog {
  id: number;
  userId: number;
  action: string;
  userAgent: string;
  logIpAddress: string;
  logDescription: string;
  actionDetails: string;
  timestamps: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

// Define the API response type
interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function AuditLogs() {
  const { token } = useAuth()
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter state
  const [filters, setFilters] = useState({
    userId: "",
    action: "",
    from: "",
    to: ""
  })
  
  // Pagination state
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)

  const fetchAuditLogs = async () => {
    if (!token) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Prepare API params
      const params: any = {
        page,
        limit
      }
      
      // Add filters if provided
      if (filters.userId) params.userId = parseInt(filters.userId)
      if (filters.action && filters.action !== "all") params.action = filters.action
      if (filters.from) params.from = new Date(filters.from).toISOString()
      if (filters.to) params.to = new Date(filters.to).toISOString()
      
      const response = await api.getAuditLogs(token, params)
      
      // Handle response - use type assertion and fallbacks
      const responseData = response as AuditLogsResponse
      
      let logs: AuditLog[] = []
      let total = 0
      let totalPages = 1
      
      // Check if response has the expected structure
      if (responseData && responseData.logs && Array.isArray(responseData.logs)) {
        logs = responseData.logs
        total = responseData.total || logs.length
        totalPages = responseData.totalPages || Math.ceil(total / limit)
      } else if (Array.isArray(response)) {
        // Fallback: if response is directly an array
        logs = response
        total = response.length
        totalPages = 1
      }
      
      setAuditLogs(logs)
      setTotalPages(totalPages)
      setTotalLogs(total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch audit logs")
      console.error("Error fetching audit logs:", err)
      setAuditLogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLogs()
  }, [page, limit, token])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApplyFilters = () => {
    setPage(1)
    fetchAuditLogs()
  }

  const handleClearFilters = () => {
    setFilters({
      userId: "",
      action: "all",
      from: "",
      to: ""
    })
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleLimitChange = (newLimit: string) => {
    setLimit(parseInt(newLimit))
    setPage(1)
  }

  // Common actions for filter dropdown
  const commonActions = [
    "LOGIN",
    "LOGOUT", 
    "CREATE",
    "UPDATE",
    "DELETE",
    "VIEW",
    "DOWNLOAD",
    "UPLOAD"
  ]

  // Safe array check
  const displayLogs = Array.isArray(auditLogs) ? auditLogs : []

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-foreground">View recent system events and critical actions</p>
        </div>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* User ID Filter */}
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                type="number"
                placeholder="Filter by user ID"
                value={filters.userId}
                onChange={(e) => handleFilterChange("userId", e.target.value)}
              />
            </div>

            {/* Action Filter */}
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select
                value={filters.action}
                onValueChange={(value) => handleFilterChange("action", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {commonActions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* From Date Filter */}
            <div className="space-y-2">
              <Label htmlFor="from">From Date</Label>
              <Input
                id="from"
                type="datetime-local"
                value={filters.from}
                onChange={(e) => handleFilterChange("from", e.target.value)}
              />
            </div>

            {/* To Date Filter */}
            <div className="space-y-2">
              <Label htmlFor="to">To Date</Label>
              <Input
                id="to"
                type="datetime-local"
                value={filters.to}
                onChange={(e) => handleFilterChange("to", e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleApplyFilters}>
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Audit Log Entries</CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="limit">Show:</Label>
            <Select value={limit.toString()} onValueChange={handleLimitChange}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center">Loading audit logs...</div>
          ) : error ? (
            <div className="p-6 text-center text-destructive">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-max">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 whitespace-nowrap">ID</th>
                    <th className="text-left p-3 whitespace-nowrap">User ID</th>
                    <th className="text-left p-3 whitespace-nowrap">Action</th>
                    <th className="text-left p-3 whitespace-nowrap">User Agent</th>
                    <th className="text-left p-3 whitespace-nowrap">IP Address</th>
                    <th className="text-left p-3 whitespace-nowrap">Description</th>
                    <th className="text-left p-3 whitespace-nowrap">Action Details</th>
                    <th className="text-left p-3 whitespace-nowrap">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {displayLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-muted-foreground">
                        No audit logs found
                      </td>
                    </tr>
                  ) : (
                    displayLogs.map((log) => (
                      <tr key={log.id} className="border-t hover:bg-muted/50">
                        {/* ID */}
                        <td className="p-3 align-top text-xs text-muted-foreground font-mono">
                          {log.id}
                        </td>
                        
                        {/* User ID */}
                        <td className="p-3 align-top font-medium font-mono">
                          {log.userId}
                        </td>
                        
                        {/* Action */}
                        <td className="p-3 align-top">
                          <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                            log.action === 'DELETE' ? 'bg-destructive/20 text-destructive' :
                            log.action === 'CREATE' ? 'bg-green-500/20 text-green-600' :
                            log.action === 'UPDATE' ? 'bg-blue-500/20 text-blue-600' :
                            log.action === 'LOGIN' ? 'bg-purple-500/20 text-purple-600' :
                            log.action === 'LOGOUT' ? 'bg-gray-500/20 text-gray-600' :
                            'bg-muted text-foreground'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        
                        {/* User Agent */}
                        <td className="p-3 align-top text-xs text-muted-foreground max-w-[200px] truncate">
                          {log.userAgent}
                        </td>
                        
                        {/* IP Address */}
                        <td className="p-3 align-top text-sm font-mono whitespace-nowrap">
                          {log.logIpAddress}
                        </td>
                        
                        {/* Log Description */}
                        <td className="p-3 align-top text-sm text-foreground max-w-[200px]">
                          <div className="break-words">{log.logDescription}</div>
                        </td>
                        
                        {/* Action Details */}
                        <td className="p-3 align-top text-sm text-muted-foreground max-w-[200px]">
                          <div className="break-words">{log.actionDetails}</div>
                        </td>
                        
                        {/* Timestamp */}
                        <td className="p-3 align-top text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.timestamps).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalLogs)} of {totalLogs} entries
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      {totalPages > 5 && <span className="px-2">...</span>}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}