import '../styles/styles.css';
import Toast from '../../components/Toast';

export default function DashboardLayout({ children }) {
  return (
    <>
      <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
      />
      {children}
      <Toast />
    </>
  );
}
