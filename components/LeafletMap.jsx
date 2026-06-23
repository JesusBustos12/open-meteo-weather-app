"use client";

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useStore } from '../lib/store';

/**
 * Genera puntos térmicos aleatorios y sus opacidades
 */
function _generarPuntosTermicos(lat, lon, tempBase) {
  const puntos = [];
  const offsets = [
    { dlat: 0.05, dlon: 0.08 }, { dlat: -0.06, dlon: 0.04 },
    { dlat: 0.03, dlon: -0.07 }, { dlat: -0.04, dlon: -0.05 },
    { dlat: 0.08, dlon: -0.02 }, { dlat: -0.02, dlon: 0.09 },
    { dlat: 0.04, dlon: 0.05 }, { dlat: -0.07, dlon: -0.03 },
    { dlat: 0.01, dlon: -0.09 }, { dlat: -0.09, dlon: 0.01 },
    { dlat: 0.06, dlon: 0.06 }, { dlat: -0.05, dlon: -0.08 },
  ];

  offsets.forEach(({ dlat, dlon }) => {
    const variacion = (Math.random() - 0.5) * 6; // ±3°C
    puntos.push({
      vlat: lat + dlat,
      vlon: lon + dlon,
      vtemp: tempBase + variacion,
      vradio: 3000 + Math.random() * 5000,
      vopacidad: 0.12 + Math.random() * 0.15,
    });
  });
  return puntos;
}

/**
 * Convierte temperatura °C a color RGB para la capa térmica
 */
function _tempAColor(temp) {
  const t = Math.max(-10, Math.min(45, temp));
  let r, g, b;

  if (t <= 0) {
    const p = (t + 10) / 10;
    r = 0; g = Math.round(p * 200); b = Math.round(200 + p * 55);
  } else if (t <= 15) {
    const p = t / 15;
    r = 0; g = Math.round(200 + p * 55); b = Math.round(255 * (1 - p));
  } else if (t <= 25) {
    const p = (t - 15) / 10;
    r = Math.round(p * 255); g = 255; b = 0;
  } else if (t <= 35) {
    const p = (t - 25) / 10;
    r = 255; g = Math.round(255 * (1 - p)); b = 0;
  } else {
    const p = (t - 35) / 10;
    r = 255; g = 0; b = Math.round(p * 180);
  }
  return `rgb(${r},${g},${b})`;
}

export default function LeafletMap({ location, currentTemp = 20 }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markerRef = useRef(null);
  const thermalLayerRef = useRef(null);
  const { theme } = useStore();
  
  const [layerType, setLayerType] = useState('dark'); // 'dark' | 'satellite'
  const [showThermal, setShowThermal] = useState(false);

  // 1) Initialize Map
  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      center: [52.52, 13.41], 
      zoom: 4,
      minZoom: 3, // Evita bordes vacíos arriba/abajo
      maxBounds: [[-85, -Infinity], [85, Infinity]], // Limita el scroll vertical a la tierra
      maxBoundsViscosity: 1.0, 
      worldCopyJump: true,
      zoomControl: false, 
      attributionControl: false
    });

    const ro = new ResizeObserver(() => {
      mapRef.current?.invalidateSize();
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2) Handle Base Layers
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Remover solo tiles (no markers ni círculos)
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current.removeLayer(layer);
      }
    });

    // Usamos Voyager para ambos temas por su nivel de detalle, 
    // y aplicamos filtros CSS en el modo oscuro.
    let url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'; 

    if (layerType === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } 

    L.tileLayer(url, {
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(mapRef.current);

  }, [layerType, theme]);

  // 3) Handle Marker and "FlyTo" recenter
  useEffect(() => {
    if (!mapRef.current || !location) return;

    // Fly animado a la nueva ciudad
    mapRef.current.flyTo([location.lat, location.lon], 11, {
      animate: true,
      duration: 1.5,
      easeLinearity: 0.5
    });

    // Quitar marcador anterior
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // SVG decorativo para marker idéntico al vanilla origin
    const svgIcon = L.divIcon({
      className: '',
      html: `<div style="
        width:2.8rem;height:2.8rem;
        background:var(--color-primario,#1dd0ed);
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:2px solid rgba(2,6,23,.7);
        box-shadow:0 0 14px rgba(29,208,237,.7);
      "></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -30],
    });

    const marcador = L.marker([location.lat, location.lon], { icon: svgIcon }).addTo(mapRef.current);
    marcador.bindPopup(
      `<strong style="font-size:1.3rem">${location.ciudad || "Ciudad"}</strong><br>
       <span style="font-size:1.1rem;color:#64748b">${Number(location.lat).toFixed(4)}, ${Number(location.lon).toFixed(4)}</span>`,
      { className: 'mapa__popup', offset: [0, -10] }
    ).openPopup();

    markerRef.current = marcador;

  }, [location]);

  // 4) Handle Thermal Heatmap Layer
  useEffect(() => {
    if (!mapRef.current || !location) return;

    if (!showThermal) {
      if (thermalLayerRef.current) {
        mapRef.current.removeLayer(thermalLayerRef.current);
        thermalLayerRef.current = null;
      }
      return;
    }

    // Refresh if active
    if (thermalLayerRef.current) {
      mapRef.current.removeLayer(thermalLayerRef.current);
    }

    const lat = Number(location.lat);
    const lon = Number(location.lon);
    const temp = currentTemp;

    const layerGroup = L.layerGroup();
    
    const anillos = [
      { radio: 3000, opacidad: 0.35 },
      { radio: 6000, opacidad: 0.25 },
      { radio: 10000, opacidad: 0.18 },
      { radio: 16000, opacidad: 0.12 },
      { radio: 25000, opacidad: 0.07 },
    ];

    const colorBase = _tempAColor(temp);

    anillos.forEach(({ radio, opacidad }) => {
      const circle = L.circle([lat, lon], {
        radius: radio,
        color: 'transparent',
        fillColor: colorBase,
        fillOpacity: opacidad,
        interactive: false,
      });
      layerGroup.addLayer(circle);
    });

    const variaciones = _generarPuntosTermicos(lat, lon, temp);
    variaciones.forEach(({ vlat, vlon, vtemp, vradio, vopacidad }) => {
      const circle = L.circle([vlat, vlon], {
        radius: vradio,
        color: 'transparent',
        fillColor: _tempAColor(vtemp),
        fillOpacity: vopacidad,
        interactive: false,
      });
      layerGroup.addLayer(circle);
    });

    thermalLayerRef.current = layerGroup;
    layerGroup.addTo(mapRef.current);

  }, [showThermal, location, currentTemp]);

  const recenterMap = () => {
    if (mapRef.current && location) {
      // Re-centrar usando el closure actual del useEffect
      mapRef.current.flyTo([location.lat, location.lon], 11, { animate: true, duration: 1 });
    }
  };

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%', 
      display: 'flex',
      flexDirection: 'column',
      background: layerType === 'satellite' ? '#040b1a' : (theme === 'light' ? '#DFF2FC' : '#020617'),
      borderRadius: 'inherit'
    }}>
      <div id="leaflet-map" ref={containerRef} style={{ flex: 1, width: '100%', zIndex: 1, background: 'transparent' }}></div>

      {/* Botones flotantes sobre el mapa */}
      <div className="mapa__controles" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
          <button 
            type="button"
            className={`mapa__ctrl-btn ${showThermal ? 'activo' : ''}`} 
            aria-label="Capa Termal y Clima"
            onClick={() => setShowThermal(!showThermal)}
            data-tooltip="Térmico"
          >
              <span className="material-symbols-outlined" aria-hidden="true">layers</span>
          </button>
          <button 
            type="button"
            className={`mapa__ctrl-btn ${layerType === 'satellite' ? 'activo' : ''}`} 
            aria-label="Vista satélite"
            onClick={() => setLayerType(layerType === 'satellite' ? 'dark' : 'satellite')}
            data-tooltip="Vista Satélite"
          >
              <span className="material-symbols-outlined" aria-hidden="true">satellite_alt</span>
          </button>
          <button 
            type="button"
            className="mapa__ctrl-btn" 
            aria-label="Centrar en mi ciudad" 
            data-tooltip="Reubicar ciudad"
            onClick={(e) => {
              e.preventDefault();
              recenterMap();
            }}
          >
              <span className="material-symbols-outlined" aria-hidden="true">my_location</span>
          </button>
      </div>
    </div>
  );
}
