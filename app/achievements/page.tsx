"use client"

import { Navigation } from "@/components/navigation"
import { AchievementCard } from "@/components/achievement-card"
import { StreakCounter } from "@/components/streak-counter"
import { PointsDisplay } from "@/components/points-display"
import { LevelProgress } from "@/components/level-progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Star, Target, Award, Crown } from "lucide-react"
import { useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { getAuthHeaders } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export default function AchievementsPage() {
  const [overview, setOverview] = useState<any | null>(null)
  const [achievements, setAchievements] = useState<any[]>([])

  useEffect(() => {
    let timer: any
    let socket: Socket | null = null
    const load = async () => {
      try {
        const data = await fetch(`${API_URL}/api/gamification/overview`, { headers: getAuthHeaders() }).then((r) => r.json())
        setOverview(data)
        setAchievements(data.achievements || [])
      } catch (e) {
        console.error(e)
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        load()
      }
    }

    load()
    timer = setInterval(load, 15000)

    // Realtime via socket.io
    try {
      socket = io(API_URL, { transports: ["websocket"], autoConnect: true })
      // Join user room after we know the user id via /me
      fetch(`${API_URL}/api/auth/me`, { headers: getAuthHeaders() })
        .then((r) => r.json())
        .then((me) => {
          if (me?.id) {
            socket?.emit("join-user", me.id)
          }
        })
        .catch(() => {})

      socket.on("achievement-updated", () => {
        load()
      })
    } catch (e) {
      // ignore socket failures; polling still works
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      if (timer) clearInterval(timer)
      if (socket) {
        try { socket.disconnect() } catch {}
      }
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  const unlockedAchievements = achievements.filter((a) => a.unlocked)
  const lockedAchievements = achievements.filter((a) => !a.unlocked)

  const achievementsByCategory = {
    milestone: achievements.filter((a) => a.category === "milestone"),
    nutrition: achievements.filter((a) => a.category === "nutrition"),
    streak: achievements.filter((a) => a.category === "streak"),
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Achievements & Progress</h1>
          <p className="text-lg text-muted-foreground">Track your nutrition journey and unlock rewards</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overview && <PointsDisplay points={overview.totalPoints} />}
          <LevelProgress
            currentLevel={overview?.currentLevel || 0}
            currentPoints={overview?.totalPoints || 0}
            nextLevelPoints={overview?.nextLevelPoints || 0}
          />
          {overview && (
            <StreakCounter currentStreak={overview.currentStreak} longestStreak={overview.longestStreak} />
          )}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
              <Award className="w-4 h-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unlockedAchievements.length}</div>
              <p className="text-xs text-muted-foreground">
                {achievements.length - unlockedAchievements.length} more to unlock
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="milestone">Milestones</TabsTrigger>
                <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                <TabsTrigger value="streak">Streaks</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6 mt-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Unlocked Achievements ({unlockedAchievements.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unlockedAchievements.map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-muted-foreground" />
                    In Progress ({lockedAchievements.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lockedAchievements.map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </div>
                </div>
              </TabsContent>

              {Object.entries(achievementsByCategory).map(([category, achievements]) => (
                <TabsContent key={category} value={category} className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(overview?.achievements || []).slice(0, 3).map((a, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Earned '{a.title}'</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          +{a.points} pts
                        </Badge>
                        <span className="text-xs text-muted-foreground">recently</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Next Level Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Next Level Rewards
                </CardTitle>
                <CardDescription>Level {(overview?.currentLevel || 0) + 1} unlocks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <div className="text-lg">🏆</div>
                  <span className="text-sm">Nutrition Expert badge</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <div className="text-lg">⚡</div>
                  <span className="text-sm">Bonus point multiplier</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                  <div className="text-lg">🎯</div>
                  <span className="text-sm">Custom goal setting</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
