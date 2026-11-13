// Click Merchant API (Prepare & Complete)
// Official integration endpoint for ELRIZO NASIYA SAVDO
import crypto from 'crypto';
import {
  findOrderByContract,
  findTransactionByProviderId,
  saveTransaction,
  sendTelegramPaymentNotification,
  PaymentTransaction,
} from '@/lib/paymentStorage';

export const dynamic = 'force-dynamic';

const CLICK_SECRET_KEY = process.env.CLICK_SECRET_KEY || process.env.NEXT_PUBLIC_CLICK_SECRET_KEY || '';

function md5(str: string): string {
  return crypto.createHash('md5').update(str).digest('hex');
}

export async function POST(req: Request) {
  let body: any = {};

  // Click can send JSON or application/x-www-form-urlencoded
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      body = await req.json();
    } catch {}
  } else {
    try {
      const formData = await req.formData();
      formData.forEach((value, key) => {
        body[key] = value.toString();
      });
    } catch {
      try {
        const text = await req.text();
        const params = new URLSearchParams(text);
        params.forEach((value, key) => {
          body[key] = value;
        });
      } catch {}
    }
  }

  const click_trans_id = String(body.click_trans_id || '');
  const service_id = String(body.service_id || '');
  const click_paydoc_id = String(body.click_paydoc_id || '');
  const merchant_trans_id = String(body.merchant_trans_id || '');
  const amount = Number(body.amount) || 0;
  const action = Number(body.action); // 0 = Prepare, 1 = Complete
  const error = Number(body.error) || 0;
  const error_note = String(body.error_note || '');
  const sign_time = String(body.sign_time || '');
  const sign_string = String(body.sign_string || '').toLowerCase();

  // 1. MD5 Signature validation (if secret key configured)
  if (CLICK_SECRET_KEY) {
    const rawSign = `${click_trans_id}${service_id}${CLICK_SECRET_KEY}${merchant_trans_id}${amount}${action}${sign_time}`;
    const calculatedSign = md5(rawSign).toLowerCase();

    if (calculatedSign !== sign_string) {
      return Response.json({
        error: -1,
        error_note: 'SIGN CHECK FAILED',
      });
    }
  }

  // If Click reports an error from their side
  if (error < 0) {
    return Response.json({
      error: -9,
      error_note: 'Transaction cancelled by Click',
    });
  }

  const now = Date.now();

  try {
    // 2. Action 0: Prepare
    if (action === 0) {
      const order = await findOrderByContract(merchant_trans_id);

      if (!order && !merchant_trans_id.startsWith('ELR-PAY-')) {
        return Response.json({
          error: -5,
          error_note: 'Order not found',
        });
      }

      if (order && Math.abs(order.amount - amount) > 10) {
        return Response.json({
          error: -2,
          error_note: 'Incorrect amount',
        });
      }

      const existingTx = await findTransactionByProviderId(click_trans_id);
      if (existingTx && existingTx.status === 'completed') {
        return Response.json({
          error: -4,
          error_note: 'Already paid',
        });
      }

      const prepareId = `prep_${now}`;
      const newTx: PaymentTransaction = {
        id: click_trans_id,
        provider: 'click',
        providerTransId: click_trans_id,
        orderId: merchant_trans_id,
        contractNumber: merchant_trans_id,
        amount,
        state: 0,
        status: 'pending',
        createdAt: now,
      };

      await saveTransaction(newTx);

      return Response.json({
        click_trans_id: Number(click_trans_id) || click_trans_id,
        merchant_trans_id,
        merchant_prepare_id: prepareId,
        error: 0,
        error_note: 'Success',
      });
    }

    // 3. Action 1: Complete
    if (action === 1) {
      const merchant_prepare_id = String(body.merchant_prepare_id || '');
      let tx = await findTransactionByProviderId(click_trans_id);

      if (!tx) {
        // If Prepare wasn't cached in serverless instance, create it
        tx = {
          id: click_trans_id,
          provider: 'click',
          providerTransId: click_trans_id,
          orderId: merchant_trans_id,
          contractNumber: merchant_trans_id,
          amount,
          state: 0,
          status: 'pending',
          createdAt: now,
        };
      }

      if (tx.status === 'completed') {
        return Response.json({
          click_trans_id: Number(click_trans_id) || click_trans_id,
          merchant_trans_id,
          merchant_confirm_id: tx.performedAt || now,
          error: 0,
          error_note: 'Already confirmed',
        });
      }

      tx.status = 'completed';
      tx.state = 1;
      tx.performedAt = now;
      await saveTransaction(tx);

      // Telegram orqali adminga xabar yuborish
      const order = await findOrderByContract(merchant_trans_id);
      await sendTelegramPaymentNotification({
        provider: 'Click',
        contractNumber: merchant_trans_id,
        amount,
        customerName: order?.customerName,
        phone: order?.phone,
      });

      return Response.json({
        click_trans_id: Number(click_trans_id) || click_trans_id,
        merchant_trans_id,
        merchant_confirm_id: now,
        error: 0,
        error_note: 'Success',
      });
    }

    return Response.json({
      error: -3,
      error_note: 'Action not found',
    });
  } catch (err: any) {
    console.error('Click error:', err);
    return Response.json({
      error: -8,
      error_note: err.message || 'Internal server error',
    });
  }
}

export async function GET() {
  return Response.json({
    ok: true,
    service: 'ELRIZO Click Merchant Webhook API',
    endpoint: 'https://elrizonasiya.vercel.app/api/payment/click',
    docs: 'https://docs.click.uz/',
    status: 'ACTIVE',
  });
}
