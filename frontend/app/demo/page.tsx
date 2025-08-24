import { AnimatedGridPatternDemo } from "@/components/ui/animated-grid-pattern-demo";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Animated Grid Pattern Demo</h1>
          <p className="text-xl text-muted-foreground">
            A beautiful animated grid pattern component built with Framer Motion
          </p>
        </div>
        
        <AnimatedGridPatternDemo />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative h-[300px] w-full overflow-hidden rounded-lg border bg-card p-8">
            <div className="relative z-10 flex h-full items-center justify-center">
              <p className="text-center text-2xl font-medium">Subtle Background</p>
            </div>
            <AnimatedGridPattern
              numSquares={15}
              maxOpacity={0.08}
              duration={5}
              repeatDelay={3}
              className="opacity-40"
            />
          </div>
          
          <div className="relative h-[300px] w-full overflow-hidden rounded-lg border bg-card p-8">
            <div className="relative z-10 flex h-full items-center justify-center">
              <p className="text-center text-2xl font-medium">Dense Pattern</p>
            </div>
            <AnimatedGridPattern
              numSquares={40}
              maxOpacity={0.15}
              duration={2}
              repeatDelay={1}
              width={30}
              height={30}
              className="opacity-60"
            />
          </div>
        </div>
        
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">Usage Examples</h2>
          <p className="text-muted-foreground">
            The AnimatedGridPattern component can be used as a background element, 
            loading state, or decorative pattern throughout your application.
          </p>
        </div>
      </div>
    </div>
  );
}
