"use client"

import { useState, useCallback } from "react"
import { Navigation } from "@/components/navigation"
import { PhotoUpload } from "@/components/photo-upload"
import { NutritionResults } from "@/components/nutrition-results"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Sparkles, Star, TrendingUp } from "lucide-react"
import { getAuthHeaders } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function AnalyzePage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<any | null>(null)
  const [mealId, setMealId] = useState<string | null>(null)

  const handleImageUpload = useCallback(async (imageUrl: string) => {
    setUploadedImage(imageUrl)
    setIsAnalyzing(true)
    setResults(null)
    setMealId(null)

    try {
      const res = await fetch(`${API_URL}/api/meals/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ imageBase64: imageUrl }),
      })
      if (!res.ok) throw new Error("Analyze failed")
      const data = await res.json()
      setResults({
        foods: data.foods,
        nutrition: data.nutrition,
        score: data.score,
        recommendations: data.recommendations || [],
        alternatives: data.alternatives || [],
      })
      setMealId(data.mealId || null)
      setUploadedImage(data.imageUrl || imageUrl)
    } catch (e) {
      console.error(e)
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const handleReset = useCallback(() => {
    setUploadedImage(null)
    setResults(null)
    setIsAnalyzing(false)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-green-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent mb-6">
              AI Food Analysis
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Upload a photo of your meal and get instant nutrition analysis powered by advanced AI technology
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card className="border-2 border-gradient-to-r from-emerald-200 to-teal-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
                <CardTitle className="flex items-center gap-2 text-emerald-700">
                  <Camera className="w-6 h-6" />
                  Upload Your Meal Photo
                </CardTitle>
                <CardDescription className="text-emerald-600">
                  Take a photo or upload an image of your meal for instant nutrition analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <PhotoUpload onImageUpload={handleImageUpload} onReset={handleReset} />
              </CardContent>
            </Card>

            {isAnalyzing && (
              <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center space-x-3 text-emerald-600 mb-6">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-5 h-5 animate-spin text-emerald-600" />
                    </div>
                    <span className="font-semibold text-lg">Analyzing your meal...</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-lg">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-emerald-700 font-medium">Identifying food items</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-lg">
                      <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                      <span className="text-teal-700 font-medium">Calculating nutrition values</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 font-medium">Generating recommendations</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {!uploadedImage && !isAnalyzing && !results && (
              <Card className="border-2 border-dashed border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 shadow-lg">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-700 mb-4">Ready to Analyze!</h3>
                  <p className="text-emerald-600 text-lg mb-6 max-w-md mx-auto">
                    Upload a photo of your meal to see detailed nutrition analysis, health scores, and personalized
                    recommendations.
                  </p>
                  <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                    <div className="p-4 bg-white/70 rounded-lg">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Star className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-sm font-medium text-emerald-700">Nutrition Score</p>
                    </div>
                    <div className="p-4 bg-white/70 rounded-lg">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="w-4 h-4 text-teal-600" />
                      </div>
                      <p className="text-sm font-medium text-teal-700">Health Insights</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {results && (
              <NutritionResults
                data={results}
                onSave={async () => {
                  try {
                    // if already saved via analyze, do nothing
                    if (mealId) return
                    await fetch(`${API_URL}/api/meals/save`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
                      body: JSON.stringify({
                        meal: {
                          imageUrl: uploadedImage,
                          foods: results.foods,
                          nutrition: results.nutrition,
                          score: results.score,
                        },
                      }),
                    })
                  } catch (e) {
                    console.error(e)
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
