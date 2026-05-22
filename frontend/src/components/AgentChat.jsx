import { useState, useRef, useEffect } from 'react'
import { agentAPI } from '../api/agentAPI'
import JobCard from './JobCard'
import LoadingSpinner from './LoadingSpinner'

function Message({ msg }) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-primary-800 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-xs md:max-w-md text-sm">
          {msg.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
          <span className="text-primary-800 text-xs font-bold">AI</span>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-xs md:max-w-md text-sm text-gray-800">
          {msg.content}
        </div>
      </div>
      {msg.jobs && msg.jobs.length > 0 && (
        <div className="ml-10 space-y-3">
          {msg.jobs.map((job) => (
            <JobCard key={job.job_id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function AgentChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm JobEasy AI. Tell me what kind of job you're looking for — like 'Find React developer internships in Bangalore' — and I'll search for you!" }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      const { data } = await agentAPI.chat(text)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        jobs: data.jobs || [],
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        jobs: [],
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && (
          <div className="flex items-center gap-2 ml-10">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-800 text-xs font-bold">AI</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm text-gray-400">
              Searching jobs...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="border-t border-gray-200 p-4 bg-white flex gap-2">
        <input
          className="input-field flex-1"
          placeholder="Ask me to find jobs... e.g. 'Find Python internships in Delhi'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} className="btn-primary px-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  )
}
