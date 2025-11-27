import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Upload, BookOpen } from "lucide-react"
import type { ActivityItem } from "@/lib/types"

interface ActivityItemProps {
  item: ActivityItem
}

export function ActivityItemComponent({ item }: ActivityItemProps) {
  const getIcon = () => {
    switch (item.type) {
      case "card_accepted":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case "upload_completed":
        return <Upload className="w-5 h-5 text-blue-500" />
      case "deck_created":
        return <BookOpen className="w-5 h-5 text-purple-500" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="mt-1">{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            <p className="text-xs text-muted-foreground mt-2">{new Date(item.timestamp).toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
