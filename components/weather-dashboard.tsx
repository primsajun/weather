"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Search, MapPin, Droplets, Wind, Thermometer, Sunrise } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import ForecastCard from "./forecast-card"
import WeatherBackground from "./weather-background"
import { Skeleton } from "@/components/ui/skeleton"

// API key from the provided information
const API_KEY = "9a08e76102adb04ffbd396967034a13f"

type WeatherData = {
  name: string
  main: {
    temp: number
    feels_like: number
    humidity: number
    temp_min: number
    temp_max: number
  }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  wind: {
    speed: number
  }
  sys: {
    country: string
    sunrise: number
    sunset: number
  }
  coord: {
    lat: number
    lon: number
  }
}

type ForecastData = {
  list: Array<{
    dt: number
    main: {
      temp: number
      feels_like: number
      humidity: number
    }
    weather: Array<{
      id: number
      main: string
      description: string
      icon: string
    }>
    wind: {
      speed: number
    }
    dt_txt: string
  }>
}

export default function WeatherDashboard() {
  const [city, setCity] = useState("")
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<ForecastData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [unit, setUnit] = useState<"metric" | "imperial">("metric")
  const { theme, setTheme } = useTheme()

  // Get current location weather on initial load
  useEffect(() => {
    if (navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          fetchWeatherByCoords(latitude, longitude)
        },
        (err) => {
          // console.error("Geolocation error:", err.code, err.message)
          let errorMessage = "Unable to get your location. Please search for a city."
          switch(err.code) {
            case 1:
              errorMessage = "Location access denied. Please enable permissions or search for a city."
              break
            case 2:
              errorMessage = "Location unavailable. Please check your connection or search for a city."
              break
            case 3:
              errorMessage = "Location request timed out. Please try again or search for a city."
              break
          }
          setError(errorMessage)
          setLoading(false)
          // Default to a major city if geolocation fails
          fetchWeatherByCity("Kanniyakumari")
        },
      )
    } else {
      setError("Geolocation is not supported by your browser. Please search for a city.")
      // Default to a major city if geolocation is not supported
      fetchWeatherByCity("Kanniyakumari")
    }
  }, [])

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    try {
      setLoading(true)
      setError("")

      // Fetch current weather
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`,
      )

      if (!weatherResponse.ok) {
        throw new Error("Failed to fetch weather data")
      }

      const weatherData = await weatherResponse.json()
      setWeather(weatherData)

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`,
      )

      if (!forecastResponse.ok) {
        throw new Error("Failed to fetch forecast data")
      }

      const forecastData = await forecastResponse.json()
      setForecast(forecastData)
    } catch (err) {
      console.error("Error fetching weather:", err)
      setError("Failed to fetch weather data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchWeatherByCity = async (cityName: string) => {
    try {
      setLoading(true)
      setError("")

      // Fetch current weather
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=${unit}&appid=${API_KEY}`,
      )

      if (!weatherResponse.ok) {
        if (weatherResponse.status === 404) {
          throw new Error("City not found. Please check the spelling and try again.")
        }
        throw new Error("Failed to fetch weather data")
      }

      const weatherData = await weatherResponse.json()
      setWeather(weatherData)

      // Fetch 5-day forecast using coordinates from weather data
      const { lat, lon } = weatherData.coord
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`,
      )

      if (!forecastResponse.ok) {
        throw new Error("Failed to fetch forecast data")
      }

      const forecastData = await forecastResponse.json()
      setForecast(forecastData)
    } catch (err: any) {
      console.error("Error fetching weather:", err)
      setError(err.message || "Failed to fetch weather data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (city.trim()) {
      fetchWeatherByCity(city.trim())
    }
  }

  const handleUnitChange = () => {
    const newUnit = unit === "metric" ? "imperial" : "metric"
    setUnit(newUnit)

    // Refetch data with new unit
    if (weather) {
      const { lat, lon } = weather.coord
      fetchWeatherByCoords(lat, lon)
    }
  }

  // Get weather condition for background
  const getWeatherCondition = () => {
    if (!weather || !weather.weather[0]) return "clear"

    const condition = weather.weather[0].main.toLowerCase()
    if (condition.includes("cloud")) return "cloudy"
    if (condition.includes("rain") || condition.includes("drizzle")) return "rainy"
    if (condition.includes("snow")) return "snowy"
    if (condition.includes("thunder")) return "stormy"
    if (condition.includes("fog") || condition.includes("mist")) return "foggy"
    return "clear"
  }

  // Format daily forecasts (one forecast per day)
  const getDailyForecasts = () => {
    if (!forecast) return []

    const dailyForecasts: any[] = []
    const dates: { [key: string]: boolean } = {}

    forecast.list.forEach((item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString()

      // Only take the first forecast for each day (around noon if possible)
      if (!dates[date]) {
        const hour = new Date(item.dt * 1000).getHours()

        // Prefer forecasts around noon (11am-2pm)
        if (hour >= 11 && hour <= 14) {
          dates[date] = true
          dailyForecasts.push(item)
        } else if (dailyForecasts.filter((f) => new Date(f.dt * 1000).toLocaleDateString() === date).length === 0) {
          // If we haven't found a noon forecast yet, use this one temporarily
          dailyForecasts.push(item)
          dates[date] = true
        }
      }
    })

    // Limit to 5 days
    return dailyForecasts.slice(0, 5)
  }

  // Format time from timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Dynamic weather background */}
      <WeatherBackground condition={getWeatherCondition()} />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col gap-6">
          {/* Header with app name and theme toggle */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-primary">Weatherly</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch id="unit-toggle" checked={unit === "imperial"} onCheckedChange={handleUnitChange} />
                <Label htmlFor="unit-toggle">°F</Label>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full"
              >
                {theme === "dark" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-sun"
                  >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-moon"
                  >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                  </svg>
                )}
              </Button>
            </div>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for a city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-background/80 backdrop-blur-sm"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>

          {/* Error message */}
          {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md">{error}</div>}

          {/* Current weather */}
          <div className="grid gap-6 md:grid-cols-[1fr_300px]">
            <Card className="bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6">
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <Skeleton className="h-12 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                ) : weather ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <h2 className="text-xl font-semibold">
                        {weather.name}, {weather.sys.country}
                      </h2>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="flex flex-col items-center">
                        <img
                          src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
                          alt={weather.weather[0].description}
                          className="w-32 h-32"
                        />
                        <p className="text-lg capitalize">{weather.weather[0].description}</p>
                      </div>

                      <div className="flex flex-col items-center md:items-start">
                        <div className="text-6xl font-bold">
                          {Math.round(weather.main.temp)}°{unit === "metric" ? "C" : "F"}
                        </div>
                        <p className="text-muted-foreground">
                          Feels like {Math.round(weather.main.feels_like)}°{unit === "metric" ? "C" : "F"}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4 md:mt-0">
                        <div className="flex items-center gap-2">
                          <Thermometer className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">High / Low</p>
                            <p>
                              {Math.round(weather.main.temp_max)}° / {Math.round(weather.main.temp_min)}°
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Wind className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Wind</p>
                            <p>
                              {Math.round(weather.wind.speed)} {unit === "metric" ? "m/s" : "mph"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Droplets className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Humidity</p>
                            <p>{weather.main.humidity}%</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Sunrise className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Sunrise / Sunset</p>
                            <p>
                              {formatTime(weather.sys.sunrise)} / {formatTime(weather.sys.sunset)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {/* 5-day forecast */}
            <Card className="bg-background/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">5-Day Forecast</h3>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : forecast ? (
                  <div className="space-y-3">
                    {getDailyForecasts().map((day, index) => (
                      <ForecastCard
                        key={index}
                        date={new Date(day.dt * 1000)}
                        temp={Math.round(day.main.temp)}
                        icon={day.weather[0].icon}
                        description={day.weather[0].description}
                        unit={unit}
                      />
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

