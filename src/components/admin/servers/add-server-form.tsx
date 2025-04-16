'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import useServers from '@/hooks/use-servers'
import { getCategories } from '@/app/actions/admin'
import { Loader2 } from 'lucide-react'

interface ServerFormData {
    id: string
    name: string
    categoryId: string
    order: number
    image_path: string
    server_address: string // Add this line
}

export function AddServerForm() {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const { control, register, handleSubmit, reset } = useForm<ServerFormData>()
    const { data: categories, isLoading: isCategoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const result = await getCategories();
            if (result.error) {
                throw new Error(result.error);
            }
            return result.data;
        },
    })
    const queryClient = useQueryClient()

    const categoriesMemo = useMemo(() => categories?.map((category) => ({
        id: category.id,
        name: category.name
    })).flat(), [categories])

    const mutation = useMutation({
        mutationFn: async (data: ServerFormData) => {
            const response = await fetch('/api/admin/servers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    categoryId: parseInt(data.categoryId, 10),
                    image_path: data.image_path || null
                }),
            })
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("You are not authorized to do this.")
                }
                throw new Error('Failed to complete request');
            }
            return response.json()
        },
        onSuccess: () => {
            reset()
            setOpen(false)
            queryClient.invalidateQueries({ queryKey: ['fetch-server-list'] })
            queryClient.invalidateQueries({ queryKey: ['serverData'] })
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            router.refresh()
            toast.success('Server added successfully')
        },
        onError: (error) => {
            toast.error(error.message || `Failed to complete request`)
        },
    })

    const onSubmit = (data: ServerFormData) => {
        mutation.mutate({
            ...data,
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add Server</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Server</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        {...register('id', { required: true })}
                        type="text"
                        placeholder="Server ID"
                    />
                    <Input
                        {...register('name', { required: true })}
                        type="text"
                        placeholder="Server Name"
                    />
                    <Input
                        {...register('server_address')}
                        type="text"
                        placeholder="Server Address (optional)"
                    />
                    <Controller
                        name="categoryId"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                {isCategoriesLoading ? (
                                    <SelectContent>
                                        <SelectItem key={0} value={"0"}>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        </SelectItem>
                                    </SelectContent>
                                ) : (
                                    <SelectContent>
                                        {categoriesMemo?.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                )}
                            </Select>
                        )}
                    />
                    <Input
                        {...register('image_path')}
                        type="text"
                        placeholder="Header Image Path (optional)"
                    />
                    <Input
                        {...register('order', { required: true, valueAsNumber: true })}
                        type="number"
                        placeholder="Order"
                    />
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? 'Adding...' : 'Add Server'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog >
    )
}
