import { Card, CardContent } from "@/components/ui/card"

type ForecastCardProps = {
  date: Date
  temp: number
  icon: string
  description: string
  unit: "metric" | "imperial"
}

export default function ForecastCard({ date, temp, icon, description, unit }: ForecastCardProps) {
  // Format the date to show day of week
  const formatDay = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" })
  }

  // Format the date to show month and day
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <Card className="bg-background/50 hover:bg-background/70 transition-colors">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-medium">{formatDay(date)}</span>
            <span className="text-sm text-muted-foreground">{formatDate(date)}</span>
          </div>

          <div className="flex items-center gap-2">
            <img src={`https://openweathermap.org/img/wn/${icon}.png`} alt={description} className="w-10 h-10" />
            <span className="font-semibold">
              {temp}°{unit === "metric" ? "C" : "F"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

