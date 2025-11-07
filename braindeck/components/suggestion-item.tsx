"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Trash2, Edit2 } from "lucide-react"
import type { Suggestion } from "@/lib/types"

interface SuggestionItemProps {
  suggestion: Suggestion
  onAccept: () => void
  onDiscard: () => void
  onEdit: () => void
}

export function SuggestionItem({ suggestion, onAccept, onDiscard, onEdit }: SuggestionItemProps) {
  const confidenceColor =
    suggestion.confidence > 0.9
      ? "bg-green-500/10 text-green-700"
      : suggestion.confidence > 0.8
        ? "bg-blue-500/10 text-blue-700"
        : "bg-yellow-500/10 text-yellow-700"

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-1">Front</p>
              <p className="font-medium mb-3">{suggestion.front}</p>
              <p className="text-sm text-muted-foreground mb-1">Back</p>
              <p className="text-sm">{suggestion.back}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Badge variant="outline">{suggestion.type === "qa" ? "Q&A" : "Cloze"}</Badge>
              <Badge className={confidenceColor}>{(suggestion.confidence * 100).toFixed(0)}%</Badge>
            </div>
          </div>

          {suggestion.pageRefs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestion.pageRefs.map((page) => (
                <Badge key={page} variant="secondary">
                  Page {page}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={onAccept} className="flex-1">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDiscard}
              className="text-destructive hover:text-destructive bg-transparent"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
