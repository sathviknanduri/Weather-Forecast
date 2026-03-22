import { 
  WeatherData, 
  GeolocationCoords, 
  OpenWeatherCurrentResponse,
  OpenWeatherForecastResponse,
  OpenWeatherAirPollutionResponse,
  OpenWeatherGeocodingResponse,
  ForecastDay,
  HourlyWeather
} from '@/types/weather';

const API_KEY = '79583747e62e1ddb06e04a941ae789ce';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_URL = 'https://api.openweathermap.org/geo/1.0';

export class WeatherService {
  static async getCurrentWeather(query: string): Promise<WeatherData> {
    try {
      // First, geocode the city name to get coordinates
      const locations = await this.searchCities(query);
      if (locations.length === 0) {
        throw new Error('Location not found');
      }

      const location = locations[0];
      return this.getWeatherByCoords({
        latitude: location.lat,
        longitude: location.lon
      });
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  static async getWeatherByCoords(coords: GeolocationCoords): Promise<WeatherData> {
    try {
      // Fetch current weather, forecast, and air pollution in parallel
      const [currentWeather, forecastData, airPollution] = await Promise.all([
        this.fetchCurrentWeather(coords.latitude, coords.longitude),
        this.fetchForecast(coords.latitude, coords.longitude),
        this.fetchAirPollution(coords.latitude, coords.longitude).catch(() => null) // Air pollution is optional
      ]);

      // Transform OpenWeatherMap data to our unified format
      return this.transformWeatherData(currentWeather, forecastData, airPollution);
    } catch (error) {
      console.error('Error fetching weather by coordinates:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  static async searchCities(query: string): Promise<OpenWeatherGeocodingResponse[]> {
    try {
      const response = await fetch(
        `${GEO_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching cities:', error);
      throw new Error('Failed to search cities');
    }
  }

  private static async fetchCurrentWeather(lat: number, lon: number): Promise<OpenWeatherCurrentResponse> {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`Current weather API error: ${response.status}`);
    }
    
    return response.json();
  }

  private static async fetchForecast(lat: number, lon: number): Promise<OpenWeatherForecastResponse> {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      throw new Error(`Forecast API error: ${response.status}`);
    }
    
    return response.json();
  }

  private static async fetchAirPollution(lat: number, lon: number): Promise<OpenWeatherAirPollutionResponse> {
    const response = await fetch(
      `${BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`Air pollution API error: ${response.status}`);
    }
    
    return response.json();
  }

  private static transformWeatherData(
    current: OpenWeatherCurrentResponse,
    forecast: OpenWeatherForecastResponse,
    airPollution: OpenWeatherAirPollutionResponse | null
  ): WeatherData {
    // Create location object
    const location = {
      name: current.name,
      region: current.sys.country,
      country: current.sys.country,
      lat: current.coord.lat,
      lon: current.coord.lon,
      localtime: new Date().toISOString()
    };

    // Transform current weather
    const currentWeather = {
      temp_c: Math.round(current.main.temp),
      temp_f: Math.round(current.main.temp * 9/5 + 32),
      condition: {
        text: this.capitalizeWords(current.weather[0].description),
        icon: this.getWeatherIcon(current.weather[0].icon),
        code: current.weather[0].id
      },
      wind_mph: Math.round(current.wind.speed * 2.237), // m/s to mph
      wind_kph: Math.round(current.wind.speed * 3.6), // m/s to km/h
      wind_dir: this.getWindDirection(current.wind.deg),
      pressure_mb: current.main.pressure,
      precip_mm: 0, // Current weather doesn't include precipitation
      humidity: current.main.humidity,
      cloud: current.clouds.all,
      feelslike_c: Math.round(current.main.feels_like),
      feelslike_f: Math.round(current.main.feels_like * 9/5 + 32),
      vis_km: Math.round(current.visibility / 1000),
      uv: 5 // OpenWeather doesn't provide UV in current weather, using mock value
    };

    // Transform forecast data
    const forecastDays = this.groupForecastByDay(forecast);

    return {
      location,
      current: currentWeather,
      forecast: {
        forecastday: forecastDays
      }
    };
  }

  private static groupForecastByDay(forecast: OpenWeatherForecastResponse): ForecastDay[] {
    const days: { [date: string]: any } = {};
    
    // Group forecast items by date
    forecast.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0]; // Extract date part (YYYY-MM-DD)
      
      if (!days[date]) {
        days[date] = {
          date,
          items: [],
          temps: [],
          conditions: [],
          humidity: [],
          precipitation: 0,
          windSpeeds: []
        };
      }
      
      days[date].items.push(item);
      days[date].temps.push(item.main.temp);
      days[date].conditions.push(item.weather[0]);
      days[date].humidity.push(item.main.humidity);
      days[date].windSpeeds.push(item.wind.speed);
      
      if (item.rain?.['3h']) {
        days[date].precipitation += item.rain['3h'];
      }
      if (item.snow?.['3h']) {
        days[date].precipitation += item.snow['3h'];
      }
    });

    // Convert grouped data to ForecastDay format
    return Object.values(days).slice(0, 5).map((dayData: any) => {
      const maxTemp = Math.max(...dayData.temps);
      const minTemp = Math.min(...dayData.temps);
      const avgTemp = dayData.temps.reduce((a: number, b: number) => a + b, 0) / dayData.temps.length;
      const avgHumidity = dayData.humidity.reduce((a: number, b: number) => a + b, 0) / dayData.humidity.length;
      const maxWind = Math.max(...dayData.windSpeeds);
      
      // Get most common weather condition for the day
      const conditionCounts: { [key: string]: any } = {};
      dayData.conditions.forEach((condition: any) => {
        const key = condition.main;
        if (!conditionCounts[key]) {
          conditionCounts[key] = { count: 0, condition };
        }
        conditionCounts[key].count++;
      });
      
      const dominantCondition = Object.values(conditionCounts)
        .sort((a: any, b: any) => b.count - a.count)[0] as any;

      // Calculate rain/snow chances
      const rainItems = dayData.items.filter((item: any) => item.rain?.['3h'] > 0);
      const snowItems = dayData.items.filter((item: any) => item.snow?.['3h'] > 0);
      const rainChance = Math.round((rainItems.length / dayData.items.length) * 100);
      const snowChance = Math.round((snowItems.length / dayData.items.length) * 100);

      // Create hourly data from 3-hour forecast items
      const hourlyData: HourlyWeather[] = dayData.items.map((item: any) => ({
        time: item.dt_txt,
        temp_c: Math.round(item.main.temp),
        temp_f: Math.round(item.main.temp * 9/5 + 32),
        condition: {
          text: this.capitalizeWords(item.weather[0].description),
          icon: this.getWeatherIcon(item.weather[0].icon),
          code: item.weather[0].id
        },
        wind_mph: Math.round(item.wind.speed * 2.237),
        humidity: item.main.humidity,
        cloud: item.clouds.all,
        feelslike_c: Math.round(item.main.feels_like),
        chance_of_rain: Math.round(item.pop * 100),
        chance_of_snow: item.snow?.['3h'] ? Math.round(item.pop * 100) : 0,
        will_it_rain: item.rain?.['3h'] ? 1 : 0,
        will_it_snow: item.snow?.['3h'] ? 1 : 0
      }));

      return {
        date: dayData.date,
        day: {
          maxtemp_c: Math.round(maxTemp),
          maxtemp_f: Math.round(maxTemp * 9/5 + 32),
          mintemp_c: Math.round(minTemp),
          mintemp_f: Math.round(minTemp * 9/5 + 32),
          avgtemp_c: Math.round(avgTemp),
          condition: {
            text: this.capitalizeWords(dominantCondition.condition.description),
            icon: this.getWeatherIcon(dominantCondition.condition.icon),
            code: dominantCondition.condition.id
          },
          maxwind_mph: Math.round(maxWind * 2.237),
          totalprecip_mm: Math.round(dayData.precipitation),
          avghumidity: Math.round(avgHumidity),
          daily_chance_of_rain: rainChance,
          daily_chance_of_snow: snowChance,
          uv: 5 // Mock UV index
        },
        astro: {
          sunrise: this.formatTime(forecast.city.sunrise, forecast.city.timezone),
          sunset: this.formatTime(forecast.city.sunset, forecast.city.timezone),
          moonrise: '12:00 AM', // Mock moonrise
          moonset: '12:00 PM'   // Mock moonset
        },
        hour: hourlyData
      };
    });
  }

  static getWeatherEmoji(code: number, icon?: string): string {
    if (code >= 200 && code < 300) return '⛈️';
    if (code >= 300 && code < 400) return '🌧️';
    if (code >= 500 && code < 505) return '🌧️';
    if (code === 511) return '🧊';
    if (code >= 520 && code < 600) return '🌧️';
    if (code >= 600 && code < 700) return '❄️';
    if (code >= 700 && code < 800) return '🌫️';
    if (code === 800) return '☀️';
    if (code === 801) return '🌤️';
    if (code === 802) return '⛅';
    if (code === 803 || code === 804) return '☁️';
    return '🌡️';
  }

  private static getWeatherIcon(iconCode: string): string {
    return iconCode;
  }

  private static formatTime(timestamp: number, timezone: number): string {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'UTC'
    });
  }

  private static capitalizeWords(str: string): string {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private static getWindDirection(degrees: number): string {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  static getGeolocation(): Promise<GeolocationCoords> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  static getWeatherCondition(code: number, isDay: boolean): 'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'stormy' | 'night' {
    if (!isDay) return 'night';
    
    // OpenWeatherMap condition codes
    if (code >= 200 && code < 300) return 'stormy'; // Thunderstorm
    if (code >= 300 && code < 600) return 'rainy';  // Drizzle and Rain
    if (code >= 600 && code < 700) return 'snowy';  // Snow
    if (code >= 700 && code < 800) return 'cloudy'; // Atmosphere (fog, etc.)
    if (code === 800) return 'sunny';               // Clear
    if (code > 800) return 'cloudy';                // Clouds
    
    return 'cloudy'; // Default fallback
  }

  static isDay(localtime: string, sunrise: string, sunset: string): boolean {
    const current = new Date(`1970-01-01 ${localtime.split(' ')[1]}`);
    const sunriseTime = new Date(`1970-01-01 ${sunrise}`);
    const sunsetTime = new Date(`1970-01-01 ${sunset}`);
    
    return current >= sunriseTime && current <= sunsetTime;
  }
}
