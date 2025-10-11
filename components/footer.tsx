"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  ArrowRight,
  Heart,
  Shield,
  Award,
  Users,
  ChefHat,
  BarChart3,
  Trophy,
  User,
  HelpCircle,
  FileText,
  Lock,
  Zap
} from "lucide-react"
import { useState } from "react"

export function Footer() {
  const [email, setEmail] = useState("")

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email)
    setEmail("")
    // You can add actual newsletter subscription logic here
  }

  const productLinks = [
    { href: "/analyze", label: "Photo Analysis", icon: Camera },
    { href: "/recipe-generator", label: "Recipe Generator", icon: ChefHat },
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/achievements", label: "Achievements", icon: Trophy },
  ]

  const companyLinks = [
    { href: "/about", label: "About Us" },
    { href: "/careers", label: "Careers" },
    { href: "/blog", label: "Blog" },
    { href: "/press", label: "Press" },
  ]

  const supportLinks = [
    { href: "/help", label: "Help Center", icon: HelpCircle },
    { href: "/contact", label: "Contact Us" },
    { href: "/faq", label: "FAQ" },
    { href: "/tutorials", label: "Tutorials" },
  ]

  const legalLinks = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/cookies", label: "Cookie Policy" },
    { href: "/gdpr", label: "GDPR" },
  ]

  const socialLinks = [
    { href: "https://facebook.com", label: "Facebook", icon: Facebook },
    { href: "https://twitter.com", label: "Twitter", icon: Twitter },
    { href: "https://instagram.com", label: "Instagram", icon: Instagram },
    { href: "https://linkedin.com", label: "LinkedIn", icon: Linkedin },
    { href: "https://youtube.com", label: "YouTube", icon: Youtube },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">Nutrisnap</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-sm">
              Making healthy eating accessible and enjoyable for everyone through AI-powered nutrition analysis.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="w-4 h-4" />
                <span className="text-sm">support@nutrisnap.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="w-4 h-4" />
                <span className="text-sm">+91 9834515256</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Pune ,India</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Product</h3>
            <ul className="space-y-3">
              {productLinks.map((link) => {
                const Icon = link.icon
                return (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
                    >
                      <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            {/* <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul> */}

            <h3 className="font-semibold text-lg mb-4 mt-8">Support</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => {
                const Icon = link.icon
                return (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
                    >
                      {Icon && <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                      <span>{link.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Stay Updated</h3>
            <p className="text-gray-300 mb-4 text-sm">
              Get the latest nutrition tips, app updates, and healthy recipes delivered to your inbox.
            </p>
            
            {/* Newsletter Signup */}
            <form onSubmit={handleNewsletterSubmit} className="mb-6">
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-emerald-500"
                  required
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {/* Social Links */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-200">Follow Us</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <Link
                      key={social.href}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors group"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5 text-gray-300 group-hover:text-white" />
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-white">Secure & Private</h4>
                <p className="text-sm text-gray-400">Your data is protected with enterprise-grade security</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-white">Trusted by 10,000+</h4>
                <p className="text-sm text-gray-400">Users worldwide rely on our nutrition insights</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-white">AI-Powered</h4>
                <p className="text-sm text-gray-400">Advanced machine learning for accurate analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-400 text-sm">
                © 2024 Nutrisnap. All rights reserved.
              </p>
              <div className="flex space-x-6">
                {legalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>for healthy living</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}


