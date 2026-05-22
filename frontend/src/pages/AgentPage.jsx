import AgentChat from '../components/AgentChat'

export default function AgentPage() {
  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 sm:px-6 py-6" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">AI Job Agent 🤖</h1>
        <p className="text-gray-500 text-sm mt-1">
          Tell me what you're looking for in plain English and I'll find jobs for you.
        </p>
      </div>
      <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex flex-col">
        <AgentChat />
      </div>
    </div>
  )
}
