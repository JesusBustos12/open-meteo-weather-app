import { create } from 'zustand';

export const useStore = create((set, get) => ({
  user: null,         // { name, email, avatar_url }
  theme: 'dark',      // 'dark' | 'light'
  language: 'es',     // 'es' | 'en'
  cities: [],         // Array of { id, name, latitude, longitude }
  // ===== ESTADO CLIMÁTICO =====
  currentWeather: null,
  hourlyForecast: null,
  activeLocation: null, // { lat, lon, ciudad, region }

  // ===== ESTADO DEL BUSCADOR =====
  isSearching: false,
  suggestions: [],

  // Acciones (Setters)
  setUser: (user) => set({ user }),
  setTheme: (theme) => {
    set({ theme });
    // Side effect seguro en Browser: Aplicar clase CSS global o data attr
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  },
  setLanguage: (language) => set({ language }),
  setCities: (cities) => set({ cities }),
  
  // Agregar una ciudad en el estado local (tras confirmación de backend)
  addCity: (city) => set((state) => ({ 
    cities: [...state.cities, city] 
  })),

  // Eliminar una ciudad del estado local
  removeCity: (cityName) => set((state) => ({
    cities: state.cities.filter(c => c.name !== cityName)
  })),

  // ===== SISTEMA DE TOAST =====
  toastMessage: null,
  toastType: 'error', // 'error' | 'success'
  showToast: (msg, type = 'error') => {
    set({ toastMessage: msg, toastType: type });
    setTimeout(() => {
      set({ toastMessage: null });
    }, 4000);
  },

  // ===== ACCIONES BACKEND: CIUDADES =====
  saveCityAuth: async (cityObj) => {
    try {
      const res = await fetch('/api/user/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cityObj)
      });
      if (res.ok) {
        get().addCity(cityObj);
        get().showToast('Ciudad guardada con éxito', 'success');
      } else if (res.status === 409) {
        get().showToast('Esta ciudad ya está en tu lista', 'error');
      } else {
        get().showToast('Error al guardar la ciudad', 'error');
      }
    } catch (err) {
      console.error(err);
      get().showToast('Hubo un problema de conexión', 'error');
    }
  },

  removeCityAuth: async (cityName) => {
    try {
      const res = await fetch(`/api/user/cities/${encodeURIComponent(cityName)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        get().removeCity(cityName);
      } else {
        get().showToast('Error al eliminar ciudad', 'error');
      }
    } catch (err) {
      console.error(err);
      get().showToast('Problema de conexión al eliminar', 'error');
    }
  },

  updateProfile: async (userData) => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (res.ok) {
        set({ user: data.user });
        get().showToast('Perfil actualizado con éxito', 'success');
        return true;
      } else {
        get().showToast(data.error || 'Error al actualizar perfil', 'error');
        return false;
      }
    } catch (err) {
      console.error(err);
      get().showToast('Error de conexión', 'error');
      return false;
    }
  },

  // Cargar estado inicial desde la API (Sync)
  syncFromBackend: async () => {
    try {
      const res = await fetch('/api/user/sync');
      if (res.ok) {
        const data = await res.json();
        set({
          user: data.user,
          theme: data.preferences?.theme || 'dark',
          language: data.preferences?.language || 'es',
          cities: data.cities || []
        });
        
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', data.preferences?.theme || 'dark');
        }
      } else {
        // Falló sync, tal vez token expiró.
        set({ user: null });
      }
    } catch (err) {
      console.error("Zustand Sync Error:", err);
    }
  },

  // ===== ACCIONES DE GEOLOCALIZACIÓN Y CLIMA =====
  
  clearSuggestions: () => set({ suggestions: [] }),

  fetchSuggestions: async (query, lang) => {
    if (!query || query.length < 2) {
      set({ suggestions: [] });
      return;
    }
    try {
      const params = new URLSearchParams({
        name: query,
        count: '1',
        language: lang || 'es',
        format: 'json'
      });
      
      const res = await fetch(`/api/geocoding?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        set({ suggestions: data.results || [] });
      }
    } catch (err) {
      console.error("Geocoding Error:", err);
      set({ suggestions: [] });
    }
  },

  fetchWeather: async (lat, lon, ciudad, region) => {
    set({ isSearching: true, currentWeather: null, hourlyForecast: null, activeLocation: null });
    try {
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,weather_code',
        hourly: 'temperature_2m,weather_code,precipitation_probability,uv_index',
        forecast_days: '2',
        timezone: 'auto'
      });

      const res = await fetch(`/api/weather?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        set({
          isSearching: false,
          currentWeather: data.current,
          hourlyForecast: data.hourly,
          activeLocation: { lat, lon, ciudad, region }
        });
      } else {
        set({ isSearching: false });
      }
    } catch (err) {
      console.error("Detailed Weather Fetch Error:", {
        message: err.message,
        name: err.name,
        stack: err.stack,
        cause: err.cause
      });
      set({ isSearching: false });
    }
  }
}));
