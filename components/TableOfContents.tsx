'use client'

interface TableOfContentsItem {
  id: string
  title: string
}

interface TableOfContentsProps {
  items: TableOfContentsItem[]
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const offset = 100 // Offset pour le header sticky
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 shadow-sm sticky top-[64px]">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Dans cet article</h3>
      <nav className="space-y-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => handleClick(e, item.id)}
            className="block text-base text-gray-600 hover:text-primary-500 transition"
          >
            {item.title}
          </a>
        ))}
      </nav>
    </div>
  )
}

