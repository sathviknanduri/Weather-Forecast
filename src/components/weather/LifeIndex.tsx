import React from 'react';
import { WeatherData } from '@/types/weather';
import { Activity, Shirt, Pill, Plane, Sun, Car, Droplets, Wind } from 'lucide-react';

interface LifeIndexProps {
  weather: WeatherData;
}

const LifeIndex: React.FC<LifeIndexProps> = ({ weather }) => {
  const { current } = weather;

  const getExerciseAdvice = () => {
    const temp = current.temp_c;
    const humidity = current.humidity;
    const wind = current.wind_kph;
    
    if (temp < 5 || temp > 35) return { level: 'Poor', text: 'Uncomfortable for exercise', color: 'text-red-400' };
    if (humidity > 80 || wind > 30) return { level: 'Fair', text: 'Exercise with caution', color: 'text-yellow-400' };
    if (temp >= 18 && temp <= 25 && humidity < 70) return { level: 'Excellent', text: 'Perfect for exercise', color: 'text-green-400' };
    return { level: 'Good', text: 'Good for exercise', color: 'text-blue-400' };
  };

  const getClothingAdvice = () => {
    const temp = current.temp_c;
    const feelsLike = current.feelslike_c;
    
    if (feelsLike < 5) return { item: 'Heavy Coat', text: 'Winter clothing needed', color: 'text-blue-600' };
    if (feelsLike < 15) return { item: 'Jacket', text: 'Light jacket recommended', color: 'text-blue-400' };
    if (feelsLike < 25) return { item: 'Long Sleeve', text: 'Long sleeves comfortable', color: 'text-green-400' };
    return { item: 'T-shirt', text: 'T-shirt weather', color: 'text-orange-400' };
  };

  const getFluRisk = () => {
    const temp = current.temp_c;
    const humidity = current.humidity;
    
    if (temp < 10 && humidity > 60) return { level: 'High', text: 'High incidence of flu', color: 'text-red-400' };
    if (temp < 15 || humidity > 70) return { level: 'Moderate', text: 'Moderate flu risk', color: 'text-yellow-400' };
    return { level: 'Low', text: 'Low incidence of flu', color: 'text-green-400' };
  };

  const getTravelAdvice = () => {
    const visibility = current.vis_km;
    const wind = current.wind_kph;
    const condition = current.condition.text.toLowerCase();
    
    if (visibility < 5 || wind > 40 || condition.includes('storm')) {
      return { level: 'Poor', text: 'Unsuitable for travel', color: 'text-red-400' };
    }
    if (visibility < 10 || wind > 25 || condition.includes('rain') || condition.includes('snow')) {
      return { level: 'Fair', text: 'Travel with caution', color: 'text-yellow-400' };
    }
    return { level: 'Good', text: 'Suitable for travel', color: 'text-green-400' };
  };

  const getSkinAdvice = () => {
    const humidity = current.humidity;
    const uv = current.uv;
    
    if (humidity < 30) return { text: 'Moisturize skin well', type: 'Dry skin care', color: 'text-blue-400' };
    if (humidity > 70) return { text: 'Proper oil control for oily skin', type: 'Oily skin care', color: 'text-orange-400' };
    if (uv > 6) return { text: 'Use strong sun protection', type: 'UV protection', color: 'text-red-400' };
    return { text: 'Normal skin care routine', type: 'Regular care', color: 'text-green-400' };
  };

  const getDrivingAdvice = () => {
    const visibility = current.vis_km;
    const wind = current.wind_kph;
    const condition = current.condition.text.toLowerCase();
    
    if (visibility < 3 || condition.includes('heavy')) {
      return { level: 'Poor', text: 'Driving not recommended', color: 'text-red-400' };
    }
    if (visibility < 8 || wind > 30 || condition.includes('rain') || condition.includes('snow')) {
      return { level: 'Caution', text: 'Drive with extra caution', color: 'text-yellow-400' };
    }
    return { level: 'Good', text: 'Suitable for driving', color: 'text-green-400' };
  };

  const getUVAdvice = () => {
    const uv = current.uv;
    
    if (uv <= 2) return { level: 'Low', text: 'Minimal protection needed', color: 'text-green-400' };
    if (uv <= 5) return { level: 'Moderate', text: 'Seek shade during midday', color: 'text-yellow-400' };
    if (uv <= 7) return { level: 'High', text: 'Protection essential', color: 'text-orange-400' };
    return { level: 'Very High', text: 'Avoid sun exposure', color: 'text-red-400' };
  };

  const getAirQualityAdvice = () => {
    // Mock air quality based on visibility and conditions
    const visibility = current.vis_km;
    const condition = current.condition.text.toLowerCase();
    
    if (visibility > 15 && !condition.includes('haze')) {
      return { level: 'Good', text: 'Air quality is good', color: 'text-green-400' };
    }
    if (visibility > 8) {
      return { level: 'Moderate', text: 'Acceptable air quality', color: 'text-yellow-400' };
    }
    return { level: 'Poor', text: 'Poor air quality', color: 'text-red-400' };
  };

  const exercise = getExerciseAdvice();
  const clothing = getClothingAdvice();
  const flu = getFluRisk();
  const travel = getTravelAdvice();
  const skin = getSkinAdvice();
  const driving = getDrivingAdvice();
  const uvAdvice = getUVAdvice();
  const airQuality = getAirQualityAdvice();

  const lifeIndexItems = [
    {
      icon: Activity,
      title: 'Exercise',
      value: exercise.level,
      description: exercise.text,
      color: exercise.color,
      bgColor: 'bg-blue-500/20'
    },
    {
      icon: Shirt,
      title: 'Clothing',
      value: clothing.item,
      description: clothing.text,
      color: clothing.color,
      bgColor: 'bg-green-500/20'
    },
    {
      icon: Pill,
      title: 'Flu Risk',
      value: flu.level,
      description: flu.text,
      color: flu.color,
      bgColor: 'bg-purple-500/20'
    },
    {
      icon: Plane,
      title: 'Travel',
      value: travel.level,
      description: travel.text,
      color: travel.color,
      bgColor: 'bg-indigo-500/20'
    },
    {
      icon: Droplets,
      title: 'Skin Care',
      value: skin.type,
      description: skin.text,
      color: skin.color,
      bgColor: 'bg-pink-500/20'
    },
    {
      icon: Car,
      title: 'Driving',
      value: driving.level,
      description: driving.text,
      color: driving.color,
      bgColor: 'bg-yellow-500/20'
    },
    {
      icon: Sun,
      title: 'UV Protection',
      value: uvAdvice.level,
      description: uvAdvice.text,
      color: uvAdvice.color,
      bgColor: 'bg-orange-500/20'
    },
    {
      icon: Wind,
      title: 'Air Quality',
      value: airQuality.level,
      description: airQuality.text,
      color: airQuality.color,
      bgColor: 'bg-cyan-500/20'
    }
  ];

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-primary/20">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Life Index</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lifeIndexItems.map((item, index) => (
          <div
            key={index}
            className="glass-card-hover p-4 space-y-3 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${item.bgColor}`}>
                <item.icon className="w-5 h-5 text-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground">{item.title}</h4>
                <p className={`text-sm font-semibold ${item.color}`}>
                  {item.value}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-card-border/20">
        <p className="text-xs text-muted-foreground text-center">
          Tap any card for detailed recommendations and tips
        </p>
      </div>
    </div>
  );
};

export default LifeIndex;