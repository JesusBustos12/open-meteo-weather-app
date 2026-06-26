"use client";

import { useState, useEffect, useRef } from 'react';
import { useStore } from '../lib/store';
import { useTranslation } from '../hooks/useTranslation';

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile } = useStore();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    avatar_url: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSlowProcess, setIsSlowProcess] = useState(false);
  const abortControllerRef = useRef(null);

  // Sync form with user state when opened
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '', // Password stays empty unless changed
        avatar_url: user.avatar_url || ''
      });
      setFileName('');
      setShowPassword(false);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { id, value } = e.target;
    // Map IDs from HTML to formData keys
    const key = id.replace('perfil-input-', '').replace('pass', 'password');
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(t('err_solo_img') || "El archivo es demasiado grande. Máximo 2MB.");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, avatar_url: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleCancel = () => {
    if (isSaving && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    setIsSlowProcess(false);
    
    abortControllerRef.current = new AbortController();

    // Iniciar temporizador para detectar si el proceso es lento (1 segundo)
    const slowTimer = setTimeout(() => {
      setIsSlowProcess(true);
      
      // Si es lento, mostramos popup y damos 6 segundos antes de forzar el cierre
      setTimeout(() => {
        setIsSaving(false);
        setIsSlowProcess(false);
        onClose();
        // Nota: NO abortamos la petición, dejamos que termine en segundo plano
      }, 6000);
    }, 1000);

    try {
      const success = await updateProfile(formData, abortControllerRef.current.signal);
      
      clearTimeout(slowTimer);
      if (success) {
        onClose();
      }
    } catch (err) {
      clearTimeout(slowTimer);
      console.error("Error en handleSubmit:", err);
    } finally {
      // Solo actualizamos si no se ha cerrado ya por el temporizador de 6s
      setIsSaving(false);
      setIsSlowProcess(false);
    }
  };

  return (
    <div 
      className="modal-overlay" 
      id="modal-perfil" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-perfil-titulo"
      onClick={(e) => e.target.id === 'modal-perfil' && onClose()}
    >
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__titulo" id="modal-perfil-titulo">{t('editar_perfil')}</h2>
          <button className="modal__cerrar" onClick={handleCancel} aria-label="Cerrar modal">
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>

        <form className="modal__form" id="form-perfil" onSubmit={handleSubmit}>
          {/* Nombre completo */}
          <div className="form-grupo">
            <label className="form-grupo__label" htmlFor="perfil-input-name">
              <span className="material-symbols-outlined" aria-hidden="true">person</span>
              <span>{t('campo_nombre')}</span>
            </label>
            <input 
              type="text" 
              id="perfil-input-name" 
              className="form-grupo__input" 
              placeholder="Juan Pérez"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Correo electrónico */}
          <div className="form-grupo">
            <label className="form-grupo__label" htmlFor="perfil-input-email">
              <span className="material-symbols-outlined" aria-hidden="true">mail</span>
              <span>{t('campo_email')}</span>
            </label>
            <input 
              type="email" 
              id="perfil-input-email" 
              className="form-grupo__input"
              placeholder="usuario@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Contraseña */}
          <div className="form-grupo">
            <label className="form-grupo__label" htmlFor="perfil-input-pass">
              <span className="material-symbols-outlined" aria-hidden="true">lock</span>
              <span>{t('campo_password')}</span>
            </label>
            <div className="form-grupo__pass-wrap">
              <input 
                type={showPassword ? "text" : "password"} 
                id="perfil-input-pass" 
                className="form-grupo__input"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
              />
              <button 
                type="button" 
                className="form-grupo__ojo" 
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <p className="form-grupo__ayuda" style={{fontSize: '1rem', marginTop: '0.4rem', color: 'var(--color-texto-4)'}}>
              {t('ayuda_password_opcional')}
            </p>
          </div>

          {/* Foto de perfil */}
          <div className="form-grupo">
            <label className="form-grupo__label">
              <span className="material-symbols-outlined" aria-hidden="true">photo_camera</span>
              <span>{t('campo_avatar')}</span>
            </label>
            <div className="form-grupo__avatar-wrap">
              <div className="avatar-preview" aria-hidden="true">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Preview" />
                ) : (
                  <span className="material-symbols-outlined">account_circle</span>
                )}
              </div>
              <div className="form-grupo__avatar-opciones">
                <div className="form-grupo__opcion">
                  <label className="form-grupo__opcion-label" htmlFor="perfil-input-avatar_url">URL WEB</label>
                  <input 
                    type="url" 
                    id="perfil-input-avatar_url" 
                    className="form-grupo__input"
                    placeholder="https://..." 
                    value={formData.avatar_url && formData.avatar_url.startsWith('http') ? formData.avatar_url : ''}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-grupo__opcion">
                  <p className="form-grupo__opcion-label">ARCHIVO LOCAL</p>
                  <label className="form-grupo__btn-upload" htmlFor="perfil-input-file">
                    <span className="material-symbols-outlined" aria-hidden="true">upload_file</span>
                    <span>{t('subir_archivo')}</span>
                    <input 
                      type="file" 
                      id="perfil-input-file" 
                      className="sr-only" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  {fileName && <span className="form-grupo__archivo-nombre">{fileName}</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="modal__acciones">
            <button type="button" className="btn-secundario" onClick={handleCancel}>
              <span>{t('cancelar')}</span>
            </button>
            <button type="submit" className="btn-primario" disabled={isSaving}>
              <span 
                className={`material-symbols-outlined ${isSaving ? 'icono-cargando' : ''}`} 
                aria-hidden="true"
              >
                {isSaving ? 'sync' : 'save'}
              </span>
              <span>{isSaving ? t('guardando') : t('guardar')}</span>
            </button>
          </div>
        </form>

        {/* POPUP DE PROCESO LENTO */}
        {isSlowProcess && (
          <div style={{
            position: 'absolute', inset: 0, 
            backgroundColor: 'var(--color-fondo-transparente, rgba(0,0,0,0.6))',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            borderRadius: 'var(--radius-lg, 12px)', zIndex: 10,
            backdropFilter: 'blur(8px)', padding: '1.5rem'
          }}>
            <div style={{
              backgroundColor: 'var(--color-tarjeta, rgba(30,30,30,0.95))',
              border: '1px solid var(--color-borde, rgba(255,255,255,0.1))',
              borderRadius: '16px', padding: '2.5rem 2rem', textAlign: 'center',
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)', width: '100%', maxWidth: '400px'
            }}>
              <div className="loader__spinner" style={{ width: '60px', height: '60px', borderWidth: '6px', margin: '0 auto 1.5rem auto' }}></div>
              <h3 style={{ color: 'var(--color-texto, #fff)', fontSize: '1.8rem', fontWeight: '700', marginBottom: '1rem' }}>
                Guardando cambios...
              </h3>
              <p style={{ color: 'var(--color-texto-mutado, #aaa)', fontSize: '1.15rem', lineHeight: '1.6' }}>
                El recurso que estás subiendo es pesado y tardará un poco en procesarse, pero los cambios se aplicarán en breve.
                <br /><br />
                <span style={{color: 'var(--color-primario, #3b82f6)', fontWeight: '600'}}>Esta ventana se cerrará sola.</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
