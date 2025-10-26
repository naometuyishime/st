"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"

export interface KpiItem {
  id: string
  title: string
  description: string
  subCluster: string // id
  subClusterName: string // display name
  category: string // category id
  categoryName: string // category display name
  stakeholderCategory: string
  units: string
  currentValue: number
  targetValue: number
  disaggregation: string[]
}

interface SubCluster { 
  id: string; 
  name: string 
  focalPersonId?: string
}

interface KpiCategory { 
  id: string; 
  name: string; 
  subClusterId: string 
}

interface KpiContextType {
  subClusters: SubCluster[]
  categories: KpiCategory[]
  focalPersonId: number | null
  kpis: KpiItem[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const KpiContext = createContext<KpiContextType | undefined>(undefined)

export function KpiProvider({ children }: { children: React.ReactNode }) {
  const [subClusters, setSubClusters] = useState<SubCluster[]>([])
  const [categories, setCategories] = useState<KpiCategory[]>([])
  const [kpis, setKpis] = useState<KpiItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [focalPersonId, setFocalPersonId] = useState<number | null>(null)
  const { token } = useAuth()

  const refresh = async () => {
    if (!token) {
      console.log("No token available for KPI refresh")
      setError("No authentication token available")
      return
    }

    setIsLoading(true)
    setError(null)
    console.log("Starting KPI data refresh...")

    let subs: SubCluster[] = []
    let cats: KpiCategory[] = []
    let rawKpis: any[] = []

    try {
      console.log("Fetching sub-clusters...")
      subs = await api.getSubClusters(token)
      console.log("Sub-clusters fetched successfully:", subs)
      setSubClusters(subs)
    } catch (e: any) {
      console.error("Error fetching sub-clusters:", e)
      const msg = e?.message || "Failed to fetch sub-clusters"
      setError(prev => (prev ? prev + '\n' + msg : msg))
      subs = []
    }

    try {
      console.log("Fetching KPI categories...")
      cats = await api.getKpiCategories(token)
      console.log("KPI categories fetched successfully:", cats)
      setCategories(cats)
    } catch (e: any) {
      console.error("Error fetching KPI categories:", e)
      const msg = e?.message || "Failed to fetch kpi categories"
      setError(prev => (prev ? prev + '\n' + msg : msg))
      cats = []
    }

    try {
      console.log("Fetching KPIs...")
      rawKpis = await api.getKpis(token)
      console.log("Raw KPIs from API:", rawKpis)
    } catch (e: any) {
      console.error("Error fetching KPIs:", e)
      const msg = e?.message || "Failed to fetch kpis"
      setError(prev => (prev ? prev + '\n' + msg : msg))
      rawKpis = []
    }

    try {
      console.log("Transforming KPI data...")
      
      // Create maps for efficient lookup
      const subClusterMap = new Map(subs.map(s => [s.id, s.name]))
      const categoryMap = new Map(cats.map(c => [c.id, c.name]))
      
      console.log("SubCluster Map:", Array.from(subClusterMap.entries()))
      console.log("Category Map:", Array.from(categoryMap.entries()))

      // Helper function to safely extract string values
      const safeString = (value: any, fallback: string = ""): string => {
        if (value == null) return fallback
        if (typeof value === 'string') return value
        if (typeof value === 'number') return String(value)
        if (typeof value === 'object') {
          return value.name || value.title || value.displayName || fallback
        }
        return String(value)
      }

      const safeNumber = (value: any, fallback: number = 0): number => {
        if (value == null) return fallback
        const num = Number(value)
        return isNaN(num) ? fallback : num
      }

      const transformed: KpiItem[] = rawKpis.map((kpi: any, index: number) => {
        console.log(`Processing KPI ${index}:`, kpi)

        // Extract subCluster ID from various possible field names
        const subClusterId = safeString(
          kpi.subClusterId || kpi.subCluster || kpi.subClusterID || kpi.subCluster?.id || ""
        )

        // Extract subCluster name - prioritize mapped name, then fallback to API data
        let subClusterName = subClusterMap.get(subClusterId)
        if (!subClusterName) {
          subClusterName = safeString(
            kpi.subClusterName || kpi.subCluster?.name || "Unknown Sub-Cluster"
          )
        }

        // Extract category ID from various possible field names
        const categoryId = safeString(
          kpi.kpiCategoryId || kpi.category || kpi.kpiCategory || kpi.categoryId || kpi.category?.id || ""
        )

        // Extract category name from map or API data
        const categoryName = categoryMap.get(categoryId) || 
                           safeString(kpi.category?.name || kpi.categoryName || "Uncategorized")

        console.log(`KPI ${index} category mapping:`, {
          rawCategory: kpi.category,
          rawKpiCategoryId: kpi.kpiCategoryId,
          resolvedCategoryId: categoryId,
          categoryName: categoryName,
          availableCategories: Array.from(categoryMap.entries())
        })

        // Transform disaggregation data
        const disaggregationData = kpi.disaggregation || kpi.disaggregationCategories || []
        const safeDisaggregation = Array.isArray(disaggregationData) 
          ? disaggregationData.map((d: any) => safeString(d))
          : []

        const transformedKpi: KpiItem = {
          id: safeString(kpi.id || kpi._id, `kpi-${Date.now()}-${index}`),
          title: safeString(kpi.name || kpi.title, "Untitled KPI"),
          description: safeString(kpi.description, ""),
          subCluster: subClusterId,
          subClusterName: subClusterName,
          category: categoryId,
          categoryName: categoryName, // Add category name for easy access
          stakeholderCategory: safeString(kpi.stakeholderCategory, "N/A"),
          units: safeString(kpi.unit || kpi.units, ""),
          currentValue: safeNumber(kpi.currentValue ?? kpi.current ?? kpi.currentVal, 0),
          targetValue: safeNumber(kpi.targetValue ?? kpi.target ?? kpi.targetVal, 0),
          disaggregation: safeDisaggregation,
        }

        console.log(`Transformed KPI ${index}:`, transformedKpi)
        return transformedKpi
      })

      console.log("KPI transformation completed:", transformed)
      setKpis(transformed)
    } catch (e: any) {
      console.error("Error transforming KPIs:", e)
      const msg = e?.message || "Failed to process KPI data"
      setError(prev => (prev ? prev + '\n' + msg : msg))
      setKpis([])
    } finally {
      setIsLoading(false)
      console.log("KPI refresh completed")
    }
  }

  // Effect to load data when token becomes available
  useEffect(() => {
    if (token) {
      console.log("Token available, initializing KPI data...")
      refresh()
    } else {
      console.log("No token available for KPI initialization")
      setError("Authentication required")
      setKpis([])
      setSubClusters([])
      setCategories([])
    }
  }, [token])
  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ 
    subClusters, 
    categories, 
    focalPersonId,
    kpis, 
    isLoading, 
    error, 
    refresh
  }), [subClusters, categories, focalPersonId, kpis, isLoading, error])

  return <KpiContext.Provider value={value}>{children}</KpiContext.Provider>
}

export function useKpi() {
  const context = useContext(KpiContext)
  if (!context) {
    throw new Error("useKpi must be used within a KpiProvider")
  }
  return context
}

// Helper function to get category name by ID
export const getCategoryName = (categoryId: string, categories: KpiCategory[]): string => {
  const category = categories.find(cat => cat.id === categoryId)
  return category?.name || categoryId
}

// Helper function to get subcluster name by ID
export const getSubClusterName = (subClusterId: string, subClusters: SubCluster[]): string => {
  const subCluster = subClusters.find(sc => sc.id === subClusterId)
  return subCluster?.name || subClusterId
}

// Safe string conversion for rendering
export const safeString = (value: any, fallback: string = "N/A"): string => {
  if (!value) return fallback
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'object') {
    return value.name || value.title || value.displayName || fallback
  }
  return String(value)
}

// Helper hooks for specific data
export function useSubClusters() {
  const { subClusters } = useKpi()
  return subClusters
}

export function useKpiCategories() {
  const { categories } = useKpi()
  return categories
}

export function useKpis() {
  const { kpis } = useKpi()
  return kpis
}

export function useKpiById(id: string) {
  const { kpis } = useKpi()
  return kpis.find(kpi => kpi.id === id)
}

export function useKpisBySubCluster(subClusterId: string) {
  const { kpis } = useKpi()
  return kpis.filter(kpi => kpi.subCluster === subClusterId)
}

export function useKpisByCategory(categoryId: string) {
  const { kpis } = useKpi()
  return kpis.filter(kpi => kpi.category === categoryId)
}