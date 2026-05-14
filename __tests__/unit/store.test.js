import { useStore } from '../../lib/store';

describe('Zustand Store', () => {
  beforeEach(() => {
    useStore.setState({
      user: null,
      theme: 'dark',
      language: 'es',
      cities: [],
      toastMessage: null
    });
  });

  test('setUser actualiza el usuario', () => {
    useStore.getState().setUser({ name: 'Test', email: 'test@test.com' });
    expect(useStore.getState().user).toEqual({ name: 'Test', email: 'test@test.com' });
  });

  test('setLanguage cambia el idioma', () => {
    useStore.getState().setLanguage('en');
    expect(useStore.getState().language).toBe('en');
  });

  test('setTheme cambia el tema', () => {
    useStore.getState().setTheme('light');
    expect(useStore.getState().theme).toBe('light');
  });

  test('addCity agrega una ciudad', () => {
    useStore.getState().addCity({ name: 'Madrid', latitude: 40.4, longitude: -3.7 });
    expect(useStore.getState().cities).toHaveLength(1);
    expect(useStore.getState().cities[0].name).toBe('Madrid');
  });

  test('removeCity elimina una ciudad', () => {
    useStore.setState({ cities: [{ name: 'Madrid' }, { name: 'Lima' }] });
    useStore.getState().removeCity('Madrid');
    expect(useStore.getState().cities).toHaveLength(1);
    expect(useStore.getState().cities[0].name).toBe('Lima');
  });

  test('showToast muestra un mensaje', () => {
    useStore.getState().showToast('Test message', 'success');
    expect(useStore.getState().toastMessage).toBe('Test message');
    expect(useStore.getState().toastType).toBe('success');
  });
});
