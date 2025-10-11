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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      number: false,
      special: false,
    }
  })

  // Validation functions
  const validateName = (name: string) => {
    if (!name.trim()) return "Full name is required"
    if (name.trim().length < 2) return "Name must be at least 2 characters"
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return "Name can only contain letters and spaces"
    return ""
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) return "Email is required"
    if (!emailRegex.test(email)) return "Please enter a valid email address"
    return ""
  }

  const checkPasswordStrength = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    const score = Object.values(requirements).filter(Boolean).length
    let feedback = ""
    
    if (score === 0) feedback = "Very weak"
    else if (score === 1) feedback = "Weak"
    else if (score === 2) feedback = "Fair"
    else if (score === 3) feedback = "Good"
    else if (score === 4) feedback = "Strong"
    else feedback = "Very strong"

    return { score, feedback, requirements }
  }

  const validatePassword = (password: string) => {
    if (!password) return "Password is required"
    if (password.length < 8) return "Password must be at least 8 characters"
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter"
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter"
    if (!/\d/.test(password)) return "Password must contain at least one number"
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one special character"
    return ""
  }

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) return "Please confirm your password"
    if (confirmPassword !== password) return "Passwords don't match"
    return ""
  }

  const validateForm = () => {
    const nameError = validateName(formData.name)
    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password)
    
    setValidationErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    })
    
    return !nameError && !emailError && !passwordError && !confirmPasswordError
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    
    // Clear validation error when user starts typing
    if (validationErrors[field as keyof typeof validationErrors]) {
      setValidationErrors({ ...validationErrors, [field]: "" })
    }

    // Update password strength when password changes
    if (field === "password") {
      const strength = checkPasswordStrength(value)
      setPasswordStrength(strength)
    }

    // Re-validate confirm password when password changes
    if (field === "password" && formData.confirmPassword) {
      const confirmError = validateConfirmPassword(formData.confirmPassword, value)
      setValidationErrors({ ...validationErrors, confirmPassword: confirmError })
    }
  }

  const handleBlur = (field: string) => {
    if (field === "name") {
      const error = validateName(formData.name)
      setValidationErrors({ ...validationErrors, name: error })
    } else if (field === "email") {
      const error = validateEmail(formData.email)
      setValidationErrors({ ...validationErrors, email: error })
    } else if (field === "password") {
      const error = validatePassword(formData.password)
      setValidationErrors({ ...validationErrors, password: error })
    } else if (field === "confirmPassword") {
      const error = validateConfirmPassword(formData.confirmPassword, formData.password)
      setValidationErrors({ ...validationErrors, confirmPassword: error })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setErrorMessage("")
    const name = formData.name.trim()
    const email = formData.email.trim()
    const password = formData.password
    try {
      setIsSubmitting(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        window.location.href = "/dashboard"
      } else {
        const backendError = Array.isArray(data.errors) && data.errors.length > 0 ? data.errors[0].msg : data.error
        setErrorMessage(backendError || "Signup failed")
      }
    } catch (error) {
      console.error("Signup error:", error)
      setErrorMessage("Signup failed. Please try again.")
    } finally {
      setIsSubmitting(false)
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
              {errorMessage && (
                <div className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded p-2">
                  {errorMessage}
                </div>
              )}
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
                    className={`pl-11 h-12 border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 bg-teal-50/50 ${
                      validationErrors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : ""
                    }`}
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    required
                  />
                </div>
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                )}
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
                    className={`pl-11 h-12 border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 bg-teal-50/50 ${
                      validationErrors.email ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : ""
                    }`}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    required
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
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
                    className={`pl-11 pr-11 h-12 border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 bg-teal-50/50 ${
                      validationErrors.password ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : ""
                    }`}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
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
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.score <= 1 ? 'bg-red-500' :
                            passwordStrength.score <= 2 ? 'bg-orange-500' :
                            passwordStrength.score <= 3 ? 'bg-yellow-500' :
                            passwordStrength.score <= 4 ? 'bg-blue-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${
                        passwordStrength.score <= 1 ? 'text-red-500' :
                        passwordStrength.score <= 2 ? 'text-orange-500' :
                        passwordStrength.score <= 3 ? 'text-yellow-500' :
                        passwordStrength.score <= 4 ? 'text-blue-500' : 'text-green-500'
                      }`}>
                        {passwordStrength.feedback}
                      </span>
                    </div>
                    
                    {/* Password Requirements */}
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className={`flex items-center space-x-1 ${passwordStrength.requirements.length ? 'text-green-600' : 'text-gray-500'}`}>
                        <span>{passwordStrength.requirements.length ? '✓' : '○'}</span>
                        <span>8+ characters</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${passwordStrength.requirements.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                        <span>{passwordStrength.requirements.uppercase ? '✓' : '○'}</span>
                        <span>Uppercase</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${passwordStrength.requirements.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                        <span>{passwordStrength.requirements.lowercase ? '✓' : '○'}</span>
                        <span>Lowercase</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${passwordStrength.requirements.number ? 'text-green-600' : 'text-gray-500'}`}>
                        <span>{passwordStrength.requirements.number ? '✓' : '○'}</span>
                        <span>Number</span>
                      </div>
                      <div className={`flex items-center space-x-1 col-span-2 ${passwordStrength.requirements.special ? 'text-green-600' : 'text-gray-500'}`}>
                        <span>{passwordStrength.requirements.special ? '✓' : '○'}</span>
                        <span>Special character</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {validationErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                )}
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
                    className={`pl-11 h-12 border-teal-200 focus:border-teal-500 focus:ring-teal-500/20 bg-teal-50/50 ${
                      validationErrors.confirmPassword ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : ""
                    }`}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    onBlur={() => handleBlur("confirmPassword")}
                    required
                  />
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Account"}
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
