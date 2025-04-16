'use client'

import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'

interface ServerActionsProps {
    serverId: string;
    serverName: string;
    enabled: boolean;
    serverImagePath: string | null;
    serverAddress: string | null;
}

const serverFormSchema = z.object({
    server_id: z.string().min(1, 'Server ID is required'),
    enabled: z.boolean().default(true),
    name: z.string().min(1, 'Server name is required'),
    image_path: z.string().nullable(),
    server_address: z.string().nullable(),
})

type ServerFormData = z.infer<typeof serverFormSchema>

export function ServerActions({ serverId, serverName, enabled, serverImagePath, serverAddress }: ServerActionsProps) {
    const router = useRouter()
    const queryClient = useQueryClient()
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    const form = useForm<ServerFormData>({
        resolver: zodResolver(serverFormSchema),
        defaultValues: {
            server_id: serverId,
            enabled: enabled,
            name: serverName,
            image_path: serverImagePath,
            server_address: serverAddress,
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`/api/admin/servers?id=${serverId}`, {
                method: 'DELETE',
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
            queryClient.invalidateQueries({ queryKey: ['servers'] })
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            router.refresh()
            toast.success('Server deleted successfully')
        },
        onError: (error) => {
            toast.error(error.message || `Failed to complete request`)
        },
    })

    const updateMutation = useMutation({
        mutationFn: async (data: ServerFormData) => {
            const response = await fetch('/api/admin/servers', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldServerId: serverId,
                    serverId: data.server_id,
                    name: data.name,
                    imagePath: data.image_path,
                    serverAddress: data.server_address,
                    enabled: data.enabled,
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
            setIsEditDialogOpen(false)
            queryClient.invalidateQueries({ queryKey: ['servers'] })
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            router.refresh()
            toast.success('Server updated successfully')
        },
        onError: (error) => {
            toast.error(error.message || `Failed to complete request`)
        },
    })

    const handleDelete = () => {
        deleteMutation.mutate()
    }

    const handleEdit = () => {
        setIsEditDialogOpen(true)
        form.reset({
            server_id: serverId,
            enabled: enabled,
            name: serverName,
            image_path: serverImagePath,
            server_address: serverAddress, // Add this line
        })
    }

    function onSubmit(data: ServerFormData) {
        updateMutation.mutate(data)
    }

    return (
        <div className="flex items-center space-x-2">
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>Edit</Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={deleteMutation.isPending}>
                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the server
                            and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Server</DialogTitle>
                        <DialogDescription>
                            Make changes to the server details below. Click save when you&apos;re done.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="enabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/15 p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel>
                                                Enable Server
                                            </FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="server_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Server ID</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Server Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="image_path"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Header Image Path (optional)</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value || null)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="server_address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Server Address (optional)</FormLabel>
                                        <FormControl>
                                            <Input {...field} value={field.value || ''} onChange={(e) => field.onChange(e.target.value || null)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? 'Saving...' : 'Save'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
