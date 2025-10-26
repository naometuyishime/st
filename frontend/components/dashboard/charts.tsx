"use client"

import React from "react"
import StatsChart from "./stats-chart"

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <StatsChart type="bar" title="Planned vs Actual by Quarter" />
      <StatsChart type="pie" title="Stakeholders by Gender" />
    </div>
  )
}
