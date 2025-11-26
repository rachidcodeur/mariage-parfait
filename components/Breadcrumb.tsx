import Link from 'next/link'
import { HiHome } from 'react-icons/hi'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  centered?: boolean
}

export default function Breadcrumb({ items, centered = false }: BreadcrumbProps) {
  return (
    <section className="py-4 bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className={`text-sm text-gray-600 ${centered ? 'flex items-center justify-center' : ''}`}>
          {items.map((item, index) => (
            <span key={index} className="flex items-center">
              {index > 0 && <span className="mx-2">→</span>}
              {item.href ? (
                <Link href={item.href} className="hover:text-primary-500 transition flex items-center space-x-1">
                  {index === 0 && <HiHome className="text-lg" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span className="text-primary-500 font-medium">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>
    </section>
  )
}

