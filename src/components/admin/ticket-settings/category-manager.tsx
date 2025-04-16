"use client";

import React, { useState } from 'react'
import { useForm, FormProvider, useFieldArray, useFormState} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
    FormField, FormItem, FormControl
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { SortableStep } from './sortable-step'
import { CategoryList } from './category-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner';
import { EditCategoryForm } from './edit-category-form'
import { useQueryState } from 'nuqs'

interface Category extends FormValues {
    slug: string;
}

// type CategoryWithId = FormValues & { slug: string };

export const fieldSchema = z.object({
    label: z.string().min(1, 'Label is required'),
    key: z.string().min(1, 'Key is required'),
    type: z.enum(['string', 'number', 'boolean', 'enum', 'date', 'textarea', 'players', 'server', 'server-grid', 'players-grid']),
    required: z.boolean().default(false),
    options: z.object({
        description: z.string().optional(),
        placeholder: z.string().optional(),
        minLength: z.coerce.number().optional(),
        maxLength: z.coerce.number().optional(),
        min: z.coerce.number().optional(),
        max: z.coerce.number().optional(),
        defaultValue: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]).optional(),
        enumOptions: z.array(z.string()).optional(),
        minDate: z.string().optional(),
        maxDate: z.string().optional(),
    }).optional(),
})

export const stepSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, 'Step name is required'),
    fields: z.array(fieldSchema),
})

export const formSchema = z.object({
    name: z.string().min(1, 'Category name is required'),
    steps: z.array(stepSchema),
})

export type FormValues = z.infer<typeof formSchema>

export function CategoryManager() {
    const [selectedCategory, setSelectedCategory] = useQueryState('category', {
        defaultValue: 'new',
        parse: (value) => value || 'new',
        serialize: (value) => value.toString(),
    })
    const queryClient = useQueryClient()

    const { data: categories, isLoading, error } = useQuery<Category[]>({
        queryKey: ['ticket-admin-categories'],
        queryFn: async () => {
            const response = await fetch('/api/admin/ticket-settings')
            if (!response.ok) throw new Error('Failed to fetch categories')
            return response.json()
        },
    })

    const createCategoryMutation = useMutation({
        mutationFn: async (newCategory: FormValues) => {
            const response = await fetch('/api/admin/ticket-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCategory),
            })
            if (!response.ok) throw new Error('Failed to create category')
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket-admin-categories'] })
            methods.reset() // Reset the form after successful submission
            toast.success('Category created successfully')
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create category')
        },
    })

    const methods = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            steps: [{
                name: 'Step 1',
                fields: [{
                    label: '',
                    key: '',
                    type: 'string',
                    required: false,
                    options: {
                        description: '',
                        placeholder: '',
                    }
                }]
            }],
        },
    })

    const { errors } = useFormState({ control: methods.control })

    const { fields: steps, append: appendStep, remove: removeStep, move: moveStep } = useFieldArray({
        control: methods.control,
        name: 'steps',
    })

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (!over) return

        if (active.id !== over.id) {
            const activeId = active.id.toString()
            const overId = over.id.toString()

            if (activeId.startsWith('step-') && overId.startsWith('step-')) {
                // Reordering steps
                const oldIndex = steps.findIndex(step => `step-${step.id}` === activeId)
                const newIndex = steps.findIndex(step => `step-${step.id}` === overId)
                const newSteps = arrayMove(steps, oldIndex, newIndex)
                methods.setValue('steps', newSteps)
            } else {
                // Moving fields within the same step
                const [activeStepIndex, activeFieldIndex] = activeId.split('-').map(Number)
                const [overStepIndex, overFieldIndex] = overId.split('-').map(Number)

                if (activeStepIndex === overStepIndex) {
                    const newSteps = [...methods.getValues().steps]
                    const stepFields = newSteps[activeStepIndex].fields
                    const newFields = arrayMove(stepFields, activeFieldIndex, overFieldIndex ?? stepFields.length)
                    newSteps[activeStepIndex].fields = newFields
                    methods.setValue('steps', newSteps)
                }
                // If activeStepIndex !== overStepIndex, do nothing (prevent moving between steps)
            }
        }
    }

    const onSubmit = (data: FormValues) => {
        createCategoryMutation.mutate(data)
    }

    const handleSelectCategory = (categoryId: string) => {
        setSelectedCategory(categoryId)
    }

    if (isLoading) return <div>Loading categories...</div>
    if (error) return <div>Error loading categories: {error.message}</div>


    return (
        <Tabs value={selectedCategory} className="flex gap-4 h-full">
            <Card>
                <CardHeader>
                    <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <CategoryList
                        categories={categories || []}
                        selectedCategory={selectedCategory}
                        onSelectCategory={handleSelectCategory}
                    />
                </CardContent>
            </Card>

            <div className="flex-grow">
                <TabsContent value="new" className="mt-0">
                    <Card>
                        <CardHeader>
                            <CardTitle>New Category</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormProvider {...methods}>
                                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
                                    {Object.keys(errors).length > 0 && (
                                        <div className="text-red-500">
                                            Please correct the errors in the form before submitting.
                                            {JSON.stringify(errors)}
                                        </div>
                                    )}
                                    <FormField
                                        control={methods.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input {...field} placeholder="Category Name" />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                                        <SortableContext items={steps.map(step => `step-${step.id}`)} strategy={verticalListSortingStrategy}>
                                            {steps.map((step, stepIndex) => (
                                                <SortableStep
                                                    key={step.id}
                                                    id={`step-${step.id}`}
                                                    stepIndex={stepIndex}
                                                    control={methods.control}
                                                    removeStep={removeStep}
                                                />
                                            ))}
                                        </SortableContext>
                                    </DndContext>
                                    <div className="flex gap-4 justify-between">
                                        <Button
                                            type="button"
                                            variant={"outline"}
                                            onClick={() => appendStep({ name: `Step ${steps.length + 1}`, fields: [] })}
                                        >
                                            Add Step
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={createCategoryMutation.isPending}
                                        >
                                            {createCategoryMutation.isPending ? 'Saving...' : 'Save Category'}
                                        </Button>
                                    </div>
                                </form>
                            </FormProvider>
                        </CardContent>
                    </Card>
                </TabsContent>
                {categories?.map((category: Category) => (
                    <TabsContent key={category.slug} value={category.slug}>
                        <Card>
                            <CardHeader>
                                <CardTitle>{category.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <EditCategoryForm
                                    category={category}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </div>
        </Tabs>
    )
}
