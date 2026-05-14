"use client";

import { useState, useEffect } from 'react';
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

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, avatar_url: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await updateProfile(formData);
    setIsSaving(false);
    if (success) {
      onClose();
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
          <button className="modal__cerrar" onClick={onClose} aria-label="Cerrar modal">
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
            <button type="button" className="btn-secundario" onClick={onClose} disabled={isSaving}>
              <span>{t('cancelar')}</span>
            </button>
            <button type="submit" className="btn-primario" disabled={isSaving}>
              <span className="material-symbols-outlined" aria-hidden="true">
                {isSaving ? 'sync' : 'save'}
              </span>
              <span>{isSaving ? t('guardando') : t('guardar')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
