"use client"

import { Navigation } from "@/components/navigation"
import { DashboardStats } from "@/components/dashboard-stats"
import { NutritionChart } from "@/components/nutrition-chart"
import { MealHistory } from "@/components/meal-history"
import { WeeklyProgress } from "@/components/weekly-progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Target, Calendar, Plus } from "lucide-react"
import Link from "next/link"

import { useEffect, useState } from "react"
import { getAuthHeaders } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const h = Math.floor(diffMs / (1000 * 60 * 60))
  if (h < 1) return "Just now"
  if (h === 1) return "1 hour ago"
  if (h < 24) return `${h} hours ago`
  const d = Math.floor(h / 24)
  return d === 1 ? "Yesterday" : `${d} days ago`
}

export default function DashboardPage() {
  const [todayStats, setTodayStats] = useState<any | null>(null)
  const [weeklyData, setWeeklyData] = useState<any[]>([])
  const [recentMeals, setRecentMeals] = useState<any[]>([])
  const [insights, setInsights] = useState<string[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [t, w, r, i] = await Promise.all([
          fetch(`${API_URL}/api/stats/today`, { headers: getAuthHeaders() }).then((r) => r.json()),
          fetch(`${API_URL}/api/stats/weekly`, { headers: getAuthHeaders() }).then((r) => r.json()),
          fetch(`${API_URL}/api/meals/recent?limit=5`, { headers: getAuthHeaders() }).then((r) => r.json()),
          fetch(`${API_URL}/api/stats/insights`, { headers: getAuthHeaders() }).then((r) => r.json()),
        ])
        setTodayStats(t)
        setWeeklyData(w.days || [])
        setRecentMeals(
          (r.meals || []).map((m: any) => ({
            id: m._id,
            name: (m.foods?.[0]?.name || "Meal"),
            time: timeAgo(m.createdAt),
            calories: m.nutrition?.calories || 0,
            score: m.score || 0,
            image: m.imageUrl || "/placeholder.svg",
          }))
        )
        setInsights(i.insights || [])
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Nutrition Dashboard</h1>
            <p className="text-muted-foreground">Track your daily nutrition and progress</p>
          </div>
          <Button asChild>
            <Link href="/analyze">
              <Plus className="w-4 h-4 mr-2" />
              Add Meal
            </Link>
          </Button>
        </div>

        {/* Today's Stats */}
        {todayStats && <DashboardStats data={todayStats} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Weekly Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Weekly Progress
                </CardTitle>
                <CardDescription>Your nutrition scores and calorie intake over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <WeeklyProgress data={weeklyData} />
              </CardContent>
            </Card>

            {/* Nutrition Breakdown Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Today's Nutrition Breakdown
                </CardTitle>
                <CardDescription>Macronutrient distribution for today</CardDescription>
              </CardHeader>
              <CardContent>
                {todayStats && <NutritionChart data={todayStats} />}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Meals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Meals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MealHistory meals={recentMeals} />
              </CardContent>
            </Card>

            {/* Daily Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Daily Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm">{insight}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/analyze">
                    <Plus className="w-4 h-4 mr-2" />
                    Log New Meal
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/profile">
                    <Target className="w-4 h-4 mr-2" />
                    Update Goals
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link href="/achievements">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Achievements
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
