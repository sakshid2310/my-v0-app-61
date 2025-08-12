"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  Search,
  Calendar,
  IndianRupee,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  FileText,
  Info,
  Play,
} from "lucide-react"
import { useAppStore } from "@/lib/store"
import { TaskModal } from "@/components/task-modal"
import { TaskDocuments } from "@/components/task-documents"
import { formatCurrency } from "@/lib/utils"
import { ClientLogo } from "@/components/client-logo"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function Tasks() {
  const { tasks, clients, deleteTask, updateTask } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterClient, setFilterClient] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)

  const filteredTasks = tasks.filter((task) => {
    const client = clients.find((c) => c.id === task.clientId)
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || task.status === filterStatus
    const matchesClient = filterClient === "all" || task.clientId === filterClient
    return matchesSearch && matchesStatus && matchesClient
  })

  const handleEdit = (task: any) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleDelete = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskId)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTask(null)
  }

  const handleViewDocuments = (task: any) => {
    setSelectedTask(task)
    setDocumentsModalOpen(true)
  }

  const handleToggleStatus = (task: any) => {
    const newStatus = task.status === "completed" ? "pending" : "completed"
    updateTask(task.id, { ...task, status: newStatus })
  }

  const handleSetInProgress = (task: any) => {
    updateTask(task.id, { ...task, status: "in-progress" })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800"
      case "in-progress":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700"
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold gradient-text">Tasks</h1>
          <Button onClick={() => setIsModalOpen(true)} className="btn-primary animate-button-press">
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-card border-2"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48 glass-card border-2">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterClient} onValueChange={setFilterClient}>
            <SelectTrigger className="w-48 glass-card border-2">
              <SelectValue placeholder="Filter by client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Group tasks by client */}
        {(() => {
          const tasksByClient = filteredTasks.reduce(
            (acc, task) => {
              const client = clients.find((c) => c.id === task.clientId)
              const clientName = client?.name || "Unknown Client"
              if (!acc[clientName]) {
                acc[clientName] = { client, tasks: [] }
              }
              acc[clientName].tasks.push(task)
              return acc
            },
            {} as Record<string, { client: any; tasks: any[] }>,
          )

          return Object.entries(tasksByClient).map(([clientName, { client, tasks: clientTasks }]) => (
            <div key={clientName} className="space-y-4">
              {/* Client Header */}
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <ClientLogo client={client || { name: clientName }} size="lg" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-card-foreground">{clientName}</h2>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 transition-colors"
                          onClick={() => {
                            // Navigate to clients section
                            const clientsSection = document.querySelector('[data-section="clients"]')
                            if (clientsSection) {
                              clientsSection.scrollIntoView({ behavior: "smooth" })
                            } else {
                              // If using router navigation
                              window.location.hash = "clients"
                            }
                          }}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View client details</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {clientTasks.length} task{clientTasks.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="ml-auto flex space-x-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {clientTasks.filter((t) => t.status === "completed").length} Completed
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    {clientTasks.filter((t) => t.status === "pending").length} Pending
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {clientTasks.filter((t) => t.status === "in-progress").length} In Progress
                  </Badge>
                </div>
              </div>

              {/* Tasks Grid for this client */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-4">
                {clientTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="glass-card border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 animate-slide-up h-[350px] flex flex-col"
                  >
                    <CardHeader className="pb-3 flex-shrink-0">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1 pr-2">
                          <CardTitle className="text-base font-bold text-card-foreground leading-tight break-words mb-1">
                            {task.title}
                          </CardTitle>
                        </div>
                        <div className="flex space-x-1 flex-shrink-0">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 transition-colors"
                                onClick={() => handleViewDocuments(task)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View documents</p>
                            </TooltipContent>
                          </Tooltip>
                          {task.status !== "in-progress" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSetInProgress(task)}
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 transition-colors"
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Mark as in progress</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleStatus(task)}
                                className={`h-8 w-8 p-0 transition-colors ${
                                  task.status === "completed"
                                    ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:text-yellow-300 dark:hover:bg-yellow-900/20"
                                    : "text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
                                }`}
                              >
                                {task.status === "completed" ? (
                                  <Clock className="h-4 w-4" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{task.status === "completed" ? "Mark as pending" : "Mark as completed"}</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(task)}
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit task</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(task.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete task</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 flex-1 flex flex-col">
                      <p className="text-sm text-muted-foreground break-words leading-relaxed line-clamp-2 flex-shrink-0">
                        {task.description}
                      </p>

                      <div className="flex items-center text-sm text-muted-foreground flex-shrink-0">
                        <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="break-words">Due: {new Date(task.deadline).toLocaleDateString()}</span>
                      </div>

                      <div className="flex items-center text-sm flex-shrink-0">
                        <IndianRupee className="mr-2 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                        <span className="font-bold text-lg gradient-text">{formatCurrency(task.price)}</span>
                      </div>

                      {/* Fixed position badges and priority */}
                      <div className="flex items-center justify-between pt-2 mt-auto">
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace("-", " ")}
                        </Badge>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Priority</p>
                          <p className="text-sm font-medium capitalize">{task.priority}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        })()}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-4">No tasks found</div>
            <Button onClick={() => setIsModalOpen(true)} className="btn-primary animate-button-press">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Task
            </Button>
          </div>
        )}

        <TaskModal isOpen={isModalOpen} onClose={handleCloseModal} task={editingTask} />
        <TaskDocuments isOpen={documentsModalOpen} onClose={() => setDocumentsModalOpen(false)} task={selectedTask} />
      </div>
    </TooltipProvider>
  )
}
