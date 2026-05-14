"use client";

import { useState, useEffect, useRef } from 'react';
import { useStore } from '../lib/store';
import { useTranslation } from '../hooks/useTranslation';

export default function SearchBar() {
    const { t, language } = useTranslation();
    const { fetchSuggestions, clearSuggestions, suggestions, fetchWeather, toastMessage, toastType } = useStore();
    
    const [query, setQuery] = useState('');
    const [ghostHint, setGhostHint] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    
    const debounceTimer = useRef(null);

    // Actualiza sugerencias cuando el query cambia
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        
        if (query.trim().length < 2) {
            clearSuggestions();
            setGhostHint('');
            return;
        }

        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(query, language);
        }, 300);
        
        return () => clearTimeout(debounceTimer.current);
    }, [query, language]);

    // Calcular Ghost Hint cuando llegan sugerencias
    useEffect(() => {
        if (suggestions.length > 0 && query.trim().length >= 2) {
            const first = suggestions[0];
            const fullText = [first.name, first.admin1, first.country].filter(Boolean).join(', ');
            
            if (fullText.toLowerCase().startsWith(query.toLowerCase())) {
                setGhostHint(query + fullText.slice(query.length));
            } else {
                setGhostHint('');
            }
        } else {
            setGhostHint('');
        }
    }, [suggestions, query]);

    const handleSelect = (sug) => {
        const fullName = [sug.name, sug.admin1, sug.country].filter(Boolean).join(', ');
        setQuery(fullName);
        setGhostHint('');
        clearSuggestions();
        setIsFocused(false);
        setSelectedIndex(-1);
        
        // Disparar búsqueda del clima
        fetchWeather(sug.latitude, sug.longitude, sug.name, [sug.admin1, sug.country].filter(Boolean).join(', '));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsFocused(false);
            return;
        }

        // Aceptar hint
        if ((e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'End') && ghostHint && query.length === ghostHint.length) {
          // Si cursor al final... (para react omitimos la conf de cursor muy estricta por ahora)
          e.preventDefault();
          setQuery(ghostHint);
          setGhostHint('');
        }

        if (suggestions.length > 0 && isFocused) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % suggestions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex >= 0) {
                    handleSelect(suggestions[selectedIndex]);
                } else {
                    handleSelect(suggestions[0]);
                }
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (suggestions.length > 0) {
            handleSelect(suggestions[selectedIndex >= 0 ? selectedIndex : 0]);
        }
    };

    return (
        <form className="buscador" role="search" noValidate autoComplete="off" onSubmit={handleSubmit}>
            <label htmlFor="buscador-input" className="sr-only">{t('buscar_placeholder')}</label>
            <span className="material-symbols-outlined buscador__icono" aria-hidden="true">search</span>
            
            <div className="buscador__input-wrapper">
                <input 
                    type="text" 
                    id="buscador-hint" 
                    className="buscador__input buscador__input--hint" 
                    readOnly 
                    tabIndex="-1" 
                    aria-hidden="true" 
                    value={ghostHint}
                />
                <input 
                    type="search" 
                    id="buscador-input" 
                    className="buscador__input" 
                    placeholder={t('buscar_placeholder')}
                    autoComplete="off"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                    onKeyDown={handleKeyDown}
                    aria-expanded={suggestions.length > 0 && isFocused}
                />
            </div>
            
            <button className="buscador__btn" type="submit" aria-label="Buscar ciudad">
                <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
            </button>

            {/* Toast / Errors */}
            {toastMessage && (
                <div 
                  className="buscador__error" 
                  role="alert" 
                  aria-live="assertive"
                  style={{ 
                      borderColor: toastType === 'success' ? 'var(--color-exito)' : 'rgba(239, 68, 68, 0.3)',
                      color: toastType === 'success' ? 'var(--color-exito)' : 'var(--color-error)'
                  }}
                >
                    <span className="material-symbols-outlined" aria-hidden="true">
                        {toastType === 'success' ? 'check_circle' : 'error'}
                    </span>
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Sugerencias Dropdown */}
            {isFocused && suggestions.length > 0 && (
                <ul className="sugerencias" role="listbox">
                    {suggestions.map((sug, idx) => {
                        const region = [sug.admin1, sug.country].filter(Boolean).join(', ');
                        const fullName = [sug.name, region].filter(Boolean).join(', ');
                        return (
                            <li 
                                key={idx} 
                                className={`sugerencia-item ${selectedIndex === idx ? 'sugerencia-item--activo' : ''}`}
                                role="option"
                                onClick={() => handleSelect(sug)}
                                onMouseEnter={() => setSelectedIndex(idx)}
                            >
                                <span className="material-symbols-outlined" aria-hidden="true">location_on</span>
                                <span>{fullName}</span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </form>
    );
}
