import React, { useEffect, useState } from 'react';
import { WeatherCondition } from '@/types/weather';

interface WeatherBackgroundProps {
  condition: WeatherCondition;
  children: React.ReactNode;
}

const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ condition, children }) => {
  const [raindrops, setRaindrops] = useState<number[]>([]);
  const [snowflakes, setSnowflakes] = useState<number[]>([]);

  useEffect(() => {
    if (condition === 'rainy' || condition === 'stormy') {
      setRaindrops(Array.from({ length: 50 }, (_, i) => i));
    } else {
      setRaindrops([]);
    }

    if (condition === 'snowy') {
      setSnowflakes(Array.from({ length: 30 }, (_, i) => i));
    } else {
      setSnowflakes([]);
    }
  }, [condition]);

  const getBackgroundClass = () => {
    switch (condition) {
      case 'sunny':
        return 'bg-sunny';
      case 'rainy':
      case 'stormy':
        return 'bg-rainy';
      case 'cloudy':
        return 'bg-cloudy';
      case 'snowy':
        return 'bg-cloudy';
      case 'night':
        return 'bg-night';
      default:
        return 'bg-cloudy';
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-1000 ${getBackgroundClass()}`}>
      {/* Weather Effects */}
      {(condition === 'rainy' || condition === 'stormy') && (
        <div className="rain-effect">
          {raindrops.map((_, index) => (
            <div
              key={index}
              className="raindrop"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {condition === 'snowy' && (
        <div className="rain-effect">
          {snowflakes.map((_, index) => (
            <div
              key={index}
              className="snowflake"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              ❄
            </div>
          ))}
        </div>
      )}

      {/* Floating Clouds */}
      {(condition === 'cloudy' || condition === 'night') && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="cloud-float absolute top-20 left-10 text-6xl opacity-20">☁️</div>
          <div className="cloud-float absolute top-32 right-20 text-4xl opacity-15" style={{ animationDelay: '5s' }}>☁️</div>
          <div className="cloud-float absolute top-48 left-1/3 text-5xl opacity-10" style={{ animationDelay: '10s' }}>☁️</div>
        </div>
      )}

      {/* Sun Effect */}
      {condition === 'sunny' && (
        <div className="absolute top-20 right-20 pointer-events-none">
          <div className="sun-glow text-6xl">☀️</div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default WeatherBackground;