export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return !!(re.test(email) && email.length <= 150);
}

export function isValidPassword(password) {
  return !!(password && typeof password === 'string' && password.length >= 6 && password.length <= 128);
}

export function isValidName(name) {
  return !!(name && typeof name === 'string' && name.trim().length >= 1 && name.length <= 100);
}
