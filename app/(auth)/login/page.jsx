"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../../lib/store';
import { useTranslation } from '../../../hooks/useTranslation';

export default function LoginPage() {
  const router = useRouter();
  const { setLanguage } = useStore();
  const { t, language } = useTranslation();
  
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'registro'
  const [feedback, setFeedback] = useState({ msg: '', type: '', visible: false });
  const [loading, setLoading] = useState(false);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [regAvatarType, setRegAvatarType] = useState('url');
  const [regAvatarUrl, setRegAvatarUrl] = useState('');
  const [regAvatarFileUrl, setRegAvatarFileUrl] = useState('');
  const [fileName, setFileName] = useState('');

  const displayAvatar = regAvatarType === 'url' ? regAvatarUrl : regAvatarFileUrl;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        setFileName('Solo se permiten imágenes');
        return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
        setRegAvatarFileUrl(ev.target.result);
        setRegAvatarType('archivo');
        setRegAvatarUrl(''); // Limpiar URL
        setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setFeedback({ visible: false });
    if (!loginEmail || !loginPass) {
        setFeedback({ msg: t('error_generico'), type: 'error', visible: true });
        return;
    }

    setLoading(true);
    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: loginEmail, password: loginPass })
        });
        const data = await res.json();
        
        if (!res.ok) {
            setFeedback({ msg: data.error || 'Credenciales inválidas', type: 'error', visible: true });
        } else {
            setFeedback({ msg: '¡Bienvenido de nuevo! Redirigiendo...', type: 'exito', visible: true });
            setTimeout(() => router.push('/'), 1000);
        }
    } catch (err) {
        setFeedback({ msg: t('error_red'), type: 'error', visible: true });
    } finally {
        setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFeedback({ visible: false });
    if (!regName || !regEmail || !regPass) {
        setFeedback({ msg: t('error_generico'), type: 'error', visible: true });
        return;
    }

    setLoading(true);
    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: regName, 
                email: regEmail, 
                password: regPass,
                avatar: displayAvatar
            })
        });
        const data = await res.json();
        
        if (!res.ok) {
            setFeedback({ msg: data.error || 'Error al registrar', type: 'error', visible: true });
        } else {
            setFeedback({ msg: '¡Cuenta creada! Redirigiendo...', type: 'exito', visible: true });
            setTimeout(() => router.push('/'), 1000);
        }
    } catch (err) {
        setFeedback({ msg: t('error_red'), type: 'error', visible: true });
    } finally {
        setLoading(false);
    }
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    // Intentar guardar en BD de forma optimista
    fetch('/api/user/config', { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: lang }) 
    }).catch(() => {}); // Ignorar si falla
  };

  return (
    <div className="pagina">
        <header className="encabezado" role="banner">
            <div className="encabezado__logo-fila">
                <span className="material-symbols-outlined encabezado__icono" aria-hidden="true">monitoring</span>
                <h1 className="encabezado__titulo">WeatherApp</h1>
            </div>
            <p className="encabezado__subtitulo">{t('login_portal_subtitulo')}</p>
            <div className="idioma-toggle" id="idioma-toggle">
                <button 
                  type="button" 
                  className={`idioma-btn ${language === 'es' ? 'idioma-btn--activo' : ''}`} 
                  aria-label="Español"
                  aria-pressed={language === 'es'}
                  onClick={() => changeLanguage('es')}
                >ES</button>
                <button 
                  type="button" 
                  className={`idioma-btn ${language === 'en' ? 'idioma-btn--activo' : ''}`} 
                  aria-label="English"
                  aria-pressed={language === 'en'}
                  onClick={() => changeLanguage('en')}
                >EN</button>
            </div>
        </header>

        <main className="tarjeta" role="main" aria-label="Formulario de autenticación">
            <nav className="tabs" role="tablist" aria-label="Modo de acceso">
                <button 
                  className={`tab ${activeTab === 'login' ? 'tab--activo' : ''}`} 
                  onClick={() => setActiveTab('login')}
                  type="button"
                >
                  {t('login_tab')}
                </button>
                <button 
                  className={`tab ${activeTab === 'registro' ? 'tab--activo' : ''}`} 
                  onClick={() => setActiveTab('registro')}
                  type="button"
                >
                  {t('registro_tab')}
                </button>
            </nav>

            {/* TAB LOGIN */}
            {activeTab === 'login' && (
                <section className="panel panel--entrando" id="panel-login">
                    <form className="form" onSubmit={handleLogin} noValidate>
                        <div className="campo">
                            <label className="campo__label" htmlFor="login-email">
                                <span className="material-symbols-outlined" aria-hidden="true">mail</span>
                                <span>{t('campo_email')}</span>
                            </label>
                            <input 
                                type="email" id="login-email" className="campo__input" 
                                placeholder="usuario@ejemplo.com"
                                value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                            />
                        </div>

                        <div className="campo">
                            <label className="campo__label" htmlFor="login-pass">
                                <span className="material-symbols-outlined" aria-hidden="true">lock</span>
                                <span>{t('campo_password')}</span>
                            </label>
                            <div className="campo__wrap">
                                <input 
                                    type={showLoginPass ? 'text' : 'password'} id="login-pass" className="campo__input" 
                                    placeholder="••••••••••••"
                                    value={loginPass} onChange={e => setLoginPass(e.target.value)}
                                />
                                <button type="button" className="campo__ojo" onClick={() => setShowLoginPass(!showLoginPass)}>
                                    <span className="material-symbols-outlined" aria-hidden="true">
                                        {showLoginPass ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {feedback.visible && (
                            <div className={`feedback feedback--${feedback.type}`} role="alert">
                                {feedback.msg}
                            </div>
                        )}

                        <button type="submit" className="btn-submit" disabled={loading}>
                            <span>{loading ? t('guardando').toUpperCase() : t('btn_login')}</span>
                            <span className={`material-symbols-outlined ${loading ? 'icono-cargando' : ''}`} aria-hidden="true">
                                {loading ? 'sync' : 'login'}
                            </span>
                        </button>
                    </form>
                </section>
            )}

            {/* TAB REGISTRO */}
            {activeTab === 'registro' && (
                <section className="panel panel--entrando" id="panel-registro">
                    <form className="form" onSubmit={handleRegister} noValidate>
                        <div className="campo">
                            <label className="campo__label" htmlFor="reg-nombre">
                                <span className="material-symbols-outlined" aria-hidden="true">person</span>
                                <span>{t('campo_nombre')}</span>
                            </label>
                            <input 
                                type="text" id="reg-nombre" className="campo__input" 
                                placeholder={t('placeholder_nombre')}
                                value={regName} onChange={e => setRegName(e.target.value)}
                            />
                        </div>

                        <div className="campo">
                            <label className="campo__label" htmlFor="reg-email">
                                <span className="material-symbols-outlined" aria-hidden="true">mail</span>
                                <span>{t('campo_email')}</span>
                            </label>
                            <input 
                                type="email" id="reg-email" className="campo__input" 
                                placeholder="usuario@ejemplo.com"
                                value={regEmail} onChange={e => setRegEmail(e.target.value)}
                            />
                        </div>

                        <div className="campo">
                            <label className="campo__label" htmlFor="reg-pass">
                                <span className="material-symbols-outlined" aria-hidden="true">lock</span>
                                <span>{t('campo_password')}</span>
                            </label>
                            <div className="campo__wrap">
                                <input 
                                    type={showRegPass ? 'text' : 'password'} id="reg-pass" className="campo__input" 
                                    placeholder="••••••••••••"
                                    value={regPass} onChange={e => setRegPass(e.target.value)}
                                />
                                <button type="button" className="campo__ojo" onClick={() => setShowRegPass(!showRegPass)}>
                                    <span className="material-symbols-outlined" aria-hidden="true">
                                        {showRegPass ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="perfil-foto">
                            <h3 className="perfil-foto__titulo">{t('campo_avatar').toUpperCase()}</h3>
                            <div className="perfil-foto__fila">
                                <div className={`avatar-circulo ${displayAvatar ? 'avatar--activo' : ''}`}>
                                    {!displayAvatar && (
                                        <span className="material-symbols-outlined avatar-circulo__icono">account_circle</span>
                                    )}
                                    {displayAvatar && (
                                        <img className="avatar-circulo__img" src={displayAvatar} alt="Preview" />
                                    )}
                                </div>
                                <div className="perfil-foto__opciones">
                                    <div className="opcion">
                                        <label className="opcion__label" htmlFor="reg-avatar-url">OPCIÓN 1: URL WEB</label>
                                        <input 
                                            type="url" id="reg-avatar-url" className="campo__input opcion__input" 
                                            placeholder="Pegar URL de imagen"
                                            value={regAvatarUrl} 
                                            onChange={e => {
                                                setRegAvatarUrl(e.target.value);
                                                setRegAvatarType('url');
                                            }}
                                        />
                                    </div>
                                    <div className="opcion">
                                        <p className="opcion__label">OPCIÓN 2: ARCHIVO LOCAL</p>
                                        <label className="btn-upload" htmlFor="reg-avatar-file">
                                            <span className="material-symbols-outlined" aria-hidden="true">upload_file</span>
                                            <span>{t('subir_archivo').toUpperCase()}</span>
                                            <input type="file" id="reg-avatar-file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                        </label>
                                        <span className="opcion__archivo">{fileName}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="divider" aria-hidden="true" />

                        {feedback.visible && (
                            <div className={`feedback feedback--${feedback.type}`} role="alert">
                                {feedback.msg}
                            </div>
                        )}

                        <button type="submit" className="btn-submit" disabled={loading}>
                            <span>{loading ? t('guardando').toUpperCase() : t('btn_registro')}</span>
                            <span className={`material-symbols-outlined ${loading ? 'icono-cargando' : ''}`} aria-hidden="true">
                                {loading ? 'sync' : 'person_add'}
                            </span>
                        </button>
                        <p className="aviso">
                            <span className="material-symbols-outlined" aria-hidden="true">shield</span>
                            <span>{t('faja_proteccion')}</span>
                        </p>
                    </form>
                </section>
            )}
        </main>

        <footer className="pie" role="contentinfo">
            <div className="pie__estado">
                <span className="pie__dot" aria-hidden="true"></span>
                <span>{t('estado_sistema')}</span>
            </div>
        </footer>
    </div>
  );
}
