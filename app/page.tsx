"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
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

// Extend the Window interface to include html2pdf
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
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    clientName: "",
    clientEmail: "",
    companyName: "Lightspeed Labs",
    companyEmail: "lightspeedlabs.io@gmail.com",
    items: [{ description: "", price: 0 }],
    notes: "",
    terms: "",
    taxRate: 0,
  })

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
    // Add the style element to the document head
    document.head.appendChild(style)

    // Clean up function to remove the style element when component unmounts
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Reset email dialog state when closed
  useEffect(() => {
    if (!showEmailDialog) {
      setEmailStep("download")
      setPdfDownloaded(false)
    }
  }, [showEmailDialog])

  // Set default email values when client email changes
  useEffect(() => {
    if (invoiceData.clientEmail) {
      setEmailAddress(invoiceData.clientEmail)
      setEmailSubject(
        `Invoice #${invoiceData.invoiceNumber || "New"} from ${invoiceData.companyName || "Your Company"}`,
      )
      setEmailBody(`Dear ${invoiceData.clientName || "Client"},

Please find attached the invoice #${invoiceData.invoiceNumber || "New"}.

Total Amount: ${formatCurrency(calculateTotal())}

If you have any questions, please don't hesitate to contact us.

Best regards,
${invoiceData.companyName || "Your Company"}`)
    }
  }, [
    invoiceData.clientEmail,
    invoiceData.invoiceNumber,
    invoiceData.companyName,
    invoiceData.clientName,
    invoiceData.dueDate,
    invoiceData.items,
    invoiceData.taxRate,
  ])

  // Update PDF filename when invoice number changes
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
        // Create a temporary link and trigger download
        const link = document.createElement("a")
        link.href = result.url
        link.download = result.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }, 100)
  }

  const handleEmailPdfDownload = async () => {
    const result = await generatePDF()
    if (result) {
      // Create a temporary link and trigger download
      const link = document.createElement("a")
      link.href = result.url
      link.download = result.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Mark PDF as downloaded and move to next step
      setPdfDownloaded(true)
      setEmailStep("email")
    }
  }

  const handleOpenEmailClient = () => {
    // Create mailto link with subject and body
    const mailtoLink = `mailto:${emailAddress}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`

    // Open the email client
    window.location.href = mailtoLink

    // Close the dialog
    setShowEmailDialog(false)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-center items-center space-x-4 mb-6 print:hidden">
        <img
          src="/LL-logo.png"
          alt={`${invoiceData.companyName} Logo`}
          className="h-16 w-16 object-cover rounded border"
        />
        <h1 className="text-3xl font-bold text-center">Invoice Generator</h1>
      </div>

      <div className="flex justify-center mb-6 space-x-4 print:hidden">
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

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={() => setShowEmailDialog(true)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Email invoice to client</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" onClick={handlePrint}>
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Print or save as PDF</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider> */}
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

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Email Invoice</DialogTitle>
            <DialogDescription>Send this invoice to your client via email</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Steps currentStep={emailStep === "download" ? 0 : 1}>
              <Step title="Download PDF" description="Generate and download the invoice PDF">
                <div className="mt-4 space-y-4">
                  <Alert className="bg-blue-50 border-blue-200">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      First, download the invoice PDF that you'll attach to your email.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-center">
                    <Button
                      onClick={handleEmailPdfDownload}
                      disabled={pdfGenerating || pdfDownloaded}
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      {pdfGenerating ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      ) : pdfDownloaded ? (
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                      ) : (
                        <Download className="h-5 w-5 mr-2" />
                      )}
                      {pdfDownloaded ? "PDF Downloaded" : "Download Invoice PDF"}
                    </Button>
                  </div>

                  {pdfDownloaded && (
                    <div className="flex justify-center mt-4">
                      <Button variant="outline" onClick={() => setEmailStep("email")} className="flex items-center">
                        Continue to Email
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </Step>

              <Step title="Send Email" description="Open your email client with pre-filled details">
                <div className="mt-4 space-y-4">
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      PDF downloaded successfully! Now you can send the email and attach the PDF.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Recipient Email</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="email"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          placeholder="client@example.com"
                          className="flex-1"
                        />
                        {invoiceData.clientEmail && (
                          <Button variant="outline" size="sm" onClick={() => setEmailAddress(invoiceData.clientEmail)}>
                            Use Client
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="subject"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                          className="flex-1"
                        />
                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(emailSubject)}>
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="body">Email Body</Label>
                      <div className="flex space-x-2">
                        <Textarea
                          id="body"
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          rows={6}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(emailBody)}
                          className="self-start"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Alert className="bg-amber-50 border-amber-200">
                      <FileText className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        Remember to attach the downloaded PDF file ({pdfFilename}) to your email after your email client
                        opens.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </Step>
            </Steps>
          </div>

          <DialogFooter>
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                Cancel
              </Button>

              {emailStep === "email" && (
                <Button onClick={handleOpenEmailClient}>
                  <Mail className="h-4 w-4 mr-2" />
                  Open Email Client
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
