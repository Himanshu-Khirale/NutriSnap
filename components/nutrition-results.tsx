"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Star, TrendingUp, Lightbulb, ArrowRight, Save } from "lucide-react"

interface NutritionData {
  foods: Array<{ name: string; portion: string }>
  nutrition: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sugar: number
  }
  score: number
  recommendations: string[]
  alternatives: Array<{
    current: string
    suggestion: string
    benefit: string
  }>
}

interface NutritionResultsProps {
  data: NutritionData
  onSave?: () => Promise<void> | void
}

export function NutritionResults({ data, onSave }: NutritionResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  return (
    <div className="space-y-6">
      {/* Nutrition Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Nutrition Score
            </span>
            <Badge variant={getScoreBadgeVariant(data.score)} className="text-lg px-3 py-1">
              {data.score}/100
            </Badge>
          </CardTitle>
          <CardDescription>Overall nutritional quality of your meal</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={data.score} className="h-3" />
          <p className={`text-sm mt-2 font-medium ${getScoreColor(data.score)}`}>
            {data.score >= 80 ? "Excellent choice!" : data.score >= 60 ? "Good meal!" : "Room for improvement"}
          </p>
        </CardContent>
      </Card>

      {/* Identified Foods */}
      <Card>
        <CardHeader>
          <CardTitle>Identified Foods</CardTitle>
          <CardDescription>AI-detected items in your meal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.foods.map((food, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <span className="font-medium">{food.name}</span>
                <Badge variant="outline">{food.portion}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Nutrition Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Nutrition Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{data.nutrition.calories}</div>
              <div className="text-sm text-muted-foreground">Calories</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{data.nutrition.protein}g</div>
              <div className="text-sm text-muted-foreground">Protein</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Carbohydrates</span>
              <span className="text-sm">{data.nutrition.carbs}g</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Fat</span>
              <span className="text-sm">{data.nutrition.fat}g</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Fiber</span>
              <span className="text-sm">{data.nutrition.fiber}g</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Sugar</span>
              <span className="text-sm">{data.nutrition.sugar}g</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Recommendations
          </CardTitle>
          <CardDescription>Personalized insights for your meal</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {data.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Healthier Alternatives */}
      <Card>
        <CardHeader>
          <CardTitle>Healthier Alternatives</CardTitle>
          <CardDescription>Suggestions to boost your meal's nutrition</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.alternatives.map((alt, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{alt.current}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-primary">{alt.suggestion}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {alt.benefit}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Meal Button */}
      <Button className="w-full" size="lg" onClick={onSave}>
        <Save className="w-4 h-4 mr-2" />
        Save to Meal History
      </Button>
    </div>
  )
}
