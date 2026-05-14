import { isValidEmail, isValidPassword, isValidName } from '../../lib/validators';

describe('Validators', () => {
  describe('isValidEmail', () => {
    test('acepta email válido', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
    });
    test('rechaza email sin @', () => {
      expect(isValidEmail('userexample.com')).toBe(false);
    });
    test('rechaza string vacío', () => {
      expect(isValidEmail('')).toBe(false);
    });
    test('rechaza null', () => {
      expect(isValidEmail(null)).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    test('acepta 6+ caracteres', () => {
      expect(isValidPassword('123456')).toBe(true);
    });
    test('rechaza menos de 6 caracteres', () => {
      expect(isValidPassword('12345')).toBe(false);
    });
  });

  describe('isValidName', () => {
    test('acepta nombre válido', () => {
      expect(isValidName('Juan')).toBe(true);
    });
    test('rechaza nombre vacío', () => {
      expect(isValidName('')).toBe(false);
    });
  });
});
