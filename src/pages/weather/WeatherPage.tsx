import { CloudSun, Droplets, Wind, Eye, Gauge, Cloud, RefreshCw } from 'lucide-react';
import { useWeather } from '../../hooks/useWeather';
import { useFarm } from '../../contexts/FarmContext';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatDate } from '../../lib/utils';

export function WeatherPage() {
  const { current, forecast, loading, error, refresh } = useWeather();
  const { activeFarm } = useFarm();

  const hasCoordinates = activeFarm?.latitude && activeFarm?.longitude;

  if (!hasCoordinates) {
    return (
      <>
        <PageHeader title="Weather" />
        <Card>
          <div className="text-center py-8">
            <CloudSun className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Set Farm Coordinates</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              To get weather data for your farm, add GPS coordinates in Settings. Go to Settings &rarr;
              Farm Details and enter your latitude and longitude.
            </p>
          </div>
        </Card>
      </>
    );
  }

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <>
        <PageHeader title="Weather" />
        <Card>
          <div className="text-center py-8">
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Button onClick={refresh}>Try Again</Button>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Weather"
        subtitle={current ? `${current.city} — ${activeFarm?.county ?? ''} County` : undefined}
        action={
          <Button variant="secondary" onClick={refresh}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        }
      />

      {current && (
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center gap-4">
              <img
                src={`https://openweathermap.org/img/wn/${current.icon}@2x.png`}
                alt={current.description}
                className="w-20 h-20"
              />
              <div>
                <p className="text-4xl font-bold text-slate-900">{current.temp}°C</p>
                <p className="text-sm text-slate-500 capitalize">{current.description}</p>
                <p className="text-xs text-slate-400">Feels like {current.feels_like}°C</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-xs text-slate-500">Humidity</p>
                  <p className="text-sm font-medium">{current.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Wind</p>
                  <p className="text-sm font-medium">{current.wind_speed} m/s</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Pressure</p>
                  <p className="text-sm font-medium">{current.pressure} hPa</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">Visibility</p>
                  <p className="text-sm font-medium">{(current.visibility / 1000).toFixed(1)} km</p>
                </div>
              </div>
            </div>
          </div>

          {current.rain_1h && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center gap-2">
              <Cloud className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-blue-800">Rain in last hour: {current.rain_1h} mm</p>
            </div>
          )}
        </Card>
      )}

      {forecast.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">5-Day Forecast</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {forecast.map((day) => (
              <div key={day.date} className="text-center p-3 rounded-lg bg-slate-50">
                <p className="text-xs font-medium text-slate-600">{formatDate(day.date)}</p>
                <img
                  src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                  alt={day.description}
                  className="w-12 h-12 mx-auto"
                />
                <p className="text-lg font-bold text-slate-900">
                  {Math.round(day.temp_max)}°
                  <span className="text-sm font-normal text-slate-400 ml-1">{Math.round(day.temp_min)}°</span>
                </p>
                <p className="text-xs text-slate-500 capitalize mt-1">{day.description}</p>
                <div className="flex justify-center gap-2 mt-1">
                  <span className="text-xs text-blue-500">{day.humidity}%</span>
                  <span className="text-xs text-slate-400">{day.wind_speed} m/s</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </>
  );
}
