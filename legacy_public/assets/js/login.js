/* =====================================================
   WEATHERAPP — LOGIN.JS
   Autenticación con localStorage
   Sin innerHTML · sin alert · preventDefault en todos
   Soporte: subida desde URL y archivo local (FileReader)
   Requiere: i18n.js (cargado antes)
   ===================================================== */

'use strict';

function mostrar(el) { el.hidden = false; }
function ocultar(el) { el.hidden = true; }

/* ===== TEMA ===== */
function aplicarTema() {
    document.documentElement.dataset.theme = 'dark';
}

async function verificarSesion() {
    try {
        const res = await fetch('/api/user/sync');
        if (res.ok) {
            const data = await res.json();
            if (data.user) {
                window.location.replace('dashboard.html');
            }
        }
    } catch (e) {
        // Ignorar errores de red
    }
}

/* ===== DOM ===== */
const dom = {};

function cachearDOM() {
    dom.tabLogin = document.getElementById('tab-login');
    dom.tabRegistro = document.getElementById('tab-registro');
    dom.panelLogin = document.getElementById('panel-login');
    dom.panelReg = document.getElementById('panel-registro');

    /* Login */
    dom.formLogin = document.getElementById('form-login');
    dom.loginEmail = document.getElementById('login-email');
    dom.loginPass = document.getElementById('login-pass');
    dom.loginOjo = document.getElementById('login-ojo');
    dom.loginFeedback = document.getElementById('login-feedback');

    /* Registro */
    dom.formReg = document.getElementById('form-registro');
    dom.regNombre = document.getElementById('reg-nombre');
    dom.regEmail = document.getElementById('reg-email');
    dom.regPass = document.getElementById('reg-pass');
    dom.regOjo = document.getElementById('reg-ojo');
    dom.regAvatarUrl = document.getElementById('reg-avatar-url');
    dom.regAvatarFile = document.getElementById('reg-avatar-file');
    dom.regFeedback = document.getElementById('reg-feedback');
    dom.avatarCirculo = document.getElementById('avatar-circulo');
    dom.avatarImg = document.getElementById('avatar-img');
    dom.nombreArchivo = document.getElementById('nombre-archivo');

    /* Toggle idioma */
    dom.btnIdiomaEs = document.getElementById('btn-idioma-es');
    dom.btnIdiomaEn = document.getElementById('btn-idioma-en');

    /* Modal Registro */
    dom.modalRegistro = document.getElementById('modal-registro');
    dom.btnCerrarModalReg = document.getElementById('btn-cerrar-modal-reg');
}

/* ===== IDIOMA ===== */
function aplicarIdiomaLogin() {
    const idioma = obtenerIdiomaActual();

    // Actualizar botones
    if (dom.btnIdiomaEs && dom.btnIdiomaEn) {
        dom.btnIdiomaEs.classList.toggle('idioma-btn--activo', idioma === 'es');
        dom.btnIdiomaEn.classList.toggle('idioma-btn--activo', idioma === 'en');
    }

    // Aplicar traducciones con data-i18n
    aplicarTraducciones();

    // Actualizar lang del HTML
    document.documentElement.lang = idioma === 'en' ? 'en' : 'es';
}

/* ===== TABS ===== */
function activarTab(tabActivo) {
    const panelActivo = document.getElementById(tabActivo.getAttribute('aria-controls'));

    /* Resetear todos */
    [dom.tabLogin, dom.tabRegistro].forEach(t => {
        t.classList.remove('tab--activo');
        t.setAttribute('aria-selected', 'false');
    });
    [dom.panelLogin, dom.panelReg].forEach(p => {
        ocultar(p);
        p.classList.remove('panel--entrando');
    });

    /* Activar el elegido */
    tabActivo.classList.add('tab--activo');
    tabActivo.setAttribute('aria-selected', 'true');
    mostrar(panelActivo);
    void panelActivo.offsetWidth;   /* forzar reflow para animación */
    panelActivo.classList.add('panel--entrando');
    panelActivo.querySelector('input')?.focus();
}

/* ===== MOSTRAR/OCULTAR CONTRASEÑA ===== */
function toggleOjo(input, btn) {
    const esPass = input.type === 'password';
    input.type = esPass ? 'text' : 'password';
    const icono = btn.querySelector('.material-symbols-outlined');
    icono.textContent = esPass ? 'visibility_off' : 'visibility';
    btn.setAttribute('aria-label', esPass ? t('ocultar_pass') : t('mostrar_pass'));
}

/* ===== AVATAR — PREVIEW ===== */
function mostrarAvatar(src) {
    if (src) {
        dom.avatarImg.src = src;
        mostrar(dom.avatarImg);
        dom.avatarCirculo.classList.add('avatar--activo');
        const icono = dom.avatarCirculo.querySelector('.avatar-circulo__icono');
        if (icono) icono.style.display = 'none';
    } else {
        dom.avatarImg.src = '';
        ocultar(dom.avatarImg);
        dom.avatarCirculo.classList.remove('avatar--activo');
        const icono = dom.avatarCirculo.querySelector('.avatar-circulo__icono');
        if (icono) icono.style.display = '';
    }
}

/* ===== VALIDACIÓN ===== */
function validarEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function setError(input, errEl, msg) {
    input.classList.add('campo--error');
    input.classList.remove('campo--valido');
    errEl.textContent = msg;
}

function setValido(input, errEl) {
    input.classList.remove('campo--error');
    input.classList.add('campo--valido');
    errEl.textContent = '';
}

function limpiarEstado(input, errEl) {
    input.classList.remove('campo--error', 'campo--valido');
    errEl.textContent = '';
}

/* ===== FEEDBACK GLOBAL ===== */
function mostrarFeedback(el, msg, tipo) {
    el.textContent = msg;
    el.className = 'feedback feedback--' + tipo;
    mostrar(el);
}
function ocultarFeedback(el) { ocultar(el); }

/* ===== MODAL DE REGISTRO ===== */
function mostrarModalRegistro(exito, mensaje) {
    const icono = dom.modalRegistro.querySelector('.modal-icon');
    const titulo = dom.modalRegistro.querySelector('.modal-title');
    const desc = dom.modalRegistro.querySelector('.modal-desc');

    // Resetear clases por si acaso
    icono.style.color = exito ? 'var(--color-exito)' : 'var(--color-error)';
    icono.style.filter = exito ? 'drop-shadow(0 0 12px var(--color-borde-exito))' : 'drop-shadow(0 0 12px var(--color-borde-error))';
    icono.textContent = exito ? 'check_circle' : 'error';
    
    titulo.textContent = exito ? t('modal_reg_exito_titulo') || '¡Registro Exitoso!' : 'Error de Registro';
    desc.textContent = mensaje;
    
    // Guardamos estado para cuando cierre el modal saber si redirigir o no
    dom.modalRegistro.dataset.exito = exito ? 'true' : 'false';

    mostrar(dom.modalRegistro);
}

/* ===== AUTH API ===== */
async function apiPost(url, data) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
}

/* ===== LOGIN ===== */
async function manejarLogin(e) {
    e.preventDefault();
    ocultarFeedback(dom.loginFeedback);

    const email = dom.loginEmail.value.trim();
    const password = dom.loginPass.value;
    const emailErr = document.getElementById('login-email-err');
    const passErr = document.getElementById('login-pass-err');

    limpiarEstado(dom.loginEmail, emailErr);
    limpiarEstado(dom.loginPass, passErr);

    let ok = true;

    if (!email) {
        setError(dom.loginEmail, emailErr, t('err_email_req'));
        ok = false;
    } else if (!validarEmail(email)) {
        setError(dom.loginEmail, emailErr, t('err_email_inv'));
        ok = false;
    } else {
        setValido(dom.loginEmail, emailErr);
    }

    if (!password) {
        setError(dom.loginPass, passErr, t('err_pass_req'));
        ok = false;
    } else {
        setValido(dom.loginPass, passErr);
    }

    if (!ok) return;

    const btnLogin = document.getElementById('btn-login');
    const spanIcono = btnLogin.querySelector('.material-symbols-outlined');
    const spanTexto = btnLogin.querySelector('span:not(.material-symbols-outlined)');
    const textoOriginal = spanTexto.textContent;
    const iconoOriginal = spanIcono.textContent;

    btnLogin.disabled = true;
    spanTexto.textContent = t('guardando') ? t('guardando').toUpperCase() : 'GUARDANDO';
    spanIcono.textContent = 'sync';
    spanIcono.classList.add('icono-cargando');

    try {
        const data = await apiPost('/api/auth/login', { email, password });
        
        if (data.error) {
            const isEmailErr = data.error === 'No se encontró la cuenta';
            mostrarFeedback(dom.loginFeedback, t(isEmailErr ? 'err_no_cuenta' : 'err_pass_inc') || data.error, 'error');
            btnLogin.disabled = false;
            spanTexto.textContent = textoOriginal;
            spanIcono.textContent = iconoOriginal;
            spanIcono.classList.remove('icono-cargando');
            return;
        }

        /* Éxito */
        mostrarFeedback(dom.loginFeedback, t('exito_bienvenido') || '¡Bienvenido!', 'exito');
        setTimeout(() => window.location.replace('dashboard.html'), 1000);
    } catch (err) {
        mostrarFeedback(dom.loginFeedback, 'Error de conexión con el servidor', 'error');
        btnLogin.disabled = false;
        spanTexto.textContent = textoOriginal;
        spanIcono.textContent = iconoOriginal;
        spanIcono.classList.remove('icono-cargando');
    }
}

/* ===== REGISTRO ===== */

/* Estado del avatar para registro */
const avatarState = { dataURL: '', tipo: '' }; /* tipo: 'url' | 'archivo' */

async function manejarRegistro(e) {
    e.preventDefault();
    ocultarFeedback(dom.regFeedback);

    const name = dom.regNombre.value.trim();
    const email = dom.regEmail.value.trim();
    const password = dom.regPass.value;

    const nombreErr = document.getElementById('reg-nombre-err');
    const emailErr = document.getElementById('reg-email-err');
    const passErr = document.getElementById('reg-pass-err');

    [dom.regNombre, dom.regEmail, dom.regPass].forEach((inp, i) => {
        limpiarEstado(inp, [nombreErr, emailErr, passErr][i]);
    });

    let ok = true;

    if (!name) {
        setError(dom.regNombre, nombreErr, t('err_nombre_req'));
        ok = false;
    } else {
        setValido(dom.regNombre, nombreErr);
    }

    if (!email) {
        setError(dom.regEmail, emailErr, t('err_email_req'));
        ok = false;
    } else if (!validarEmail(email)) {
        setError(dom.regEmail, emailErr, t('err_email_inv'));
        ok = false;
    } else {
        setValido(dom.regEmail, emailErr);
    }

    if (!password) {
        setError(dom.regPass, passErr, t('err_pass_req'));
        ok = false;
    } else if (password.length < 6) {
        setError(dom.regPass, passErr, t('err_pass_min'));
        ok = false;
    } else {
        setValido(dom.regPass, passErr);
    }

    if (!ok) return;

    const btnRegistro = document.getElementById('btn-registro');
    const spanIcono = btnRegistro.querySelector('.material-symbols-outlined');
    const spanTexto = btnRegistro.querySelector('span:not(.material-symbols-outlined)');
    const textoOriginal = spanTexto.textContent;
    const iconoOriginal = spanIcono.textContent;

    btnRegistro.disabled = true;
    spanTexto.textContent = t('guardando') ? t('guardando').toUpperCase() : 'GUARDANDO';
    spanIcono.textContent = 'sync';
    spanIcono.classList.add('icono-cargando');

    try {
        const data = await apiPost('/api/auth/register', { name, email, password, avatar: avatarState.dataURL });
        
        if (data.error) {
            btnRegistro.disabled = false;
            spanTexto.textContent = textoOriginal;
            spanIcono.textContent = iconoOriginal;
            spanIcono.classList.remove('icono-cargando');
            if (data.error.includes('email')) {
                setError(dom.regEmail, emailErr, data.error);
            }
            mostrarModalRegistro(false, data.error);
            return;
        }

        /* Éxito */
        btnRegistro.disabled = false;
        spanTexto.textContent = textoOriginal;
        spanIcono.textContent = iconoOriginal;
        spanIcono.classList.remove('icono-cargando');
        
        mostrarModalRegistro(true, t('modal_reg_exito_desc') || 'Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.');
    } catch (err) {
        btnRegistro.disabled = false;
        spanTexto.textContent = textoOriginal;
        spanIcono.textContent = iconoOriginal;
        spanIcono.classList.remove('icono-cargando');
        mostrarModalRegistro(false, 'Error al conectar con el servidor.');
    }
}

/* ===== INIT ===== */
function initLogin() {
    aplicarTema();
    verificarSesion();
    cachearDOM();

    /* Aplicar idioma guardado */
    aplicarIdiomaLogin();

    /* Toggle idioma */
    dom.btnIdiomaEs?.addEventListener('click', () => {
        cambiarIdiomaGlobal('es');
        aplicarIdiomaLogin();
    });
    dom.btnIdiomaEn?.addEventListener('click', () => {
        cambiarIdiomaGlobal('en');
        aplicarIdiomaLogin();
    });

    /* Tabs */
    dom.tabLogin.addEventListener('click', (e) => { e.preventDefault(); activarTab(dom.tabLogin); });
    dom.tabRegistro.addEventListener('click', (e) => { e.preventDefault(); activarTab(dom.tabRegistro); });

    /* Navegación con teclado entre tabs */
    [dom.tabLogin, dom.tabRegistro].forEach(tab => {
        tab.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                const otro = tab === dom.tabLogin ? dom.tabRegistro : dom.tabLogin;
                activarTab(otro);
                otro.focus();
            }
        });
    });

    /* Formularios */
    dom.formLogin.addEventListener('submit', manejarLogin);
    dom.formReg.addEventListener('submit', manejarRegistro);

    /* Ojos */
    dom.loginOjo.addEventListener('click', e => { e.preventDefault(); toggleOjo(dom.loginPass, dom.loginOjo); });
    dom.regOjo.addEventListener('click', e => { e.preventDefault(); toggleOjo(dom.regPass, dom.regOjo); });

    /* Avatar — URL web */
    dom.regAvatarUrl.addEventListener('input', () => {
        const url = dom.regAvatarUrl.value.trim();
        if (url.startsWith('http')) {
            avatarState.dataURL = url;
            avatarState.tipo = 'url';
            mostrarAvatar(url);
            dom.nombreArchivo.textContent = '';
        } else if (!url) {
            avatarState.dataURL = '';
            mostrarAvatar('');
        }
    });

    /* Avatar — archivo local (FileReader → base64) */
    dom.regAvatarFile.addEventListener('change', () => {
        const archivo = dom.regAvatarFile.files[0];
        if (!archivo) return;
        if (!archivo.type.startsWith('image/')) {
            dom.nombreArchivo.textContent = t('err_solo_img');
            dom.nombreArchivo.style.color = 'var(--color-error)';
            return;
        }
        const reader = new FileReader();
        reader.addEventListener('load', e => {
            avatarState.dataURL = e.target.result;
            avatarState.tipo = 'archivo';
            /* Limpiar URL si había una escrita */
            dom.regAvatarUrl.value = '';
            mostrarAvatar(e.target.result);
            dom.nombreArchivo.textContent = archivo.name;
            dom.nombreArchivo.style.color = '';
        });
        reader.readAsDataURL(archivo);
    });

    /* Limpiar estados de error al escribir */
    [dom.loginEmail, dom.loginPass,
    dom.regNombre, dom.regEmail, dom.regPass].forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('campo--error');
        });
    });

    /* Activar tab de inicio de sesión por defecto */
    activarTab(dom.tabLogin);

    /* Cerrar modal de registro y preparar login */
    if (dom.btnCerrarModalReg) {
        dom.btnCerrarModalReg.addEventListener('click', () => {
            ocultar(dom.modalRegistro);
            
            // Si fue exitoso, cambiar al tab de login
            if (dom.modalRegistro.dataset.exito === 'true') {
                activarTab(dom.tabLogin);
                if (dom.regEmail.value) {
                    dom.loginEmail.value = dom.regEmail.value.trim();
                    dom.loginPass.focus();
                }
                dom.formReg.reset();
                mostrarAvatar('');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', initLogin);
