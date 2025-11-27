"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RotateCcw } from "lucide-react"

interface StudyGraderProps {
  currentIndex: number
  total: number
  onGrade: (grade: 1 | 2 | 3 | 4) => void
  onReset: () => void
}

export function StudyGrader({ currentIndex, total, onGrade, onReset }: StudyGraderProps) {
  const progress = ((currentIndex + 1) / total) * 100

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {total}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-1 bg-transparent"
          onClick={() => onGrade(1)}
        >
          <span className="text-lg font-semibold">1</span>
          <span className="text-xs">Again</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-1 bg-transparent"
          onClick={() => onGrade(2)}
        >
          <span className="text-lg font-semibold">2</span>
          <span className="text-xs">Hard</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-1 bg-transparent"
          onClick={() => onGrade(3)}
        >
          <span className="text-lg font-semibold">3</span>
          <span className="text-xs">Good</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-1 bg-transparent"
          onClick={() => onGrade(4)}
        >
          <span className="text-lg font-semibold">4</span>
          <span className="text-xs">Easy</span>
        </Button>
      </div>

      <Button variant="ghost" className="w-full" onClick={onReset}>
        <RotateCcw className="w-4 h-4 mr-2" />
        Reset
      </Button>
    </div>
  )
}
