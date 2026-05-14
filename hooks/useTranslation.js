import { useStore } from '../lib/store';
import { I18N } from '../lib/i18nData';

/**
 * Hook reactivo de traducción
 * @returns {function} Función `t(clave)` que devuelve el texto en el lenguaje activo
 */
export function useTranslation() {
    const language = useStore((state) => state.language);
    
    // Función de traducción
    const t = (key) => {
        const dict = I18N[language] || I18N.es;
        return dict[key] || key;
    };

    return { t, language };
}
