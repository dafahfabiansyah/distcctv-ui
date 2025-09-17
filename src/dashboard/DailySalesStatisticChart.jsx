import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Daily Sales Statistic Chart Component
export default function DailySalesStatisticChart({ data, title, salesStatisticDate, onDateChange, onResetDate }) {
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Cari data lengkap berdasarkan label (salesperson)
      const fullData = chartData.find(item => item.salesperson === label)
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-64">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-green-600">Won:</span>
              <span className="font-medium">{fullData?.won || 0} deals</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-600">Lose:</span>
              <span className="font-medium">{fullData?.lose || 0} deals</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">On Progress:</span>
              <span className="font-medium">{fullData?.onProgress || 0} deals</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between">
              <span className="text-green-600">Won Value:</span>
              <span className="font-medium text-xs">{fullData?.wonValueFormatted || 'Rp 0'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-red-600">Lose Value:</span>
              <span className="font-medium text-xs">{fullData?.loseValueFormatted || 'Rp 0'}</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  if (!data || !data.data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-black">{title}</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onResetDate}
                className="text-gray-600"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Select
                value={salesStatisticDate.year.toString()}
                onValueChange={(value) => onDateChange('year', parseInt(value))}
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
                value={salesStatisticDate.month.toString()}
                onValueChange={(value) => onDateChange('month', parseInt(value))}
              >
                <SelectTrigger className="w-32">
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
          </div>
          <div className="flex items-center justify-center h-32 text-gray-500">
            No sales statistic data available
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transform data untuk chart - mengubah struktur data agar lebih mudah dibaca
  const chartData = data.data.labels.map((label, index) => ({
    salesperson: label,
    won: data.data.wonCount[index] || 0,
    lose: data.data.loseCount[index] || 0,
    onProgress: data.data.onProgressCount[index] || 0,
    wonValue: parseInt(data.data.wonValue[index]) || 0,
    loseValue: parseInt(data.data.loseValue[index]) || 0,
    // Format nilai untuk display
    wonValueFormatted: new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0 
    }).format(parseInt(data.data.wonValue[index]) || 0),
    loseValueFormatted: new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0 
    }).format(parseInt(data.data.loseValue[index]) || 0)
  }))

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-black">{title}</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onResetDate}
              className="text-gray-600"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Select
              value={salesStatisticDate.year.toString()}
              onValueChange={(value) => onDateChange('year', parseInt(value))}
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
              value={salesStatisticDate.month.toString()}
              onValueChange={(value) => onDateChange('month', parseInt(value))}
            >
              <SelectTrigger className="w-32">
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
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="salesperson" 
                fontSize={10}
                stroke="#666"
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis stroke="#666" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="won" 
                fill="#10b981" 
                name="Won Deals"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="lose" 
                fill="#ef4444" 
                name="Lose Deals"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="onProgress" 
                fill="#3b82f6" 
                name="On Progress Deals"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}