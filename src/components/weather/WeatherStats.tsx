import React from 'react';
import { WeatherData } from '@/types/weather';
import { Droplets, Wind, Sun, Moon } from 'lucide-react';

interface WeatherStatsProps {
  weather: WeatherData;
}

const WeatherStats: React.FC<WeatherStatsProps> = ({ weather }) => {
  const { current, forecast } = weather;
  const today = forecast.forecastday[0];

  const getAirQualityLevel = (index: number) => {
    if (index <= 50) return { label: 'Good', color: 'text-green-400' };
    if (index <= 100) return { label: 'Moderate', color: 'text-yellow-400' };
    if (index <= 150) return { label: 'Unhealthy for Sensitive', color: 'text-orange-400' };
    if (index <= 200) return { label: 'Unhealthy', color: 'text-red-400' };
    if (index <= 300) return { label: 'Very Unhealthy', color: 'text-purple-400' };
    return { label: 'Hazardous', color: 'text-red-600' };
  };

  const getWindDirection = (dir: string) => {
    const directions: { [key: string]: string } = {
      N: 'North', NE: 'Northeast', E: 'East', SE: 'Southeast',
      S: 'South', SW: 'Southwest', W: 'West', NW: 'Northwest'
    };
    return directions[dir] || dir;
  };

  const getHumidityAdvice = (humidity: number) => {
    if (humidity < 30) return 'Low humidity. Consider using a humidifier.';
    if (humidity > 70) return 'High humidity. Wetter environment.';
    return 'Comfortable humidity level.';
  };

  const getUVAdvice = (uv: number) => {
    if (uv <= 2) return 'Low UV. Minimal protection required.';
    if (uv <= 5) return 'Moderate UV. Seek shade during midday.';
    if (uv <= 7) return 'High UV. Protection essential.';
    return 'Very high UV. Avoid sun exposure.';
  };

  // Mock air quality data (in real app, this would come from API)
  const mockAirQuality = 61;
  const airQuality = getAirQualityLevel(mockAirQuality);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Humidity Card */}
      <div className="glass-card-hover p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/20">
            <Droplets className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Humidity</h3>
            <p className="text-2xl font-bold">{current.humidity}%</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {getHumidityAdvice(current.humidity)}
        </p>
      </div>

      {/* Wind Card */}
      <div className="glass-card-hover p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent/20">
            <Wind className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Wind</h3>
            <p className="text-2xl font-bold">{Math.round(current.wind_kph)} km/h</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {getWindDirection(current.wind_dir)} wind. 
          {current.wind_kph > 25 ? ' Strong winds today.' : ' Light breeze.'}
        </p>
      </div>

      {/* Sun Times Card */}
      <div className="glass-card-hover p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-weather-sunny/20">
            <Sun className="w-5 h-5 text-weather-sunny" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Sun</h3>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-bold">{today.astro.sunrise}</p>
                <p className="text-xs text-muted-foreground">Sunrise</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">{today.astro.sunset}</p>
                <p className="text-xs text-muted-foreground">Sunset</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sun arc visualization */}
        <div className="relative h-16 bg-muted/10 rounded-xl overflow-hidden">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <div className="w-8 h-8 bg-weather-sunny rounded-full opacity-80 animate-pulse"></div>
          </div>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 64">
            <path
              d="M 20 50 Q 100 20 180 50"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-weather-sunny/40"
              strokeDasharray="4,4"
            />
          </svg>
        </div>
      </div>

      {/* UV Index Card */}
      <div className="glass-card-hover p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-500/20">
            <Sun className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">UV Index</h3>
            <p className="text-2xl font-bold">
              {current.uv}
              <span className="text-base font-normal ml-2">
                {current.uv <= 2 ? 'Low' : current.uv <= 5 ? 'Moderate' : current.uv <= 7 ? 'High' : 'Very High'}
              </span>
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {getUVAdvice(current.uv)}
        </p>
      </div>

      {/* Air Quality Card (spans both columns on larger screens) */}
      <div className="glass-card-hover p-6 space-y-4 md:col-span-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <Wind className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Air Quality</h3>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{mockAirQuality}</p>
                <span className={`text-sm font-medium ${airQuality.color}`}>
                  {airQuality.label}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Air Quality Progress Bar */}
        <div className="space-y-2">
          <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(mockAirQuality / 3, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Good</span>
            <span>Moderate</span>
            <span>Unhealthy</span>
            <span>Hazardous</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherStats;