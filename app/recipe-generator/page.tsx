"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Navigation } from "@/components/navigation"
import { 
  Camera, 
  Upload, 
  ChefHat, 
  Utensils, 
  Sparkles, 
  Image as ImageIcon,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Heart,
  Zap
} from "lucide-react"

interface Ingredient {
  name: string
  amount: string
  unit: string
}

interface Recipe {
  title: string
  description: string
  prepTime: string
  cookTime: string
  servings: number
  ingredients: Ingredient[]
  instructions: string[]
  tips: string[]
}

interface Nutrition {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
  vitamins: { [key: string]: number }
  minerals: { [key: string]: number }
}

interface Substitution {
  original: string
  substitute: string
  benefit: string
  reason: string
}

interface GeneratedContent {
  recipe: Recipe
  nutrition: Nutrition
  substitutions: Substitution[]
}

export default function RecipeGeneratorPage() {
  const [activeTab, setActiveTab] = useState("text")
  const [ingredientsText, setIngredientsText] = useState("")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [error, setError] = useState("")
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (!ingredientsText.trim() && !uploadedImage) {
      setError("Please provide ingredients either as text or upload an image")
      return
    }

    setIsGenerating(true)
    setError("")
    setProgress(0)
    setGeneratedContent(null)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/recipe/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          ingredientsText: ingredientsText.trim(),
          imageBase64: uploadedImage
        })
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate recipe")
      }

      const data = await response.json()
      setGeneratedContent(data)
    } catch (err) {
      console.error("Generation error:", err)
      setError(err instanceof Error ? err.message : "Failed to generate recipe")
    } finally {
      setIsGenerating(false)
      setProgress(0)
    }
  }

  const resetForm = () => {
    setIngredientsText("")
    setUploadedImage(null)
    setGeneratedContent(null)
    setError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      <Navigation />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {/* <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <ChefHat className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">AI Recipe Generator</h1>
              <p className="text-emerald-100 text-lg">Transform ingredients into delicious recipes with nutrition analysis</p>
            </div>
          </div>
        </div> */}

        <div className="text-center mb-12 relative py-9">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-green-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent mb-6">
              AI Recipe Generator
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform ingredients into delicious recipes with nutrition analysis
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="border-white/20 shadow-2xl backdrop-blur-sm bg-white/95">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Add Your Ingredients
              </CardTitle>
              <CardDescription>
                Upload an image of your ingredients or type them in manually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text" className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Text Input</span>
                  </TabsTrigger>
                  <TabsTrigger value="image" className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>Image Upload</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ingredients" className="text-gray-700 font-medium">
                      List your ingredients
                    </Label>
                    <Textarea
                      id="ingredients"
                      placeholder="e.g., 2 chicken breasts, 1 cup rice, 1 onion, 2 tomatoes, olive oil, salt, pepper..."
                      className="min-h-32 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500/20 bg-emerald-50/50"
                      value={ingredientsText}
                      onChange={(e) => setIngredientsText(e.target.value)}
                    />
                    <p className="text-sm text-gray-600">
                      Include quantities and any specific ingredients you have available
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="image" className="space-y-4">
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-emerald-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                          <Upload className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="border-emerald-300 hover:bg-emerald-50"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Upload Image
                          </Button>
                          <p className="text-sm text-gray-600 mt-2">
                            Upload a photo of your ingredients
                          </p>
                        </div>
                      </div>
                    </div>

                    {uploadedImage && (
                      <div className="space-y-2">
                        <Label className="text-gray-700 font-medium">Uploaded Image</Label>
                        <div className="relative">
                          <img
                            src={uploadedImage}
                            alt="Uploaded ingredients"
                            className="w-full h-48 object-cover rounded-lg border border-emerald-200"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setUploadedImage(null)
                              if (fileInputRef.current) fileInputRef.current.value = ""
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 border border-red-200 rounded p-3">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <div className="flex space-x-4">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || (!ingredientsText.trim() && !uploadedImage)}
                  className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Recipe
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetForm}
                  disabled={isGenerating}
                  className="border-emerald-300 hover:bg-emerald-50"
                >
                  Reset
                </Button>
              </div>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Generating your recipe...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <div className="space-y-6">
            {generatedContent ? (
              <>
                {/* Recipe */}
                <Card className="border-white/20 shadow-2xl backdrop-blur-sm bg-white/95">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Utensils className="w-5 h-5 text-emerald-600" />
                      <span>{generatedContent.recipe.title}</span>
                    </CardTitle>
                    <CardDescription>{generatedContent.recipe.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Recipe Info */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-emerald-50 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">{generatedContent.recipe.prepTime}</div>
                        <div className="text-sm text-gray-600">Prep Time</div>
                      </div>
                      <div className="text-center p-3 bg-emerald-50 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">{generatedContent.recipe.cookTime}</div>
                        <div className="text-sm text-gray-600">Cook Time</div>
                      </div>
                      <div className="text-center p-3 bg-emerald-50 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600">{generatedContent.recipe.servings}</div>
                        <div className="text-sm text-gray-600">Servings</div>
                      </div>
                    </div>

                    {/* Ingredients */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">Ingredients</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {generatedContent.recipe.ingredients.map((ingredient, index) => (
                          <div key={index} className="flex items-center space-x-3 p-2 bg-emerald-50 rounded">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm">
                              <span className="font-medium">{ingredient.amount} {ingredient.unit}</span> {ingredient.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">Instructions</h4>
                      <div className="space-y-3">
                        {generatedContent.recipe.instructions.map((instruction, index) => (
                          <div key={index} className="flex space-x-3">
                            <div className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {index + 1}
                            </div>
                            <p className="text-sm text-gray-700">{instruction}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tips */}
                    {generatedContent.recipe.tips.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          <span>Chef's Tips</span>
                        </h4>
                        <div className="space-y-2">
                          {generatedContent.recipe.tips.map((tip, index) => (
                            <div key={index} className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
                              <Zap className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-gray-700">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Nutrition */}
                <Card className="border-white/20 shadow-2xl backdrop-blur-sm bg-white/95">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Heart className="w-5 h-5 text-red-600" />
                      <span>Nutrition Information</span>
                    </CardTitle>
                    <CardDescription>Per serving</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{generatedContent.nutrition.calories}</div>
                        <div className="text-sm text-gray-600">Calories</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{generatedContent.nutrition.protein}g</div>
                        <div className="text-sm text-gray-600">Protein</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{generatedContent.nutrition.carbs}g</div>
                        <div className="text-sm text-gray-600">Carbs</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{generatedContent.nutrition.fat}g</div>
                        <div className="text-sm text-gray-600">Fat</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Fiber</span>
                          <span className="font-medium">{generatedContent.nutrition.fiber}g</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Sugar</span>
                          <span className="font-medium">{generatedContent.nutrition.sugar}g</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Sodium</span>
                          <span className="font-medium">{generatedContent.nutrition.sodium}mg</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(generatedContent.nutrition.vitamins).slice(0, 3).map(([vitamin, amount]) => (
                          <div key={vitamin} className="flex justify-between text-sm">
                            <span className="capitalize">{vitamin}</span>
                            <span className="font-medium">{amount}mg</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Substitutions */}
                {generatedContent.substitutions.length > 0 && (
                  <Card className="border-white/20 shadow-2xl backdrop-blur-sm bg-white/95">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Lightbulb className="w-5 h-5 text-green-600" />
                        <span>Healthier Alternatives</span>
                      </CardTitle>
                      <CardDescription>Suggested ingredient substitutions for better nutrition</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {generatedContent.substitutions.map((sub, index) => (
                          <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge variant="outline" className="border-red-300 text-red-700">
                                    {sub.original}
                                  </Badge>
                                  <span className="text-gray-500">→</span>
                                  <Badge variant="outline" className="border-green-300 text-green-700">
                                    {sub.substitute}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-700 mb-1">
                                  <span className="font-medium">Benefit:</span> {sub.benefit}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Why:</span> {sub.reason}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="border-white/20 shadow-2xl backdrop-blur-sm bg-white/95">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <ChefHat className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready to Create Magic?</h3>
                  <p className="text-gray-600 max-w-md">
                    Upload your ingredients or type them in, and our AI will generate a delicious recipe with step-by-step instructions, nutrition information, and healthier alternatives!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
