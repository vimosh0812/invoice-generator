import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"

interface StepsProps {
  currentStep: number
  children: React.ReactNode
  className?: string
}

export function Steps({ currentStep, children, className }: StepsProps) {
  // Count the number of Step children
  const steps = React.Children.toArray(children).filter((child) => React.isValidElement(child) && child.type === Step)

  return (
    <div className={cn("space-y-8", className)}>
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full border-2 font-semibold text-sm",
                    isActive && "border-primary bg-primary text-primary-foreground",
                    isCompleted && "border-primary bg-primary text-primary-foreground",
                    !isActive && !isCompleted && "border-muted-foreground text-muted-foreground",
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                </div>
                {React.isValidElement(step) && (
                  <div className="mt-2 text-center">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        isActive && "text-foreground",
                        isCompleted && "text-foreground",
                        !isActive && !isCompleted && "text-muted-foreground",
                      )}
                    >
                      {(step as React.ReactElement<StepProps>).props.title}
                    </p>
                    <p
                      className={cn(
                        "text-xs",
                        isActive && "text-muted-foreground",
                        isCompleted && "text-muted-foreground",
                        !isActive && !isCompleted && "text-muted-foreground/60",
                      )}
                    >
                      {(step as React.ReactElement<StepProps>).props.description}
                    </p>
                  </div>
                )}
              </div>

              {index < steps.length - 1 && (
                <div className={cn("absolute top-4 left-0 right-0 h-0.5 -translate-y-1/2", "flex-1 mx-auto w-full")}>
                  <div
                    className={cn("h-full bg-muted-foreground/30", "mx-auto", index < currentStep && "bg-primary")}
                    style={{
                      width: `calc(100% - ${8 * steps.length}px)`,
                      marginLeft: `${8 * (index + 1)}px`,
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      <div>
        {React.Children.map(children, (child, index) => {
          if (index === currentStep) {
            return child
          }
          return null
        })}
      </div>
    </div>
  )
}

interface StepProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function Step({ children }: StepProps) {
  return <div>{children}</div>
}
