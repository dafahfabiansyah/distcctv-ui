"use client"

import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { dashboardService } from "@/services/dashboard"
import { 
  TrendingUp, 
  TrendingDown, 
  Filter,
  Download,
  BarChart3,
  PieChartIcon,
  RefreshCw,
  Settings,
  Plus,
  Trash2,
  Save
} from "lucide-react"

// Helper function to transform dashboard summary data
const transformDashboardData = (summaryData) => {
  if (!summaryData?.data) return null

  const { leads, cardData, hotLeads, followUpLeads, totalLeads, totalCallCount } = summaryData.data

  // Transform leads data for analytics
  const stageDistribution = {}
  const userDistribution = {}
  const monthlyData = {}

  leads?.forEach(lead => {
    // Count by stage
    const stageName = lead.lead_on_stage?.stage?.name || 'Unknown'
    stageDistribution[stageName] = (stageDistribution[stageName] || 0) + 1

    // Count by user
    const userName = lead.user?.name || 'Unknown'
    userDistribution[userName] = (userDistribution[userName] || 0) + 1

    // Count by month
    const createdMonth = new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short' })
    monthlyData[createdMonth] = (monthlyData[createdMonth] || 0) + 1
  })

  // Transform for charts
  const salesChart = Object.entries(monthlyData).map(([month, count]) => ({
    month,
    sales: count,
    leads: count
  }))

  const pieData = Object.entries(userDistribution).map(([name, value], index) => ({
    name,
    value,
    color: ['#00559a', '#ffb401', '#005499', '#22c55e', '#a855f7'][index % 5]
  }))

  const comparisonData = Object.entries(stageDistribution).map(([name, total]) => ({
    name: name.substring(0, 15), // Truncate long stage names
    won: name.toLowerCase().includes('won') ? total : 0,
    inProgress: name.toLowerCase().includes('waiting') || name.toLowerCase().includes('progress') ? total : 0,
    lose: name.toLowerCase().includes('lose') || name.toLowerCase().includes('lost') ? total : 0,
    total
  }))

  return {
    salesChart: salesChart.length > 0 ? salesChart : [{ month: 'Sep', sales: totalLeads, leads: totalLeads }],
    pieData: pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1, color: '#gray' }],
    revenueData: pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1, color: '#gray' }],
    comparisonData: comparisonData.length > 0 ? comparisonData : [{ name: 'Total', won: 0, inProgress: totalLeads, lose: 0, total: totalLeads }],
    employeesTarget: [
      { month: 'Current', target: totalLeads + 10, achieved: totalLeads }
    ],
    recentActivities: leads?.slice(0, 5).map(lead => ({
      id: lead.id,
      user: lead.user?.name || 'Unknown User',
      action: 'Created new lead',
      target: lead.name || lead.company || 'Unknown Lead',
      time: new Date(lead.created_at).toLocaleString(),
      avatar: '/thoughtful-man.png'
    })) || []
  }
}

// Metric Card Component
function MetricCard({ metric }) {
  const IconComponent = metric.icon
  const isPositive = metric.trend === "up"
  
  return (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg ${metric.color} flex items-center justify-center`}>
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{metric.title}</p>
              <p className="text-2xl font-bold text-black">{metric.value}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {metric.change}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Simple Bar Chart Component - Updated
function SimpleBarChart({ data, title, dataKeys = { primary: 'sales', secondary: 'leads' }, labels = { primary: 'Sales', secondary: 'Leads' }, colors = { primary: 'bg-crm-stage-new', secondary: 'bg-crm-stage-open' } }) {
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-black">{title}</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-center justify-center h-32 text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const maxValue = Math.max(...data.map(d => Math.max(d[dataKeys.primary] || 0, d[dataKeys.secondary] || 0)))
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-black">{title}</h3>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{item.month || item.name || `Item ${index + 1}`}</span>
                <div className="flex gap-4">
                  <span className="text-gray-600">{labels.primary}: {item[dataKeys.primary] || 0}</span>
                  {/* <span className="text-gray-600">{labels.secondary}: {item[dataKeys.secondary]}</span> */}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${colors.primary} h-2 rounded-full transition-all`}
                    style={{ width: `${maxValue > 0 ? ((item[dataKeys.primary] || 0) / maxValue) * 100 : 0}%` }}
                  ></div>
                </div>
                {/* <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${colors.secondary} h-2 rounded-full transition-all`}
                    style={{ width: `${(item[dataKeys.secondary] / maxValue) * 100}%` }}
                  ></div>
                </div> */}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Sales Target Management Modal Component
function SalesTargetModal({ isOpen, onClose, salesTargetDate, onDateChange, onSave }) {
  const [targetPeriod, setTargetPeriod] = useState({
    month: salesTargetDate.month,
    year: salesTargetDate.year
  })
  const [targetList, setTargetList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Month options
  const monthOptions = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' }
  ]
  
  // Year options
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 16 }, (_, i) => currentYear + i)

  // Fetch sales list
  const { data: salesListData, error: salesListError } = useQuery({
    queryKey: ['sales-list'],
    queryFn: () => dashboardService.getSalesList(),
    enabled: isOpen,
    staleTime: 10 * 60 * 1000,
  })

  // Handle different data structures
  let salesList = []
  if (salesListData?.data) {
    salesList = Array.isArray(salesListData.data) ? salesListData.data : []
  } else if (salesListData && Array.isArray(salesListData)) {
    salesList = salesListData
  }

  console.log('Sales list data:', salesListData)
  console.log('Processed sales list:', salesList)

  // Add sales to target list
  const addSalesTarget = (sales) => {
    if (!targetList.find(item => item.user_id === sales.id)) {
      setTargetList(prev => [...prev, {
        user_id: sales.id,
        user_name: sales.name,
        target_value: 0
      }])
    }
  }

  // Remove sales from target list
  const removeSalesTarget = (userId) => {
    setTargetList(prev => prev.filter(item => item.user_id !== userId))
  }

  // Update target value
  const updateTargetValue = (userId, value) => {
    setTargetList(prev => prev.map(item => 
      item.user_id === userId 
        ? { ...item, target_value: parseInt(value) || 0 }
        : item
    ))
  }

  // Handle save
  const handleSave = async () => {
    if (targetList.length === 0) {
      alert('Please add at least one sales target')
      return
    }

    setIsLoading(true)
    try {
      const targetData = {
        month: targetPeriod.month,
        year: targetPeriod.year,
        targets: targetList.map(item => ({
          user_id: item.user_id,
          target_value: item.target_value
        }))
      }

      await dashboardService.storeSalesTarget(targetData)
      
      // Update parent date filter
      onDateChange('month', targetPeriod.month)
      onDateChange('year', targetPeriod.year)
      
      // Trigger refetch
      if (onSave) onSave()
      
      // Close modal and reset
      setTargetList([])
      onClose()
    } catch (error) {
      console.error('Error saving sales target:', error)
      alert('Failed to save sales target')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sales Target Management
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Period Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Month</label>
              <Select
                value={targetPeriod.month.toString()}
                onValueChange={(value) => setTargetPeriod(prev => ({ ...prev, month: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(month => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Year</label>
              <Select
                value={targetPeriod.year.toString()}
                onValueChange={(value) => setTargetPeriod(prev => ({ ...prev, year: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Target List */}
          <div>
            <label className="text-sm font-medium mb-2 block">Sales Target List</label>
            <div className="border rounded-lg">
              {targetList.length > 0 ? (
                <div className="divide-y">
                  {targetList.map((target) => (
                    <div key={target.user_id} className="p-3 flex items-center justify-between">
                      <span className="font-medium">{target.user_name}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Target value"
                          value={target.target_value}
                          onChange={(e) => updateTargetValue(target.user_id, e.target.value)}
                          className="w-32 px-2 py-1 border rounded text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSalesTarget(target.user_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No sales targets added yet
                </div>
              )}
              
              {/* Add Sales Dropdown */}
              <div className="p-3 border-t bg-gray-50">
                {salesListError ? (
                  <div className="text-sm text-red-600">
                    Error loading sales list: {salesListError.message}
                  </div>
                ) : salesList.length > 0 ? (
                  <Select onValueChange={(value) => {
                    const sales = salesList.find(s => s.id.toString() === value)
                    if (sales) addSalesTarget(sales)
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="+ Add more sales" />
                    </SelectTrigger>
                    <SelectContent>
                      {salesList.filter(sales => !targetList.find(item => item.user_id === sales.id)).map(sales => (
                        <SelectItem key={sales.id} value={sales.id.toString()}>
                          {sales.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-gray-500">
                    Loading sales list...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleSave} disabled={isLoading || targetList.length === 0}>
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Target
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Sales Target Chart Component with Year/Month Filter
function SalesTargetChart({ data, title, salesTargetDate, onDateChange, onResetDate, onOpenModal }) {
  // Generate year options (current year ± 2 years)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
  
  // Generate month options
  const monthOptions = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' }
  ]

  if (!data || !data.salesTargets || data.salesTargets.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-black">{title}</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenModal}
                className="text-gray-600"
              >
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
              <Select
                value={salesTargetDate.year.toString()}
                onValueChange={(value) => onDateChange('year', value)}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={salesTargetDate.month.toString()}
                onValueChange={(value) => onDateChange('month', value)}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(month => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={onResetDate}
                title="Reset ke bulan ini"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center justify-center h-32 text-gray-500">
            No sales target data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const { salesTargets, targetTotal, completed, remaining, targetProgress } = data

  // Transform data untuk bar chart
  const chartData = salesTargets.map(target => ({
    name: target.user.name,
    target: target.target_value,
    achieved: parseInt(target.won) || 0,
    percentage: parseInt(target.persentageSales.replace('%', '')) || 0,
    wonRp: target.wonRp,
    remainingRp: target.remainingRp,
    targetRp: `Rp ${target.target_value.toLocaleString('id-ID')}`
  }))

  const maxValue = Math.max(...chartData.map(d => Math.max(d.target, d.achieved)))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-blue-600">
            Target: <span className="font-medium">{data.targetRp}</span>
          </p>
          <p className="text-sm text-green-600">
            Achieved: <span className="font-medium">{data.wonRp}</span>
          </p>
          <p className="text-sm text-gray-600">
            Progress: <span className="font-medium">{data.percentage}%</span>
          </p>
          <p className="text-sm text-orange-600">
            Remaining: <span className="font-medium">{data.remainingRp}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-black">{title}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <span>Total Target: <strong className="text-blue-600">{targetTotal}</strong></span>
              <span>Completed: <strong className="text-green-600">{completed}</strong></span>
              <span>Progress: <strong className="text-orange-600">{targetProgress}</strong></span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenModal}
              className="text-gray-600"
            >
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onResetDate}
              title="Reset ke bulan ini"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
                stroke="#666"
              />
              <YAxis 
                stroke="#666" 
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="target" 
                fill="#e5e7eb" 
                name="Target"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="achieved" 
                fill="#3b82f6" 
                name="Achieved"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Total Target</div>
            <div className="text-lg font-bold text-blue-800">{targetTotal}</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Completed</div>
            <div className="text-lg font-bold text-green-800">{completed}</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-sm text-orange-600 font-medium">Progress</div>
            <div className="text-lg font-bold text-orange-800">{targetProgress}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
// Sales Achievement Chart Component
function SalesAchievementChart({ data, salesTargetDate, onDateChange, onResetDate }) {
  // Generate year options (current year ± 2 years)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
  
  // Generate month options
  const monthOptions = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' }
  ]

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-black">Sales Achievement</h3>
            <div className="flex items-center gap-2">
              <Select
                value={salesTargetDate.year.toString()}
                onValueChange={(value) => onDateChange('year', value)}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={salesTargetDate.month.toString()}
                onValueChange={(value) => onDateChange('month', value)}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map(month => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={onResetDate}
                title="Reset ke bulan ini"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <PieChartIcon className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex items-center justify-center h-32 text-gray-500">
            Loading achievement data...
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transform data untuk pie chart
  const { opportunityTotal, wonTotal, loseTotal } = data

  // Parse nilai rupiah ke angka untuk perhitungan
  const parseRupiah = (rupiah) => {
    if (!rupiah) return 0
    return parseInt(rupiah.replace(/[^0-9]/g, '')) || 0
  }

  const opportunityValue = parseRupiah(opportunityTotal)
  const wonValue = parseRupiah(wonTotal)
  const loseValue = parseRupiah(loseTotal)

  const chartData = [
    {
      name: 'Won',
      value: wonValue,
      color: '#22c55e',
      label: wonTotal
    },
    {
      name: 'Lost',
      value: loseValue,
      color: '#ef4444',
      label: loseTotal
    },
    {
      name: 'Opportunity',
      value: opportunityValue - wonValue - loseValue,
      color: '#3b82f6',
      label: `Rp ${(opportunityValue - wonValue - loseValue).toLocaleString('id-ID')}`
    }
  ].filter(item => item.value > 0)

  const COLORS = chartData.map(item => item.color)

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Value: <span className="font-medium">{data.label}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-black">Sales Achievement Overview</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <span>Period: {monthOptions.find(m => m.value === salesTargetDate.month)?.label} {salesTargetDate.year}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={salesTargetDate.year.toString()}
              onValueChange={(value) => onDateChange('year', value)}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={salesTargetDate.month.toString()}
              onValueChange={(value) => onDateChange('month', value)}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(month => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={onResetDate}
              title="Reset ke bulan ini"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <PieChartIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom"
                height={60}
                formatter={(value, entry) => `${value}: ${entry.payload.label}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Total Won</div>
            <div className="text-lg font-bold text-green-800">{wonTotal}</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-sm text-red-600 font-medium">Total Lost</div>
            <div className="text-lg font-bold text-red-800">{loseTotal}</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Total Opportunity</div>
            <div className="text-lg font-bold text-blue-800">{opportunityTotal}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RecentActivities({ activities }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-black">Recent Activities</h3>
          <Button variant="link" size="sm" className="text-crm-primary">
            View all
          </Button>
        </div>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.avatar} />
                <AvatarFallback>
                  {activity.user.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-black">
                  <span className="font-medium">{activity.user}</span>
                  {" "}{activity.action}{" "}
                  <span className="font-medium">{activity.target}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSalesTargetModalOpen, setIsSalesTargetModalOpen] = useState(false)
  
  // Function to get default date range (7 days back) - sama seperti PipelinePage
  const getDefaultDateRange = () => {
    const today = new Date()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(today.getDate() - 7)
    
    return {
      from: sevenDaysAgo.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0]
    }
  }

  const defaultDates = getDefaultDateRange()
  const [filters, setFilters] = useState({
    dateFrom: defaultDates.from,
    dateTo: defaultDates.to,
    department: '',
    status: ''
  })

  // Local state untuk filter modal (tidak langsung memicu API call)
  const [localFilters, setLocalFilters] = useState({
    dateFrom: defaultDates.from,
    dateTo: defaultDates.to,
    department: '',
    status: ''
  })

  // Sales target date filter (tahun dan bulan)
  const [salesTargetDate, setSalesTargetDate] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1 // JavaScript month is 0-indexed
  })

  const queryClient = useQueryClient()

  // Modal handlers
  const handleOpenSalesTargetModal = () => {
    setIsSalesTargetModalOpen(true)
  }

  const handleCloseSalesTargetModal = () => {
    setIsSalesTargetModalOpen(false)
  }

  const handleSalesTargetSave = () => {
    // Refetch sales target data dan achievement data setelah save
    queryClient.invalidateQueries(['sales-target-data'])
    queryClient.invalidateQueries(['sales-achievement-data'])
  }

  // Fetch only dashboard summary data - this contains everything we need
  const { 
    data: dashboardSummaryData, 
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard
  } = useQuery({
    queryKey: ['dashboard-summary', filters.dateFrom, filters.dateTo],
    queryFn: () => dashboardService.getDashboardSummary({
      from: filters.dateFrom,
      to: filters.dateTo
    }),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  })

  // Fetch sales target data untuk bar chart
  const { 
    data: salesTargetData, 
    isLoading: isSalesTargetLoading,
    error: salesTargetError,
    refetch: refetchSalesTarget
  } = useQuery({
    queryKey: ['sales-target-data', salesTargetDate.year, salesTargetDate.month],
    queryFn: () => dashboardService.getSalesTargetData({
      year: salesTargetDate.year,
      month: salesTargetDate.month
    }),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Only refetch when query key changes
  })

  // Fetch sales achievement data untuk pie chart
  const { 
    data: salesAchievementData, 
    isLoading: isSalesAchievementLoading,
    error: salesAchievementError,
    refetch: refetchSalesAchievement
  } = useQuery({
    queryKey: ['sales-achievement-data', salesTargetDate.year, salesTargetDate.month],
    queryFn: () => dashboardService.getSalesAchievement({
      year: salesTargetDate.year,
      month: salesTargetDate.month
    }),
    staleTime: 5 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Only refetch when query key changes
  })

  const isLoading = isDashboardLoading || isSalesTargetLoading || isSalesAchievementLoading

  // Transform dashboard summary data for charts
  const transformedData = transformDashboardData(dashboardSummaryData)

  // Create metrics from dashboard summary data
  const dashboardMetrics = dashboardSummaryData?.data ? [
    {
      id: 1,
      title: "Total Leads Today",
      value: dashboardSummaryData.data.cardData?.leadCountToday?.toString() || "0",
      change: "+12%", // You can calculate this from historical data
      trend: "up",
      icon: TrendingUp,
      color: "bg-blue-500"
    },
    {
      id: 2,
      title: "Lead Value Won",
      value: dashboardSummaryData.data.cardData?.leadValueWon || "Rp 0",
      change: "+8%",
      trend: "up",
      icon: TrendingUp,
      color: "bg-green-500"
    },
    {
      id: 3,
      title: "Lead Value Opportunity",
      value: dashboardSummaryData.data.cardData?.leadValueOpportunity || "Rp 0",
      change: "+15%",
      trend: "up",
      icon: TrendingUp,
      color: "bg-orange-500"
    },
    {
      id: 4,
      title: "Total Call Count",
      value: dashboardSummaryData.data.totalCallCount?.toString() || "0",
      change: "+5%",
      trend: "up",
      icon: TrendingUp,
      color: "bg-purple-500"
    }
  ] : []

  const hasError = dashboardError || salesTargetError || salesAchievementError

  const handleRefreshData = () => {
    refetchDashboard()
    refetchSalesTarget()
    refetchSalesAchievement()
  }

  // Filter handling functions - untuk modal lokal
  const handleLocalFilterChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleApplyFilters = () => {
    // Hanya saat apply filter, baru update state global yang memicu API call
    setFilters(localFilters)
    console.log('Applied filters:', localFilters)
    setIsFilterOpen(false)
  }

  const handleResetFilters = () => {
    const defaultDates = getDefaultDateRange()
    const resetFilters = {
      dateFrom: defaultDates.from,
      dateTo: defaultDates.to,
      department: '',
      status: ''
    }
    setLocalFilters(resetFilters)
    setFilters(resetFilters)
  }

  // Sinkronisasi local filters dengan global filters saat modal dibuka
  const handleOpenFilterModal = () => {
    setLocalFilters(filters) // Sync dengan state global
    setIsFilterOpen(true)
  }

  // Sales target date filter handlers
  const handleSalesTargetDateChange = (field, value) => {
    setSalesTargetDate(prev => ({
      ...prev,
      [field]: parseInt(value)
    }))
  }

  const resetSalesTargetDate = () => {
    setSalesTargetDate({
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1
    })
  }

  // Debug logging
  useEffect(() => {
    if (dashboardSummaryData) {
      console.log('Dashboard Summary Data:', dashboardSummaryData)
      console.log('Transformed Data:', transformedData)
    }
    if (salesTargetData) {
      console.log('Sales Target Data:', salesTargetData)
    }
    console.log('Current Filters:', filters)
  }, [dashboardSummaryData, transformedData, filters, salesTargetData])

  // Effect untuk auto-refresh data ketika filter berubah - sama seperti PipelinePage
  useEffect(() => {
    console.log('Filters changed, data will auto-refresh via React Query')
  }, [filters.dateFrom, filters.dateTo])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex-1 bg-white p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-crm-primary"></div>
        </div>
      </div>
    )
  }

  // Show error state
  if (hasError) {
    return (
      <div className="flex-1 bg-white p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading dashboard data</p>
            <Button onClick={handleRefreshData} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-white p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-black">Dashboard Overview</h1>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="text-gray-600 bg-transparent"
              onClick={handleRefreshData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" className="text-black bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="text-gray-600 bg-transparent"
                  onClick={handleOpenFilterModal}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Filter Dashboard</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Date From */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="dateFrom" className="text-right text-sm font-medium">
                      Date From
                    </label>
                    <input
                      type="date"
                      id="dateFrom"
                      value={localFilters.dateFrom}
                      onChange={(e) => handleLocalFilterChange('dateFrom', e.target.value)}
                      className="col-span-3 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  {/* Date To */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="dateTo" className="text-right text-sm font-medium">
                      Date To
                    </label>
                    <input
                      type="date"
                      id="dateTo"
                      value={localFilters.dateTo}
                      onChange={(e) => handleLocalFilterChange('dateTo', e.target.value)}
                      className="col-span-3 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  
                  {/* Department */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="department" className="text-right text-sm font-medium">
                      Department
                    </label>
                    <Select
                      value={localFilters.department}
                      onValueChange={(value) => handleLocalFilterChange('department', value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="All Departments"/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Status */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="status" className="text-right text-sm font-medium">
                      Status
                    </label>
                    <Select
                      value={localFilters.status}
                      onValueChange={(value) => handleLocalFilterChange('status', value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="All Status"/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Filter Actions */}
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handleResetFilters}>
                    Reset
                  </Button>
                  <Button onClick={handleApplyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span>Period: {filters.dateFrom} to {filters.dateTo}</span>
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Metrics Cards - Top Row */}
        <div className="col-span-12">
          <div className="grid grid-cols-4 gap-6 mb-6">
            {dashboardMetrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </div>

        {/* Main Charts Section - Bento Style */}
        <div className="col-span-8 space-y-6">
          {/* Bar Chart - Full width */}
          <SimpleBarChart 
            data={transformedData?.salesChart || []} 
            title="Analytics Overview"
          />
          
          {/* Two Pie Charts Side by Side - Auto height */}
          <div className="grid grid-cols-2 gap-6">
            <RechartsPieChart 
              data={transformedData?.pieData || []} 
              title="Leads per Sales User"
            />
            <RechartsPieChart 
              data={transformedData?.revenueData || []} 
              title="Lead Distribution"
            />
          </div>
          
          {/* Comparison Bar Chart - Full width */}
          <RechartsBarChart 
            data={transformedData?.comparisonData || []} 
            title="Lead Status by Stage"
          />
        </div>

        {/* Right Sidebar - Sales Target Chart & Achievement */}
        <div className="col-span-4 space-y-6">
          <SalesTargetChart 
            data={salesTargetData} 
            title="Sales Target"
            salesTargetDate={salesTargetDate}
            onDateChange={handleSalesTargetDateChange}
            onResetDate={resetSalesTargetDate}
            onOpenModal={handleOpenSalesTargetModal}
          />
          
          <SalesAchievementChart 
            data={salesAchievementData} 
            salesTargetDate={salesTargetDate}
            onDateChange={handleSalesTargetDateChange}
            onResetDate={resetSalesTargetDate}
          />
        </div>

        {/* Bottom Section - Recent Activities */}
        <div className="col-span-12">
          <RecentActivities activities={transformedData?.recentActivities || []} />
        </div>
      </div>

      {/* Sales Target Modal */}
      <SalesTargetModal
        isOpen={isSalesTargetModalOpen}
        onClose={handleCloseSalesTargetModal}
        salesTargetDate={salesTargetDate}
        onDateChange={handleSalesTargetDateChange}
        onSave={handleSalesTargetSave}
      />
    </div>
  )
}

// Recharts Pie Chart Component
function RechartsPieChart({ data, title }) {
  const COLORS = data.map(item => item.color)
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium">{((data.value / data.payload.total) * 100).toFixed(1)}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-col gap-1 mt-3">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div 
                className="w-3 h-3 rounded-sm flex-shrink-0" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-700 truncate">{entry.value}</span>
            </div>
            <span className="text-gray-500 ml-2 flex-shrink-0">
              {data[index]?.value}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // Add total to each data item for tooltip calculation
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const dataWithTotal = data.map(item => ({ ...item, total }))

  // Calculate dynamic height based on legend items
  const legendHeight = Math.max(80, data.length * 20 + 40)
  const chartHeight = 200 + legendHeight

  return (
    <Card className="h-fit">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-black truncate">{title}</h3>
          <PieChartIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </div>
        <div style={{ height: `${chartHeight}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithTotal}
                cx="50%"
                cy="35%"
                outerRadius={70}
                paddingAngle={1}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {dataWithTotal.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                content={<CustomLegend />} 
                verticalAlign="bottom"
                height={legendHeight}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function RechartsBarChart({ data, title }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + entry.value, 0)
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label} ({total})</p>
          {payload.reverse().map((entry, index) => (
            <p key={index} className="text-sm text-gray-600">
              {entry.dataKey === 'won' ? 'Won' : entry.dataKey === 'inProgress' ? 'In Progress' : 'Lose'}: 
              <span className="font-medium ml-1" style={{ color: entry.color }}>
                {entry.value}
              </span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-black">{title}</h3>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
                stroke="#666"
              />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {/* Stacked Bars */}
              <Bar 
                dataKey="won" 
                stackId="a"
                fill="#ffb401" 
                name="Won"
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="inProgress" 
                stackId="a"
                fill="#9ca3af" 
                name="In Progress"
                radius={[0, 0, 0, 0]}
              />
              <Bar 
                dataKey="lose" 
                stackId="a"
                fill="#06b6d4" 
                name="Lose"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
