"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, Zap, MoveRight } from "lucide-react"
import { motion } from "framer-motion"

// NextGen VDR Logo Component
function NextGenVDRLogo() {
  return (
    <div className="flex justify-center mb-6">
      <img 
        src="/logo_transparent.png" 
        alt="NextGen VDR Logo" 
        className="h-32 w-auto"
      />
    </div>
  )
}

// Rotating Message Hero Component
function RotatingMessageHero() {
  const [titleNumber, setTitleNumber] = useState(0)
  const titles = useMemo(
    () => [
      "Transactions",
      "Diligence", 
      "Deal documents",
      "Data rooms"
    ],
    []
  )

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((prev) => (prev === titles.length - 1 ? 0 : prev + 1))
    }, 2000)
    return () => clearTimeout(timeoutId)
  }, [titleNumber, titles])

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-6 py-12 items-center justify-center flex-col">


          {/* Title + rotating words */}
          <div className="flex gap-4 flex-col">
                        <h2 className="text-5xl md:text-6xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-1 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? { y: 0, opacity: 1 }
                        : { y: titleNumber > index ? -150 : 150, opacity: 0 }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
              <span className="text-purple-400 text-2xl md:text-3xl"> made easy with NextGen VDR</span>
            </h2>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-gray-500 max-w-2xl text-center italic">
              Transform your due diligence process with AI-powered document analysis, 
              intelligent Q&A workflows, and secure collaboration tools designed for 
              modern M&A transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6 text-center">
        {/* Logo */}
        <NextGenVDRLogo />

        {/* Rotating Hero */}
        <RotatingMessageHero />

        {/* CTA Buttons */}
        <div className="flex flex-row gap-3 justify-center mt-6">
          <Button 
            size="sm" 
            className="gap-2" 
            onClick={() => router.push("/login/")}
          >
            Get started <MoveRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Footer */}
        <div className="text-sm text-muted-foreground mt-10">
          <p>Secure • Compliant • Trusted</p>
        </div>
      </div>
    </div>
  )
}
