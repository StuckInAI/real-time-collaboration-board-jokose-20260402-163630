'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import Image from 'next/image'
import {
  Users,
  Zap,
  MessageSquare,
  FileText,
  ArrowRight,
  CheckCircle,
  Globe,
  Lock
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [userName, setUserName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCreateRoom = () => {
    if (!userName.trim()) return
    setIsCreating(true)
    const newRoomId = uuidv4().slice(0, 8).toUpperCase()
    setTimeout(() => {
      router.push(`/workspace/${newRoomId}?name=${encodeURIComponent(userName.trim())}`)
    }, 500)
  }

  const handleJoinRoom = () => {
    if (!userName.trim() || !roomId.trim()) return
    setIsJoining(true)
    setTimeout(() => {
      router.push(`/workspace/${roomId.trim().toUpperCase()}?name=${encodeURIComponent(userName.trim())}`)
    }, 500)
  }

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Live Updates',
      description: 'See changes in real-time as your team collaborates simultaneously',
      color: 'text-yellow-500 bg-yellow-50'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Team Presence',
      description: 'Know who is online and see live cursors of your teammates',
      color: 'text-blue-500 bg-blue-50'
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Live Chat',
      description: 'Communicate instantly with your team without leaving the workspace',
      color: 'text-green-500 bg-green-50'
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Shared Documents',
      description: 'Create and edit documents together with conflict-free collaboration',
      color: 'text-purple-500 bg-purple-50'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Anywhere Access',
      description: 'Access your workspace from any device, anywhere in the world',
      color: 'text-cyan-500 bg-cyan-50'
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'Private Rooms',
      description: 'Each workspace has a unique ID — only share with people you trust',
      color: 'text-red-500 bg-red-50'
    }
  ]

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b border-white/60 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">SharedSpace</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Zap className="w-3.5 h-3.5" />
              Real-time collaboration
            </div>
            <h1 className="text-5xl font-extrabold text-slate-900 leading-tight mb-6">
              Your team's
              <span className="text-blue-600"> shared workspace</span>
              <br />— live & in sync
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Create a workspace, invite your team, and collaborate in real-time.
              See live cursors, instant messages, and shared documents — all in one place.
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              {['No signup required', 'Instant rooms', 'Free to use'].map(item => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Join/Create Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 animate-slide-up">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Get Started</h2>

            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all"
                maxLength={30}
              />
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={!userName.trim() || isCreating}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 mb-4"
            >
              {isCreating ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  Creating...
                </span>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Create New Workspace
                </>
              )}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-slate-400">or join existing</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Room ID
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="e.g. A1B2C3D4"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-mono"
                maxLength={8}
              />
            </div>

            <button
              onClick={handleJoinRoom}
              disabled={!userName.trim() || !roomId.trim() || isJoining}
              className="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isJoining ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  Joining...
                </span>
              ) : (
                <>
                  Join Workspace
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-3">Everything your team needs</h2>
          <p className="text-slate-500 text-lg">Powerful collaboration tools, zero friction</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color} group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-slate-400 text-sm">
          <p>SharedSpace — Built with Next.js, Socket.IO & Tailwind CSS</p>
        </div>
      </footer>
    </div>
  )
}
