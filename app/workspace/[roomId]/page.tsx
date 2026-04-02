'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import {
  Users,
  MessageSquare,
  FileText,
  Send,
  X,
  Copy,
  CheckCheck,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Save,
  ChevronDown,
  ChevronRight,
  Hash,
  Circle
} from 'lucide-react'
import clsx from 'clsx'

// Types
interface User {
  id: string
  name: string
  color: string
  joinedAt: number
  isOnline: boolean
  cursor?: { x: number; y: number }
}

interface Message {
  id: string
  userId: string
  userName: string
  userColor: string
  content: string
  timestamp: number
  type: 'message' | 'system'
}

interface Document {
  id: string
  title: string
  content: string
  createdBy: string
  createdAt: number
  updatedAt: number
  updatedBy: string
}

interface WorkspaceState {
  users: User[]
  messages: Message[]
  documents: Document[]
}

// Color palette for users
const USER_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
]

const getRandomColor = () => USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]

// Simulate real-time with localStorage + storage events
const getStorageKey = (roomId: string) => `workspace_${roomId}`

const loadWorkspace = (roomId: string): WorkspaceState => {
  if (typeof window === 'undefined') return { users: [], messages: [], documents: [] }
  try {
    const data = localStorage.getItem(getStorageKey(roomId))
    if (data) return JSON.parse(data)
  } catch {}
  return { users: [], messages: [], documents: [] }
}

const saveWorkspace = (roomId: string, state: WorkspaceState) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(getStorageKey(roomId), JSON.stringify(state))
  // Trigger storage event for other tabs
  window.dispatchEvent(new StorageEvent('storage', {
    key: getStorageKey(roomId),
    newValue: JSON.stringify(state)
  }))
}

export default function WorkspacePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomId = params.roomId as string
  const userName = searchParams.get('name') || 'Anonymous'

  const [userId] = useState(() => uuidv4())
  const [userColor] = useState(() => getRandomColor())
  const [workspace, setWorkspace] = useState<WorkspaceState>({ users: [], messages: [], documents: [] })
  const [activeTab, setActiveTab] = useState<'documents' | 'chat' | 'members'>('documents')
  const [activeDocId, setActiveDocId] = useState<string | null>(null)
  const [editingDoc, setEditingDoc] = useState<Document | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const saveTimeoutRef = useRef<NodeJS.Timeout>()
  const heartbeatRef = useRef<NodeJS.Timeout>()

  // Initialize user and load workspace
  useEffect(() => {
    const ws = loadWorkspace(roomId)
    const me: User = {
      id: userId,
      name: userName,
      color: userColor,
      joinedAt: Date.now(),
      isOnline: true
    }

    // Add join message
    const joinMsg: Message = {
      id: uuidv4(),
      userId: 'system',
      userName: 'System',
      userColor: '#94a3b8',
      content: `${userName} joined the workspace`,
      timestamp: Date.now(),
      type: 'system'
    }

    const updated: WorkspaceState = {
      ...ws,
      users: [...ws.users.filter(u => u.id !== userId), me],
      messages: [...ws.messages, joinMsg]
    }

    setWorkspace(updated)
    saveWorkspace(roomId, updated)

    if (updated.documents.length > 0) {
      setActiveDocId(updated.documents[0].id)
    }

    // Heartbeat to keep presence alive
    heartbeatRef.current = setInterval(() => {
      const current = loadWorkspace(roomId)
      const updatedUsers = current.users.map(u =>
        u.id === userId ? { ...u, isOnline: true, joinedAt: u.joinedAt } : u
      )
      // Mark users as offline if no heartbeat in 10s
      const now = Date.now()
      const withPresence = updatedUsers.map(u => ({
        ...u,
        isOnline: u.id === userId ? true : now - u.joinedAt < 30000
      }))
      saveWorkspace(roomId, { ...current, users: withPresence })
    }, 3000)

    // Listen for storage changes (other tabs/windows)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === getStorageKey(roomId) && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue)
          setWorkspace(newState)
        } catch {}
      }
    }
    window.addEventListener('storage', handleStorage)

    return () => {
      clearInterval(heartbeatRef.current)
      window.removeEventListener('storage', handleStorage)
      // Leave message
      const finalWs = loadWorkspace(roomId)
      const leaveMsg: Message = {
        id: uuidv4(),
        userId: 'system',
        userName: 'System',
        userColor: '#94a3b8',
        content: `${userName} left the workspace`,
        timestamp: Date.now(),
        type: 'system'
      }
      saveWorkspace(roomId, {
        ...finalWs,
        users: finalWs.users.filter(u => u.id !== userId),
        messages: [...finalWs.messages, leaveMsg]
      })
    }
  }, [roomId, userId, userName, userColor])

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [workspace.messages])

  // Set active doc when documents load
  useEffect(() => {
    if (!activeDocId && workspace.documents.length > 0) {
      setActiveDocId(workspace.documents[0].id)
    }
  }, [workspace.documents, activeDocId])

  const activeDocument = workspace.documents.find(d => d.id === activeDocId) || null

  const updateWorkspace = useCallback((updater: (ws: WorkspaceState) => WorkspaceState) => {
    const current = loadWorkspace(roomId)
    const updated = updater(current)
    saveWorkspace(roomId, updated)
    setWorkspace(updated)
  }, [roomId])

  const sendMessage = () => {
    if (!messageInput.trim()) return
    const msg: Message = {
      id: uuidv4(),
      userId,
      userName,
      userColor,
      content: messageInput.trim(),
      timestamp: Date.now(),
      type: 'message'
    }
    updateWorkspace(ws => ({ ...ws, messages: [...ws.messages, msg] }))
    setMessageInput('')
  }

  const createDocument = () => {
    const doc: Document = {
      id: uuidv4(),
      title: 'Untitled Document',
      content: '',
      createdBy: userName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      updatedBy: userName
    }
    updateWorkspace(ws => ({ ...ws, documents: [...ws.documents, doc] }))
    setActiveDocId(doc.id)
    setEditingDoc(doc)
    setActiveTab('documents')
  }

  const deleteDocument = (docId: string) => {
    updateWorkspace(ws => ({
      ...ws,
      documents: ws.documents.filter(d => d.id !== docId)
    }))
    if (activeDocId === docId) {
      const remaining = workspace.documents.filter(d => d.id !== docId)
      setActiveDocId(remaining.length > 0 ? remaining[0].id : null)
    }
    setEditingDoc(null)
  }

  const handleDocumentChange = (field: 'title' | 'content', value: string) => {
    if (!editingDoc) return
    const updated = { ...editingDoc, [field]: value, updatedAt: Date.now(), updatedBy: userName }
    setEditingDoc(updated)

    clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      updateWorkspace(ws => ({
        ...ws,
        documents: ws.documents.map(d => d.id === updated.id ? updated : d)
      }))
    }, 300)
  }

  const saveDocument = () => {
    if (!editingDoc) return
    updateWorkspace(ws => ({
      ...ws,
      documents: ws.documents.map(d => d.id === editingDoc.id ? editingDoc : d)
    }))
    setEditingDoc(null)
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLeave = () => {
    router.push('/')
  }

  const onlineUsers = workspace.users.filter(u => u.isOnline)

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800 hidden sm:block">SharedSpace</span>
          </div>
          <div className="h-5 w-px bg-slate-200"></div>
          <button
            onClick={copyRoomId}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Hash className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-mono text-sm font-semibold text-slate-700">{roomId}</span>
            {copied ? (
              <CheckCheck className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Online users avatars */}
          <div className="flex items-center">
            <div className="flex -space-x-2">
              {onlineUsers.slice(0, 4).map(user => (
                <div
                  key={user.id}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                  style={{ backgroundColor: user.color }}
                  title={user.name}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {onlineUsers.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold border-2 border-white">
                  +{onlineUsers.length - 4}
                </div>
              )}
            </div>
            <span className="ml-2 text-sm text-slate-500">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-1"></span>
              {onlineUsers.length} online
            </span>
          </div>

          <button
            onClick={handleLeave}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Leave</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 hidden md:flex">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-slate-200">
            {[
              { id: 'documents', icon: <FileText className="w-4 h-4" />, label: 'Docs' },
              { id: 'chat', icon: <MessageSquare className="w-4 h-4" />, label: 'Chat' },
              { id: 'members', icon: <Users className="w-4 h-4" />, label: 'People' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <div className="p-3">
                <button
                  onClick={createDocument}
                  className="w-full flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm px-3 py-2.5 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Document
                </button>
              </div>
              <div className="px-2 pb-4">
                {workspace.documents.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No documents yet</p>
                  </div>
                ) : (
                  workspace.documents.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setActiveDocId(doc.id)
                        setEditingDoc(null)
                      }}
                      className={clsx(
                        'w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-colors group flex items-center justify-between',
                        activeDocId === doc.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-sm truncate">{doc.title}</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteDocument(doc.id) }}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-0.5 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">
                {workspace.messages.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No messages yet</p>
                  </div>
                ) : (
                  workspace.messages.map(msg => (
                    <div key={msg.id} className={clsx('animate-fade-in', msg.type === 'system' && 'opacity-60')}>
                      {msg.type === 'system' ? (
                        <p className="text-xs text-center text-slate-400 italic">{msg.content}</p>
                      ) : (
                        <div className="flex gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                            style={{ backgroundColor: msg.userColor }}
                          >
                            {msg.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-1.5 mb-0.5">
                              <span className="text-xs font-semibold text-slate-700">{msg.userName}</span>
                              <span className="text-xs text-slate-400">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 break-words">{msg.content}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-3 border-t border-slate-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Message..."
                    className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageInput.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white p-2 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
              <div className="mb-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
                  Online — {onlineUsers.length}
                </p>
                {onlineUsers.map(user => (
                  <div key={user.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50">
                    <div className="relative">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {user.name}
                        {user.id === userId && <span className="text-xs text-slate-400 ml-1">(you)</span>}
                      </p>
                      <p className="text-xs text-slate-400">Active now</p>
                    </div>
                  </div>
                ))}
              </div>

              {workspace.users.filter(u => !u.isOnline).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">
                    Offline — {workspace.users.filter(u => !u.isOnline).length}
                  </p>
                  {workspace.users.filter(u => !u.isOnline).map(user => (
                    <div key={user.id} className="flex items-center gap-3 px-2 py-2 rounded-lg opacity-50">
                      <div className="relative">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                          style={{ backgroundColor: user.color }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-slate-300 border-2 border-white rounded-full"></span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{user.name}</p>
                        <p className="text-xs text-slate-400">Offline</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {activeDocument ? (
            editingDoc && editingDoc.id === activeDocument.id ? (
              /* Edit Mode */
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="text"
                      value={editingDoc.title}
                      onChange={(e) => handleDocumentChange('title', e.target.value)}
                      className="text-lg font-semibold text-slate-800 bg-transparent border-none outline-none focus:ring-0 flex-1 min-w-0"
                      placeholder="Document title..."
                    />
                    <span className="text-xs text-slate-400 shrink-0">Auto-saving...</span>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={saveDocument}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Done
                    </button>
                  </div>
                </div>
                <textarea
                  value={editingDoc.content}
                  onChange={(e) => handleDocumentChange('content', e.target.value)}
                  placeholder="Start writing..."
                  className="flex-1 resize-none p-8 text-slate-700 text-base leading-relaxed focus:outline-none bg-white workspace-grid"
                  style={{ fontFamily: 'ui-monospace, monospace' }}
                />
              </div>
            ) : (
              /* View Mode */
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">{activeDocument.title}</h2>
                    <p className="text-xs text-slate-400">
                      Last edited by {activeDocument.updatedBy} · {new Date(activeDocument.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingDoc({ ...activeDocument })}
                    className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-thin p-8 workspace-grid">
                  {activeDocument.content ? (
                    <pre className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap font-sans">
                      {activeDocument.content}
                    </pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300">
                      <FileText className="w-16 h-16 mb-4" />
                      <p className="text-lg font-medium">Empty document</p>
                      <p className="text-sm mt-1">Click Edit to start writing</p>
                    </div>
                  )}
                </div>
              </div>
            )
          ) : (
            /* No Document Selected */
            <div className="flex-1 flex flex-col items-center justify-center workspace-grid">
              <div className="text-center animate-fade-in">
                <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No document selected</h3>
                <p className="text-slate-400 mb-6">Create a new document or select one from the sidebar</p>
                <button
                  onClick={createDocument}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-colors mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Create Document
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Mobile Bottom Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex z-20">
          {[
            { id: 'documents', icon: <FileText className="w-5 h-5" />, label: 'Docs' },
            { id: 'chat', icon: <MessageSquare className="w-5 h-5" />, label: 'Chat' },
            { id: 'members', icon: <Users className="w-5 h-5" />, label: 'People' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                activeTab === tab.id ? 'text-blue-600' : 'text-slate-400'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
