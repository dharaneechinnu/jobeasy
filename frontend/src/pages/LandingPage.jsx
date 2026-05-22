import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-primary-800 text-white px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold">Job<span className="text-blue-300">Easy</span></span>
        <div className="flex gap-3">
          <Link to="/login" className="text-sm text-blue-100 hover:text-white px-3 py-1.5">Login</Link>
          <Link to="/register" className="text-sm bg-white text-primary-800 font-semibold px-4 py-1.5 rounded-lg hover:bg-blue-50">Get Started</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-800 to-primary-600 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Dream Job<br />With AI</h1>
        <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
          Search jobs from LinkedIn, Indeed, Naukri and more — all in one place. Let our AI find the right jobs for you.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register" className="bg-white text-primary-800 font-bold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors">
            Start For Free
          </Link>
          <Link to="/login" className="border border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors">
            Sign In
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Tell the AI', desc: 'Type what job you want in plain English — role, location, experience level.' },
            { step: '2', title: 'AI Searches', desc: 'Our AI searches multiple job portals and finds the best matches for you.' },
            { step: '3', title: 'Apply Directly', desc: 'Click "View Job" to go to the original listing and apply directly.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-12 h-12 bg-primary-800 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">{step}</div>
              <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
              <p className="text-gray-600 text-sm">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Portals */}
      <section className="bg-gray-50 py-12 px-6 text-center">
        <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-6">Jobs aggregated from</p>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {['LinkedIn', 'Indeed', 'Naukri', 'Glassdoor', 'AngelList'].map((portal) => (
            <span key={portal} className="text-gray-400 font-bold text-lg">{portal}</span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 text-sm">
        © 2024 JobEasy. Built for freshers, by developers.
      </footer>
    </div>
  )
}
