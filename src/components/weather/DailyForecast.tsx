import React from 'react';
import { WeatherData } from '@/types/weather';
import { WeatherService } from '@/services/weatherService';
import { Calendar, Droplets, Wind } from 'lucide-react';

interface DailyForecastProps {
  weather: WeatherData;
}

const DailyForecast: React.FC<DailyForecastProps> = ({ weather }) => {
  const { forecast } = weather;

  const formatDate = (dateString: string, index: number) => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';
    
    const date = new Date(dateString);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 30) return 'text-red-400';
    if (temp >= 20) return 'text-orange-400';
    if (temp >= 10) return 'text-yellow-400';
    if (temp >= 0) return 'text-blue-400';
    return 'text-blue-600';
  };

  const getTemperatureRange = (min: number, max: number) => {
    const range = max - min;
    return {
      minWidth: range < 5 ? '20%' : `${Math.max(20, (range / 40) * 100)}%`,
      leftOffset: `${((min + 20) / 60) * 100}%`
    };
  };

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">7-Day Forecast</h3>
      </div>

      {/* Forecast Days */}
      <div className="space-y-3">
        {forecast.forecastday.map((day, index) => (
          <div
            key={day.date}
            className={`group p-4 rounded-xl transition-all duration-200 ${
              index === 0 
                ? 'bg-primary/10 border border-primary/20' 
                : 'hover:bg-muted/10 border border-transparent hover:border-card-border/30'
            }`}
          >
            <div className="flex items-center justify-between">
              {/* Date and Weather */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground min-w-20">
                  {formatDate(day.date, index)}
                </div>
                
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-3xl flex-shrink-0">
                    {WeatherService.getWeatherEmoji(day.day.condition.code, day.day.condition.icon)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {day.day.condition.text}
                    </div>
                    
                    {/* Weather details */}
                    <div className="flex items-center gap-4 mt-1">
                      {day.day.daily_chance_of_rain > 0 && (
                        <div className="flex items-center gap-1 text-xs text-blue-400">
                          <Droplets className="w-3 h-3" />
                          <span>{day.day.daily_chance_of_rain}%</span>
                        </div>
                      )}
                      
                      {day.day.maxwind_mph > 15 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Wind className="w-3 h-3" />
                          <span>{Math.round(day.day.maxwind_mph)} mph</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Temperature Range */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`text-lg font-semibold ${getTemperatureColor(day.day.maxtemp_c)}`}>
                    {Math.round(day.day.maxtemp_c)}°
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round(day.day.mintemp_c)}°
                  </div>
                </div>

                {/* Temperature bar visualization */}
                <div className="w-24 h-2 bg-muted/20 rounded-full relative overflow-hidden">
                  <div
                    className="absolute h-full bg-gradient-to-r from-blue-400 via-yellow-400 to-red-400 rounded-full transition-all duration-300"
                    style={{
                      left: getTemperatureRange(day.day.mintemp_c, day.day.maxtemp_c).leftOffset,
                      width: getTemperatureRange(day.day.mintemp_c, day.day.maxtemp_c).minWidth,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Expanded details for today */}
            {index === 0 && (
              <div className="mt-4 pt-4 border-t border-primary/20">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-xs text-muted-foreground">Humidity</div>
                    <div className="text-sm font-medium">{day.day.avghumidity}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">UV Index</div>
                    <div className="text-sm font-medium">{day.day.uv}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Sunrise</div>
                    <div className="text-sm font-medium">{day.astro.sunrise}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Sunset</div>
                    <div className="text-sm font-medium">{day.astro.sunset}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Temperature Scale Legend */}
      <div className="pt-4 border-t border-card-border/20">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Temperature Range</span>
          <span>°C</span>
        </div>
        <div className="h-2 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400 rounded-full"></div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>-10°</span>
          <span>0°</span>
          <span>20°</span>
          <span>40°</span>
        </div>
      </div>
    </div>
  );
};

export default DailyForecast;