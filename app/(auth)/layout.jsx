import '../styles/login.css';

export default function AuthLayout({ children }) {
  // En Next.js, no necesitamos agregar <body> nuevamente ya que RootLayout lo tiene.
  // Pero necesitamos emular la estructura de la página de Login que antes era el <body> entero.
  // La clase de body en login.css por defecto estiliza la raíz, así que esto se asimilará automáticamente.
  return (
    <>
      {children}
    </>
  );
}
