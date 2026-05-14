"use client";

import { useStore } from '../lib/store';
import { useTranslation } from '../hooks/useTranslation';
import { infoClima, gradosADireccion } from '../lib/weatherUtils';

export default function WeatherWidgets() {
    const { t, language } = useTranslation();
    const { currentWeather, isSearching, activeLocation, saveCityAuth } = useStore();

    if (isSearching) {
        return (
            <section className="zona-1" aria-label="Clima actual">
                <div className="loader" aria-live="polite" aria-label="Cargando">
                    <div className="loader__spinner" aria-hidden="true"></div>
                    <p>{t('cargando')}</p>
                </div>
                <div className="clima-tarjetas">
                    <div className="clima-tarjeta skeleton skeleton-card"></div>
                    <div className="clima-tarjeta skeleton skeleton-card"></div>
                    <div className="clima-tarjeta skeleton skeleton-card"></div>
                    <div className="clima-tarjeta skeleton skeleton-card"></div>
                </div>
            </section>
        );
    }

    if (!currentWeather || !activeLocation) {
        return (
            <section className="zona-1" aria-label="Clima actual">
                <section className="estado-inicial" aria-label="Estado inicial">
                    <span className="material-symbols-outlined estado-inicial__icono" aria-hidden="true">partly_cloudy_day</span>
                    <h2 className="estado-inicial__titulo">{t('inicio_titulo')}</h2>
                    <p className="estado-inicial__desc">{t('inicio_desc')}</p>
                </section>
            </section>
        );
    }

    const { ciudad, region } = activeLocation;
    const temp = Math.round(currentWeather.temperature_2m);
    const sensacion = Math.round(currentWeather.apparent_temperature);
    const delta = sensacion - temp;
    const humedad = currentWeather.relative_humidity_2m;
    const viento = Math.round(currentWeather.wind_speed_10m);
    const direccion = gradosADireccion(currentWeather.wind_direction_10m);
    const wmo = infoClima(currentWeather.weather_code);

    return (
        <section className="zona-1" aria-label="Clima actual">
            {/* Cabecera */}
            <div className="zona-1__cabecera">
                <div>
                    <h2 className="clima-ciudad">{ciudad}</h2>
                    <p className="clima-region">{region}</p>
                </div>
                <button 
                  className="btn-guardar-ciudad" 
                  aria-label="Guardar ciudad"
                  onClick={() => saveCityAuth({
                      name: ciudad,
                      latitude: activeLocation.lat,
                      longitude: activeLocation.lon
                  })}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">bookmark_add</span>
                    <span>{t('guardar_ciudad')}</span>
                </button>
            </div>

            <div className="badge-estacion">
                <span className="material-symbols-outlined" aria-hidden="true">sensors</span>
                <span>{t('estacion_tiempo_real')}</span>
            </div>

            {/* Tarjetas Ocupando Todo El Grid */}
            <div className="clima-tarjetas" aria-live="polite">
                {/* Temperatura */}
                <div className="clima-tarjeta">
                    <p className="clima-tarjeta__etiqueta">{t('temperatura')}</p>
                    <div className="clima-tarjeta__valor-fila">
                        <span className="clima-tarjeta__num">{temp}</span>
                        <span className="clima-tarjeta__unidad-primaria">°C</span>
                    </div>
                    <p className="clima-tarjeta__sub">
                        <span className="material-symbols-outlined clima-tarjeta__flecha" aria-hidden="true">{wmo.msIcon}</span>
                        <span>{wmo[language]}</span>
                    </p>
                </div>

                {/* Viento */}
                <div className="clima-tarjeta">
                    <p className="clima-tarjeta__etiqueta">{t('viento')}</p>
                    <div className="clima-tarjeta__valor-fila">
                        <span className="clima-tarjeta__num">{viento}</span>
                        <span className="clima-tarjeta__unidad">km/h</span>
                    </div>
                    <div className="viento-badges">
                        <span className="viento-badge">{direccion}</span>
                        <span className="viento-badge viento-badge--borde">{t('viento_estable')}</span>
                    </div>
                </div>

                {/* Humedad */}
                <div className="clima-tarjeta">
                    <p className="clima-tarjeta__etiqueta">{t('humedad')}</p>
                    <div className="clima-tarjeta__valor-fila">
                        <span className="clima-tarjeta__num">{humedad}</span>
                        <span className="clima-tarjeta__unidad">%</span>
                    </div>
                    <div className="barra-progreso" role="progressbar" aria-valuenow={humedad} aria-valuemin="0" aria-valuemax="100">
                        <div className="barra-progreso__fill" style={{ width: `${Math.min(100, humedad)}%` }}></div>
                    </div>
                </div>

                {/* Sensación Térmica */}
                <div className="clima-tarjeta">
                    <p className="clima-tarjeta__etiqueta">{t('sensacion')}</p>
                    <div className="clima-tarjeta__valor-fila">
                        <span className="clima-tarjeta__num">{sensacion}</span>
                        <span className="clima-tarjeta__unidad">°C</span>
                    </div>
                    <p className="clima-tarjeta__delta">
                        {t('delta_index').replace('—', `${delta >= 0 ? '+' : ''}${delta}`)}
                    </p>
                </div>
            </div>
        </section>
    );
}
