"use client"

import { useEffect, useState } from "react"
import { Navigation } from "@/components/navigation"
import { ProfileSettings } from "@/components/profile-settings"
import { NutritionGoals } from "@/components/nutrition-goals"
import { MoodTracker } from "@/components/mood-tracker"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Target, Heart, Calendar, TrendingUp, Settings } from "lucide-react"
import { getAuthHeaders } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [user, setUser] = useState<any | null>(null)
  const [stats, setStats] = useState<any | null>(null)
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [u, s, h] = await Promise.all([
          fetch(`${API_URL}/api/users/me`, { headers: getAuthHeaders() }).then((r) => r.json()),
          fetch(`${API_URL}/api/users/me/stats`, { headers: getAuthHeaders() }).then((r) => r.json()),
          fetch(`${API_URL}/api/users/me/history`, { headers: getAuthHeaders() }).then((r) => r.json()),
        ])
        setUser(u)
        setStats(s)
        setHistory(h.history || [])
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
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
          <img
            src={user?.profile?.avatar || "/placeholder.svg"}
            alt={user?.name || "User"}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">{user?.name}</h1>
            <p className="text-muted-foreground mb-3">{user?.email}</p>
            <div className="flex flex-wrap gap-2">
              {(user?.profile?.dietaryPreferences || []).map((pref: string) => (
                <Badge key={pref} variant="outline">
                  {pref}
                </Badge>
              ))}
              {user?.profile?.joinDate && (
                <Badge variant="secondary">Member since {user.profile.joinDate}</Badge>
              )}
            </div>
          </div>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Meals</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalMeals ?? 0}</div>
              <p className="text-xs text-muted-foreground">Logged and analyzed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.averageScore ?? 0}</div>
              <p className="text-xs text-muted-foreground">Nutrition quality</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Target className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.streakDays ?? 0}</div>
              <p className="text-xs text-muted-foreground">Days logging meals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorite Food</CardTitle>
              <Heart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{stats?.favoriteFood || ""}</div>
              <p className="text-xs text-muted-foreground">Most logged meal</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="mood">Mood Tracking</TabsTrigger>
            <TabsTrigger value="history">Meal History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {user && <ProfileSettings profile={user.profile || {}} />}
          </TabsContent>

          <TabsContent value="goals" className="space-y-6 mt-6">
            {user && <NutritionGoals goals={user.goals || {}} />}
          </TabsContent>

          <TabsContent value="mood" className="space-y-6 mt-6">
            {/* Wire real mood data when API exists */}
            <MoodTracker moodData={[]} />
          </TabsContent>

          <TabsContent value="history" className="space-y-6 mt-6">
            <div className="space-y-6">
              {history.map((day, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{day.date}</CardTitle>
                    <CardDescription>
                      {day.meals.length} meals • {day.meals.reduce((sum: number, meal: any) => sum + meal.calories, 0)} total
                      calories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {day.meals.map((meal: any, mealIndex: number) => (
                        <div key={mealIndex} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">{meal.name}</p>
                            <p className="text-sm text-muted-foreground">{meal.time}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground">{meal.calories} cal</span>
                            <Badge variant={meal.score >= 80 ? "default" : meal.score >= 60 ? "secondary" : "outline"}>
                              {meal.score}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
