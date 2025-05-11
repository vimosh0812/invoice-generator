import { formatCurrency } from "@/lib/utils"
import type { InvoiceData } from "@/types/invoice"

interface InvoicePreviewProps {
  invoiceData: InvoiceData
  subtotal: number
  tax: number
  total: number
}

export default function InvoicePreview({ invoiceData, subtotal, tax, total }: InvoicePreviewProps) {
  return (
    <div className="space-y-8 print:text-black">
      <div className="flex justify-between">
        <div>
            <img
              src="/LL-logo.png"
              alt={`${invoiceData.companyName} Logo`}
              className="mb-4 h-16 w-16 object-cover rounded border"
            />
          <h2 className="text-2xl font-bold">{invoiceData.companyName || "Your Company"}</h2>
          {/* <div className="mt-2 whitespace-pre-line">{invoiceData.companyAddress}</div> */}
          {invoiceData.companyEmail && <div className="mt-1">{invoiceData.companyEmail}</div>}
        </div>
        <div className="text-right">
          <h1 className="text-3xl font-bold">INVOICE</h1>
          {invoiceData.invoiceNumber && <div className="mt-1">#{invoiceData.invoiceNumber}</div>}
          {invoiceData.date && (
            <div className="mt-1">
              <span className="font-medium">Date: </span>
              {new Date(invoiceData.date).toLocaleDateString()}
            </div>
          )}
          {invoiceData.dueDate && (
            <div className="mt-1">
              <span className="font-medium">Due Date: </span>
              {new Date(invoiceData.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-b py-6">
        <h3 className="text-lg font-medium mb-2">Bill To:</h3>
        <div className="font-medium">{invoiceData.clientName}</div>
        {/* <div className="mt-1 whitespace-pre-line">{invoiceData.clientAddress}</div> */}
        {invoiceData.clientEmail && <div className="mt-1">{invoiceData.clientEmail}</div>}
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">Description</th>
            {/* <th className="py-2 text-right">Quantity</th> */}
            {/* <th className="py-2 text-right">Price</th> */}
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoiceData.items.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="py-3">{item.description || "Item description"}</td>
              {/* <td className="py-3 text-right">{item.quantity}</td> */}
              {/* <td className="py-3 text-right">{formatCurrency(item.price)}</td> */}
              <td className="py-3 text-right">{formatCurrency(item.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <div className="font-medium">Subtotal:</div>
            <div>{formatCurrency(subtotal)}</div>
          </div>
          {invoiceData.taxRate > 0 && (
            <div className="flex justify-between py-2">
              <div className="font-medium">Tax ({invoiceData.taxRate}%):</div>
              <div>{formatCurrency(tax)}</div>
            </div>
          )}
          <div className="flex justify-between py-2 border-t font-bold">
            <div>Total:</div>
            <div>{formatCurrency(total)}</div>
          </div>
        </div>
      </div>

      {(invoiceData.notes || invoiceData.terms) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {invoiceData.notes && (
            <div>
              <h3 className="font-medium mb-2">Notes:</h3>
              <div className="whitespace-pre-line">{invoiceData.notes}</div>
            </div>
          )}
          {invoiceData.terms && (
            <div>
              <h3 className="font-medium mb-2">Terms & Conditions:</h3>
              <div className="whitespace-pre-line">{invoiceData.terms}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
