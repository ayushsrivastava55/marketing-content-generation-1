'use client'

import { useState } from 'react'
import { PlusIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Migration Timeline</h1>
          <button
            onClick={() => setShowAddTask(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            <PlusIcon className="w-5 h-5" />
            Add Task
          </button>
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
                          <div className="text-right">
                            <div className="text-sm font-medium">{task.assignee}</div>
                            <div className="text-sm text-gray-500">{calculateDaysRemaining(task.endDate)}</div>
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
      </div>
    </div>
  )
} 