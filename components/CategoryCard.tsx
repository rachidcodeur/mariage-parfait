import Link from 'next/link'
import { HiArrowRight } from 'react-icons/hi'
import { IconType } from 'react-icons'

interface CategoryCardProps {
  icon: IconType
  title: string
  description: string
  articleCount: number
  href: string
}

export default function CategoryCard({ icon: Icon, title, description, articleCount, href }: CategoryCardProps) {
  return (
    <Link 
      href={href}
      className="bg-white px-6 md:p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-300 border-opacity-60 flex flex-col h-full block group cursor-pointer"
    >
      <div className="flex items-center justify-center w-12 h-12 bg-primary-500 rounded-lg mb-4">
        <Icon className="text-white text-2xl" />
      </div>
      <h3 className="text-[22px] md:text-lg font-bold text-gray-800 mt-5 mb-2 group-hover:text-primary-500 transition-colors">{title}</h3>
      <p className="text-gray-600 text-base md:text-sm mb-4 leading-relaxed flex-grow">{description}</p>
      <div className="flex items-center pt-2 mt-auto mb-5">
        <div className="text-primary-500 hover:text-primary-600 font-medium flex items-center space-x-1 transition">
          <span>Explorer</span>
          <HiArrowRight className="text-sm" />
        </div>
      </div>
    </Link>
  )
}

