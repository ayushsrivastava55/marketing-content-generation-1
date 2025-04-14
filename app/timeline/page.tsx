'use client'

import { useState } from 'react'
import { PlusIcon, ChevronDownIcon, ChevronRightIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline'

interface Task {
  id: string
  name: string
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
  startDate: string
  endDate: string
  assignee: string
  dependencies: string[]
  description: string
  progress: number
}

interface Milestone {
  id: string
  phase: string
  tasks: Task[]
  startDate: string
  endDate: string
  progress: number
  expanded?: boolean
}

export default function TimelinePage() {
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: '1',
      phase: 'Planning & Analysis',
      startDate: '2024-01-01',
      endDate: '2024-02-15',
      progress: 75,
      expanded: true,
      tasks: [
        {
          id: '1-1',
          name: 'Requirements Gathering',
          status: 'completed',
          startDate: '2024-01-01',
          endDate: '2024-01-15',
          assignee: 'John Doe',
          dependencies: [],
          description: 'Collect and document all migration requirements',
          progress: 100
        },
        {
          id: '1-2',
          name: 'Technical Assessment',
          status: 'in-progress',
          startDate: '2024-01-16',
          endDate: '2024-02-15',
          assignee: 'Jane Smith',
          dependencies: ['1-1'],
          description: 'Evaluate current technical infrastructure',
          progress: 60
        }
      ]
    },
    {
      id: '2',
      phase: 'Development',
      startDate: '2024-02-16',
      endDate: '2024-04-30',
      progress: 20,
      expanded: true,
      tasks: [
        {
          id: '2-1',
          name: 'Backend Migration',
          status: 'in-progress',
          startDate: '2024-02-16',
          endDate: '2024-03-31',
          assignee: 'Mike Johnson',
          dependencies: ['1-2'],
          description: 'Migrate backend services to new architecture',
          progress: 30
        },
        {
          id: '2-2',
          name: 'Frontend Updates',
          status: 'pending',
          startDate: '2024-03-01',
          endDate: '2024-04-30',
          assignee: 'Sarah Wilson',
          dependencies: ['2-1'],
          description: 'Update frontend components',
          progress: 0
        }
      ]
    }
  ])

  const [showAddTask, setShowAddTask] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [newTask, setNewTask] = useState<Partial<Task>>({
    name: '',
    status: 'pending',
    startDate: '',
    endDate: '',
    assignee: '',
    dependencies: [],
    description: '',
    progress: 0
  })
  const [availableDependencies, setAvailableDependencies] = useState<{id: string, name: string}[]>([])

  const toggleMilestone = (id: string) => {
    setMilestones(prev => prev.map(m => 
      m.id === id ? { ...m, expanded: !m.expanded } : m
    ))
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in-progress': return 'bg-blue-500'
      case 'blocked': return 'bg-red-500'
      default: return 'bg-gray-300'
    }
  }

  const calculateDaysRemaining = (endDate: string) => {
    const days = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return days > 0 ? `${days} days remaining` : 'Overdue'
  }

  const handleAddTaskClick = (milestoneId: string) => {
    setIsEditMode(false)
    setEditingTaskId(null)
    setSelectedMilestone(milestoneId)
    
    // Get available dependencies from all tasks
    const allTasks: {id: string, name: string}[] = []
    milestones.forEach(milestone => {
      milestone.tasks.forEach(task => {
        allTasks.push({ id: task.id, name: task.name })
      })
    })
    setAvailableDependencies(allTasks)
    
    // Set default dates based on selected milestone
    const milestone = milestones.find(m => m.id === milestoneId)
    if (milestone) {
      setNewTask({
        name: '',
        status: 'pending',
        startDate: milestone.startDate,
        endDate: milestone.endDate,
        assignee: '',
        dependencies: [],
        description: '',
        progress: 0
      })
    }
    
    setShowAddTask(true)
  }
  
  const handleEditTask = (milestoneId: string, taskId: string) => {
    setIsEditMode(true)
    setEditingTaskId(taskId)
    setSelectedMilestone(milestoneId)

    // Find the task to edit
    const milestone = milestones.find(m => m.id === milestoneId)
    const taskToEdit = milestone?.tasks.find(t => t.id === taskId)

    if (taskToEdit) {
      // Set form with task data
      setNewTask({
        name: taskToEdit.name,
        status: taskToEdit.status,
        startDate: taskToEdit.startDate,
        endDate: taskToEdit.endDate,
        assignee: taskToEdit.assignee,
        dependencies: taskToEdit.dependencies,
        description: taskToEdit.description,
        progress: taskToEdit.progress
      })

      // Get available dependencies excluding the current task
      const allTasks: {id: string, name: string}[] = []
      milestones.forEach(milestone => {
        milestone.tasks.forEach(task => {
          if (task.id !== taskId) {
            allTasks.push({ id: task.id, name: task.name })
          }
        })
      })
      setAvailableDependencies(allTasks)
      
      setShowAddTask(true)
    }
  }
  
  const handleTaskInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewTask(prev => ({ ...prev, [name]: value }))
  }
  
  const handleDependencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value)
    setNewTask(prev => ({ ...prev, dependencies: selected }))
  }
  
  const resetForm = () => {
    setNewTask({
      name: '',
      status: 'pending',
      startDate: '',
      endDate: '',
      assignee: '',
      dependencies: [],
      description: '',
      progress: 0
    })
    setSelectedMilestone(null)
    setIsEditMode(false)
    setEditingTaskId(null)
    setShowAddTask(false)
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedMilestone || !newTask.name || !newTask.startDate || !newTask.endDate) {
      alert('Please fill in all required fields')
      return
    }
    
    // Update or add task based on mode
    const updatedMilestones = milestones.map(milestone => {
      if (milestone.id === selectedMilestone) {
        let updatedTasks: Task[] = []
        
        if (isEditMode && editingTaskId) {
          // Update existing task
          updatedTasks = milestone.tasks.map(task => {
            if (task.id === editingTaskId) {
              return {
                ...task,
                name: newTask.name || task.name,
                status: (newTask.status as Task['status']) || task.status,
                startDate: newTask.startDate || task.startDate,
                endDate: newTask.endDate || task.endDate,
                assignee: newTask.assignee || task.assignee,
                dependencies: newTask.dependencies || task.dependencies,
                description: newTask.description || task.description,
                progress: Number(newTask.progress) || task.progress
              }
            }
            return task
          })
        } else {
          // Add new task
          const newTaskId = `${milestone.id}-${milestone.tasks.length + 1}`
          updatedTasks = [
            ...milestone.tasks,
            {
              id: newTaskId,
              name: newTask.name || '',
              status: (newTask.status as Task['status']) || 'pending',
              startDate: newTask.startDate || '',
              endDate: newTask.endDate || '',
              assignee: newTask.assignee || '',
              dependencies: newTask.dependencies || [],
              description: newTask.description || '',
              progress: Number(newTask.progress) || 0
            }
          ]
        }
        
        // Recalculate milestone progress based on tasks
        const totalProgress = updatedTasks.reduce((sum, task) => sum + task.progress, 0)
        const averageProgress = Math.round(totalProgress / updatedTasks.length)
        
        return {
          ...milestone,
          tasks: updatedTasks,
          progress: averageProgress
        }
      }
      return milestone
    })
    
    setMilestones(updatedMilestones)
    resetForm()
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Migration Timeline</h1>
        </div>

        {/* Timeline Overview */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Project Progress</h2>
          <div className="space-y-6">
            {milestones.map(milestone => (
              <div key={milestone.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleMilestone(milestone.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {milestone.expanded ? (
                        <ChevronDownIcon className="w-5 h-5" />
                      ) : (
                        <ChevronRightIcon className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <h3 className="font-medium">{milestone.phase}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(milestone.startDate).toLocaleDateString()} - {new Date(milestone.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      {milestone.progress}% Complete
                    </div>
                    <div className="w-32 h-2 bg-gray-200 rounded">
                      <div
                        className="h-full bg-blue-500 rounded"
                        style={{ width: `${milestone.progress}%` }}
                      ></div>
                    </div>
                    <button
                      onClick={() => handleAddTaskClick(milestone.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add Task
                    </button>
                  </div>
                </div>

                {milestone.expanded && (
                  <div className="pl-8 space-y-4">
                    {milestone.tasks.map(task => (
                      <div key={task.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`}></span>
                              <h4 className="font-medium">{task.name}</h4>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="text-right">
                              <div className="text-sm font-medium">{task.assignee}</div>
                              <div className="text-sm text-gray-500">{calculateDaysRemaining(task.endDate)}</div>
                            </div>
                            <button
                              onClick={() => handleEditTask(milestone.id, task.id)}
                              className="p-1 hover:bg-gray-200 rounded"
                              title="Edit task"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded">
                            <div
                              className={`h-full rounded ${getStatusColor(task.status)}`}
                              style={{ width: `${task.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        {task.dependencies.length > 0 && (
                          <div className="mt-2 text-sm text-gray-500">
                            Dependencies: {task.dependencies.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Task Form Modal (for both Add and Edit) */}
        {showAddTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-xl font-semibold">
                  {isEditMode ? 'Edit Task' : 'Add New Task'}
                </h3>
                <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Task Name*</label>
                    <input
                      type="text"
                      name="name"
                      value={newTask.name || ''}
                      onChange={handleTaskInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      name="status"
                      value={newTask.status || 'pending'}
                      onChange={handleTaskInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Start Date*</label>
                    <input
                      type="date"
                      name="startDate"
                      value={newTask.startDate || ''}
                      onChange={handleTaskInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">End Date*</label>
                    <input
                      type="date"
                      name="endDate"
                      value={newTask.endDate || ''}
                      onChange={handleTaskInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Assignee</label>
                    <input
                      type="text"
                      name="assignee"
                      value={newTask.assignee || ''}
                      onChange={handleTaskInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Progress (%)</label>
                    <input
                      type="number"
                      name="progress"
                      min="0"
                      max="100"
                      value={newTask.progress || 0}
                      onChange={handleTaskInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Dependencies</label>
                    <select
                      multiple
                      name="dependencies"
                      value={newTask.dependencies || []}
                      onChange={handleDependencyChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      size={4}
                    >
                      {availableDependencies.map(dep => (
                        <option key={dep.id} value={dep.id}>
                          {dep.name} ({dep.id})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      name="description"
                      value={newTask.description || ''}
                      onChange={handleTaskInputChange}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    ></textarea>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {isEditMode ? 'Update Task' : 'Add Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 