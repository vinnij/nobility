import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions/permissions'

interface LeaderboardColumn {
  columnKey: string
  columnLabel: string
  icon?: string | null
  order?: number
}

interface LeaderboardTab {
  id: string
  tabKey: string
  tabLabel: string
  columns: LeaderboardColumn[]
  order?: number
}

interface TabChange {
  type: 'add' | 'update' | 'delete' | 'reorder'
  tab: LeaderboardTab
  oldTabKey?: string
}

interface ColumnChange {
  type: 'add' | 'update' | 'delete' | 'reorder'
  tabKey: string
  column: LeaderboardColumn
  oldColumnKey?: string
}

interface UpdateLeaderboardRequest {
  tabs: LeaderboardTab[]
  deletedTabKeys?: string[]
  deletedColumnKeys?: string[]
  tabChanges?: TabChange[]
  columnChanges?: ColumnChange[]
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'leaderboard', action: 'manage' })))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tabs = await prisma.leaderboardTab.findMany({
      include: {
        columns: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        order: 'asc'
      }
    })
    return NextResponse.json(tabs)
  } catch (error) {
    console.error('Error fetching leaderboard tabs:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard settings' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions())
    if (!session || (session.user.roles && !(await hasPermission(session.user.roles, { resource: 'leaderboard', action: 'manage' })))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { 
      tabs, 
      deletedTabKeys = [], 
      deletedColumnKeys = [],
      tabChanges = [],
      columnChanges = []
    } = await request.json() as UpdateLeaderboardRequest

    if (!Array.isArray(tabs)) {
      return NextResponse.json({ error: 'Invalid input: tabs must be an array' }, { status: 400 })
    }

    const currentTabs = await prisma.leaderboardTab.findMany({
      include: {
        columns: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    const currentColumnsMap = new Map(
      currentTabs.flatMap(tab => 
        tab.columns.map(col => [`${tab.tabKey}:${col.columnKey}`, col])
      )
    )

    await prisma.$transaction(async (prisma) => {
      if (deletedTabKeys.length > 0) {
        await prisma.leaderboardTab.deleteMany({
          where: { tabKey: { in: deletedTabKeys } }
        })
      }

      if (deletedColumnKeys.length > 0) {
        await prisma.leaderboardColumn.deleteMany({
          where: { columnKey: { in: deletedColumnKeys } }
        })
      }

      if (tabChanges.length > 0) {
        for (const change of tabChanges) {
          switch (change.type) {
            case 'add':
              await prisma.leaderboardTab.create({
                data: {
                  tabKey: change.tab.tabKey,
                  tabLabel: change.tab.tabLabel,
                  order: change.tab.order || 0
                }
              })
              break
            case 'update':
              await prisma.leaderboardTab.update({
                where: { tabKey: change.oldTabKey || change.tab.tabKey },
                data: {
                  tabKey: change.tab.tabKey,
                  tabLabel: change.tab.tabLabel,
                  order: change.tab.order || 0
                }
              })
              break
            case 'reorder':
              await prisma.leaderboardTab.update({
                where: { tabKey: change.tab.tabKey },
                data: { order: change.tab.order || 0 }
              })
              break
          }
        }
      }

      if (columnChanges.length > 0) {
        for (const change of columnChanges) {
          const tab = await prisma.leaderboardTab.findUnique({
            where: { tabKey: change.tabKey }
          })
          
          if (!tab) continue
          
          switch (change.type) {
            case 'add':
              await prisma.leaderboardColumn.create({
                data: {
                  tabId: tab.id,
                  columnKey: change.column.columnKey,
                  columnLabel: change.column.columnLabel,
                  order: change.column.order || 0,
                  icon: change.column.icon || null
                }
              })
              break
            case 'update':
              await prisma.leaderboardColumn.update({
                where: {
                  tabId_columnKey: {
                    tabId: tab.id,
                    columnKey: change.oldColumnKey || change.column.columnKey
                  }
                },
                data: {
                  columnKey: change.column.columnKey,
                  columnLabel: change.column.columnLabel,
                  order: change.column.order || 0,
                  icon: change.column.icon || null
                }
              })
              break
            case 'reorder':
              await prisma.leaderboardColumn.update({
                where: {
                  tabId_columnKey: {
                    tabId: tab.id,
                    columnKey: change.column.columnKey
                  }
                },
                data: { order: change.column.order || 0 }
              })
              break
          }
        }
      }

      if (tabChanges.length === 0 && columnChanges.length === 0) {
        for (let tabIndex = 0; tabIndex < tabs.length; tabIndex++) {
          const tab = tabs[tabIndex]
          
          const updatedTab = await prisma.leaderboardTab.upsert({
            where: { tabKey: tab.tabKey },
            update: { 
              tabLabel: tab.tabLabel, 
              order: tabIndex 
            },
            create: { 
              tabKey: tab.tabKey, 
              tabLabel: tab.tabLabel, 
              order: tabIndex 
            }
          })

          for (let columnIndex = 0; columnIndex < tab.columns.length; columnIndex++) {
            const column = tab.columns[columnIndex]
            const columnKey = `${tab.tabKey}:${column.columnKey}`
            const existingColumn = currentColumnsMap.get(columnKey)
            
            if (!existingColumn || 
                existingColumn.columnLabel !== column.columnLabel || 
                existingColumn.order !== columnIndex ||
                existingColumn.icon !== (column.icon || null)) {
              
              await prisma.leaderboardColumn.upsert({
                where: {
                  tabId_columnKey: {
                    tabId: updatedTab.id,
                    columnKey: column.columnKey
                  }
                },
                update: {
                  columnLabel: column.columnLabel,
                  order: columnIndex,
                  icon: column.icon || null
                },
                create: {
                  tabId: updatedTab.id,
                  columnKey: column.columnKey,
                  columnLabel: column.columnLabel,
                  order: columnIndex,
                  icon: column.icon || null
                }
              })
            }
          }
        }
      }
    })

    const updatedTabs = await prisma.leaderboardTab.findMany({
      include: {
        columns: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(updatedTabs)
  } catch (error) {
    console.error('Error updating leaderboard tabs:', error)
    return NextResponse.json({ error: 'Failed to update leaderboard settings' }, { status: 500 })
  }
}