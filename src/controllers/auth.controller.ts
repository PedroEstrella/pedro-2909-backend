import { Request, Response } from 'express';

// Expresión regular corregida para validar correos electrónicos estándar
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const registerUser = async (req: Request, res: Response) => {
  const { fullName, email, password, confirmPassword } = req.body;

  // 1. Validaciones de presencia
  if (!fullName || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  // 2. Validación de formato de Email
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'El formato del correo electrónico no es válido.' });
  }

  // 3. Validación de coincidencia de contraseñas
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
  }

  // 4. Robustez de la contraseña
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  // Respuesta exitosa: Entregamos el objeto de sesión inicial con saldo de cortesía
  return res.status(201).json({
    message: 'Usuario validado con éxito.',
    user: {
      id: `usr_${Math.random().toString(36).substring(2, 11)}`,
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      balance: 0 // \$0.00 representados en créditos/centavos para evitar flotantes
    }
  });
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña requeridos.' });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'El formato del correo no es válido.' });
  }

  // Simulamos una aprobación exitosa. El frontend verificará si las credenciales coinciden con su LocalStorage
  return res.status(200).json({
    token: `simulated-jwt-token-${Math.random().toString(36).substring(2)}`,
    message: 'Credenciales validadas por el servidor.'
  });
};