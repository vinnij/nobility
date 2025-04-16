"use client"

import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { NavigationItem, navigationItemSchema } from '@/types/navigation'
import { AddNavigationDialog } from '@/components/admin/add-navigation-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getNavigationItems, createNavigationItem, deleteNavigationItem, updateNavigationItem } from '@/lib/api/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader2, GripVertical, PlusCircle } from 'lucide-react'
import { toast } from 'sonner'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
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

export function NavigationForm() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<NavigationItem | undefined>(undefined)
    const queryClient = useQueryClient()

    const { data: navItems, isLoading } = useQuery<NavigationItem[]>({
        queryKey: ['navigation-items'],
        queryFn: getNavigationItems,
    })

    useEffect(() => {
        if (navItems && selectedItem) {
            const itemSelected = navItems.find((item) => item.id === selectedItem?.id);
            if (!itemSelected) {
                setSelectedItem(undefined)
                return;
            } else {
                setSelectedItem(itemSelected)
            }
        }
    }, [navItems])

    const createMutation = useMutation({
        mutationFn: createNavigationItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['navigation-items'] })
            setIsAddDialogOpen(false)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: deleteNavigationItem,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['navigation-items'] }),
    })

    const updateMutation = useMutation({
        mutationFn: updateNavigationItem,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['navigation-items'] }),
    })

    const handleAddItem = (data: z.infer<typeof navigationItemSchema>) => {
        createMutation.mutate(data)
    }

    const handleDeleteItem = (id: string) => {
        deleteMutation.mutate(id)
    }

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (active.id !== over?.id && navItems) {
            const oldIndex = navItems.findIndex((item) => item.id === active.id)
            const newIndex = navItems.findIndex((item) => item.id === over?.id)

            const newOrder = arrayMove(navItems, oldIndex, newIndex)

            // Update the order of all items
            newOrder.forEach((item, index) => {
                updateMutation.mutate({ ...item, order: index })
            })

            // Optimistically update the UI
            queryClient.setQueryData(['navigation-items'], newOrder)
        }
    }

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            <Card className="w-1/4 mr-4">
                <CardHeader>
                    <CardTitle>Navigation Items</CardTitle>
                </CardHeader>
                <CardContent>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={navItems || []}
                            strategy={verticalListSortingStrategy}
                        >
                            <NavigationList
                                items={navItems || []}
                                selectedItem={selectedItem}
                                onSelectItem={setSelectedItem}
                                setIsAddDialogOpen={setIsAddDialogOpen}
                                onDeleteItem={handleDeleteItem}
                            />
                        </SortableContext>
                    </DndContext>
                </CardContent>
            </Card>

            <Card className="w-3/4">
                <CardHeader>
                    <CardTitle>Navigation Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    {selectedItem ? (
                        <NavigationItemForm item={selectedItem} />
                    ) : null}
                </CardContent>
                <AddNavigationDialog
                    isOpen={isAddDialogOpen}
                    onClose={() => setIsAddDialogOpen(false)}
                    onSubmit={handleAddItem}
                />
            </Card>
        </div>
    )
}

function NavigationItemForm({ item }: { item: NavigationItem }) {
    const queryClient = useQueryClient()
    const form = useForm<z.infer<typeof navigationItemSchema>>({
        resolver: zodResolver(navigationItemSchema),
        defaultValues: {
            label: item.label,
            url: item.url,
            order: item.order,
        },
    })

    useEffect(() => {
        form.reset({
            label: item.label,
            url: item.url,
            order: item.order,
        })
    }, [item])

    const updateMutation = useMutation({
        mutationFn: updateNavigationItem,
        onSuccess: () => {
            toast.success("Navigation item updated successfully")
            queryClient.invalidateQueries({ queryKey: ['navigation-items'] })
        },
    })

    const onSubmit = (data: z.infer<typeof navigationItemSchema>) => {
        updateMutation.mutate({ id: item.id, ...data })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Label</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>URL</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Order</FormLabel>
                            <FormControl>
                                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : 'Update'}
                </Button>
            </form>
        </Form>
    )
}

function SortableNavigationItem({ item, onSelect, isSelected, onDelete }: { item: NavigationItem; onSelect: () => void; isSelected: boolean; onDelete: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <Button
            ref={setNodeRef}
            style={style}
            {...attributes}
            variant="ghost"
            size="lg"
            className={`w-full flex items-center px-2 cursor-pointer ${isSelected ? 'bg-accent' : ''}`}
            onClick={onSelect}
        >
            <div className="flex-grow flex items-center">
                <div {...listeners} className="mr-2 cursor-move">
                    <GripVertical size={16} />
                </div>
                <span className="">{item.label}</span>
            </div>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                        Delete
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the navigation item.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => { e.stopPropagation(); onDelete(); }}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Button>
    )
}

function NavigationList({ items, selectedItem, onSelectItem, setIsAddDialogOpen, onDeleteItem }: {
    items: NavigationItem[];
    selectedItem?: NavigationItem;
    onSelectItem: (item: NavigationItem) => void;
    setIsAddDialogOpen: (isOpen: boolean) => void;
    onDeleteItem: (id: string) => void;
}) {
    return (
        <div className="space-y-2">
            <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" className="mb-4 w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Navigation Item
            </Button>
            {items.map((item) => (
                <SortableNavigationItem
                    key={item.id}
                    item={item}
                    onSelect={() => onSelectItem(item)}
                    isSelected={selectedItem?.id === item.id}
                    onDelete={() => onDeleteItem(item.id)}
                />
            ))}
        </div>
    )
}
