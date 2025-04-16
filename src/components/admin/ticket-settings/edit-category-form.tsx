"use client";

import React from 'react'
import { useForm, FormProvider, useFormState } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormValues, formSchema } from './category-manager'
import { Button } from '@/components/ui/button'
import { FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SortableStep } from './sortable-step'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import { Loader2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface EditCategoryFormProps {
    category: FormValues & { slug: string };
}

export function EditCategoryForm({ category }: EditCategoryFormProps) {
    const router = useRouter()
    const queryClient = useQueryClient();
    const methods = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ...category,
            steps: category.steps.map(step => ({
                ...step,
                fields: step.fields.map(field => ({
                    ...field,
                    options: field.options ? {
                        ...field.options
                    } : undefined
                }))
            }))
        },
        mode: 'onSubmit',
    })

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const updateCategoryMutation = useMutation({
        mutationFn: async (updatedCategory: FormValues & { slug: string }) => {
            const response = await fetch(`/api/admin/ticket-settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCategory),
            })
            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.message || 'Failed to update category');
            }
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket-admin-categories'] })
            toast.success('Category updated successfully')
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Failed to update category')
        },
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: async (slug: string) => {
            const response = await fetch(`/api/admin/ticket-settings?slug=${slug}`, {
                method: 'DELETE',
            })
            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.message || 'Failed to delete category');
            }
            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket-admin-categories'] })
            toast.success('Category deleted successfully')
            router.push('/admin/ticket-settings')
        },
        onError: (error) => {
            toast.error(error instanceof Error ? error.message : 'Failed to delete category')
        },
    });

    const onDragEnd = (event: DragEndEvent) => {
        // ... implement drag and drop logic similar to CategoryManager
    }

    const onSubmit = (data: FormValues) => {
        // Validate the data before submitting
        try {
            formSchema.parse(data);
            updateCategoryMutation.mutate({ ...data, slug: category.slug });
        } catch (error) {
            if (error instanceof z.ZodError) {
                console.error('Zod validation error:', error.errors);
                toast.error('Form validation failed. Please check your inputs.');
            } else {
                console.error('Unexpected error:', error);
                toast.error('An unexpected error occurred.');
            }
        }
    };

    const { errors } = useFormState({ control: methods.control })

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className="space-y-8"
            >
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
                            <FormLabel>Category Name</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Category Name" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={methods.watch('steps').map(step => `step-${step.id}`)} strategy={verticalListSortingStrategy}>
                        {methods.watch('steps').map((step, stepIndex) => (
                            <SortableStep
                                key={step.id}
                                id={`step-${step.id}`}
                                stepIndex={stepIndex}
                                control={methods.control}
                                removeStep={(index) => methods.setValue('steps', methods.getValues('steps').filter((_, i) => i !== index))}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
                <div className="flex gap-4 justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => methods.setValue('steps', [...methods.getValues('steps'), { name: `Step ${methods.getValues('steps').length + 1}`, fields: [] }])}
                    >
                        Add Step
                    </Button>
                    <div className="flex gap-4">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    disabled={deleteCategoryMutation.isPending}
                                >
                                    {deleteCategoryMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to delete this category?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the category
                                        and all its associated steps and fields.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => deleteCategoryMutation.mutate(category.slug)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button
                            type="submit"
                            disabled={updateCategoryMutation.isPending}
                        >
                            {updateCategoryMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : 'Update Category'}
                        </Button>
                    </div>
                </div>
            </form>
        </FormProvider>
    )
}
