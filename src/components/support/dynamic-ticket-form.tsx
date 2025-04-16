"use client"

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { CategoryWithId } from '@/types/tickets'
import { Checkbox } from '@/components/ui/checkbox'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ServerCombobox } from '@/components/server-combobox'
import ServerGrid from './server-grid'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import PlayerGrid from './player-grid'

interface DynamicTicketFormProps {
    categorySlug: string
}

export function DynamicTicketForm({ categorySlug }: DynamicTicketFormProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0)
    const [direction, setDirection] = useState(0)

    const { data: category, isLoading, isError, error } = useQuery<CategoryWithId>({
        queryKey: ['ticket-category', categorySlug],
        queryFn: async () => {
            const response = await fetch(`/api/support/${categorySlug}`)
            if (!response.ok) throw new Error('Failed to fetch category')
            return response.json()
        },
    })

    const formSchema = useMemo(() => {
        return z.object(
            category?.steps.reduce((acc: any, step: any) => {
                step.fields.forEach((field: any) => {
                    let fieldSchema
                    switch (field.type) {
                        case 'string':
                            fieldSchema = z.string()
                            if (field.options?.minLength) fieldSchema = fieldSchema.min(field.options.minLength, `Minimum length is ${field.options.minLength}`)
                            if (field.options?.maxLength) fieldSchema = fieldSchema.max(field.options.maxLength, `Maximum length is ${field.options.maxLength}`)
                            break
                        case 'number':
                            fieldSchema = z.number()
                            if (field.options?.min) fieldSchema = fieldSchema.min(field.options.min, `Minimum value is ${field.options.min}`)
                            if (field.options?.max) fieldSchema = fieldSchema.max(field.options.max, `Maximum value is ${field.options.max}`)
                            break
                        case 'boolean':
                            fieldSchema = z.boolean()
                            break
                        case 'enum':
                            fieldSchema = z.enum(field.options?.enumOptions || [])
                            break
                        case 'date':
                            fieldSchema = z.date()
                            if (field.options?.minDate) fieldSchema = fieldSchema.min(new Date(field.options.minDate), `Minimum date is ${field.options.minDate}`)
                            if (field.options?.maxDate) fieldSchema = fieldSchema.max(new Date(field.options.maxDate), `Maximum date is ${field.options.maxDate}`)
                            break
                        case 'textarea':
                            fieldSchema = z.string()
                            if (field.options?.minLength) fieldSchema = fieldSchema.min(field.options.minLength, `Minimum length is ${field.options.minLength}`)
                            if (field.options?.maxLength) fieldSchema = fieldSchema.max(field.options.maxLength, `Maximum length is ${field.options.maxLength}`)
                            break
                        case 'players':
                            fieldSchema = z.array(z.string())
                            if (field.options?.min) fieldSchema = fieldSchema.min(field.options.min, `Minimum ${field.options.min} players required`)
                            if (field.options?.max) fieldSchema = fieldSchema.max(field.options.max, `Maximum ${field.options.max} players allowed`)
                            break
                        case 'server':
                            fieldSchema = z.string()
                            break
                        case 'server-grid':
                            fieldSchema = z.string()
                            break
                        case 'players-grid':
                            fieldSchema = z.array(z.string())
                            if (field.options?.min) fieldSchema = fieldSchema.min(field.options.min, `Minimum ${field.options.min} players required`)
                            if (field.options?.max) fieldSchema = fieldSchema.max(field.options.max, `Maximum ${field.options.max} players allowed`)
                            break
                        default:
                            fieldSchema = z.string()
                    }
                    acc[field.key] = field.required ? fieldSchema : fieldSchema.optional()
                })
                return acc
            }, {})
        )
    }, [category]);

    const submitTicket = useMutation({
        mutationFn: async (data: z.infer<typeof formSchema>) => {
            const response = await fetch('/api/support', {
                method: 'POST',
                body: JSON.stringify({ content: data, categoryId: categorySlug }),
            })
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to submit ticket')
            }
            return response.json()
        },
        onSuccess: (data) => {
            toast.success('Ticket submitted successfully')
            router.push(`/ticket/${data.id}`)
        },
        onError: (error) => {
            toast.error(error.message === 'Unauthorized' ? (
                'Please sign in to submit a ticket!'
            ) : (
                error.message || 'Failed to submit ticket'
            ))
        }
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: useMemo(() =>
            category?.steps.reduce((acc: any, step: any) => {
                step.fields.forEach((field: any) => {
                    if (field.type === 'players-grid') {
                        acc[field.key] = []
                    } else if (field.type === 'boolean') {
                        acc[field.key] = false
                    } else {
                        acc[field.key] = ''
                    }
                })
                return acc
            }, {}),
            [category]),
        mode: 'onSubmit',
        criteriaMode: 'all'
    })

    if (isLoading) return <div>Loading...</div>

    if (isError) return <div>Error: {error.message}</div>

    if (!category) return <div>Category not found</div>

    const currentStepFields = category?.steps.find(step => step.order === currentStep)?.fields || []

    // Animation variants
    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0
        })
    }

    const handleNext = async (e: React.MouseEvent) => {
        e.preventDefault() // Prevent form submission
        const isValid = await form.trigger(currentStepFields.map(field => field.key))
        if (isValid) {
            setDirection(1)
            setCurrentStep(prev => Math.min(prev + 1, category.steps.length - 1))
        }
    }

    const handlePrevious = () => {
        setDirection(-1)
        setCurrentStep(prev => prev - 1)
    }

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        const transformedData = Object.entries(data).reduce((acc, [key, value]) => {
            const field = category?.steps
                .flatMap(step => step.fields)
                .find(f => f.key === key);

            acc[`${key}--${field?.type}`] = value;
            return acc;
        }, {} as Record<string, any>);
        submitTicket.mutate(transformedData)
    }

    return (
        <Card className="mx-auto rounded-md bg-secondary/15 border-border/5">
            <CardHeader>
                <CardTitle>{category.name}</CardTitle>
                <CardDescription>Step {currentStep + 1} of {category.steps.length}</CardDescription>
            </CardHeader>
            <CardContent className='overflow-hidden'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <AnimatePresence custom={direction} mode="wait">
                            <motion.div
                                key={currentStep}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: 'tween', duration: 0.3 }}
                                className="space-y-4"
                            >
                                {currentStepFields.map((field) => (
                                    <FormField
                                        key={field.id}
                                        control={form.control}
                                        name={field.key}
                                        render={({ field: formField }) => (
                                            <FormItem>
                                                {field.type !== 'boolean' ? (
                                                    <FormLabel
                                                        className={cn({ "text-lg": field.type === 'server-grid' || field.type === 'players-grid' })}
                                                    >
                                                        {field.label}
                                                    </FormLabel>
                                                ) : null}
                                                <FormControl>
                                                    <>
                                                        {field.type === 'string' && (
                                                            <Input
                                                                {...formField}
                                                                value={formField.value || ''}
                                                                placeholder={field.options?.placeholder}
                                                            />
                                                        )}
                                                        {field.type === 'number' && (
                                                            <Input
                                                                {...formField}
                                                                type="number"
                                                                onChange={(e) => formField.onChange(Number(e.target.value))}
                                                                value={formField.value}
                                                                placeholder={field.options?.placeholder}
                                                            />
                                                        )}
                                                        {field.type === 'boolean' ? (
                                                            <div className="w-full flex items-center gap-2">
                                                                <FormLabel>
                                                                    {field.label}
                                                                </FormLabel>
                                                                <Checkbox
                                                                    checked={formField.value}
                                                                    onCheckedChange={formField.onChange}
                                                                />
                                                            </div>
                                                        ) : null}
                                                        {field.type === 'enum' ? (
                                                            <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder={`Select ${field.label}`} />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {field.options?.enumOptions?.map((option: string) => (
                                                                        <SelectItem key={option} value={option}>
                                                                            {option}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        ) : null}
                                                        {field.type === 'date' ? (
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant={"outline"}
                                                                        className={cn(
                                                                            "w-[240px] pl-3 text-left font-normal ml-2",
                                                                            !formField.value && "text-muted-foreground"
                                                                        )}
                                                                    >
                                                                        {formField.value ? (
                                                                            format(formField.value, "PPP")
                                                                        ) : (
                                                                            <span>Pick a date</span>
                                                                        )}
                                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-auto p-0" align="start">
                                                                    <Calendar
                                                                        mode="single"
                                                                        selected={formField.value}
                                                                        onSelect={formField.onChange}
                                                                        disabled={(date) => {
                                                                            if (field.options?.minDate && date < new Date(field.options.minDate)) {
                                                                                return true;
                                                                            }
                                                                            if (field.options?.maxDate && date > new Date(field.options.maxDate)) {
                                                                                return true;
                                                                            }
                                                                            return false;
                                                                        }}
                                                                        initialFocus
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                        ) : null}
                                                        {field.type === 'textarea' ? (
                                                            <Textarea
                                                                {...formField}
                                                                placeholder={field.options?.placeholder}
                                                            />
                                                        ) : null}
                                                        {field.type === 'players' ? (
                                                            <ServerCombobox
                                                                value={formField.value}
                                                                onChange={formField.onChange}
                                                                groupByCategory={false}
                                                                allowGlobal={false}
                                                            />
                                                        ) : null}
                                                        {field.type === 'server' ? (
                                                            <ServerCombobox
                                                                value={formField.value}
                                                                onChange={formField.onChange}
                                                                align='start'
                                                            />
                                                        ) : null}
                                                        {field.type === 'server-grid' ? (
                                                            <>
                                                                <FormMessage />
                                                                <ServerGrid
                                                                    value={formField.value}
                                                                    onChange={formField.onChange}
                                                                />
                                                            </>
                                                        ) : null}
                                                        {field.type === 'players-grid' ? (
                                                            <>
                                                                <FormMessage />
                                                                <PlayerGrid
                                                                    value={formField.value}
                                                                    onChange={formField.onChange}
                                                                /*  min={field.options?.min} */
                                                                /*  max={field.options?.max} */
                                                                />
                                                            </>
                                                        ) : null}
                                                    </>
                                                </FormControl>
                                                {field.options?.description && (
                                                    <FormDescription>{field.options.description}</FormDescription>
                                                )}
                                                {field.type === 'server-grid' || field.type === 'players-grid' ? null : <FormMessage />}
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                        <div className="flex justify-between">
                            {currentStep > 0 && (
                                <Button type="button" onClick={handlePrevious}>Previous</Button>
                            )}
                            {currentStep < (category.steps.length - 1) ? (
                                <Button type="button" onClick={handleNext}>Next</Button>
                            ) : (
                                <Button type="submit" disabled={submitTicket.isPending || submitTicket.isSuccess}>{submitTicket.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : 'Submit Ticket'}</Button>
                            )}
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

// Implement ServerSelect and PlayerSelect components as needed
