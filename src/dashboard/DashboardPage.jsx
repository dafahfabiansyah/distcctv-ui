"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  Filter,
  Download,
  BarChart3,
  PieChartIcon,
} from "lucide-react"

const chartData = {
  salesChart: [
    { month: "Jan", sales: 4000, leads: 2400 },
    { month: "Feb", sales: 3000, leads: 1398 },
    { month: "Mar", sales: 2000, leads: 9800 },
    { month: "Apr", sales: 2780, leads: 3908 },
    { month: "May", sales: 1890, leads: 4800 },
    { month: "Jun", sales: 2390, leads: 3800 }
  ],

   pieData: [
    { name: "John doe", value: 9999, color: "#00559a" }, // merah
    { name: "John doe", value: 9999, color: "#ffb401" }, // hijau muda
    { name: "John doe", value: 9999, color: "#005499" }, // hijau
    { name: "John doe", value: 9999, color: "#22c55e" }, // biru
    { name: "DISTCCTV AI", value: 9999, color: "#a855f7" } // ungu
  ],
  revenueData: [
    { name: "John doe", value: 9999, color: "#00559a" }, // merah
    { name: "John doe", value: 9999, color: "#ffb401" }, // hijau muda (dominan)
    { name: "John doe", value: 9999, color: "#005499" }, // hijau
    { name: "John doe", value: 9999, color: "#22c55e" }, // biru
    { name: "DISTCCTV AI", value: 9999, color: "#a855f7" } // ungu
  ],
  // Data baru untuk perbandingan kedua pie chart
  comparisonData: [
    { 
      name: "John doev", 
      won: 321, 
      inProgress: 42, 
      lose: 46,
      total: 409
    },
    { 
      name: "John doey", 
      won: 141, 
      inProgress: 144, 
      lose: 39,
      total: 324
    },
    { 
      name: "John doeyy", 
      won: 300, 
      inProgress: 61, 
      lose: 42,
      total: 403
    },
    { 
      name: "John doeyyyy", 
      won: 122, 
      inProgress: 110, 
      lose: 45,
      total: 277
    },
    { 
      name: "John doew", 
      won: 139, 
      inProgress: 9, 
      lose: 27,
      total: 175
    }
  ],
  // Data baru untuk Employees Target
  employeesTarget: [
    { month: "Jan", target: 100, achieved: 85 },
    { month: "Feb", target: 120, achieved: 110 },
    { month: "Mar", target: 110, achieved: 95 },
    { month: "Apr", target: 130, achieved: 125 },
    { month: "May", target: 140, achieved: 135 },
    { month: "Jun", target: 150, achieved: 145 }
  ]
}

const recentActivities = [
  {
    id: 1,
    user: "John Doe",
    action: "Created new lead",
    target: "Acme Corp",
    time: "2 minutes ago",
    avatar: "/thoughtful-man.png"
  },
  {
    id: 2,
    user: "Jane Smith",
    action: "Closed deal",
    target: "Tech Solutions",
    time: "15 minutes ago",
    avatar: "/diverse-woman-portrait.png"
  },
  {
    id: 3,
    user: "Mike Johnson",
    action: "Updated pipeline",
    target: "Global Industries",
    time: "1 hour ago",
    avatar: "/thoughtful-man.png"
  }
]

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
  const maxValue = Math.max(...data.map(d => Math.max(d[dataKeys.primary], d[dataKeys.secondary])))
  
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
                <span className="text-gray-600">{item.month}</span>
                <div className="flex gap-4">
                  <span className="text-gray-600">{labels.primary}: {item[dataKeys.primary]}</span>
                  {/* <span className="text-gray-600">{labels.secondary}: {item[dataKeys.secondary]}</span> */}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${colors.primary} h-2 rounded-full transition-all`}
                    style={{ width: `${(item[dataKeys.primary] / maxValue) * 100}%` }}
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

// Recent Activities Component
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
  const [filters, setFilters] = useState({
    dateRange: '30',
    department: '',
    status: ''
  })

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleApplyFilters = () => {
    console.log('Applied filters:', filters)
    setIsFilterOpen(false)
  }

  const handleResetFilters = () => {
    setFilters({
      dateRange: '30',
      department: '',
      status: ''
    })
  }

  return (
    <div className="flex-1 bg-white p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-black">Dashboard Overview</h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-black bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-gray-600 bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Filter Dashboard</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {/* Date Range */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="dateRange" className="text-right text-sm font-medium">
                      Date Range
                    </label>
                    <Select
                      value={filters.dateRange}
                      onValueChange={(value) => handleFilterChange('dateRange', value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select range"/>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Last 7 days</SelectItem>
                        <SelectItem value="30">Last 30 days</SelectItem>
                        <SelectItem value="90">Last 3 months</SelectItem>
                        <SelectItem value="365">Last year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Department */}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="department" className="text-right text-sm font-medium">
                      Department
                    </label>
                    <Select
                      value={filters.department}
                      onValueChange={(value) => handleFilterChange('department', value)}
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
                      value={filters.status}
                      onValueChange={(value) => handleFilterChange('status', value)}
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
          {/* <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Last updated: Today at 2:30 PM</span>
          </div> */}
          {/* <Separator orientation="vertical" className="h-4" /> */}
          {/* <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>Real-time data</span>
          </div> */}
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Metrics Cards - Top Row */}
        {/* <div className="col-span-12">
          <div className="grid grid-cols-4 gap-6 mb-6">
            {dashboardMetrics.map((metric) => (
              <MetricCard key={metric.id} metric={metric} />
            ))}
          </div>
        </div> */}

        {/* Main Charts Section - Bento Style */}
        <div className="col-span-8 grid grid-cols-2 gap-6">
          {/* Bar Chart - Takes 2 columns */}
          <div className="col-span-2">
            <SimpleBarChart 
              data={chartData.salesChart} 
              title="Analytics Overview"
            />
          </div>
          
          {/* Two Pie Charts Side by Side */}
          <div className="col-span-1">
            <RechartsPieChart 
              data={chartData.pieData} 
              title="Total Won per Sales"
            />
          </div>
          <div className="col-span-1">
            <RechartsPieChart 
              data={chartData.revenueData} 
              title="Total Lose per Sales"
            />
          </div>
          
          {/* New Comparison Bar Chart - Takes 2 columns */}
          <div className="col-span-2">
            <RechartsBarChart 
              data={chartData.comparisonData} 
              title="Won vs Lose Sales Comparison"
            />
          </div>
        </div>

        {/* Right Sidebar - Quick Actions */}
        <div className="col-span-4">
           <SimpleBarChart 
            data={chartData.employeesTarget} 
            title="Employees Target"
            dataKeys={{ primary: 'target', secondary: 'achieved' }}
            labels={{ primary: 'Target', secondary: 'Achieved' }}
            colors={{ primary: 'bg-crm-stage-new', secondary: 'bg-crm-stage-open' }}
          />
        </div>

        {/* Right Sidebar - Employees Target Chart */}
        {/* <div className="col-span-4">
          <SimpleBarChart 
            data={chartData.employeesTarget} 
            title="Employees Target"
            dataKeys={{ primary: 'target', secondary: 'achieved' }}
            labels={{ primary: 'Target', secondary: 'Achieved' }}
            colors={{ primary: 'bg-crm-stage-new', secondary: 'bg-crm-stage-open' }}
          />
        </div> */}

        {/* Bottom Section - Recent Activities */}
        <div className="col-span-12">
          <RecentActivities activities={recentActivities} />
        </div>
      </div>
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
            Value: <span className="font-medium">Rp {data.value.toLocaleString('id-ID')}</span>
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
      <div className="flex flex-col gap-2 mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700">{entry.value}</span>
            <span className="text-gray-500 ml-auto">
              Rp {data[index]?.value.toLocaleString('id-ID')}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // Add total to each data item for tooltip calculation
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const dataWithTotal = data.map(item => ({ ...item, total }))

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-black">{title}</h3>
          <PieChartIcon className="h-5 w-5 text-gray-400" />
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithTotal}
                cx="50%"
                cy="40%"
                outerRadius={80}
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
                height={120}
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
