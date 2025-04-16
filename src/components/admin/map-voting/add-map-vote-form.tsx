"use client";

import { ServerCombobox } from "@/components/server-combobox";
import { TimePicker } from "@/components/time-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const mapOptionSchema = z.object({
    value: z.string().min(1, "Map ID is required"),
});

const mapVoteFormSchema = z.object({
    server: z.string().min(1, "Server is required"),
    vote_start: z.date({ required_error: "Vote start date is required" }),
    vote_end: z.date({ required_error: "Vote end date is required" }),
    map_start: z.date({ required_error: "Map start date is required" }),
    map_options: z.array(mapOptionSchema).min(2, "At least two map options are required"),
});

export type MapVoteFormData = z.infer<typeof mapVoteFormSchema>;

export function AddMapVoteForm() {
    const [open, setOpen] = useState(false)
    const router = useRouter()
    const queryClient = useQueryClient()
    const methods = useForm<MapVoteFormData>({
        resolver: zodResolver(mapVoteFormSchema),
        defaultValues: {
            map_options: [{ value: "" }, { value: "" }],
        },
        criteriaMode: "all"
    })

    const { fields, append, remove } = useFieldArray({
        control: methods.control,
        name: "map_options",
    })

    const mutation = useMutation({
        mutationFn: async (data: MapVoteFormData) => {
            const response = await fetch('/api/admin/map-voting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to complete request');
            }
            return response.json()
        },
        onSuccess: () => {
            methods.reset()
            setOpen(false)
            queryClient.invalidateQueries({ queryKey: ['mapVotes'] })
            toast.success('Map vote created successfully')

        },
        onError: (error) => {
            toast.error(error.message || `Failed to complete request`)
        },
    })
    const onSubmit = (data: MapVoteFormData) => {
        mutation.mutate(data)
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Create New Vote</Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Vote</DialogTitle>
                    <DialogDescription>Create a new map vote.</DialogDescription>
                </DialogHeader>
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            {/* Map Start */}
                            <FormField
                                control={methods.control}
                                name="map_start"
                                render={({ field }) => (
                                    <FormItem className="flex justify-end flex-col">
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
                        </div>
                        <div className="flex flex-col items-start gap-4">
                            <Label>Map Options</Label>
                            {fields.map((field, index) => (
                                <div key={field.id} className="w-full flex flex-row items-center gap-4  rounded-md">
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
                        <div className="pt-6">
                            <Button type="submit">Create New Vote</Button>
                        </div>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    )
}