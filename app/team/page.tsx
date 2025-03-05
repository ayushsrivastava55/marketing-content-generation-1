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
      name: 'John Doe',
      role: 'Frontend Developer',
      skills: ['React', 'TypeScript', 'CSS', 'Next.js'],
      trainingProgress: [
        {
          course: 'Next.js Advanced',
          progress: 75,
          completed: false
        },
        {
          course: 'Cloud Architecture',
          progress: 100,
          completed: true
        }
      ],
      availability: 80,
      projects: ['Migration Planning', 'UI Modernization'],
      joinDate: '2023-01-15'
    },
    // Add more team members...
  ])

  const [showAddMember, setShowAddMember] = useState(false)
  const [newMember, setNewMember] = useState<AddMemberFormData>({
    name: '',
    role: '',
    skills: [],
    projects: []
  })
  const [newSkill, setNewSkill] = useState('')
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleAddMember = () => {
    const member: TeamMember = {
      id: Date.now().toString(),
      ...newMember,
      trainingProgress: [],
      availability: 100,
      joinDate: new Date().toISOString().split('T')[0]
    }
    setTeamMembers(prev => [...prev, member])
    setShowAddMember(false)
    setNewMember({ name: '', role: '', skills: [], projects: [] })
  }

  const handleDeleteMember = (id: string) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      setTeamMembers(prev => prev.filter(member => member.id !== id))
    }
  }

  const addSkillToMember = (memberId: string, skill: string) => {
    setTeamMembers(prev => prev.map(member => {
      if (member.id === memberId && !member.skills.includes(skill)) {
        return { ...member, skills: [...member.skills, skill] }
      }
      return member
    }))
  }

  const filteredMembers = teamMembers.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const calculateTeamStats = () => {
    const totalMembers = teamMembers.length
    const skillsMap = new Map<string, number>()
    let totalProgress = 0
    let totalCourses = 0

    teamMembers.forEach(member => {
      member.skills.forEach(skill => {
        skillsMap.set(skill, (skillsMap.get(skill) || 0) + 1)
      })
      member.trainingProgress.forEach(course => {
        totalProgress += course.progress
        totalCourses++
      })
    })

    return {
      totalMembers,
      topSkills: Array.from(skillsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
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
                    onClick={() => setSelectedMember(member.id)}
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

        {/* Add Member Modal */}
        {showAddMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add Team Member</h2>
                <button 
                  onClick={() => setShowAddMember(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleAddMember(); }}>
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
                    onClick={() => setShowAddMember(false)}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
                  >
                    Add Member
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