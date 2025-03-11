"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

type WeatherCondition = "clear" | "cloudy" | "rainy" | "snowy" | "stormy" | "foggy"

type WeatherBackgroundProps = {
  condition: WeatherCondition
}

export default function WeatherBackground({ condition }: WeatherBackgroundProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Wait for theme to be available
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === "dark"

  // Get background styles based on weather condition and theme
  const getBackgroundStyles = () => {
    switch (condition) {
      case "clear":
        return isDark
          ? { background: "linear-gradient(to bottom, #0f172a, #1e293b)", className: "after:bg-[url(/stars.svg)]" }
          : { background: "linear-gradient(to bottom, #87ceeb, #e0f7fa)", className: "after:bg-[url(/sun.svg)]" }
      case "cloudy":
        return isDark
          ? {
              background: "linear-gradient(to bottom, #1e293b, #334155)",
              className: "after:bg-[url(/clouds-dark.svg)]",
            }
          : { background: "linear-gradient(to bottom, #b0c4de, #e0e0e0)", className: "after:bg-[url(/clouds.svg)]" }
      case "rainy":
        return isDark
          ? { background: "linear-gradient(to bottom, #1e293b, #334155)", className: "after:bg-[url(/rain-dark.svg)]" }
          : { background: "linear-gradient(to bottom, #708090, #a9a9a9)", className: "after:bg-[url(/rain.svg)]" }
      case "snowy":
        return isDark
          ? { background: "linear-gradient(to bottom, #1e293b, #334155)", className: "after:bg-[url(/snow-dark.svg)]" }
          : { background: "linear-gradient(to bottom, #b0c4de, #e0e0e0)", className: "after:bg-[url(/snow.svg)]" }
      case "stormy":
        return isDark
          ? { background: "linear-gradient(to bottom, #1a1a2e, #16213e)", className: "after:bg-[url(/storm-dark.svg)]" }
          : { background: "linear-gradient(to bottom, #4b5563, #6b7280)", className: "after:bg-[url(/storm.svg)]" }
      case "foggy":
        return isDark
          ? { background: "linear-gradient(to bottom, #334155, #475569)", className: "after:bg-[url(/fog-dark.svg)]" }
          : { background: "linear-gradient(to bottom, #b0c4de, #d1d5db)", className: "after:bg-[url(/fog.svg)]" }
      default:
        return isDark
          ? { background: "linear-gradient(to bottom, #0f172a, #1e293b)", className: "" }
          : { background: "linear-gradient(to bottom, #87ceeb, #e0f7fa)", className: "" }
    }
  }

  const { background, className } = getBackgroundStyles()

  return (
    <div
      className={`absolute inset-0 z-0 ${className} after:absolute after:inset-0 after:bg-repeat-x after:opacity-30 after:animate-weather-float`}
      style={{ background }}
    />
  )
}

