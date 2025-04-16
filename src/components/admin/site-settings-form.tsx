"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
import { useSiteSettings } from "@/hooks/use-site-settings"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Switch } from "../ui/switch"
import Link from "next/link"

const siteSettingsSchema = z.object({
    name: z.string().min(1, "Name is required"),
    storeId: z.string().min(1, "Store ID is required"),
    discordInvite: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    steamGroupId: z.string().optional(),
    steamGroupUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    rustalyzerEnabled: z.boolean().optional(),
    copyServerAddress: z.boolean().optional(),
})

export type SiteSettingsFormValues = z.infer<typeof siteSettingsSchema>

export function SiteSettingsForm() {
    const { data: initialData, isLoading: isLoadingInitialData, isError, error } = useSiteSettings()
    const queryClient = useQueryClient()

    const form = useForm<SiteSettingsFormValues>({
        resolver: zodResolver(siteSettingsSchema),
        defaultValues: initialData || {},
    })

    useEffect(() => {
        if (initialData) {
            form.reset(initialData)
        }
    }, [initialData, form])

    const mutation = useMutation({
        mutationFn: async (data: SiteSettingsFormValues) => {
            const response = await fetch("/api/admin/site-settings", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("You are not authorized to update site settings.")
                }
                throw new Error("Failed to update site settings")
            }
            return response.json()
        },
        onSuccess: () => {
            toast.success("Your site settings have been successfully updated.")
            queryClient.invalidateQueries({ queryKey: ["siteSettings"] })
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update site settings. Please try again.")
        },
    })

    function onSubmit(data: SiteSettingsFormValues) {
        mutation.mutate(data)
    }

    if (isError) {
        return <FormError error={error} />
    }

    if (isLoadingInitialData) {
        return <div>Loading...</div>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Basic Settings</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Site Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The name of your site as it will appear to users.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="storeId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>PayNow Store ID</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The ID of your store.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="discordInvite"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discord Invite URL</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The invite URL for your Discord server (optional).
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="steamGroupId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Steam Group ID</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The ID of your Steam group (optional).
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="steamGroupUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Steam Group URL</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The URL of your Steam group (optional).
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="rustalyzerEnabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Enable Rustalyzer
                                        </FormLabel>
                                        <FormDescription>
                                            Enable <Link
                                            href="https://rustalyzer.com"
                                            target="_blank"
                                            className="text-blue-500 hover:underline"
                                            >Rustalyzer</Link> to display detailed server stats on your site.
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
                            name="copyServerAddress"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Enable Copy Server Address
                                        </FormLabel>
                                        <FormDescription>
                                            Enable copy server address to clipboard on the server page instead of just connect button.
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
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Updating..." : "Update Settings"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

function FormError({ error }: { error: Error }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Basic Settings</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-destructive">{error.message}</p>
            </CardContent>
        </Card>
    )
}