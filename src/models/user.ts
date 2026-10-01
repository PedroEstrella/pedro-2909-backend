export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  balance: number; // Saldo inicial simulado (ej. 10000 centavos = $100)
}

export interface LoginRequest {
  email: string;
  password?: string;
}