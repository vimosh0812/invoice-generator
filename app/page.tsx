"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Printer, Copy, Check, Download, FileText, Loader2, CheckCircle2, ArrowRight } from "lucide-react"
import InvoiceForm from "@/components/invoice-form"
import InvoicePreview from "@/components/invoice-preview"
import type { InvoiceData, InvoiceItem } from "@/types/invoice"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Steps, Step } from "@/components/ui/steps"

declare global {
  interface Window {
    html2pdf: any
  }
}

export default function InvoiceGenerator() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form")
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailAddress, setEmailAddress] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [copied, setCopied] = useState(false)
  const [pdfGenerating, setPdfGenerating] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfFilename, setPdfFilename] = useState("invoice.pdf")
  const [pdfDownloaded, setPdfDownloaded] = useState(false)
  const [emailStep, setEmailStep] = useState<"download" | "email">("download")
  const invoiceRef = useRef<HTMLDivElement>(null)

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: "INV-",
    date: "",
    dueDate: "",
    clientName: "",
    clientEmail: "",
    companyName: "Akash Garlands",
    companyEmail: "0767722120",
    items: [{ description: "", price: 0 }],
    notes: "",
    terms: "",
    taxRate: 0,
    companyAddress: "No: 29, Barathi Village, Sinna Urani, Batticaloa",
  })

  // Set the date only on the client to avoid hydration mismatch
  useEffect(() => {
    setInvoiceData((prev) => ({
      ...prev,
      date: new Date().toISOString().split("T")[0],
    }))
  }, [])

  // Load html2pdf.js script dynamically
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Add print-specific styles when the component mounts
  useEffect(() => {
    // Create a style element for print-specific styles
    const style = document.createElement("style")
    style.innerHTML = `
      @media print {
        @page { 
          margin: 1cm;
          size: auto;
        }
        /* Hide browser's header and footer */
        html {
          height: 100%;
        }
        body {
          height: 100%;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden;
        }
        /* Hide all browser elements */
        head, header, footer {
          display: none !important;
        }
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  useEffect(() => {
      setEmailStep("download")
      setPdfDownloaded(false)
  })

  useEffect(() => {
    if (invoiceData.invoiceNumber) {
      setPdfFilename(`Invoice_${invoiceData.invoiceNumber}.pdf`)
    } else {
      setPdfFilename("Invoice.pdf")
    }
  }, [invoiceData.invoiceNumber])

  const handleInvoiceChange = (data: Partial<InvoiceData>) => {
    setInvoiceData((prev) => ({ ...prev, ...data }))
  }

  const handleItemChange = (items: InvoiceItem[]) => {
    setInvoiceData((prev) => ({ ...prev, items }))
  }

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (item?.price || 0), 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * (invoiceData.taxRate / 100)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
    }).format(amount)
  }

  const handlePrint = () => {
    // Always switch to preview before printing
    setActiveTab("preview")
    // Use setTimeout to ensure the UI updates before printing
    setTimeout(() => {
      window.print()
    }, 100)
  }

  const generatePDF = async () => {
    if (!invoiceRef.current || typeof window.html2pdf === "undefined") {
      alert("PDF generation is not ready yet. Please try again in a moment.")
      return null
    }

    setPdfGenerating(true)

    try {
      // Clone the invoice element to modify it for PDF generation
      const element = invoiceRef.current.cloneNode(true) as HTMLElement

      // Create a container with white background
      const container = document.createElement("div")
      container.style.backgroundColor = "white"
      container.style.padding = "20px"
      container.appendChild(element)

      // Configure html2pdf options
      const opt = {
        margin: 10,
        filename: pdfFilename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }

      // Generate PDF
      const pdfBlob = await window.html2pdf().from(container).set(opt).outputPdf("blob")

      // Create a URL for the blob
      const url = URL.createObjectURL(pdfBlob)
      setPdfUrl(url)

      return { url, filename: pdfFilename, blob: pdfBlob }
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
      return null
    } finally {
      setPdfGenerating(false)
    }
  }

  const handleDownloadPDF = async () => {
    // Always switch to preview before generating PDF
    setActiveTab("preview")

    // Use setTimeout to ensure the UI updates before generating PDF
    setTimeout(async () => {
      const result = await generatePDF()
      if (result) {
        const link = document.createElement("a")
        link.href = result.url
        link.download = result.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }, 100)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-center items-center space-x-4 mb-6 print:hidden">
        <img
          src="/logo.png"
          alt={`${invoiceData.companyName} Logo`}
          className="h-16 w-16"
        />
        <h1 className="text-3xl font-bold text-center">Akash Flowers</h1>
      </div>

      {/* Hide tab buttons on desktop (lg and up), show only on mobile/tablet */}
      <div className="flex justify-center mb-6 space-x-4 print:hidden lg:hidden">
        <Button variant={activeTab === "form" ? "default" : "outline"} onClick={() => setActiveTab("form")}>
          Edit Invoice
        </Button>
        <Button variant={activeTab === "preview" ? "default" : "outline"} onClick={() => setActiveTab("preview")}>
          Preview Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:block print:gap-0">
        {activeTab === "form" ? (
          <Card className="print:hidden">
            <CardContent className="pt-6">
              <InvoiceForm
                invoiceData={invoiceData}
                onInvoiceChange={handleInvoiceChange}
                onItemsChange={handleItemChange}
              />
            </CardContent>
          </Card>
        ) : null}

        <div className={activeTab === "form" ? "hidden lg:block" : "block"}>
          <div className="flex justify-end mb-4 space-x-2 print:hidden">
            <TooltipProvider>
              <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={handleDownloadPDF} disabled={pdfGenerating}>
                {pdfGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Download PDF
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download invoice as PDF</p>
              </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Card className="print:shadow-none print:border-none">
            <CardContent className="pt-6">
              <div ref={invoiceRef}>
                <InvoicePreview
                  invoiceData={invoiceData}
                  subtotal={calculateSubtotal()}
                  tax={calculateTax()}
                  total={calculateTotal()}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
