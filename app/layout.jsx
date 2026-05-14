export const metadata = {
  title: 'WeatherApp',
  description: 'Pronóstico del tiempo en tiempo real y portal de acceso.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" data-theme="dark" data-scroll-behavior="smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
