"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../lib/store';
import { useTranslation } from '../../hooks/useTranslation';
import dynamic from 'next/dynamic';

import SearchBar from '../../components/SearchBar';
import WeatherWidgets from '../../components/WeatherWidgets';
import HourlyForecast from '../../components/HourlyForecast';
import ProfileModal from '../../components/ProfileModal';

// Cargar el mapa de Leaflet sin SSR
const LeafletMap = dynamic(
  () => import('../../components/LeafletMap'),
  { ssr: false, loading: () => <div className="skeleton" style={{width: '100%', height: '100%'}}></div> }
);

export default function Dashboard() {
  const router = useRouter();
  const { user, syncFromBackend, theme, setTheme, language, setLanguage, activeLocation, cities, fetchWeather, removeCityAuth, currentWeather } = useStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const temp = currentWeather?.temperature_2m || 20;

  useEffect(() => {
    const initApp = async () => {
      if (typeof window !== 'undefined' && !localStorage.getItem('auth_hint')) {
        setLoading(false);
        return;
      }
      await syncFromBackend();
      setLoading(false);
    };
    initApp();
  }, [syncFromBackend]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="loader__spinner"></div>
      </div>
    );
  }

  return (
    <>
      <aside className={`sidebar ${isSidebarOpen ? 'sidebar--abierto' : ''}`} id="sidebar" aria-label="Panel lateral">
          <div className="sidebar__logo">
              <div className="sidebar__logo-fila">
                  <span className="material-symbols-outlined sidebar__logo-icon" aria-hidden="true">monitoring</span>
                  <h1 className="sidebar__title">WeatherApp</h1>
              </div>
          </div>

          <nav className="sidebar__nav" aria-label="Navegación principal">
              <a 
                href="#" 
                className={`sidebar__nav-item ${!isMapExpanded ? 'sidebar__nav-item--activo' : ''}`} 
                aria-current={!isMapExpanded ? 'page' : undefined}
                onClick={(e) => {
                    e.preventDefault();
                    setIsMapExpanded(!isMapExpanded);
                    setIsSidebarOpen(false);
                }}
              >
                  <span className="material-symbols-outlined" aria-hidden="true">analytics</span>
                  <span>{t('nav_dashboard')}</span>
              </a>
              <a 
                href="#" 
                className={`sidebar__nav-item ${isMapExpanded ? 'sidebar__nav-item--activo' : ''}`}
                aria-current={isMapExpanded ? 'page' : undefined}
                onClick={(e) => {
                    e.preventDefault();
                    setIsMapExpanded(!isMapExpanded);
                    setIsSidebarOpen(false);
                }}
              >
                  <span className="material-symbols-outlined" aria-hidden="true">explore</span>
                  <span>{t('nav_mapa')}</span>
              </a>
              <a 
                href="#" 
                className="sidebar__nav-item"
                onClick={(e) => {
                  e.preventDefault();
                  setIsProfileModalOpen(true);
                  setIsSidebarOpen(false);
                }}
              >
                  <span className="material-symbols-outlined" aria-hidden="true">account_circle</span>
                  <span>{t('nav_perfil')}</span>
              </a>
          </nav>

          <section className="sidebar__localidades" aria-label="Localidades guardadas">
              <h2 className="sidebar__seccion-titulo">
                  <span className="material-symbols-outlined" aria-hidden="true">bookmark</span>
                  <span>{t('localidades_titulo')}</span>
              </h2>
              <ul className="localidades-lista" aria-live="polite">
                  {cities.length === 0 ? (
                      <li className="localidades-lista__vacio">{t('localidades_vacias')}</li>
                  ) : (
                      cities.map((city) => (
                          <li key={city.name} className="localidad-item" onClick={() => {
                              fetchWeather(city.latitude, city.longitude, city.name, "");
                              setIsSidebarOpen(false); // Cierra menú móvil al seleccionar
                          }}>
                              <span className="material-symbols-outlined localidad-item__icono" aria-hidden="true">location_on</span>
                              <span className="localidad-item__nombre">{city.name}</span>
                              <button 
                                className="localidad-item__eliminar" 
                                aria-label="Eliminar ciudad"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeCityAuth(city.name);
                                }}
                              >
                                  <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                              </button>
                          </li>
                      ))
                  )}
              </ul>
          </section>

          <div className="sidebar__footer">
              <button className="btn-cerrar-sesion" aria-label="Cerrar sesión" onClick={() => {
                localStorage.removeItem('auth_hint');
                fetch('/api/auth/logout', { method: 'POST' }).then(() => router.push('/login'));
              }}>
                  <span className="material-symbols-outlined" aria-hidden="true">logout</span>
                  <span>{t('cerrar_sesion')}</span>
              </button>
          </div>
      </aside>

      {/* Overlay para móvil */}
      {isSidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <div className="layout">
          <header className="header" role="banner">
              <button 
                  className="header__menu-btn" 
                  aria-label="Abrir menú" 
                  aria-expanded={isSidebarOpen}
                  onClick={() => setIsSidebarOpen(true)}
              >
                  <span className="material-symbols-outlined" aria-hidden="true">menu</span>
              </button>

              <SearchBar />

              <div className="header__controles">
                  <div className="toggle-wrap" title="Cambiar tema">
                      <span className="material-symbols-outlined toggle-wrap__icono" aria-hidden="true">light_mode</span>
                      <label className="toggle" htmlFor="toggle-tema">
                          <input 
                              type="checkbox" 
                              id="toggle-tema" 
                              className="toggle__input" 
                              checked={theme === 'dark'}
                              onChange={() => {
                                setTheme(theme === 'dark' ? 'light' : 'dark');
                                fetch('/api/user/config', { method: 'PUT', body: JSON.stringify({theme: theme === 'dark' ? 'light' : 'dark'}) });
                              }}
                          />
                          <span className="toggle__slider" aria-hidden="true"></span>
                      </label>
                      <span className="material-symbols-outlined toggle-wrap__icono" aria-hidden="true">dark_mode</span>
                  </div>

                  <div className="toggle-wrap toggle-wrap--idioma" title="Cambiar idioma">
                      <button 
                        className={`toggle-idioma-btn ${language === 'es' ? 'activo' : ''}`}
                        aria-pressed={language === 'es'}
                        onClick={() => {
                          setLanguage('es');
                          fetch('/api/user/config', { method: 'PUT', body: JSON.stringify({language: 'es'}) });
                        }}
                      >ES</button>
                      <button 
                        className={`toggle-idioma-btn ${language === 'en' ? 'activo' : ''}`}
                        aria-pressed={language === 'en'}
                        onClick={() => {
                          setLanguage('en');
                          fetch('/api/user/config', { method: 'PUT', body: JSON.stringify({language: 'en'}) });
                        }}
                      >EN</button>
                  </div>

                  <div className="header__perfil">
                      <div className="header__perfil-info">
                          <p className="header__perfil-nombre">{user.name}</p>
                          <p className="header__perfil-rol">{t('perfil_rol')}</p>
                      </div>
                      <div className="header__perfil-avatar">
                          {user.avatar_url ? (
                              <img src={user.avatar_url} alt="Avatar" style={{width: '100%', height: '100%', borderRadius: '50%'}} />
                          ) : (
                              <span>{user.name.charAt(0).toUpperCase()}</span>
                          )}
                      </div>
                  </div>

                  <button 
                    className="header__logout-btn" 
                    aria-label="Cerrar sesión" 
                    onClick={() => {
                      localStorage.removeItem('auth_hint');
                      fetch('/api/auth/logout', { method: 'POST' }).then(() => router.push('/login'));
                    }}
                    title={t('cerrar_sesion')}
                  >
                      <span className="material-symbols-outlined" aria-hidden="true">logout</span>
                  </button>
              </div>
          </header>

          <main className={`segmented-workspace ${isMapExpanded ? 'mapa-expandido' : ''}`} id="segmented-workspace">
              <WeatherWidgets />
              <HourlyForecast />

              {/* ===== ZONA 3 — Mapa ===== */}
              <section className="zona-3" aria-label="Mapa de ubicación">
                  <div className="mapa__fondo" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                      <LeafletMap location={activeLocation} currentTemp={temp} />
                  </div>
                  
                  {/* Panel inferior del mapa — Stability Profile */}
                  <div className="mapa__panel">
                      <div className="mapa__panel-grid">
                          <div className="mapa__estabilidad">
                              <div className="mapa__panel-titulo">
                                  <span className="material-symbols-outlined" aria-hidden="true">insights</span>
                                  <h4>{t('estabilidad')}</h4>
                              </div>
                              <dl className="mapa__datos">
                                  <div className="mapa__dato-fila">
                                      <dt>{t('presion')}</dt>
                                      <dd><span>1012</span> <span className="mapa__unidad">hPa</span></dd>
                                  </div>
                                  <div className="mapa__dato-fila">
                                      <dt>{t('punto_rocio')}</dt>
                                      <dd><span>14</span> <span className="mapa__unidad">°C</span></dd>
                                  </div>
                                  <div className="mapa__dato-fila">
                                      <dt>{t('visibilidad')}</dt>
                                      <dd><span>10</span> <span className="mapa__unidad">km</span></dd>
                                  </div>
                              </dl>
                          </div>

                          <div className="mapa__heatmap">
                              <div className="mapa__heatmap-escala">
                                  <span>10°C</span>
                                  <span>30°C</span>
                              </div>
                              <div className="mapa__heatmap-barra" aria-hidden="true"></div>
                              <p className="mapa__heatmap-label">{t('heatmap')}</p>
                              <div className="mapa__live">
                                  <span className="mapa__live-dot" aria-hidden="true"></span>
                                  <span>{t('stream_live')}</span>
                              </div>
                          </div>
                      </div>
                  </div>
              </section>
          </main>
      </div>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </>
  );
}
