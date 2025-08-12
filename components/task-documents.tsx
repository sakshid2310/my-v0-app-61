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

interface TaskDocumentsProps {
  isOpen: boolean
  onClose: () => void
  task: any
}

export function TaskDocuments({ isOpen, onClose, task }: TaskDocumentsProps) {
  const { updateTask } = useAppStore()
  const [isAddingDocument, setIsAddingDocument] = useState(false)
  const [editingDocument, setEditingDocument] = useState<string | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [viewingDocument, setViewingDocument] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [newDocument, setNewDocument] = useState({
    title: "",
    type: "project-notes" as const,
    content: "",
  })

  if (!task) return null

  const documents = task.documents || []

  const handleAddDocument = () => {
    if (!task || !newDocument.title.trim()) return

    const document = {
      id: Math.random().toString(36).substr(2, 9),
      taskId: task.id,
      title: newDocument.title,
      type: newDocument.type,
      content: newDocument.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isImported: false,
    }

    const updatedDocuments = [...(task.documents || []), document]
    updateTask(task.id, { documents: updatedDocuments })

    setNewDocument({ title: "", type: "project-notes", content: "" })
    setIsAddingDocument(false)
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !task) return

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
        taskId: task.id,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        type: file.name.toLowerCase().includes("documentation")
          ? ("documentation" as const)
          : file.name.toLowerCase().includes("notes")
            ? ("project-notes" as const)
            : ("project-notes" as const),
        content: content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isImported: true,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      }

      const updatedDocuments = [...(task.documents || []), document]
      updateTask(task.id, { documents: updatedDocuments })

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
    if (!task) return

    const updatedDocuments = (task.documents || []).map((doc) =>
      doc.id === documentId ? { ...doc, ...updates, updatedAt: new Date().toISOString() } : doc,
    )

    updateTask(task.id, { documents: updatedDocuments })
    setEditingDocument(null)
  }

  const handleDeleteDocument = (documentId: string) => {
    if (!task || !confirm("Are you sure you want to delete this document?")) return

    const updatedDocuments = (task.documents || []).filter((doc) => doc.id !== documentId)
    updateTask(task.id, { documents: updatedDocuments })
  }

  const handleViewDocument = (document: any) => {
    setViewingDocument(document)
  }

  const handleDownloadDocument = (document: any) => {
    if (document.isImported && document.fileType === "application/pdf") {
      // For imported PDF files, download the original file
      const link = document.createElement("a")
      link.href = document.content
      link.download = document.fileName || `${document.title}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      // For text documents, generate PDF using print functionality
      generateDocumentPDF(document)
    }
  }

  const generateDocumentPDF = (document: any) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const html = generateDocumentHTML(document)
    printWindow.document.write(html)
    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }

  const generateDocumentHTML = (document: any) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${document.title} - Task Document</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background: white;
            }
            
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              margin-bottom: 30px;
            }
            
            .header h1 {
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 8px;
            }
            
            .header p {
              font-size: 16px;
              opacity: 0.9;
            }
            
            .container {
              max-width: 800px;
              margin: 0 auto;
              padding: 0 20px;
            }
            
            .document-info {
              background: #f8fafc;
              border-radius: 12px;
              padding: 25px;
              margin-bottom: 30px;
              border-left: 4px solid #667eea;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
            }
            
            .info-item {
              display: flex;
              flex-direction: column;
            }
            
            .info-label {
              font-weight: 600;
              color: #4a5568;
              font-size: 14px;
              margin-bottom: 4px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .info-value {
              font-size: 16px;
              color: #2d3748;
            }
            
            .content-section {
              background: white;
              border-radius: 12px;
              padding: 30px;
              border: 1px solid #e2e8f0;
              margin-bottom: 30px;
            }
            
            .content-title {
              font-size: 20px;
              font-weight: 600;
              color: #2d3748;
              margin-bottom: 20px;
              padding-bottom: 10px;
              border-bottom: 2px solid #e2e8f0;
            }
            
            .content-text {
              font-size: 14px;
              line-height: 1.8;
              color: #4a5568;
              white-space: pre-wrap;
            }
            
            .footer {
              text-align: center;
              padding: 20px;
              border-top: 1px solid #e2e8f0;
              margin-top: 40px;
              color: #718096;
              font-size: 12px;
            }
            
            .footer strong {
              color: #4a5568;
            }
            
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📋 Task Document</h1>
            <p>HustlePro - Professional Task Management</p>
          </div>
          
          <div class="container">
            <div class="document-info">
              <div class="info-grid">
                <div class="info-item">
                  <div class="info-label">Document Title</div>
                  <div class="info-value">${document.title}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Task</div>
                  <div class="info-value">${task.title}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Document Type</div>
                  <div class="info-value">${document.type.charAt(0).toUpperCase() + document.type.slice(1).replace("-", " ")}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Created Date</div>
                  <div class="info-value">${new Date(document.createdAt).toLocaleDateString()}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Last Updated</div>
                  <div class="info-value">${new Date(document.updatedAt).toLocaleDateString()}</div>
                </div>
                ${
                  document.fileName
                    ? `
                <div class="info-item">
                  <div class="info-label">Original File</div>
                  <div class="info-value">${document.fileName}</div>
                </div>
                `
                    : ""
                }
              </div>
            </div>
            
            <div class="content-section">
              <div class="content-title">Document Content</div>
              <div class="content-text">${document.content || "No content available"}</div>
            </div>
          </div>
          
          <div class="footer">
            <strong>HustlePro</strong> - Professional Task Management System<br>
            Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
          </div>
        </body>
      </html>
    `
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "project-notes":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
      case "documentation":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "project-notes":
        return "📝"
      case "documentation":
        return "📄"
      default:
        return "📁"
    }
  }

  const capitalizeType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ")
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Task Documents - {task?.title}
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
                    Upload project files, documentation, and notes. Supported formats: PDF, DOC, DOCX, TXT
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
                      <SelectItem value="project-notes">Project Notes</SelectItem>
                      <SelectItem value="documentation">Documentation</SelectItem>
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
                        setNewDocument({ title: "", type: "project-notes", content: "" })
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
                                onClick={() => handleDownloadDocument(document)}
                                className="h-8 w-8 p-0 hover:bg-green-100"
                                title="Download document"
                              >
                                <Download className="h-4 w-4 text-green-600" />
                              </Button>
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
                <div className="text-sm">Import project files, documentation, and notes using the buttons above</div>
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
          <SelectItem value="project-notes">Project Notes</SelectItem>
          <SelectItem value="documentation">Documentation</SelectItem>
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
