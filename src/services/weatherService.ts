import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  description: string;
  icon: string;
  wind_speed: number;
  pressure: number;
  visibility: number;
  clouds: number;
  rain_1h?: number;
  city: string;
}

export interface ForecastData {
  date: string;
  temp_min: number;
  temp_max: number;
  description: string;
  icon: string;
  humidity: number;
  wind_speed: number;
  rain?: number;
}

export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
  const { data } = await axios.get(`${BASE_URL}/weather`, {
    params: { lat, lon, appid: API_KEY, units: 'metric' },
  });

  return {
    temp: Math.round(data.main.temp),
    feels_like: Math.round(data.main.feels_like),
    humidity: data.main.humidity,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
    wind_speed: data.wind.speed,
    pressure: data.main.pressure,
    visibility: data.visibility,
    clouds: data.clouds.all,
    rain_1h: data.rain?.['1h'],
    city: data.name,
  };
}

export async function getForecast(lat: number, lon: number): Promise<ForecastData[]> {
  const { data } = await axios.get(`${BASE_URL}/forecast`, {
    params: { lat, lon, appid: API_KEY, units: 'metric' },
  });

  const dailyMap = new Map<string, ForecastData>();

  for (const item of data.list) {
    const date = item.dt_txt.split(' ')[0];
    const existing = dailyMap.get(date);

    if (!existing) {
      dailyMap.set(date, {
        date,
        temp_min: item.main.temp_min,
        temp_max: item.main.temp_max,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        humidity: item.main.humidity,
        wind_speed: item.wind.speed,
        rain: item.rain?.['3h'],
      });
    } else {
      existing.temp_min = Math.min(existing.temp_min, item.main.temp_min);
      existing.temp_max = Math.max(existing.temp_max, item.main.temp_max);
    }
  }

  return Array.from(dailyMap.values()).slice(0, 5);
}
