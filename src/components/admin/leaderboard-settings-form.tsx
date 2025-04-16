"use client"

import { useMutation } from '@tanstack/react-query'
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function LeaderboardSettingsForm() {
    const resetMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`/api/admin/leaderboard-settings/data`, {
                method: 'DELETE',
            })
            if (!response.ok) {
                throw new Error(`Failed to reset leaderboard: ${response.statusText}`)
            }
            return response.json()
        },
        onSuccess: () => {
            toast.success("Leaderboard reset successfully")
        },
        onError: (error) => {
            toast.error(error.message || `Failed to reset leaderboard`)
        }
    })

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Leaderboard Settings</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="">
                    <h3 className="text-lg font-medium">Dangerous Zone</h3>
                    <p className="text-sm text-gray-500 mb-4">This action will permanently delete all user stats. This action cannot be undone and all data will be lost.</p>
                    <ResetLeaderboardDialog onReset={() => resetMutation.mutate()} />
                </div>
            </CardContent>
        </Card>
    )
}

function ResetLeaderboardDialog({ onReset }: { onReset: () => void }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">
                    Reset Leaderboard
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Reset Leaderboard Data</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will permanently delete all user stats.
                        This action cannot be undone and all data will be lost.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onReset}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Reset Leaderboard
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
