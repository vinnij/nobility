import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/utils'
import { hasPermission } from '@/lib/permissions/permissions'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

interface TicketField {
    id?: string
    label: string
    key: string
    type: string
    required: boolean
    options?: string[]
}

interface TicketStep {
    id?: string
    name: string
    fields: TicketField[]
}

export async function GET() {
    const categories = await prisma.ticketCategory.findMany({
        include: { steps: { include: { fields: { orderBy: { order: 'asc' } } } } },
    })
    return NextResponse.json(categories)
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: "settings", action: "manage" })))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { name, steps } = await request.json()
    const category = await prisma.ticketCategory.create({
        data: {
            slug: slugify(name),
            name,
            steps: {
                create: steps.map((step: any, stepIndex: number) => ({
                    name: step.name,
                    order: stepIndex,
                    fields: {
                        create: step.fields.map((field: any, fieldIndex: number) => ({
                            label: field.label,
                            key: field.key,
                            type: field.type,
                            required: field.required,
                            order: fieldIndex,
                            options: field.options, // Store all options
                        })),
                    },
                })),
            },
        },
        include: {
            steps: {
                include: {
                    fields: true
                },
                orderBy: {
                    order: 'asc'
                }
            }
        },
    })
    return NextResponse.json(category)
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: "settings", action: "manage" })))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { slug, name, steps } = await request.json()
    try {
        await prisma.$transaction(async (prisma) => {
            // Update category name
            await prisma.ticketCategory.update({
                where: { slug },
                data: { name },
            })

            // Get existing steps
            const existingSteps = await prisma.ticketStep.findMany({
                where: { categoryId: slug },
                include: { fields: true },
            })

            const updatedStepIds = []
            // Update or create steps
            for (const [stepIndex, step] of steps.entries()) {
                const existingStep = existingSteps.find(s => s.id === step.id)

                const updatedStep = existingStep
                    ? await prisma.ticketStep.update({
                        where: { id: existingStep.id },
                        data: {
                            name: step.name,
                            order: stepIndex,
                        },
                    })
                    : await prisma.ticketStep.create({
                        data: {
                            categoryId: slug,
                            name: step.name,
                            order: stepIndex,
                        },
                    })

                updatedStepIds.push(updatedStep.id)

                // Update, create, or delete fields
                const updatedFieldIds = []
                for (const [fieldIndex, field] of step.fields.entries()) {
                    let updatedField
                    if (field.id) {
                        // Update existing field
                        updatedField = await prisma.ticketField.update({
                            where: { id: field.id },
                            data: {
                                label: field.label,
                                key: field.key,
                                type: field.type,
                                required: field.required,
                                order: fieldIndex,
                                options: field.options,
                            },
                        })
                    } else {
                        // Create new field
                        updatedField = await prisma.ticketField.create({
                            data: {
                                stepId: updatedStep.id,
                                label: field.label,
                                key: field.key,
                                type: field.type,
                                required: field.required,
                                order: fieldIndex,
                                options: field.options,
                            },
                        })
                    }
                    updatedFieldIds.push(updatedField.id)
                }

                // Delete fields that are no longer in the step
                await prisma.ticketField.deleteMany({
                    where: {
                        stepId: updatedStep.id,
                        id: { notIn: updatedFieldIds },
                    },
                })
            }

            // Remove steps that are no longer present
            await prisma.ticketStep.deleteMany({
                where: {
                    categoryId: slug,
                    id: { notIn: updatedStepIds },
                },
            })
        })
    } catch (error) {
        console.error('Error updating category:', error)
        return NextResponse.json({ success: false, message: 'Failed to update category' }, { status: 500 })
    }
    return NextResponse.json({ success: true, message: 'Category updated successfully' })
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: "settings", action: "manage" })))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
        return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    try {
        await prisma.$transaction(async (prisma) => {
            // Delete all fields first
            await prisma.ticketField.deleteMany({
                where: {
                    step: {
                        categoryId: slug
                    }
                }
            })

            // Delete all steps
            await prisma.ticketStep.deleteMany({
                where: {
                    categoryId: slug
                }
            })

            // Finally delete the category
            await prisma.ticketCategory.delete({
                where: {
                    slug
                }
            })
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting category:', error)
        return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
    }
}




