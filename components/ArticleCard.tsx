import Link from 'next/link'
import { IconType } from 'react-icons'
import { HiCalendar, HiClock } from 'react-icons/hi'

interface ArticleCardProps {
  icon: IconType
  category: string
  title: string
  description: string
  date: string
  readTime: string
  href: string
  imageUrl?: string
}

export default function ArticleCard({ 
  icon: Icon, 
  category, 
  title, 
  description, 
  date, 
  readTime, 
  href
}: ArticleCardProps) {
  return (
    <Link 
      href={href} 
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden block h-full w-full max-w-full"
    >
      <div className="p-6 w-full max-w-full overflow-hidden">
        {/* Category avec icône */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex items-center justify-center w-8 h-8 bg-primary-100 rounded-lg flex-shrink-0">
            <Icon className="text-primary-500 text-base" />
          </div>
          <span className="text-primary-500 text-sm font-medium truncate">{category}</span>
        </div>
        
        {/* Titre */}
        <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 leading-tight break-words">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed break-words">
          {description}
        </p>
        
        {/* Date et temps de lecture */}
        <div className="flex items-center space-x-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <HiCalendar className="text-gray-400" />
            <span>{date}</span>
          </div>
          <div className="flex items-center space-x-1">
            <HiClock className="text-gray-400" />
            <span>{readTime}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
