import React from 'react';
import { WeatherData } from '@/types/weather';
import { WeatherService } from '@/services/weatherService';

interface HourlyForecastProps {
  weather: WeatherData;
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ weather }) => {
  const today = weather.forecast.forecastday[0];
  const currentHour = new Date().getHours();
  
  // Get next 24 hours starting from current hour
  const hourlyData = today.hour.slice(currentHour).concat(
    weather.forecast.forecastday[1]?.hour.slice(0, currentHour) || []
  ).slice(0, 24);

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: 'numeric', hour12: true });
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 30) return 'text-red-400';
    if (temp >= 20) return 'text-orange-400';
    if (temp >= 10) return 'text-yellow-400';
    if (temp >= 0) return 'text-blue-400';
    return 'text-blue-600';
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground">24-Hour Forecast</h3>
      
      {/* Temperature Chart Visualization */}
      <div className="weather-chart mb-6">
        <div className="relative h-32 mb-4">
          <svg className="w-full h-full" viewBox={`0 0 ${hourlyData.length * 40} 120`}>
            {/* Temperature line */}
            <polyline
              points={hourlyData.map((hour, index) => 
                `${index * 40 + 20},${100 - (hour.temp_c + 10) * 2}`
              ).join(' ')}
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              fill="none"
              className="drop-shadow-sm"
            />
            
            {/* Temperature points */}
            {hourlyData.map((hour, index) => (
              <circle
                key={index}
                cx={index * 40 + 20}
                cy={100 - (hour.temp_c + 10) * 2}
                r="3"
                fill="hsl(var(--primary))"
                className="drop-shadow-sm"
              />
            ))}
            
            {/* Gradient fill under the line */}
            <defs>
              <linearGradient id="temperatureGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path
              d={`M 20,${100 - (hourlyData[0].temp_c + 10) * 2} ${hourlyData.map((hour, index) => 
                `L ${index * 40 + 20},${100 - (hour.temp_c + 10) * 2}`
              ).join(' ')} L ${(hourlyData.length - 1) * 40 + 20},100 L 20,100 Z`}
              fill="url(#temperatureGradient)"
            />
          </svg>
        </div>
      </div>

      {/* Hourly Data Scroll */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-2" style={{ width: `${hourlyData.length * 80}px` }}>
          {hourlyData.map((hour, index) => (
            <div
              key={index}
              className={`flex-shrink-0 text-center space-y-2 p-3 rounded-xl transition-all duration-200 ${
                index === 0 
                  ? 'bg-primary/20 border border-primary/30' 
                  : 'hover:bg-muted/20'
              }`}
              style={{ minWidth: '70px' }}
            >
              {/* Time */}
              <div className="text-xs text-muted-foreground font-medium">
                {index === 0 ? 'Now' : formatTime(hour.time)}
              </div>

              {/* Weather Icon */}
              <div className="flex justify-center">
                <span className="text-2xl">
                  {WeatherService.getWeatherEmoji(hour.condition.code, hour.condition.icon)}
                </span>
              </div>

              {/* Temperature */}
              <div className={`text-sm font-semibold ${getTemperatureColor(hour.temp_c)}`}>
                {Math.round(hour.temp_c)}°
              </div>

              {/* Rain Chance */}
              {hour.chance_of_rain > 0 && (
                <div className="text-xs text-blue-400 flex items-center justify-center gap-1">
                  <span>💧</span>
                  <span>{hour.chance_of_rain}%</span>
                </div>
              )}

              {/* Wind Speed */}
              <div className="text-xs text-muted-foreground">
                {Math.round(hour.wind_mph)} mph
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 pt-4 border-t border-card-border/20">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-3 h-0.5 bg-primary rounded"></div>
          <span>Temperature</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>💧</span>
          <span>Rain Chance</span>
        </div>
      </div>
    </div>
  );
};

export default HourlyForecast;