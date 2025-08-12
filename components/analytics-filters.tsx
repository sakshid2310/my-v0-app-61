"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Filter, TrendingUp, Users, DollarSign } from 'lucide-react'

interface AnalyticsFiltersProps {
  onFilterChange: (filters: any) => void
}

export function AnalyticsFilters({ onFilterChange }: AnalyticsFiltersProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("current-month")
  const [selectedClient, setSelectedClient] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = {
      period: selectedPeriod,
      client: selectedClient,
      status: selectedStatus,
      [key]: value
    }
    
    if (key === "period") setSelectedPeriod(value)
    if (key === "client") setSelectedClient(value)
    if (key === "status") setSelectedStatus(value)
    
    onFilterChange(newFilters)
  }

  return (
    <Card className="glass-card border-0 shadow-xl mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Analytics Filters</span>
            </div>
            
            <Select value={selectedPeriod} onValueChange={(value) => handleFilterChange("period", value)}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedClient} onValueChange={(value) => handleFilterChange("client", value)}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                <SelectItem value="top-clients">Top Clients</SelectItem>
                <SelectItem value="new-clients">New Clients</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              <TrendingUp className="h-3 w-3 mr-1" />
              Live Data
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Calendar className="h-3 w-3 mr-1" />
              {selectedPeriod.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
