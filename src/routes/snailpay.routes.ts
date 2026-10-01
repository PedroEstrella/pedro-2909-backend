import { Router, Request, Response } from 'express';

const router = Router();

router.post('/charge', (req: Request, res: Response) => {
  const simulationHeader = req.headers['x-snailpay-simulation'];
  const { cardNumber, expiryDate, cvv, fullName, amount, userId, userEmail } = req.body;

  // Base común para armar la estructura de respuesta requerida
  const buildBaseResponse = (status: string, statusDetail: string, authCode: string | null) => ({
    id: `ch_sn_${Math.random().toString(36).substring(2, 11)}`,
    status: status,
    status_detail: statusDetail,
    transaction_amount: amount ? parseInt(amount) : 0,
    date_created: new Date().toISOString(),
    authorization_code: authCode,
    reference: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
    payer_id: userId || "unknown",
    payer_email: userEmail || "unknown",
    // Requisito: Incluir datos ficticios de la tarjeta en la respuesta del servicio
    card_info: {
      cardNumber: cardNumber || null,
      cvv: cvv || null
    }
  });

  // --- 1. ESCENARIO: ERROR DEL SISTEMA (HTTP 500) ---
  if (simulationHeader === 'INTERNAL_SERVER_ERROR') {
    return res.status(500).json({
      ...buildBaseResponse("fail", "internal_system_error", null),
      message: "SnailPay experimentó un problema interno de infraestructura y no pudo procesar la solicitud."
    });
  }

  // Validación de campos obligatorios base
  if (!cardNumber || !expiryDate || !cvv || !fullName || !amount || !userId || !userEmail) {
    return res.status(400).json({ 
      ...buildBaseResponse("error", "missing_fields", null),
      message: "Todos los campos de la tarjeta son obligatorios." 
    });
  }

  const cleanCardNumber = cardNumber.replace(/\s/g, '');

  // --- 2. ESCENARIO: ERRORES DE TRANSACCIÓN (HTTP 402 / 400) ---
  // A) Fondos Insuficientes
  if (cleanCardNumber === '4242424242424242') {
    return res.status(402).json({
      ...buildBaseResponse("declined", "insufficient_funds", null),
      message: "La transacción ha sido rechazada por el banco debido a fondos insuficientes."
    });
  }

  // B) Tarjeta Expirada
  if (cleanCardNumber === '1111222233334444') {
    return res.status(402).json({
      ...buildBaseResponse("declined", "expired_card", null),
      message: "La tarjeta ingresada se encuentra vencida."
    });
  }

  // --- 3. ESCENARIO: COBRO EXITOSO (HTTP 200) ---
  if (cleanCardNumber === '1234123412341234') {
    if (expiryDate === '12/26' && cvv === '543' && fullName.trim() !== '') {
      const authCode = Math.floor(100000 + Math.random() * 900000).toString();
      return res.status(200).json({
        ...buildBaseResponse("approved", "charge_completed", authCode),
        message: "La operación fue aprobada con éxito por SnailPay."
      });
    } else {
      return res.status(400).json({
        ...buildBaseResponse("error", "invalid_security_code", null),
        message: "Código de seguridad (CVV) o fecha de vencimiento incorrectos."
      });
    }
  }

  // Tarjeta general no reconocida
  return res.status(400).json({
    ...buildBaseResponse("error", "unsupported_card", null),
    message: "El número de tarjeta no corresponde a ninguna tarjeta de pruebas registrada."
  });
});

export default router;