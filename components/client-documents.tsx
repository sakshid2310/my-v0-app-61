"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, FileText, Edit, Trash2, Save, X, Upload, File, Eye, Download } from "lucide-react"
import { useAppStore } from "@/lib/store"

interface ClientDocumentsProps {
  clientId: string
  isOpen: boolean
  onClose: () => void
}

export function ClientDocuments({ clientId, isOpen, onClose }: ClientDocumentsProps) {
  const { clients, updateClient } = useAppStore()
  const [isAddingDocument, setIsAddingDocument] = useState(false)
  const [editingDocument, setEditingDocument] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [viewingDocument, setViewingDocument] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newDocument, setNewDocument] = useState({
    title: "",
    type: "contract" as const,
    content: "",
  })

  const client = clients.find((c) => c.id === clientId)
  const documents = client?.documents || []

  const handleAddDocument = () => {
    if (!client || !newDocument.title.trim()) return

    const document = {
      id: Math.random().toString(36).substr(2, 9),
      clientId,
      title: newDocument.title,
      type: newDocument.type,
      content: newDocument.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isImported: false,
    }

    const updatedDocuments = [...(client.documents || []), document]
    updateClient(clientId, { documents: updatedDocuments })

    setNewDocument({ title: "", type: "contract", content: "" })
    setIsAddingDocument(false)
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !client) return

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string

      const document = {
        id: Math.random().toString(36).substr(2, 9),
        clientId,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        type: file.name.toLowerCase().includes("contract")
          ? ("contract" as const)
          : file.name.toLowerCase().includes("proposal")
            ? ("proposal" as const)
            : ("notes" as const),
        content: content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isImported: true,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      }

      const updatedDocuments = [...(client.documents || []), document]
      updateClient(clientId, { documents: updatedDocuments })

      setIsImporting(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }

    // Handle different file types
    if (file.type === "application/pdf" || file.type.startsWith("application/")) {
      reader.readAsDataURL(file) // For PDFs and other binary files
    } else {
      reader.readAsText(file) // For text files
    }
  }

  const handleUpdateDocument = (documentId: string, updates: any) => {
    if (!client) return

    const updatedDocuments = (client.documents || []).map((doc) =>
      doc.id === documentId ? { ...doc, ...updates, updatedAt: new Date().toISOString() } : doc,
    )

    updateClient(clientId, { documents: updatedDocuments })
    setEditingDocument(null)
  }

  const handleDeleteDocument = (documentId: string) => {
    if (!client || !confirm("Are you sure you want to delete this document?")) return

    const updatedDocuments = (client.documents || []).filter((doc) => doc.id !== documentId)
    updateClient(clientId, { documents: updatedDocuments })
  }

  const generatePDF = (document: any) => {
    const timestamp = new Date().toISOString().split("T")[0]
    const clientName = client?.name.replace(/[^a-zA-Z0-9]/g, "_") || "Client"

    // Create HTML content for PDF
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${document.title}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          margin: 40px; 
          color: #333;
        }
        .header { 
          text-align: center; 
          border-bottom: 3px solid #007bff; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
        }
        .title { 
          font-size: 28px; 
          font-weight: bold; 
          color: #007bff; 
          margin-bottom: 10px;
        }
        .subtitle { 
          font-size: 18px; 
          color: #666; 
          text-transform: uppercase;
        }
        .info-section { 
          background: #f8f9fa; 
          padding: 20px; 
          border-radius: 8px; 
          margin-bottom: 30px;
        }
        .info-row { 
          display: flex; 
          margin-bottom: 10px;
        }
        .info-label { 
          font-weight: bold; 
          width: 120px; 
          color: #495057;
        }
        .content-section { 
          margin-top: 30px;
        }
        .content-title { 
          font-size: 20px; 
          font-weight: bold; 
          color: #007bff; 
          border-bottom: 2px solid #dee2e6; 
          padding-bottom: 10px; 
          margin-bottom: 20px;
        }
        .content { 
          white-space: pre-wrap; 
          line-height: 1.8;
        }
        .footer { 
          margin-top: 50px; 
          text-align: center; 
          font-size: 12px; 
          color: #6c757d; 
          border-top: 1px solid #dee2e6; 
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${document.title}</div>
        <div class="subtitle">${document.type.toUpperCase()} DOCUMENT</div>
      </div>
      
      <div class="info-section">
        <div class="info-row">
          <span class="info-label">Client:</span>
          <span>${client?.name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Type:</span>
          <span>${document.type.charAt(0).toUpperCase() + document.type.slice(1)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Created:</span>
          <span>${new Date(document.createdAt).toLocaleDateString()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Updated:</span>
          <span>${new Date(document.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div class="content-section">
        <div class="content-title">Document Content</div>
        <div class="content">${document.content || "No content available"}</div>
      </div>

      <div class="footer">
        Generated by HustlePro • ${new Date().toLocaleDateString()}
      </div>
    </body>
    </html>
  `

    // Create a new window for PDF generation
    const printWindow = window.open("", "_blank", "width=800,height=600")
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()

      // Wait for content to load then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          // Close the window after printing
          setTimeout(() => {
            printWindow.close()
          }, 1000)
        }, 500)
      }
    }
  }

  const handleDownloadDocument = (document: any) => {
    if (document.isImported && document.fileType === "application/pdf") {
      // For imported PDFs, download the original file
      const link = document.createElement("a")
      link.href = document.content
      link.download = document.fileName || `${document.title}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // For all other documents, generate and download as PDF using print functionality
      const timestamp = new Date().toISOString().split("T")[0]
      const clientName = client?.name.replace(/[^a-zA-Z0-9]/g, "_") || "Client"
      const fileName = `${clientName}_${document.title}_${timestamp}`

      // Create HTML content for PDF generation
      const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${document.title}</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
          @page { margin: 1in; }
        }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          margin: 40px; 
          color: #333;
          background: white;
        }
        .header { 
          text-align: center; 
          border-bottom: 3px solid #007bff; 
          padding-bottom: 20px; 
          margin-bottom: 30px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          border-radius: 10px;
        }
        .title { 
          font-size: 32px; 
          font-weight: bold; 
          margin-bottom: 10px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .subtitle { 
          font-size: 18px; 
          opacity: 0.9;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .info-section { 
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); 
          padding: 25px; 
          border-radius: 12px; 
          margin-bottom: 30px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .info-row { 
          display: flex; 
          margin-bottom: 12px;
          align-items: center;
        }
        .info-label { 
          font-weight: bold; 
          width: 140px; 
          color: #495057;
          font-size: 14px;
        }
        .info-value {
          color: #2c3e50;
          font-weight: 500;
        }
        .content-section { 
          margin-top: 30px;
        }
        .content-title { 
          font-size: 24px; 
          font-weight: bold; 
          color: #2c3e50; 
          border-bottom: 3px solid #3498db; 
          padding-bottom: 10px; 
          margin-bottom: 25px;
          position: relative;
        }
        .content-title::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 50px;
          height: 3px;
          background: #e74c3c;
        }
        .content { 
          white-space: pre-wrap; 
          line-height: 1.8;
          font-size: 14px;
          color: #34495e;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #3498db;
        }
        .footer { 
          margin-top: 50px; 
          text-align: center; 
          font-size: 12px; 
          color: #7f8c8d; 
          border-top: 2px solid #ecf0f1; 
          padding-top: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
        }
        .logo {
          font-size: 16px;
          font-weight: bold;
          color: #3498db;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${document.title}</div>
        <div class="subtitle">${document.type.toUpperCase()} DOCUMENT</div>
      </div>
      
      <div class="info-section">
        <div class="info-row">
          <span class="info-label">Client:</span>
          <span class="info-value">${client?.name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Document Type:</span>
          <span class="info-value">${document.type.charAt(0).toUpperCase() + document.type.slice(1)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Created Date:</span>
          <span class="info-value">${new Date(document.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Last Updated:</span>
          <span class="info-value">${new Date(document.updatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</span>
        </div>
        ${
          document.isImported
            ? `
        <div class="info-row">
          <span class="info-label">Original File:</span>
          <span class="info-value">${document.fileName}</span>
        </div>
        `
            : ""
        }
      </div>

      <div class="content-section">
        <div class="content-title">Document Content</div>
        <div class="content">${document.content || "No content available for this document."}</div>
      </div>

      <div class="footer">
        <div class="logo">🚀 HustlePro</div>
        <div>Professional Document Management System</div>
        <div>Generated on ${new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}</div>
      </div>
    </body>
    </html>
    `

      // Create a new window for PDF generation
      const printWindow = window.open("", "_blank", "width=800,height=600")
      if (printWindow) {
        printWindow.document.write(htmlContent)
        printWindow.document.close()

        // Wait for content to load then trigger print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
            // Close the window after printing
            setTimeout(() => {
              printWindow.close()
            }, 1000)
          }, 500)
        }
      }
    }
  }

  const handleViewDocument = (document: any) => {
    setViewingDocument(document)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "contract":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
      case "proposal":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300"
      case "notes":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "contract":
        return "📄"
      case "proposal":
        return "💼"
      case "notes":
        return "📝"
      default:
        return "📁"
    }
  }

  const capitalizeType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Client Documents - {client?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {documents.length} Document{documents.length !== 1 ? "s" : ""}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsImporting(true)}
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import Document
                </Button>
                <Button
                  onClick={() => setIsAddingDocument(true)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Document
                </Button>
              </div>
            </div>

            {isImporting && (
              <Card className="border-2 border-dashed border-green-300 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Upload className="h-5 w-5 text-green-600" />
                    Import Document from Device
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Upload contracts, proposals, and notes sent by your client. Supported formats: PDF, DOC, DOCX, TXT
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.rtf"
                    onChange={handleFileImport}
                    className="hidden"
                  />

                  <div className="flex flex-col gap-4">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-green-600 hover:bg-green-700 text-white w-full"
                    >
                      <File className="mr-2 h-4 w-4" />
                      Choose File from Device
                    </Button>

                    <div className="text-xs text-gray-500 text-center">Maximum file size: 10MB</div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsImporting(false)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ""
                        }
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {isAddingDocument && (
              <Card className="border-2 border-dashed border-blue-300">
                <CardHeader>
                  <CardTitle className="text-lg">Add New Document</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Document title"
                    value={newDocument.title}
                    onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                  />
                  <Select
                    value={newDocument.type}
                    onValueChange={(value: any) => setNewDocument({ ...newDocument, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="notes">Notes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Document content or notes"
                    value={newDocument.content}
                    onChange={(e) => setNewDocument({ ...newDocument, content: e.target.value })}
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddDocument} className="bg-green-600 hover:bg-green-700">
                      <Save className="mr-2 h-4 w-4" />
                      Save Document
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingDocument(false)
                        setNewDocument({ title: "", type: "contract", content: "" })
                      }}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {documents.map((document) => (
                <Card key={document.id} className="glass-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-2xl mt-1">{getTypeIcon(document.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="mb-2">
                            <CardTitle className="text-lg break-words leading-tight">{document.title}</CardTitle>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge className={getTypeColor(document.type)}>{capitalizeType(document.type)}</Badge>
                              <span className="text-xs text-gray-500">
                                Updated {new Date(document.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewDocument(document)}
                                className="h-8 w-8 p-0 hover:bg-purple-100"
                                title="View document"
                              >
                                <Eye className="h-4 w-4 text-purple-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDownloadDocument(document)}
                                className="h-8 w-8 p-0 hover:bg-green-100"
                                title="Download document"
                              >
                                <Download className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingDocument(document.id)}
                                className="h-8 w-8 p-0 hover:bg-blue-100"
                                title="Edit document"
                              >
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteDocument(document.id)}
                                className="h-8 w-8 p-0 hover:bg-red-100"
                                title="Delete document"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {editingDocument === document.id ? (
                      <EditDocumentForm
                        document={document}
                        onSave={(updates) => handleUpdateDocument(document.id, updates)}
                        onCancel={() => setEditingDocument(null)}
                      />
                    ) : (
                      <>
                        {document.isImported && document.fileType ? (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600 mb-2 flex items-start gap-2">
                              <strong className="shrink-0">File:</strong>
                              <span className="break-words leading-tight">{document.fileName}</span>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              <strong>Type:</strong> {document.fileType}
                            </div>
                            {document.fileType === "application/pdf" ? (
                              <div className="text-sm text-gray-500">PDF file imported - click view to preview</div>
                            ) : (
                              <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                                {document.content && !document.content.startsWith("data:")
                                  ? document.content.substring(0, 200) + (document.content.length > 200 ? "..." : "")
                                  : "Click view to see content"}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">
                            {document.content || "No content"}
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {documents.length === 0 && !isAddingDocument && !isImporting && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <div className="text-lg mb-2">No documents yet</div>
                <div className="text-sm">
                  Import contracts, proposals, and notes sent by your clients using the buttons above
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                View Document: {viewingDocument.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 h-full">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl">{getTypeIcon(viewingDocument.type)}</div>
                <div className="flex-1">
                  <h3 className="font-semibold">{viewingDocument.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getTypeColor(viewingDocument.type)}>{capitalizeType(viewingDocument.type)}</Badge>
                    {viewingDocument.fileName && (
                      <div className="text-sm text-gray-600 break-words">File: {viewingDocument.fileName}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border rounded-lg bg-white h-[60vh] overflow-hidden">
                {viewingDocument.fileType === "application/pdf" ? (
                  <iframe
                    src={viewingDocument.content}
                    className="w-full h-full border-0"
                    title={`PDF Viewer - ${viewingDocument.title}`}
                  />
                ) : (
                  <div className="p-4 h-full overflow-y-auto">
                    <div className="whitespace-pre-wrap text-sm">
                      {viewingDocument.content && !viewingDocument.content.startsWith("data:")
                        ? viewingDocument.content
                        : "Content not available for preview"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

function EditDocumentForm({ document, onSave, onCancel }: any) {
  const [title, setTitle] = useState(document.title)
  const [type, setType] = useState(document.type)
  const [content, setContent] = useState(document.content)

  const handleSave = () => {
    onSave({ title, type, content })
  }

  return (
    <div className="space-y-4">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title" />
      <Select value={type} onValueChange={setType}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="contract">Contract</SelectItem>
          <SelectItem value="proposal">Proposal</SelectItem>
          <SelectItem value="notes">Notes</SelectItem>
        </SelectContent>
      </Select>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        placeholder="Document content or notes"
        disabled={document.isImported && document.fileType === "application/pdf"}
      />
      {document.isImported && document.fileType === "application/pdf" && (
        <div className="text-xs text-gray-500">
          Note: PDF content cannot be edited. You can only modify the title and type.
        </div>
      )}
      <div className="flex gap-2">
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>
    </div>
  )
}
