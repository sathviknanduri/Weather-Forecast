import React, { useState, useEffect } from 'react';
import { WeatherData, WeatherCondition } from '@/types/weather';
import { WeatherService } from '@/services/weatherService';
import WeatherBackground from './WeatherBackground';
import SearchBar from './SearchBar';
import CurrentWeather from './CurrentWeather';
import WeatherStats from './WeatherStats';
import HourlyForecast from './HourlyForecast';
import DailyForecast from './DailyForecast';
import LifeIndex from './LifeIndex';
import { toast } from 'sonner';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const WeatherApp: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>('cloudy');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWeatherData = async (query?: string) => {
    setLoading(true);
    setError(null);

    try {
      let weatherData: WeatherData;

      if (query) {
        weatherData = await WeatherService.getCurrentWeather(query);
      } else {
        // Try to get user's current location
        try {
          const coords = await WeatherService.getGeolocation();
          weatherData = await WeatherService.getWeatherByCoords(coords);
          toast.success('Weather loaded for your location');
        } catch (geoError) {
          // Fallback to a default location if geolocation fails
          weatherData = await WeatherService.getCurrentWeather('London');
          toast.info('Using default location. Allow location access for local weather.');
        }
      }

      setWeather(weatherData);
      setLastUpdated(new Date());

      // Determine weather condition for background
      const today = weatherData.forecast.forecastday[0];
      const isDay = WeatherService.isDay(
        weatherData.location.localtime,
        today.astro.sunrise,
        today.astro.sunset
      );

      const condition = WeatherService.getWeatherCondition(
        weatherData.current.condition.code,
        isDay
      );

      setWeatherCondition(condition);

      if (query) {
        toast.success(`Weather updated for ${weatherData.location.name}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch weather data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (location: string) => {
    fetchWeatherData(location);
  };

  const handleCurrentLocation = () => {
    fetchWeatherData();
  };

  const handleRefresh = () => {
    if (weather) {
      const query = `${weather.location.name}, ${weather.location.region}`;
      fetchWeatherData(query);
    } else {
      fetchWeatherData();
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  if (loading && !weather) {
    return (
      <WeatherBackground condition="cloudy">
        <div className="min-h-screen flex items-center justify-center">
          <div className="glass-card p-8 text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <h2 className="text-xl font-semibold">Loading Weather Data</h2>
            <p className="text-muted-foreground">Getting your local weather information...</p>
          </div>
        </div>
      </WeatherBackground>
    );
  }

  if (error && !weather) {
    return (
      <WeatherBackground condition="cloudy">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="glass-card p-8 text-center space-y-4 max-w-md">
            <AlertCircle className="w-8 h-8 mx-auto text-destructive" />
            <h2 className="text-xl font-semibold">Unable to Load Weather</h2>
            <p className="text-muted-foreground">{error}</p>
            <button
              onClick={() => fetchWeatherData()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </WeatherBackground>
    );
  }

  return (
    <WeatherBackground condition={weatherCondition}>
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with Search */}
          <header className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Weather Forecast
              </h1>
              {lastUpdated && (
                <div className="text-sm text-muted-foreground">
                  Updated {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <SearchBar
                onLocationSelect={handleLocationSelect}
                onCurrentLocation={handleCurrentLocation}
              />
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 glass-card hover:bg-muted/20 transition-colors"
                title="Refresh weather data"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </header>

          {weather && (
            <>
              {/* Main Weather Display */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <CurrentWeather weather={weather} />
                </div>
                <div className="lg:col-span-2">
                  <WeatherStats weather={weather} />
                </div>
              </div>

              {/* Hourly Forecast */}
              <HourlyForecast weather={weather} />

              {/* Life Index */}
              <LifeIndex weather={weather} />

              {/* Daily Forecast */}
              <DailyForecast weather={weather} />
            </>
          )}

          {/* Loading Overlay */}
          {loading && weather && (
            <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="glass-card p-6 flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-foreground">Updating weather data...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </WeatherBackground>
  );
};

export default WeatherApp;