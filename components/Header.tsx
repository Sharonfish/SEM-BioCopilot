import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              BioCopilot
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">
              首页
            </Link>
            <Link href="/tools" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">
              工具
            </Link>
            <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors">
              关于
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}

