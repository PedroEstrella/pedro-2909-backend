import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import snailPayRoutes from './routes/snailpay.routes.js'; // <-- Importar

const app = express();
const PORT = process.env.PORT || 3000; // Render inyecta dinámicamente el puerto

app.use(express.json());

// CONFIGURACIÓN DE CORS GLOBAL COMPATIBLE CON CUALQUIER SUBDOMINIO DE VERCEL
app.use(cors({
  origin: '*', // Permite el acceso temporal desde cualquier origen en la nube
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-SnailPay-Simulation']
}));

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