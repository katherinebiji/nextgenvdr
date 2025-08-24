"use client"

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  Lock,
  FileStack,
  MessageSquare,
  Sparkles,
  LineChart,
} from "lucide-react";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { GetStartedButton } from "@/components/ui/get-started-button";
import { Button } from "@/components/ui/button";

const Section: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className = "",
}) => (
  <section className={`container mx-auto px-4 ${className}`}>{children}</section>
);

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    className="rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md"
  >
    <Icon className="h-6 w-6" />
    <h3 className="mt-3 text-lg font-semibold tracking-tight">{title}</h3>
    <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
  </motion.div>
);

function NextGenVDRLogo() {
  return (
    <div className="flex justify-center mb-6 mt-3">
      <img 
        src="/logo!!!.png" 
        alt="NextGen VDR Logo" 
        className="h-1 w-auto"
      />
    </div>
  );
}

function RotatingMessageHero() {
  const [idx, setIdx] = useState(0);
  const words = useMemo(() => ["Transactions", "Diligence", "Deal documents", "Data rooms"], []);

  useEffect(() => {
    const id = setTimeout(() => setIdx((p) => (p === words.length - 1 ? 0 : p + 1)), 2200);
    return () => clearTimeout(id);
  }, [idx, words]);

  return (
    <h1 className="text-5xl font-semibold tracking-tight md:text-6xl">
      <span className="relative block h-16 md:h-20 w-full min-w-[600px]">
        {words.map((w, i) => (
          <motion.span
            key={w}
            className="absolute bg-gradient-to-r from-blue-900 to-primary bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -80 }}
            animate={idx === i ? { opacity: 1, y: 0 } : { opacity: 0, y: i < idx ? -120 : 120 }}
            transition={{ type: "spring", stiffness: 60 }}
          >
            {w}
          </motion.span>
        ))}
      </span>
      <span className="block text-2xl font-medium text-primary md:text-3xl">made easy with NextGen VDR</span>
    </h1>
  );
}

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <AnimatedGridPattern
        numSquares={42}
        maxOpacity={0.12}
        duration={4}
        repeatDelay={0.6}
        className="pointer-events-none [mask-image:radial-gradient(900px_600px_at_center,white,transparent)] inset-x-0 inset-y-[-20%] h-[140%] skew-y-6"
      />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

      <header className="sticky top-0 z-20 w-full border-b bg-background/70 backdrop-blur">
        <Section className="flex h-16 items-center justify-between">
          <NextGenVDRLogo />

          <div className="flex items-center gap-2">
            <div onClick={() => router.push("/login/")}> 
              <GetStartedButton />
            </div>
          </div>
        </Section>
      </header>

      {/* Hero with LHS text, RHS demo */}
      <Section className="relative z-10 grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
        <div className="flex flex-col items-start gap-6 text-left">
          <RotatingMessageHero />
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Transform due diligence with AI-powered document analysis, intelligent Q&A workflows, and secure collaboration tools built for modern M&A transactions.
          </p>
          <div className="flex flex-wrap gap-3">
            <div onClick={() => router.push("/login/")}> 
              <GetStartedButton />
            </div>
            <Button size="lg" variant="outline" asChild>
              <Link href="#demo">Watch 90s demo</Link>
            </Button>
          </div>
        </div>
        <motion.div
          id="demo"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="w-full max-w-2xl rounded-2xl border bg-card p-2 shadow-lg"
        >
          <div className="rounded-xl border bg-background p-2">
            <div className="flex items-center gap-2 p-2">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="h-3 w-3 rounded-full bg-green-400" />
            </div>
            <Image
              src="/Screenshot 2025-08-24 at 11.50.00.png"
              alt="Q&A Tracking Interface"
              width={1200}
              height={675}
              className="aspect-[16/9] w-full rounded-lg object-cover"
            />
          </div>
          <p className="mt-3 text-xs text-muted-foreground text-center">Our product interface!</p>
        </motion.div>
      </Section>

      {/* Rest of sections unchanged */}
      {/* Trust strip, Features, How it works, Security, Final CTA, Footer */}
    </div>
  );
}
