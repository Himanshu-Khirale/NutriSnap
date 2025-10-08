"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Mail, Lock, User, ArrowRight, Eye, EyeOff, Heart } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match")
      return
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        window.location.href = "/dashboard"
      } else {
        alert(data.error || "Signup failed")
      }
    } catch (error) {
      console.error("Signup error:", error)
      alert("Signup failed")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-emerald-300 to-green-400 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-200/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/25">
            <Camera className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <span className="font-bold text-3xl text-white drop-shadow-lg">Nutrisnap</span>
            <div className="flex items-center justify-center space-x-1 mt-1">
              <Heart className="w-4 h-4 text-pink-300" />
              <span className="text-teal-100 text-sm font-medium">Start Your Health Journey</span>
              <Heart className="w-4 h-4 text-pink-300" />
            </div>
          </div>
        </div>

        <Card className="border-white/20 shadow-2xl backdrop-blur-sm bg-white/95 border">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Create Your Account
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Start your journey to healthier eating today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 font-medium">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-teal-500" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-11 h-12 border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 bg-teal-50/50"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-teal-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-11 h-12 border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 bg-teal-50/50"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-teal-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="pl-11 pr-11 h-12 border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 bg-teal-50/50"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-teal-500 hover:text-teal-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-teal-500" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    className="pl-11 h-12 border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 bg-teal-50/50"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                size="lg"
              >
                Create Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-teal-600 hover:text-teal-700 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-white/80 mt-6 backdrop-blur-sm bg-white/10 rounded-lg p-3">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-white font-medium hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-white font-medium hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
