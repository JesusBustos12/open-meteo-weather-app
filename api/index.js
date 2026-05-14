import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

// Configuración dinámica de CORS para soportar dominios locales y de Vercel
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000'];
        if (!origin || allowedOrigins.includes(origin) || (origin && origin.endsWith('.vercel.app'))) {
            callback(null, true);
        } else {
            callback(new Error('Origen no permitido por CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Esta API puede ser extendida en el futuro para interactuar con bases de datos
// Por ahora solo provee un endpoint de prueba
app.get('/api/status', (req, res) => {
    res.json({ status: "API is running", timestamp: new Date().toISOString() });
});

// IMPORTANTE PARA VERCEL: Exportar la app en lugar de hacer app.listen()
export default app;
