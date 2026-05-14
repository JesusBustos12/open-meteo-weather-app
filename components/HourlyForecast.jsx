"use client";

import { useStore } from '../lib/store';
import { useTranslation } from '../hooks/useTranslation';
import { infoClima, nivelUV } from '../lib/weatherUtils';

export default function HourlyForecast() {
    const { t, language } = useTranslation();
    const { hourlyForecast, isSearching } = useStore();

    if (isSearching || !hourlyForecast) {
        return (
            <section className="zona-2" aria-label="Pronóstico por horas">
                <div className="zona-2__cabecera">
                    <h3 className="zona-2__titulo">{t('pronostico_horas')}</h3>
                    <span className="zona-2__granularidad">{t('granularidad')}</span>
                </div>
                
                <div className="tabla-horas-wrapper">
                    <table className="tabla-horas">
                        <thead>
                            <tr>
                                <th>{t('hora')}</th>
                                <th>{t('estado_col')}</th>
                                <th>{t('temp_col')}</th>
                                <th>{t('precip_col')}</th>
                                <th>{t('uv_col')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan="5" style={{padding: '0'}}>
                                    <div id="tabla-horas-skeleton">
                                        <div className="skeleton-row skeleton"></div>
                                        <div className="skeleton-row skeleton"></div>
                                        <div className="skeleton-row skeleton"></div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        );
    }

    // Calcular las 12 horas siguientes
    const ahora = new Date();
    const horaActual = ahora.getHours();
    
    let indiceBase = hourlyForecast.time.findIndex(timeStr => new Date(timeStr).getHours() === horaActual);
    if (indiceBase < 0) indiceBase = 0;

    const horas = hourlyForecast.time.slice(indiceBase, indiceBase + 12);
    const temps = hourlyForecast.temperature_2m.slice(indiceBase, indiceBase + 12);
    const wmos = hourlyForecast.weather_code.slice(indiceBase, indiceBase + 12);
    const precips = (hourlyForecast.precipitation_probability || []).slice(indiceBase, indiceBase + 12);
    const uvs = (hourlyForecast.uv_index || []).slice(indiceBase, indiceBase + 12);

    const formatHour = (isoString, isNow) => {
        if (isNow) return t('ahora');
        const d = new Date(isoString);
        return d.toLocaleTimeString(language === 'es' ? 'es-MX' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    };

    // Cálculos de SVG Trend Line
    const W = 400; const H = 80; const PAD = 6;
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const rango = max - min || 1;
    
    const puntos = temps.map((t, i) => {
        const x = PAD + (i / (temps.length - 1)) * (W - PAD * 2);
        const y = H - PAD - ((t - min) / rango) * (H - PAD * 2);
        return [x, y];
    });

    let pathD = puntos.length > 0 ? `M ${puntos[0][0]} ${puntos[0][1]}` : '';
    for (let i = 1; i < puntos.length; i++) {
        const prev = puntos[i - 1];
        const curr = puntos[i];
        const cpx = (prev[0] + curr[0]) / 2;
        pathD += ` C ${cpx} ${prev[1]} ${cpx} ${curr[1]} ${curr[0]} ${curr[1]}`;
    }

    // Últimas 2 horas nocturnas (Late analysis)
    const lateAnalysis = [
        { hora: horas[horas.length - 2], temp: temps[temps.length - 2], wmo: wmos[wmos.length - 2] },
        { hora: horas[horas.length - 1], temp: temps[temps.length - 1], wmo: wmos[wmos.length - 1] },
    ];

    return (
        <section className="zona-2" aria-label="Pronóstico por horas">
            <div className="zona-2__cabecera">
                <h3 className="zona-2__titulo">{t('pronostico_horas')}</h3>
                <span className="zona-2__granularidad">{t('granularidad')}</span>
            </div>

            <div className="tabla-horas-wrapper">
                <table className="tabla-horas" aria-label="Pronóstico por hora">
                    <thead>
                        <tr>
                            <th scope="col">{t('hora')}</th>
                            <th scope="col">{t('estado_col')}</th>
                            <th scope="col">{t('temp_col')}</th>
                            <th scope="col">{t('precip_col')}</th>
                            <th scope="col">{t('uv_col')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {horas.map((horaStr, i) => {
                            const info = infoClima(wmos[i]);
                            const isNow = i === 0;
                            return (
                                <tr key={i}>
                                    <td className={isNow ? 'fila-ahora' : ''}>{formatHour(horaStr, isNow)}</td>
                                    <td>
                                        <div className="fila-estado">
                                            <span className="material-symbols-outlined fila-estado__icono" aria-hidden="true">{info.msIcon || 'sunny'}</span>
                                            <span className="fila-estado__texto">{info[language]}</span>
                                        </div>
                                    </td>
                                    <td className="fila-temp">{Math.round(temps[i])}°C</td>
                                    <td>{precips[i] !== undefined ? precips[i] : 0}%</td>
                                    <td>{nivelUV(uvs[i] !== undefined ? Math.round(uvs[i]) : 0)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Late Analysis */}
            <div className="late-analysis">
                <div className="late-analysis__header">
                    <span className="material-symbols-outlined" aria-hidden="true">schedule</span>
                    <h4>{t('late_analysis')}</h4>
                </div>
                <ul className="late-analysis__lista" aria-label="Análisis nocturno">
                    {lateAnalysis.map((item, idx) => {
                        const info = infoClima(item.wmo);
                        return (
                            <li className="late-analysis__item" key={idx}>
                                <span className="late-analysis__hora">{formatHour(item.hora, false)}</span>
                                <span className="material-symbols-outlined late-analysis__icono" aria-hidden="true">{info.msIcon || 'nightlight_round'}</span>
                                <span className="late-analysis__temp">{Math.round(item.temp)}°C</span>
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Tendencia SVG */}
            <div className="tendencia" aria-hidden="true">
                <div className="tendencia__cabecera">
                    <h4>{t('tendencia')}</h4>
                    <span className="tendencia__live">{t('live_projection')}</span>
                </div>
                <div className="tendencia__contenedor">
                    <svg className="tendencia__svg" viewBox="0 0 400 100" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="grad-linea" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{ stopColor: 'var(--color-primario)', stopOpacity: 0.4 }} />
                                <stop offset="100%" style={{ stopColor: 'var(--color-primario)', stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>
                        <path className="tendencia__linea" d={pathD} />
                        <g>
                            {puntos.map(([x, y], i) => {
                                if (i % 3 !== 0 && i !== puntos.length - 1) return null;
                                return <circle key={i} cx={x} cy={y} r="3" className="tendencia__punto" />;
                            })}
                        </g>
                    </svg>
                    <div className="tendencia__etiquetas">
                        {puntos.map(([x, y], i) => {
                            if (i % 3 !== 0 && i !== puntos.length - 1) return null;
                            return (
                                <span key={i} style={{ left: `${x}px`, position: 'absolute', bottom: '-20px' }}>
                                    {Math.round(temps[i])}°
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
