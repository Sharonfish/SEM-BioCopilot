import Link from 'next/link'
import { ArrowRight, Code2, Sparkles, Database } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            BioCopilot
          </h1>
          <p className="text-2xl mb-8 text-gray-700 dark:text-gray-300">
            Your Intelligent Bioinformatics Research Assistant
          </p>
          
          {/* CTA Button */}
          <div className="mb-12">
            <Link
              href="/ide"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold text-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <Code2 className="h-6 w-6" />
              Launch IDE
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center mb-4">
                <Database className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold mb-3 text-blue-600">Sequence Analysis</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Powerful DNA, RNA and protein sequence analysis tools
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center mb-4">
                <Code2 className="h-12 w-12 text-cyan-600" />
              </div>
              <h2 className="text-xl font-semibold mb-3 text-cyan-600">Pipeline Management</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Visualize workflows and easily manage data analysis pipelines
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="h-12 w-12 text-teal-600" />
              </div>
              <h2 className="text-xl font-semibold mb-3 text-teal-600">AI Copilot</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Context-aware intelligent programming assistant
              </p>
            </div>
          </div>

          {/* Features List */}
          <div className="mt-16 text-left max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
              Core Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                '🔬 Bioinformatics-specialized IDE',
                '📊 Real-time data flow tracking',
                '🤖 AI-powered code suggestions',
                '⚡ Instant code execution',
                '📁 Pipeline step management',
                '🎯 Context-aware hints',
                '💾 Auto-save & version control',
                '🌙 Dark mode support',
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

