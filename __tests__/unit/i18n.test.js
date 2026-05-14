import { I18N } from '../../lib/i18nData';

describe('i18n Data', () => {
  test('tiene las claves en español e inglés', () => {
    expect(I18N).toHaveProperty('es');
    expect(I18N).toHaveProperty('en');
  });

  test('ambos idiomas tienen las mismas claves', () => {
    const esKeys = Object.keys(I18N.es).sort();
    const enKeys = Object.keys(I18N.en).sort();
    expect(esKeys).toEqual(enKeys);
  });

  test('ninguna traducción está vacía', () => {
    for (const [key, value] of Object.entries(I18N.es)) {
      expect(value).toBeTruthy();
    }
    for (const [key, value] of Object.entries(I18N.en)) {
      expect(value).toBeTruthy();
    }
  });
});
