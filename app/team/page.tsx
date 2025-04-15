'use client'

import { useState } from 'react'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface TeamMember {
  id: string
  name: string
  role: string
  skills: string[]
  trainingProgress: {
    course: string
    progress: number
    completed: boolean
  }[]
  availability: number
  projects: string[]
  joinDate: string
}

interface AddMemberFormData {
  name: string
  role: string
  skills: string[]
  projects: string[]
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Smith',
      role: 'Frontend Developer',
      skills: ['React', 'TypeScript', 'Tailwind CSS'],
      trainingProgress: [
        { course: 'Modern React', progress: 100, completed: true },
        { course: 'Advanced TypeScript', progress: 75, completed: false }
      ],
      availability: 80,
      projects: ['UI Modernization', 'Cloud Migration'],
      joinDate: '2023-05-15'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      role: 'Backend Engineer',
      skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
      trainingProgress: [
        { course: 'Serverless Architecture', progress: 90, completed: false },
        { course: 'Database Optimization', progress: 100, completed: true }
      ],
      availability: 65,
      projects: ['Backend Refactoring', 'Migration Planning'],
      joinDate: '2022-11-02'
    },
    {
      id: '3',
      name: 'Miguel Rodriguez',
      role: 'DevOps Engineer',
      skills: ['Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
      trainingProgress: [
        { course: 'Container Orchestration', progress: 100, completed: true },
        { course: 'Infrastructure as Code', progress: 100, completed: true }
      ],
      availability: 70,
      projects: ['Cloud Migration', 'Security Updates'],
      joinDate: '2023-03-10'
    }
  ])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddMember, setShowAddMember] = useState(false)
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [showEditMember, setShowEditMember] = useState(false)
  const [newMember, setNewMember] = useState<AddMemberFormData>({
    name: '',
    role: '',
    skills: [],
    projects: []
  })
  const [newSkill, setNewSkill] = useState('')

  const handleAddMember = () => {
    // Create new team member
    const member: TeamMember = {
      id: String(Date.now()),
      name: newMember.name,
      role: newMember.role,
      skills: newMember.skills,
      trainingProgress: [],
      availability: 100,
      projects: newMember.projects,
      joinDate: new Date().toISOString().split('T')[0]
    }
    
    setTeamMembers(prev => [...prev, member])
    setNewMember({ name: '', role: '', skills: [], projects: [] })
    setShowAddMember(false)
  }
  
  const handleEditMember = () => {
    if (!selectedMember) return
    
    setTeamMembers(prev => prev.map(member => {
      if (member.id === selectedMember) {
        return {
          ...member,
          name: newMember.name,
          role: newMember.role,
          skills: newMember.skills,
          projects: newMember.projects
        }
      }
      return member
    }))
    
    // Reset form and close modal
    setNewMember({ name: '', role: '', skills: [], projects: [] })
    setSelectedMember(null)
    setShowEditMember(false)
  }
  
  const handleDeleteMember = (id: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      setTeamMembers(prev => prev.filter(member => member.id !== id))
    }
  }
  
  const handleEditClick = (id: string) => {
    setSelectedMember(id)
    setShowEditMember(true)
    // In a real app, you would populate the form with the selected member's data
    const member = teamMembers.find(m => m.id === id)
    if (member) {
      setNewMember({
        name: member.name,
        role: member.role,
        skills: [...member.skills],
        projects: [...member.projects]
      })
    }
  }
  
  // Filter members based on search query
  const filteredMembers = teamMembers.filter(member => {
    const query = searchQuery.toLowerCase()
    return (
      member.name.toLowerCase().includes(query) ||
      member.role.toLowerCase().includes(query) ||
      member.skills.some(skill => skill.toLowerCase().includes(query))
    )
  })
  
  const calculateTeamStats = () => {
    // Create a map to count skill occurrences
    const skillCounts = new Map<string, number>()
    
    teamMembers.forEach(member => {
      member.skills.forEach(skill => {
        skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1)
      })
    })
    
    // Sort skills by count and take top 3
    const topSkills = Array.from(skillCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
    
    // Calculate average training progress
    let totalProgress = 0
    let totalCourses = 0
    
    teamMembers.forEach(member => {
      member.trainingProgress.forEach(course => {
        totalProgress += course.progress
        totalCourses++
      })
    })
    
    return {
      totalMembers: teamMembers.length,
      topSkills,
      averageTrainingProgress: totalCourses ? Math.round(totalProgress / totalCourses) : 0
    }
  }

  const stats = calculateTeamStats()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Team Management</h1>
          <button
            onClick={() => setShowAddMember(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            <PlusIcon className="w-5 h-5" />
            Add Team Member
          </button>
        </div>

        {/* Team Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-medium mb-2">Team Size</h3>
            <p className="text-2xl font-bold">{stats.totalMembers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-medium mb-2">Top Skills</h3>
            <div className="flex flex-wrap gap-2">
              {stats.topSkills.map(([skill, count]) => (
                <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {skill} ({count})
                </span>
              ))}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-medium mb-2">Training Progress</h3>
            <p className="text-2xl font-bold">{stats.averageTrainingProgress}%</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search team members by name, role, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        {/* Team Members List */}
        <div className="space-y-4">
          {filteredMembers.map(member => (
            <div key={member.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{member.name}</h3>
                  <p className="text-gray-600">{member.role}</p>
                  <p className="text-sm text-gray-500">Joined {new Date(member.joinDate).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditClick(member.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteMember(member.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Skills */}
              <div className="mt-4">
                <h4 className="font-medium mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Training Progress */}
              <div className="mt-4">
                <h4 className="font-medium mb-2">Training Progress</h4>
                <div className="space-y-3">
                  {member.trainingProgress.map(course => (
                    <div key={course.course} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{course.course}</span>
                        <span className={course.completed ? 'text-green-600' : ''}>
                          {course.progress}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded">
                        <div 
                          className={`h-full rounded ${
                            course.completed ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div className="mt-4">
                <h4 className="font-medium mb-2">Current Projects</h4>
                <div className="flex flex-wrap gap-2">
                  {member.projects.map(project => (
                    <span key={project} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      {project}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Member Modal */}
        {(showAddMember || showEditMember) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{showEditMember ? 'Edit' : 'Add'} Team Member</h2>
                <button 
                  onClick={() => {
                    setShowAddMember(false)
                    setShowEditMember(false)
                    setSelectedMember(null)
                    if (showEditMember) {
                      setNewMember({ name: '', role: '', skills: [], projects: [] })
                    }
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <form onSubmit={(e) => { 
                e.preventDefault(); 
                if (showEditMember) {
                  handleEditMember();
                } else {
                  handleAddMember();
                }
              }}>
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={newMember.name}
                      onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-2 border rounded"
                      placeholder="Enter name"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <input
                      type="text"
                      required
                      value={newMember.role}
                      onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full p-2 border rounded"
                      placeholder="e.g., Frontend Developer"
                    />
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Skills</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        className="flex-1 p-2 border rounded"
                        placeholder="Add a skill"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newSkill.trim()) {
                            setNewMember(prev => ({
                              ...prev,
                              skills: [...prev.skills, newSkill.trim()]
                            }))
                            setNewSkill('')
                          }
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newMember.skills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => {
                              setNewMember(prev => ({
                                ...prev,
                                skills: prev.skills.filter((_, i) => i !== index)
                              }))
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Projects */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Projects</label>
                    <select
                      multiple
                      value={newMember.projects}
                      onChange={(e) => {
                        const values = Array.from(e.target.selectedOptions, option => option.value)
                        setNewMember(prev => ({ ...prev, projects: values }))
                      }}
                      className="w-full p-2 border rounded"
                    >
                      <option value="Migration Planning">Migration Planning</option>
                      <option value="UI Modernization">UI Modernization</option>
                      <option value="Backend Refactoring">Backend Refactoring</option>
                      <option value="Cloud Migration">Cloud Migration</option>
                      <option value="Security Updates">Security Updates</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddMember(false)
                      setShowEditMember(false)
                      setSelectedMember(null)
                    }}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                  >
                    {showEditMember ? 'Update' : 'Add'} Member
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
