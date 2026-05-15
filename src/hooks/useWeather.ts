import { useCallback, useEffect, useState } from 'react';
import { getCurrentWeather, getForecast, type WeatherData, type ForecastData } from '../services/weatherService';
import { useFarm } from '../contexts/FarmContext';

export function useWeather() {
  const { activeFarm } = useFarm();
  const [current, setCurrent] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    if (!activeFarm?.latitude || !activeFarm?.longitude) return;

    setLoading(true);
    setError(null);

    try {
      const [weatherData, forecastData] = await Promise.all([
        getCurrentWeather(activeFarm.latitude, activeFarm.longitude),
        getForecast(activeFarm.latitude, activeFarm.longitude),
      ]);
      setCurrent(weatherData);
      setForecast(forecastData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  }, [activeFarm]);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  return { current, forecast, loading, error, refresh: fetchWeather };
}
