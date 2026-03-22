import React from 'react';
import { WeatherData } from '@/types/weather';
import { WeatherService } from '@/services/weatherService';
import { MapPin, Thermometer, Eye, Gauge } from 'lucide-react';

interface CurrentWeatherProps {
  weather: WeatherData;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ weather }) => {
  const { current, location } = weather;

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Location Header */}
      <div className="flex items-center gap-2 text-muted-foreground">
        <MapPin className="w-4 h-4" />
        <span className="text-sm">
          {location.name}, {location.region}
        </span>
      </div>

      {/* Main Temperature Display */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="temp-display">
            {Math.round(current.temp_c)}°
          </div>
          <div className="space-y-1">
            <div className="text-xl font-medium text-foreground">
              {current.condition.text}
            </div>
            <div className="text-sm text-muted-foreground">
              Feels like {Math.round(current.feelslike_c)}°
            </div>
          </div>
        </div>

        {/* Weather Icon */}
        <div className="flex-shrink-0">
          <span className="text-7xl drop-shadow-lg">
            {WeatherService.getWeatherEmoji(current.condition.code, current.condition.icon)}
          </span>
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span className="text-sm">Visibility</span>
          </div>
          <div className="text-lg font-semibold">{current.vis_km} km</div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Gauge className="w-4 h-4" />
            <span className="text-sm">Pressure</span>
          </div>
          <div className="text-lg font-semibold">{current.pressure_mb} mb</div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Thermometer className="w-4 h-4" />
            <span className="text-sm">UV Index</span>
          </div>
          <div className="text-lg font-semibold">
            {current.uv} 
            <span className="text-sm font-normal ml-1">
              {current.uv <= 2 ? 'Low' : current.uv <= 5 ? 'Moderate' : current.uv <= 7 ? 'High' : 'Very High'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="w-4 h-4 text-center">💧</span>
            <span className="text-sm">Precipitation</span>
          </div>
          <div className="text-lg font-semibold">{current.precip_mm} mm</div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;