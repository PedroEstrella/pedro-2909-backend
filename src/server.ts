import express from 'express';
import authRoutes from './routes/auth.routes.js';
import snailPayRoutes from './routes/snailpay.routes.js'; // <-- Importar

const app = express();
const PORT = 3000;

app.use(express.json());

// Configuración de CORS
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://pedro-2909-frontend.vercel.app/login', // URL de Vercel
    'http://localhost:5173' // Soporte para desarrollo local
  ];
  
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-SnailPay-Simulation');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // Manejo de peticiones preflight OPTIONS (Crítico para despliegues en la nube)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Rutas de la Aplicación
// Enrutador de Autenticación
app.use('/api/auth', authRoutes);
app.use('/api/snailpay', snailPayRoutes); // <-- Registrar nueva ruta

// ENDPOINT SIMULADO DE PASARELA SNAILPAY (Requerimiento 2.2)
app.post('/api/auth/v1/charges', (req, res) => {
  const { amount, source } = req.body;
  
  if (source === 'tok_sandbox_snailpay_success') {
    return res.status(201).json({
      id: `ch_snail_${Math.random().toString(36).substring(2, 11)}`,
      status: "succeeded",
      amount: amount // Retorna el monto procesado en centavos
    });
  }
  
  return res.status(402).json({ message: "Transacción rechazada por el simulador de SnailPay." });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Express simulado corriendo en http://localhost:${PORT}`);
});