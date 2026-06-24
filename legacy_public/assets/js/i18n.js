/* =====================================================
   WEATHERAPP — i18n.js
   Sistema de internacionalización compartido (ES / EN)
   Importar ANTES de main.js y login.js
   ===================================================== */
'use strict';

const LS_IDIOMA = 'wa_idioma';

/* ===== DICCIONARIO COMPLETO ===== */
const I18N = {
    es: {
        /* ── Página principal ── */
        buscar_placeholder: 'Buscar ciudad...',
        localidades_titulo: 'Localidades',
        localidades_vacias: 'Sin localidades guardadas',
        cerrar_sesion: 'Cerrar sesión',
        inicio_titulo: 'Busca una ciudad',
        inicio_desc: 'Escribe el nombre de una ciudad para ver el pronóstico del tiempo.',
        cargando: 'Cargando datos...',
        ciudad_no_encontrada: 'Ciudad no encontrada',
        temperatura: 'Temperatura',
        sensacion: 'Sensación térmica',
        humedad: 'Humedad',
        viento: 'Viento',
        guardar_ciudad: 'Guardar',
        pronostico_horas: 'Pronóstico 12 horas',
        granularidad: 'Granularidad: 60min',
        hora: 'Hora',
        estado_col: 'Estado',
        temp_col: 'Temp',
        precip_col: 'Precip',
        uv_col: 'UV',
        tendencia: 'Tendencia atmosférica (12H)',
        live_projection: 'Proyección en vivo',
        editar_perfil: 'Editar perfil',
        campo_nombre: 'Nombre completo',
        campo_email: 'Correo electrónico',
        campo_password: 'Contraseña',
        campo_avatar: 'Foto de perfil',
        guardar: 'Guardar',
        cancelar: 'Cancelar',
        perfil_nombre: 'Usuario',
        perfil_rol: 'Clima en tiempo real',
        ciudad_guardada: 'Ciudad guardada ✓',
        ciudad_duplicada: 'La ciudad ya está guardada',
        perfil_guardado: 'Perfil guardado ✓',
        error_red: 'Error de conexión. Comprueba tu internet.',
        ahora: 'Ahora',
        nav_dashboard: 'Dashboard',
        nav_mapa: 'Mapa',
        nav_perfil: 'Perfil',
        estacion_tiempo_real: 'Estación en tiempo real',
        delta_index: 'Delta: — Index',
        viento_estable: 'Estable',
        late_analysis: 'Análisis tardío',
        estabilidad: 'Perfil de estabilidad',
        presion: 'Presión',
        punto_rocio: 'Punto de rocío',
        visibilidad: 'Visibilidad',
        heatmap: 'Mapa térmico superpuesto',
        stream_live: 'Stream en vivo',
        uv_bajo: 'Bajo',
        uv_mod: 'Mod',
        uv_alto: 'Alto',
        uv_muy_alto: 'Muy alto',
        subir_archivo: 'Subir imagen',
        buscador_instrucciones: 'Escribe para buscar ciudades, usa las flechas para navegar por los resultados.',
        error_titulo: 'Algo salió mal',
        error_desc: 'No pudimos conectar con el servidor. Por favor, verifica tu conexión.',
        reintentar: 'Reintentar',
        error_generico: 'Ha ocurrido un error inesperado.',

        /* ── Página login ── */
        login_titulo: 'WeatherApp',
        login_subtitulo: 'PORTAL DE ACCESO SEGURO',
        tab_login: 'LOGIN',
        tab_registro: 'REGISTRO',
        login_email_label: 'Correo electrónico',
        login_email_placeholder: 'usuario@ejemplo.com',
        login_pass_label: 'Contraseña',
        login_pass_placeholder: '••••••••••••',
        btn_login: 'INICIAR SESIÓN',
        reg_nombre_label: 'Nombre completo',
        reg_nombre_placeholder: 'Juan Pérez',
        reg_email_label: 'Correo electrónico',
        reg_email_placeholder: 'usuario@ejemplo.com',
        reg_pass_label: 'Contraseña',
        reg_pass_placeholder: '••••••••••••',
        reg_foto_titulo: 'FOTO DE PERFIL',
        reg_opcion_url: 'OPCIÓN 1: URL WEB',
        reg_opcion_url_placeholder: 'Pegar URL de imagen',
        reg_opcion_archivo: 'OPCIÓN 2: ARCHIVO LOCAL',
        reg_btn_subir: 'SUBIR DESDE DISPOSITIVO',
        btn_registro: 'REGISTRARSE',
        reg_aviso: 'PROTEGIDO POR ENCRIPTACIÓN DE GRADO BANCARIO',
        pie_copy: '© 2025 WeatherApp',
        pie_privacidad: 'Política de privacidad',
        pie_terminos: 'Términos',
        pie_estado: 'Sistema en línea',

        /* ── Validaciones login ── */
        err_email_req: 'El correo es obligatorio',
        err_email_inv: 'Correo no válido',
        err_pass_req: 'La contraseña es obligatoria',
        err_pass_min: 'Mínimo 6 caracteres',
        err_nombre_req: 'El nombre es obligatorio',
        err_email_dup: 'Ya existe una cuenta con ese correo',
        err_no_cuenta: 'No existe una cuenta con ese correo',
        err_pass_inc: 'Contraseña incorrecta',
        exito_bienvenido: '¡Bienvenido de nuevo! Redirigiendo...',
        exito_cuenta: '¡Cuenta creada! Redirigiendo...',
        err_solo_img: 'Solo se permiten imágenes',
        mostrar_pass: 'Mostrar contraseña',
        ocultar_pass: 'Ocultar contraseña',
        version: 'v2.0 Pro',
    },

    en: {
        /* ── Main page ── */
        buscar_placeholder: 'Search for a city...',
        localidades_titulo: 'Saved Locations',
        localidades_vacias: 'No saved locations',
        cerrar_sesion: 'Log Out',
        inicio_titulo: 'Search a city',
        inicio_desc: 'Type a city name to see the weather forecast.',
        cargando: 'Loading data...',
        ciudad_no_encontrada: 'City not found',
        temperatura: 'Temperature',
        sensacion: 'Feels Like',
        humedad: 'Humidity',
        viento: 'Wind',
        guardar_ciudad: 'Save',
        pronostico_horas: '12-Hour Forecast',
        granularidad: 'Granularity: 60min',
        hora: 'Time',
        estado_col: 'Status',
        temp_col: 'Temp',
        precip_col: 'Precip',
        uv_col: 'UV',
        tendencia: 'Atmospheric Trend (12H)',
        live_projection: 'Live Projection',
        editar_perfil: 'Edit profile',
        campo_nombre: 'Full name',
        campo_email: 'Email address',
        campo_password: 'Password',
        campo_avatar: 'Profile photo',
        guardar: 'Save',
        cancelar: 'Cancel',
        perfil_nombre: 'User',
        perfil_rol: 'Real-time weather',
        ciudad_guardada: 'City saved ✓',
        ciudad_duplicada: 'City already saved',
        perfil_guardado: 'Profile saved ✓',
        error_red: 'Connection error. Check your internet.',
        ahora: 'Now',
        nav_dashboard: 'Dashboard',
        nav_mapa: 'Map',
        nav_perfil: 'Profile',
        estacion_tiempo_real: 'Real-time Station',
        delta_index: 'Delta: — Index',
        viento_estable: 'Steady',
        late_analysis: 'Late Analysis',
        estabilidad: 'Stability Profile',
        presion: 'Pressure',
        punto_rocio: 'Dew Point',
        visibilidad: 'Visibility',
        heatmap: 'Thermal Heatmap Overlay',
        stream_live: 'Stream Live Data',
        uv_bajo: 'Low',
        uv_mod: 'Mod',
        uv_alto: 'High',
        uv_muy_alto: 'V.High',
        subir_archivo: 'Upload image',
        buscador_instrucciones: 'Type to search for cities, use arrow keys to navigate results.',
        error_titulo: 'Something went wrong',
        error_desc: "We couldn't connect to the server. Please check your internet connection.",
        reintentar: 'Try again',
        error_generico: 'An unexpected error has occurred.',

        /* ── Login page ── */
        login_titulo: 'WeatherApp',
        login_subtitulo: 'SECURE ACCESS PORTAL',
        tab_login: 'LOGIN',
        tab_registro: 'REGISTER',
        login_email_label: 'Email address',
        login_email_placeholder: 'user@example.com',
        login_pass_label: 'Password',
        login_pass_placeholder: '••••••••••••',
        btn_login: 'LOG IN',
        reg_nombre_label: 'Full name',
        reg_nombre_placeholder: 'John Doe',
        reg_email_label: 'Email address',
        reg_email_placeholder: 'user@example.com',
        reg_pass_label: 'Password',
        reg_pass_placeholder: '••••••••••••',
        reg_foto_titulo: 'PROFILE PHOTO',
        reg_opcion_url: 'OPTION 1: WEB URL',
        reg_opcion_url_placeholder: 'Paste image URL',
        reg_opcion_archivo: 'OPTION 2: LOCAL FILE',
        reg_btn_subir: 'UPLOAD FROM DEVICE',
        btn_registro: 'REGISTER',
        reg_aviso: 'PROTECTED BY BANK-GRADE ENCRYPTION',
        pie_copy: '© 2025 WeatherApp',
        pie_privacidad: 'Privacy Policy',
        pie_terminos: 'Terms',
        pie_estado: 'System online',

        /* ── Login validations ── */
        err_email_req: 'Email is required',
        err_email_inv: 'Invalid email',
        err_pass_req: 'Password is required',
        err_pass_min: 'At least 6 characters',
        err_nombre_req: 'Name is required',
        err_email_dup: 'An account with that email already exists',
        err_no_cuenta: 'No account found with that email',
        err_pass_inc: 'Incorrect password',
        exito_bienvenido: 'Welcome back! Redirecting...',
        exito_cuenta: 'Account created! Redirecting...',
        err_solo_img: 'Only images are allowed',
        mostrar_pass: 'Show password',
        ocultar_pass: 'Hide password',
        version: 'v2.0 Pro',
    },
};

/* ===== FUNCIONES COMPARTIDAS ===== */

/** Obtiene el idioma actual guardado (default: 'es') */
function obtenerIdiomaActual() {
    try {
        return JSON.parse(localStorage.getItem(LS_IDIOMA)) || 'es';
    } catch { return 'es'; }
}

/** Traduce una clave al idioma actual */
function t(clave) {
    const idioma = obtenerIdiomaActual();
    return (I18N[idioma] && I18N[idioma][clave]) || clave;
}

/** Aplica traducciones a todos los elementos con [data-i18n] en la página */
function aplicarTraducciones() {
    const idioma = obtenerIdiomaActual();
    const dict = I18N[idioma] || I18N.es;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const clave = el.getAttribute('data-i18n');
        if (!dict[clave]) return;

        // Si es un input, cambiar placeholder; si no, cambiar textContent
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = dict[clave];
        } else {
            el.textContent = dict[clave];
        }
    });

    // Actualizar placeholders con data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const clave = el.getAttribute('data-i18n-placeholder');
        if (dict[clave]) el.placeholder = dict[clave];
    });
}

/** Cambia el idioma, lo guarda y aplica */
function cambiarIdiomaGlobal(nuevoIdioma) {
    try {
        localStorage.setItem(LS_IDIOMA, JSON.stringify(nuevoIdioma));
    } catch { }
    aplicarTraducciones();
}
