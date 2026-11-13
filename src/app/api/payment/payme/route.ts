// Payme Merchant API (Subscribe / JSON-RPC 2.0)
// Official integration endpoint for ELRIZO NASIYA SAVDO
import {
  findOrderByContract,
  findTransactionByProviderId,
  saveTransaction,
  sendTelegramPaymentNotification,
  PaymentTransaction,
} from '@/lib/paymentStorage';

export const dynamic = 'force-dynamic';

const PAYME_KEY = process.env.PAYME_KEY || process.env.NEXT_PUBLIC_PAYME_KEY || '';

function paymeError(id: any, code: number, message: string, data?: string) {
  return Response.json({
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message: {
        uz: message,
        ru: message,
        en: message,
      },
      data,
    },
  });
}

function verifyPaymeAuth(req: Request): boolean {
  if (!PAYME_KEY) {
    // If not configured, allow testing in test mode
    return true;
  }

  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Basic ')) {
    return false;
  }

  try {
    const encoded = authHeader.replace('Basic ', '').trim();
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const [login, key] = decoded.split(':');
    return login === 'Paycom' && key === PAYME_KEY;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return paymeError(null, -32700, 'Parse error');
  }

  const { method, params, id } = body || {};

  // 1. Auth check
  if (!verifyPaymeAuth(req)) {
    return paymeError(id, -32504, 'Yetarli ruxsat mavjud emas (Auth failed)');
  }

  const now = Date.now();

  try {
    switch (method) {
      // 1. CheckPerformTransaction: Tekshirish (buyurtma bormi, summa to'g'rimi)
      case 'CheckPerformTransaction': {
        const orderId = params?.account?.order_id || params?.account?.contractNumber;
        const amountInTiyin = Number(params?.amount) || 0;
        const amountInSom = Math.round(amountInTiyin / 100);

        if (!orderId) {
          return paymeError(id, -31050, 'Buyurtma kodi topilmadi', 'order_id');
        }

        const order = await findOrderByContract(orderId);
        if (!order) {
          // Allow mock/direct checkout format ELR-PAY-XXXXXX
          if (orderId.startsWith('ELR-PAY-')) {
            return Response.json({
              jsonrpc: '2.0',
              id,
              result: { allow: true },
            });
          }
          return paymeError(id, -31050, 'Buyurtma topilmadi', 'order_id');
        }

        if (order.amount && Math.abs(order.amount - amountInSom) > 10) {
          return paymeError(id, -31001, 'Summa mos kelmadi', 'amount');
        }

        return Response.json({
          jsonrpc: '2.0',
          id,
          result: {
            allow: true,
            detail: {
              receipt_type: 0,
              items: [
                {
                  title: `ELRIZO Buyurtma ${orderId}`,
                  price: amountInTiyin,
                  count: 1,
                  code: '010101',
                  units: 1,
                  vat_percent: 0,
                  package_code: '000000',
                },
              ],
            },
          },
        });
      }

      // 2. CreateTransaction: Tranzaksiya yaratish (state: 1)
      case 'CreateTransaction': {
        const paymeTransId = params?.id;
        const orderId = params?.account?.order_id || params?.account?.contractNumber;
        const amountInTiyin = Number(params?.amount) || 0;
        const amountInSom = Math.round(amountInTiyin / 100);

        let tx = await findTransactionByProviderId(paymeTransId);

        if (tx) {
          if (tx.state !== 1) {
            return paymeError(id, -31008, 'Tranzaksiya holati noto\'g\'ri');
          }
          return Response.json({
            jsonrpc: '2.0',
            id,
            result: {
              create_time: tx.createdAt,
              transaction: tx.providerTransId,
              state: tx.state,
            },
          });
        }

        const order = await findOrderByContract(orderId);
        if (!order && !orderId?.startsWith('ELR-PAY-')) {
          return paymeError(id, -31050, 'Buyurtma topilmadi', 'order_id');
        }

        const newTx: PaymentTransaction = {
          id: paymeTransId,
          provider: 'payme',
          providerTransId: paymeTransId,
          orderId: orderId,
          contractNumber: orderId,
          amount: amountInSom,
          state: 1,
          status: 'pending',
          createdAt: now,
        };

        await saveTransaction(newTx);

        return Response.json({
          jsonrpc: '2.0',
          id,
          result: {
            create_time: newTx.createdAt,
            transaction: newTx.providerTransId,
            state: newTx.state,
          },
        });
      }

      // 3. PerformTransaction: To'lovni yakunlash (state: 2) -> Mijoz kartasidan pul yechildi!
      case 'PerformTransaction': {
        const paymeTransId = params?.id;
        const tx = await findTransactionByProviderId(paymeTransId);

        if (!tx) {
          return paymeError(id, -31003, 'Tranzaksiya topilmadi');
        }

        if (tx.state === 1) {
          tx.state = 2;
          tx.status = 'completed';
          tx.performedAt = now;

          await saveTransaction(tx);

          // Telegram orqali adminga xabar yuborish
          const order = await findOrderByContract(tx.contractNumber);
          await sendTelegramPaymentNotification({
            provider: 'Payme',
            contractNumber: tx.contractNumber,
            amount: tx.amount,
            customerName: order?.customerName,
            phone: order?.phone,
          });

          return Response.json({
            jsonrpc: '2.0',
            id,
            result: {
              transaction: tx.providerTransId,
              perform_time: tx.performedAt,
              state: tx.state,
            },
          });
        }

        if (tx.state === 2) {
          return Response.json({
            jsonrpc: '2.0',
            id,
            result: {
              transaction: tx.providerTransId,
              perform_time: tx.performedAt,
              state: tx.state,
            },
          });
        }

        return paymeError(id, -31008, 'Tranzaksiya bajarilmadi');
      }

      // 4. CancelTransaction: Bekor qilish (state: -1 yoki -2)
      case 'CancelTransaction': {
        const paymeTransId = params?.id;
        const reason = params?.reason;
        const tx = await findTransactionByProviderId(paymeTransId);

        if (!tx) {
          return paymeError(id, -31003, 'Tranzaksiya topilmadi');
        }

        if (tx.state === 1) {
          tx.state = -1;
          tx.status = 'cancelled';
          tx.cancelledAt = now;
          tx.reason = reason;
          await saveTransaction(tx);
        } else if (tx.state === 2) {
          tx.state = -2;
          tx.status = 'cancelled';
          tx.cancelledAt = now;
          tx.reason = reason;
          await saveTransaction(tx);
        }

        return Response.json({
          jsonrpc: '2.0',
          id,
          result: {
            transaction: tx.providerTransId,
            cancel_time: tx.cancelledAt,
            state: tx.state,
          },
        });
      }

      // 5. CheckTransaction: Holatini tekshirish
      case 'CheckTransaction': {
        const paymeTransId = params?.id;
        const tx = await findTransactionByProviderId(paymeTransId);

        if (!tx) {
          return paymeError(id, -31003, 'Tranzaksiya topilmadi');
        }

        return Response.json({
          jsonrpc: '2.0',
          id,
          result: {
            create_time: tx.createdAt,
            perform_time: tx.performedAt || 0,
            cancel_time: tx.cancelledAt || 0,
            transaction: tx.providerTransId,
            state: tx.state,
            reason: tx.reason || null,
          },
        });
      }

      // 6. GetStatement
      case 'GetStatement': {
        return Response.json({
          jsonrpc: '2.0',
          id,
          result: {
            transactions: [],
          },
        });
      }

      default:
        return paymeError(id, -32601, 'Method not found');
    }
  } catch (err: any) {
    console.error('Payme error:', err);
    return paymeError(id, -31008, err.message || 'Ichki server xatoligi');
  }
}

export async function GET() {
  return Response.json({
    ok: true,
    service: 'ELRIZO Payme Merchant Webhook API',
    endpoint: 'https://elrizonasiya.vercel.app/api/payment/payme',
    docs: 'https://developer.help.paycom.uz/',
    status: 'ACTIVE',
  });
}
