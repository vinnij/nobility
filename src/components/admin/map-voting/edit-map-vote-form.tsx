"use client";

import { ServerCombobox } from "@/components/server-combobox";
import { TimePicker } from "@/components/time-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Trash, TrashIcon } from "lucide-react";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapVote } from "@/types/vote";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const mapOptionSchema = z.object({
    value: z.string().min(1, "Map ID is required"),
});

const mapVoteFormSchema = z.object({
    id: z.string().min(1, "ID is required"),
    enabled: z.boolean(),
    server: z.string().min(1, "Server is required"),
    vote_start: z.date({ required_error: "Vote start date is required" }),
    vote_end: z.date({ required_error: "Vote end date is required" }),
    map_start: z.date({ required_error: "Wipe time is required" }),
    map_options: z.array(mapOptionSchema).min(2, { message: "At least two map options are required" }),
});

type MapVoteFormData = z.infer<typeof mapVoteFormSchema>;

interface EditMapVoteFormProps {
    vote: MapVote;
}

export function EditMapVoteForm({ vote }: EditMapVoteFormProps) {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()
    const methods = useForm<MapVoteFormData>({
        resolver: zodResolver(mapVoteFormSchema),
        defaultValues: {
            id: vote.id,
            enabled: vote.enabled,
            server: vote.server_id,
            vote_start: new Date(vote.vote_start),
            vote_end: new Date(vote.vote_end),
            map_start: new Date(vote.map_start),
            map_options: vote.map_options.map(option => ({ value: option.id })),
        },
        criteriaMode: "all"
    })

    const { fields, append, remove } = useFieldArray({
        control: methods.control,
        name: "map_options",
        rules: {
            minLength: 2,
            required: "At least two map options are required",
        }
    })

    const mutation = useMutation({
        mutationFn: async (data: MapVoteFormData) => {
            const response = await fetch(`/api/admin/map-voting`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
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
            setOpen(false)
            queryClient.invalidateQueries({ queryKey: ['mapVotes'] })
            toast.success('Map vote updated successfully')
        },
        onError: (error) => {
            toast.error(error.message || `Failed to complete request`)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`/api/admin/map-voting?id=${vote.id}`, {
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
            setOpen(false)
            queryClient.invalidateQueries({ queryKey: ['mapVotes'] })
            toast.success('Map vote deleted successfully')
        },
        onError: (error) => {
            toast.error(error.message || `Failed to complete request`)
        },
    })

    const onSubmit = (data: MapVoteFormData) => {
        setFormError(null); // Clear previous errors
        if (data.map_options.length < 2) {
            setFormError("At least two map options are required");
            return;
        }
        mutation.mutate(data);
    }

    const [formError, setFormError] = useState<string | null>(null);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size={"sm"} variant="outline">Edit Vote</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Map Vote</DialogTitle>
                    <DialogDescription>Edit the map vote for {vote.server.server_name}</DialogDescription>
                </DialogHeader>
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="w-full flex items-center flex-row gap-6">
                            <FormField
                                control={methods.control}
                                name="server"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Server</FormLabel>
                                        <FormControl>
                                            <ServerCombobox
                                                align="start"
                                                value={field.value}
                                                onChange={field.onChange}
                                                modal={true}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={methods.control}
                                name="enabled"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col h-full gap-4">
                                        <FormLabel>Enabled</FormLabel>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Vote Start */}
                            <div className="flex flex-col gap-2">
                                <FormField
                                    control={methods.control}
                                    name="vote_start"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="text-left">Vote Start</FormLabel>
                                            <Popover modal={true}>
                                                <FormControl>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "justify-start text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {field.value ? (
                                                                format(field.value, "PPpp")
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                        </Button>
                                                    </PopoverTrigger>
                                                </FormControl>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                    />
                                                    <div className="flex justify-center p-3 border-t border-border/15">
                                                        <TimePicker
                                                            setDate={field.onChange}
                                                            date={field.value}
                                                        />
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {/* Vote End */}
                            <div className="flex flex-col gap-2">
                                <FormField
                                    control={methods.control}
                                    name="vote_end"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="text-left">Vote End</FormLabel>
                                            <Popover modal={true}>
                                                <FormControl>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "justify-start text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {field.value ? (
                                                                format(field.value, "PPpp")
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                        </Button>
                                                    </PopoverTrigger>
                                                </FormControl>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                    />
                                                    <div className="flex justify-center p-3 border-t border-border/15">
                                                        <TimePicker
                                                            setDate={field.onChange}
                                                            date={field.value}
                                                        />
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {/* Map Start */}
                            <FormField
                                control={methods.control}
                                name="map_start"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-left">Wipe Time</FormLabel>
                                        <Popover modal={true}>
                                            <FormControl>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "justify-start text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {field.value ? (
                                                            format(field.value, "PPpp")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                            </FormControl>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                                <div className="flex justify-center p-3 border-t border-border/15">
                                                    <TimePicker
                                                        setDate={field.onChange}
                                                        date={field.value}
                                                    />
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex flex-col items-start gap-4">
                            <Label>Map Options</Label>
                            {fields.map((field, index) => (
                                <div key={field.id} className="w-full flex flex-row items-center gap-4 rounded-md">
                                    <FormField
                                        control={methods.control}
                                        name={`map_options.${index}.value`}
                                        render={({ field }) => (
                                            <FormItem className="flex-grow">
                                                <FormControl>
                                                    <Input {...field} placeholder="Map URL" />
                                                </FormControl>
                                                <FormDescription>You can also enter Map ID or SIZE_SEED maps.</FormDescription>
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => {
                                            if (fields.length > 2) {
                                                remove(index)
                                                return;
                                            }
                                            toast.error("You must have at least 2 map options.")
                                        }}
                                    >
                                        <Trash className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                onClick={() => append({ value: "" })}
                                variant={"secondary"}
                            /* onClick={() => append({ size: 3000, seed: 1, staging: false })} */
                            >
                                Add Vote Option
                            </Button>
                        </div>
                        <FormMessage>{methods.formState.errors.map_options?.message}</FormMessage>
                        {formError ? (
                            <Alert variant="destructive">
                                <AlertDescription>{formError}</AlertDescription>
                            </Alert>
                        ) : null}
                        <div className="pt-6 flex items-center justify-between">
                            <Button type="submit">
                                {mutation.isPending ? (
                                    <Loader2 className="animate-spin w-4 h-4" />
                                ) : "Update Vote"}
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="flex items-center gap-2">
                                        <TrashIcon className="w-4 h-4" />
                                        Delete Vote
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the map vote
                                            and remove all associated data from the database.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => deleteMutation.mutate()}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                            {deleteMutation.isPending ? (
                                                <Loader2 className="animate-spin w-4 h-4" />
                                            ) : "Delete Vote"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    )
}