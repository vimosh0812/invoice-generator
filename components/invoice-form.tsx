"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus } from "lucide-react"
import type { InvoiceData, InvoiceItem } from "@/types/invoice"

interface InvoiceFormProps {
  invoiceData: InvoiceData
  onInvoiceChange: (data: Partial<InvoiceData>) => void
  onItemsChange: (items: InvoiceItem[]) => void
}

export default function InvoiceForm({ invoiceData, onInvoiceChange, onItemsChange }: InvoiceFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    onInvoiceChange({ [name]: value })
  }

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...invoiceData.items]
    newItems[index] = {
      ...newItems[index],
      [field]: field === "description" ? value : Number(value),
    }
    onItemsChange(newItems)
  }

  const addItem = () => {
    onItemsChange([...invoiceData.items, { description: "", price: 0 }])
  }

  const removeItem = (index: number) => {
    const newItems = invoiceData.items.filter((_, i) => i !== index)
    onItemsChange(newItems)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Your Information</h3>
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" name="companyName" value={invoiceData.companyName} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyAddress">Company Address</Label>
            <Textarea
              id="companyAddress"
              name="companyAddress"
              value={invoiceData.companyAddress}
              onChange={handleChange}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyEmail">Company Number</Label>
            <Input
              id="companyEmail"
              name="companyEmail"
              type="email"
              value={invoiceData.companyEmail}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Customer Information</h3>
            <div className="space-y-2">
            <Label htmlFor="clientName">Customer Name <span className="text-red-500">*</span></Label>
            <Input
              id="clientName"
              name="clientName"
              value={invoiceData.clientName}
              onChange={handleChange}
              placeholder="Enter client's name"
            />
            </div>
          {/* <div className="space-y-2">
            <Label htmlFor="clientAddress">Client Address</Label>
            <Textarea
              id="clientAddress"
              name="clientAddress"
              value={invoiceData.clientAddress}
              onChange={handleChange}
              rows={3}
            />
          </div> */}
            <div className="space-y-2">
            <Label htmlFor="clientEmail">
              Customer Contact Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="clientEmail"
              name="clientEmail"
              type="email"
              value={invoiceData.clientEmail}
              onChange={handleChange}
              required
            />
            </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Invoice Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceNumber">Invoice Number</Label>
            <Input
              id="invoiceNumber"
              name="invoiceNumber"
              value={invoiceData.invoiceNumber}
              onChange={handleChange}
              placeholder="INV-001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Invoice Date</Label>
            <Input id="date" name="date" type="date" value={invoiceData.date} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" name="dueDate" type="date" value={invoiceData.dueDate} onChange={handleChange} />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Invoice Items</h3>
          <Button type="button" onClick={addItem} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        <div className="space-y-4">
          {invoiceData.items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-6">
                <Label htmlFor={`item-${index}-description`}>Description</Label>
                <Input
                  id={`item-${index}-description`}
                  value={item.description}
                  onChange={(e) => handleItemChange(index, "description", e.target.value)}
                />
              </div>
              {/* <div className="col-span-2">
                <Label htmlFor={`item-${index}-quantity`}>Quantity</Label>
                <Input
                  id={`item-${index}-quantity`}
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                />
              </div> */}
              <div className="col-span-3">
                <Label htmlFor={`item-${index}-price`}>Price</Label>
                <Input
                  id={`item-${index}-price`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, "price", e.target.value)}
                />
              </div>
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                  disabled={invoiceData.items.length === 1}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              name="taxRate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={invoiceData.taxRate}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={invoiceData.notes}
            onChange={handleChange}
            placeholder="Any additional notes..."
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="terms">Terms & Conditions</Label>
          <Textarea
            id="terms"
            name="terms"
            value={invoiceData.terms}
            onChange={handleChange}
            placeholder="Payment terms, conditions, etc."
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
