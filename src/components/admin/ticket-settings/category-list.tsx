import React from 'react'
import { TabsList } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Category {
  slug: string
  name: string
}

interface CategoryListProps {
  categories: Category[]
  selectedCategory: string | null
  onSelectCategory: (id: string) => void
}

export function CategoryList({ categories, selectedCategory, onSelectCategory }: CategoryListProps) {
  return (
    <TabsList className="flex flex-col h-full w-64 space-y-2 bg-transparent">
      {categories.map((category) => (
        <Button
          key={category.slug}
          value={category.slug}
          variant={selectedCategory === category.slug ? "default" : "ghost"}
          size={"lg"}
          className={"w-full justify-start"}
          onClick={() => onSelectCategory(category.slug)}
        >
          {category.name}
        </Button>
      ))}
      <Button
        variant={selectedCategory === "new" ? "default" : "ghost"}
        size={"lg"}
        className={"w-full justify-start"}
        onClick={() => onSelectCategory("new")}
      >
        <Plus className="w-4 h-4 mr-2" /> New Category
      </Button>
    </TabsList>
  )
}