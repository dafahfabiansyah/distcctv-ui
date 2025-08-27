import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { useState } from "react"

// QuotationModal Component
function QuotationModal({ selectedLead }) {
  const [quotationItems, setQuotationItems] = useState([
    {
      id: 1,
      productName: '',
      qty: 1,
      unit: 'pcs',
      price: 0,
      ppn: 11,
      discount: 0,
      total: 0
    }
  ])

  const [quotationInfo, setQuotationInfo] = useState({
    quotationNumber: `QUO-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    validUntil: '',
    terms: '30 days',
    notes: ''
  })

  // Calculate total for each item
  const calculateItemTotal = (item) => {
    const subtotal = item.qty * item.price
    const discountAmount = (subtotal * item.discount) / 100
    const afterDiscount = subtotal - discountAmount
    const ppnAmount = (afterDiscount * item.ppn) / 100
    return afterDiscount + ppnAmount
  }

  // Update item and recalculate total
  const updateItem = (id, field, value) => {
    setQuotationItems(items => 
      items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          updatedItem.total = calculateItemTotal(updatedItem)
          return updatedItem
        }
        return item
      })
    )
  }

  // Add new row
  const addNewRow = () => {
    const newItem = {
      id: Date.now(),
      productName: '',
      qty: 1,
      unit: 'pcs',
      price: 0,
      ppn: 11,
      discount: 0,
      total: 0
    }
    setQuotationItems([...quotationItems, newItem])
  }

  // Delete row
  const deleteRow = (id) => {
    if (quotationItems.length > 1) {
      setQuotationItems(items => items.filter(item => item.id !== id))
    }
  }

  // Calculate grand total
  const grandTotal = quotationItems.reduce((sum, item) => sum + item.total, 0)

  return (
    <div className="space-y-6">
      {/* Quotation Info */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quotation Number
          </label>
          <Input
            value={quotationInfo.quotationNumber}
            onChange={(e) => setQuotationInfo({...quotationInfo, quotationNumber: e.target.value})}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <Input
            type="date"
            value={quotationInfo.date}
            onChange={(e) => setQuotationInfo({...quotationInfo, date: e.target.value})}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valid Until
          </label>
          <Input
            type="date"
            value={quotationInfo.validUntil}
            onChange={(e) => setQuotationInfo({...quotationInfo, validUntil: e.target.value})}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Terms
          </label>
          <Select value={quotationInfo.terms} onValueChange={(value) => setQuotationInfo({...quotationInfo, terms: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30 days">30 days</SelectItem>
              <SelectItem value="15 days">15 days</SelectItem>
              <SelectItem value="7 days">7 days</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Customer Info */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Name:</span> {selectedLead?.name || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Email:</span> {selectedLead?.email || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Phone:</span> {selectedLead?.phone || 'N/A'}
          </div>
        </div>
      </div>

           {/* Quotation Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left min-w-[300px]">Product Name</th>
              <th className="border border-gray-300 px-4 py-2 text-center w-24">Qty</th>
              <th className="border border-gray-300 px-4 py-2 text-center w-24">Unit</th>
              <th className="border border-gray-300 px-4 py-2 text-right w-40">Price</th>
              <th className="border border-gray-300 px-4 py-2 text-center w-24">PPN%</th>
              <th className="border border-gray-300 px-4 py-2 text-center w-32">Discount%</th>
              <th className="border border-gray-300 px-4 py-2 text-right w-40">Total</th>
              <th className="border border-gray-300 px-4 py-2 text-center w-20">Action</th>
            </tr>
          </thead>
          <tbody>
            {quotationItems.map((item) => (
              <tr key={item.id}>
                <td className="border border-gray-300 px-2 py-1">
                  <Input
                    value={item.productName}
                    onChange={(e) => updateItem(item.id, 'productName', e.target.value)}
                    placeholder="Enter product name"
                    className="w-full min-w-[280px] border-0 focus:ring-0"
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <Input
                    type="number"
                    value={item.qty}
                    onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                    className="w-full text-center border-0 focus:ring-0"
                    min="1"
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <Select value={item.unit} onValueChange={(value) => updateItem(item.id, 'unit', value)}>
                    <SelectTrigger className="border-0 focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">pcs</SelectItem>
                      <SelectItem value="set">set</SelectItem>
                      <SelectItem value="unit">unit</SelectItem>
                      <SelectItem value="meter">meter</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full text-right border-0 focus:ring-0"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <Input
                    type="number"
                    value={item.ppn}
                    onChange={(e) => updateItem(item.id, 'ppn', parseFloat(e.target.value) || 0)}
                    className="w-full text-center border-0 focus:ring-0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1">
                  <Input
                    type="number"
                    value={item.discount}
                    onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                    className="w-full text-center border-0 focus:ring-0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </td>
                <td className="border border-gray-300 px-2 py-1 text-right font-medium">
                  Rp {item.total.toLocaleString('id-ID')}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteRow(item.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    disabled={quotationItems.length === 1}
                  >
                    ×
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="6" className="border border-gray-300 px-4 py-2 text-right font-medium">
                Grand Total:
              </td>
              <td className="border border-gray-300 px-4 py-2 text-right font-bold text-lg">
                Rp {grandTotal.toLocaleString('id-ID')}
              </td>
              <td className="border border-gray-300"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Add Row Button */}
      <div className="flex justify-start">
        <Button
          type="button"
          variant="outline"
          onClick={addNewRow}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Row
        </Button>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          value={quotationInfo.notes}
          onChange={(e) => setQuotationInfo({...quotationInfo, notes: e.target.value})}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Additional notes or terms..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline">
          Save Draft
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          Generate Quotation
        </Button>
      </div>
    </div>
  )
}

export default QuotationModal