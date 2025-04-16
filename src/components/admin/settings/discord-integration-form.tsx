'use client'

import { useForm, UseFormReturn } from "react-hook-form"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ColorPicker } from "@/components/ui/color-picker"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"

const discordIntegrationSchema = z.object({
    guildId: z.string().min(1, "Guild ID is required"),
    /* verifiedRoleId: z.string().optional(), */
    webhookUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    verificationHookColor: z.string().optional(),
    verificationHookEnabled: z.boolean().optional(),
    ticketHookUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    ticketHookColor: z.string().optional(),
    ticketHookEnabled: z.boolean().optional(),
})

type DiscordIntegrationFormValues = z.infer<typeof discordIntegrationSchema>

export function DiscordIntegrationForm() {
    const queryClient = useQueryClient()

    const { data: initialData, isLoading: isLoadingInitialData, isError, error } = useQuery({
        queryKey: ["discordIntegration"],
        queryFn: async () => {
            const response = await fetch('/api/admin/settings/discord')
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("You are not authorized to view discord integration settings.")
                }
                throw new Error("Failed to load discord integration settings")
            }
            return response.json()
        },
    })

    const form = useForm<DiscordIntegrationFormValues>({
        resolver: zodResolver(discordIntegrationSchema),
        defaultValues: {
            guildId: "",
            webhookUrl: "",
            verificationHookColor: "#2105893",
            verificationHookEnabled: true,
            ticketHookUrl: "",
            ticketHookColor: "#346256",
            ticketHookEnabled: true,
        },
    })

    useEffect(() => {
        if (initialData) {
            form.reset({
                guildId: initialData.guildId || "",
                webhookUrl: initialData.webhookUrl || "",
                verificationHookColor: initialData.verificationHookColor || "#2105893",
                verificationHookEnabled: initialData.verificationHookEnabled || true,
                ticketHookUrl: initialData.ticketHookUrl || "",
                ticketHookColor: initialData.ticketHookColor || "#346256",
                ticketHookEnabled: initialData.ticketHookEnabled || true,
            })
        }
    }, [initialData, form])

    const mutation = useMutation({
        mutationFn: async (data: DiscordIntegrationFormValues) => {
            const response = await fetch('/api/admin/settings/discord', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("You are not authorized to update discord integration settings.")
                }
                throw new Error("Failed to update discord integration settings")
            }

            return response.json()
        },
        onSuccess: () => {
            toast.success("Discord integration settings have been successfully updated.")
            queryClient.invalidateQueries({ queryKey: ["discordIntegration"] })
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update site settings. Please try again.")
        },
    })

    function onSubmit(data: DiscordIntegrationFormValues) {
        mutation.mutate(data)
    }

    if (isLoadingInitialData) {
        return <DiscordIntegrationFormSkeleton />
    }

    if (isError) {
        return <DiscordIntegrationFormError error={error} />
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Discord Integration Settings</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="guildId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discord Guild ID</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The ID of your Discord server.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DiscordIntegrationFormAccordion form={form} />
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? "Updating..." : "Update Discord Settings"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

function DiscordIntegrationFormSkeleton() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Discord Integration Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="space-y-2">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                ))}
                <Skeleton className="h-10 w-1/4" />
            </CardContent>
        </Card>
    )
}

function DiscordIntegrationFormError({ error }: { error: Error }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Discord Integration Settings</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-destructive">{error.message}</p>
            </CardContent>
        </Card>
    )
}

const accordionItems: { title: string, url: string, color: string, enabled: string }[] = [
    {
        title: "Verification Hook",
        url: "webhookUrl",
        color: "verificationHookColor",
        enabled: "verificationHookEnabled",
    },
    {
        title: "Ticket Hook",
        url: "ticketHookUrl",
        color: "ticketHookColor",
        enabled: "ticketHookEnabled",
    }
]

function DiscordIntegrationFormAccordion({ form }: { form: UseFormReturn<DiscordIntegrationFormValues> }) {
    return (
        <Accordion type="single" collapsible>
            {accordionItems.map((item) => (
                <AccordionItem value={item.title} key={item.title}>
                    <AccordionTrigger>{item.title}</AccordionTrigger>
                    <AccordionContent className="space-y-8">
                        <FormField
                            control={form.control}
                            name={item.enabled as keyof DiscordIntegrationFormValues}
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/15 p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel>
                                            Enable {item.title}
                                        </FormLabel>
                                        <FormDescription>
                                            Whether to send {item.title} embeds to Discord.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value as boolean} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={item.url as keyof DiscordIntegrationFormValues}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{item.title} URL</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value?.toString() || ''} />
                                    </FormControl>
                                    <FormDescription>
                                        The Discord webhook URL for {item.title} (optional).
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={item.color as keyof DiscordIntegrationFormValues}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{item.title} Color</FormLabel>
                                    <FormControl>
                                        <ColorPicker
                                            {...field}
                                            value={field.value?.toString() || "#2105893"}
                                            onChange={(v) => {
                                                field.onChange(v)
                                            }}
                                        />

                                    </FormControl>
                                    <FormDescription>
                                        The color for {item.title} messages.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}