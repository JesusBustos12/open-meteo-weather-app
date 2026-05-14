import '../styles/styles.css';

export default function DashboardLayout({ children }) {
  return (
    <>
      <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
      />
      {children}
    </>
  );
}
