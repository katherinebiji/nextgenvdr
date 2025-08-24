"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlowCard } from "@/components/ui/spotlight-card"
import { Mail, Lock, User, MoveRight, Shield, Zap } from "lucide-react"
import apiService from "@/lib/api"
import { motion } from "framer-motion"
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"

// --- NextGen VDR Logo Component ---
function NextGenVDRLogo() {
  return (
    <div className="flex justify-center mb-6">
      <img 
        src="/logo!!!.png" 
        alt="NextGen VDR Logo" 
        className="h-16 w-auto"
      />
    </div>
  )
}


// --- Login Page ---
export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (isLogin) {
        const response = await apiService.login(email, password, name || "User", "buyer")
        if (response.success) {
          window.location.href = "/projects"
        } else {
          setError(response.error || "Login failed")
        }
      } else {
        const response = await apiService.register(email, password, name, "buyer")
        if (response.success) {
          setError("")
          setIsLogin(true)
          setPassword("")
        } else {
          setError(response.error || "Registration failed")
        }
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Grid Pattern Background */}
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={5}
        repeatDelay={1}
        className="[mask-image:radial-gradient(600px_circle_at_center,white,transparent)] inset-x-0 inset-y-[-30%] h-[160%] skew-y-12"
      />
      
      <div className="w-full max-w-sm space-y-6 relative z-10">
        {/* Logo and Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <NextGenVDRLogo />
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground">Deal documents made easy with AI</p>
          </div>
        </div>

        

        {/* Login/Register Form */}
        <GlowCard 
          customSize 
          width="100%" 
          height="auto"
          glowColor="purple" 
          className="border-purple-500/30 shadow-2xl bg-black/90 backdrop-blur-md hover:border-purple-400/50"
        >
          <div className="p-5">
            <div className="space-y-1 mb-5">
              <h2 className="text-xl font-semibold text-foreground">
                {isLogin ? "Sign in" : "Create Account"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {isLogin ? "Enter your credentials to access your data rooms" : "Register for NextGenVDR access"}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="banker@firm.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading || !email || !password || (!isLogin && !name)}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {isLogin ? "Sign in" : "Create Account"}
                  </div>
                )}
              </Button>

              <div className="text-center text-sm">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setIsLogin(!isLogin)
                    setError("")
                    setPassword("")
                  }}
                  className="text-muted-foreground hover:text-primary"
                >
                  {isLogin ? "Need an account? Register here" : "Already have an account? Sign in"}
                </Button>
              </div>
            </form>
          </div>
        </GlowCard>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-6">
          <p>Secure • Compliant • Trusted</p>
        </div>
      </div>
    </div>
  )
}
