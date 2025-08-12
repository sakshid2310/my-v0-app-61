"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Mail, Phone, MapPin, Edit, Trash2, FileText } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { ClientModal } from "@/components/client-modal"
import { ClientDocuments } from "@/components/client-documents"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

export function Clients() {
  const { clients, deleteClient } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (client: any) => {
    setEditingClient(client)
    setIsModalOpen(true)
  }

  const handleDelete = (clientId: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      deleteClient(clientId)
    }
  }

  const handleViewDocuments = (clientId: string) => {
    setSelectedClientId(clientId)
    setDocumentsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingClient(null)
  }

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`
  }

  // Filter documents to only show contracts, proposals, and notes
  const getClientDocuments = (client: any) => {
    return (client.documents || []).filter(
      (doc: any) => doc.type === "contract" || doc.type === "proposal" || doc.type === "notes",
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold gradient-text">Clients</h1>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white animate-button-press"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-card border-white/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            const clientDocuments = getClientDocuments(client)
            return (
              <Card
                key={client.id}
                className="glass-card border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-[400px] flex flex-col"
              >
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      {client.logo ? (
                        <img
                          src={client.logo || "/placeholder.svg"}
                          alt={`${client.name} logo`}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 shadow-sm flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg font-bold text-gray-800 truncate">{client.name}</CardTitle>
                      </div>
                    </div>
                    <div className="flex space-x-2 flex-shrink-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewDocuments(client.id)}
                            className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/20 transition-colors"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View documents</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(client)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit client</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(client.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete client</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col">
                  <div className="flex items-start text-sm text-gray-600">
                    <Mail className="mr-3 h-4 w-4 mt-0.5 flex-shrink-0" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEmailClick(client.email)}
                      className="h-auto p-0 hover:bg-transparent hover:text-blue-600 justify-start text-left flex-1 truncate"
                    >
                      {client.email}
                    </Button>
                  </div>
                  <div className="flex items-start text-sm text-gray-600">
                    <Phone className="mr-3 h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="flex-1 truncate">{client.phone}</span>
                  </div>
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="mr-3 h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="flex-1 break-words">{client.address}</span>
                  </div>

                  {/* Fixed position badges */}
                  <div className="flex items-center justify-between pt-2 mt-auto">
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700"
                    >
                      Active Client
                    </Badge>
                    <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700">
                      <FileText className="mr-1 h-3 w-3" />
                      {clientDocuments.length} Docs
                    </Badge>
                  </div>

                  {/* Documents section with fixed height */}
                  <div className="pt-3 border-t border-gray-100 min-h-[80px]">
                    {clientDocuments.length > 0 ? (
                      <>
                        <div className="text-xs text-gray-500 mb-2">Recent Documents:</div>
                        <div className="space-y-1">
                          {clientDocuments.slice(0, 2).map((doc) => (
                            <div key={doc.id} className="flex items-center text-xs text-gray-600">
                              <span className="mr-2">{getTypeIcon(doc.type)}</span>
                              <span className="truncate flex-1">{doc.title}</span>
                              <Badge variant="outline" className="text-xs ml-2">
                                {capitalizeType(doc.type)}
                              </Badge>
                            </div>
                          ))}
                          {clientDocuments.length > 2 && (
                            <div className="text-xs text-gray-400">+{clientDocuments.length - 2} more documents</div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-gray-400 text-center flex items-center justify-center h-full">
                        No documents yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No clients found</div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Client
            </Button>
          </div>
        )}

        <ClientModal isOpen={isModalOpen} onClose={handleCloseModal} client={editingClient} />
        <ClientDocuments
          clientId={selectedClientId || ""}
          isOpen={documentsModalOpen}
          onClose={() => setDocumentsModalOpen(false)}
        />
      </div>
    </TooltipProvider>
  )
}
