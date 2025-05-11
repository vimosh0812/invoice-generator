export interface InvoiceItem {
  description: string
  price: number
}

export interface InvoiceData {
  invoiceNumber: string
  date: string
  dueDate: string
  clientName: string
  clientEmail: string
  companyName: string
  companyEmail: string
  items: InvoiceItem[]
  notes: string
  terms: string
  taxRate: number
}
