"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

const storeSettingsSchema = z.object({
    featuredProductEnabled: z.boolean().default(false),
    featuredProductId: z.string().optional().nullable(),
    requireLinkedToPurchase: z.boolean().default(false),
}).refine(
    (data) => {
        if (data.featuredProductEnabled && !data.featuredProductId) {
            return false;
        }
        return true;
    },
    {
        message: "Please enter a valid product ID",
        path: ["featuredProductId"],
    }
);

export type StoreSettingsFormValues = z.infer<typeof storeSettingsSchema>

export function StoreSettingsForm() {
    const queryClient = useQueryClient()

    const { data: initialData, isLoading: isLoadingInitialData, isError, error } = useQuery({
        queryKey: ['store-settings'],
        queryFn: async () => {
            const response = await fetch("/api/admin/store-settings")
            if (!response.ok) {
                throw new Error("Failed to fetch store settings data")
            }
            return response.json()
        },
    })

    const form = useForm<StoreSettingsFormValues>({
        resolver: zodResolver(storeSettingsSchema),
        defaultValues: initialData || {},
    })

    useEffect(() => {
        if (initialData) {
            form.reset(initialData)
        }
    }, [initialData, form])

    const mutation = useMutation({
        mutationFn: async (data: StoreSettingsFormValues) => {
            const response = await fetch("/api/admin/store-settings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
            const resp = await response.json()
            if (!response.ok) {
                if (resp.status === 401) {
                    throw new Error("You are not authorized to update store settings.")
                }
                throw new Error(resp?.message || "Failed to update store settings")
            }
            return data
        },
        onSuccess: () => {
            toast.success("Store settings have been successfully updated.")
            queryClient.invalidateQueries({ queryKey: ["store-settings"] })
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update store settings. Please try again.")
        },
    })

    function onSubmit(data: StoreSettingsFormValues) {
        mutation.mutate(data)
    }

    const featuredProductEnabled = form.watch("featuredProductEnabled")

    if (isError) {
        return <FormError error={error as Error} />
    }

    if (isLoadingInitialData) {
        return <div>Loading...</div>
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="requireLinkedToPurchase"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                    Require Users to be linked to purchase
                                </FormLabel>
                                <FormDescription>
                                    Require users to be linked with steam and discord to purchase items in the store.
                                </FormDescription>
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
                    name="featuredProductEnabled"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                    Enable Featured Product
                                </FormLabel>
                                <FormDescription>
                                    Turn the featured product on or off.
                                </FormDescription>
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
                    name="featuredProductId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Featured Product ID</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value ?? ''} disabled={!featuredProductEnabled} />
                            </FormControl>
                            <FormDescription>
                                The ID of the product to feature.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? (
                        <Loader2 className="animate-spin" />
                    ) : "Update Store Settings"}
                </Button>
            </form>
        </Form>
    )
}

function FormError({ error }: { error: Error }) {
    return (
        <p className="text-destructive">{error.message}</p>
    )
}
