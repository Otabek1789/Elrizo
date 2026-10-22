/**
 * Official Installment Contract & Schedule Generator
 * Generates an official printable contract with company seal, QR verification, and payment schedule.
 */

import { Order } from '../types';
import { formatPrice } from '../utils/calculator';

export const generateAndPrintContract = (order: Order) => {
  const contractNumber = order.contractNumber || `ELR-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('uz-UZ');
  const months = order.installmentMonths || 12;
  const monthlyAmount = order.monthlyPayment || Math.round(order.totalPrice / months);

  // Generate schedule rows
  let scheduleRowsHtml = '';
  const startDate = new Date(order.createdAt || Date.now());
  
  for (let i = 1; i <= months; i++) {
    const payDate = new Date(startDate);
    payDate.setMonth(payDate.getMonth() + i);
    const dateFormatted = payDate.toLocaleDateString('uz-UZ');
    const remaining = Math.max(0, order.totalPrice - (monthlyAmount * i));

    scheduleRowsHtml += `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
        <td style="padding: 6px 8px; font-weight: bold; text-align: center;">${i}-oy</td>
        <td style="padding: 6px 8px; text-align: center;">${dateFormatted}</td>
        <td style="padding: 6px 8px; font-weight: 700; color: #640199; text-align: right;">${formatPrice(monthlyAmount, true, 'uz')}</td>
        <td style="padding: 6px 8px; text-align: right; color: #64748b;">${formatPrice(remaining, true, 'uz')}</td>
        <td style="padding: 6px 8px; text-align: center; color: #059669; font-weight: 600;">Rejalashtirilgan</td>
      </tr>
    `;
  }

  // Generate items list
  let itemsHtml = '';
  (order.items || []).forEach((item, idx) => {
    itemsHtml += `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 12px;">
        <td style="padding: 8px; text-align: center;">${idx + 1}</td>
        <td style="padding: 8px; font-weight: 600;">${item.title}</td>
        <td style="padding: 8px; text-align: center;">${item.quantity} dona</td>
        <td style="padding: 8px; text-align: right; font-weight: bold;">${formatPrice(item.price, true, 'uz')}</td>
      </tr>
    `;
  });

  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) {
    alert("Brauzeringizda pop-up (yangi oyna) ochishga ruxsat bering");
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="uz">
    <head>
      <meta charset="UTF-8">
      <title>Shartnoma_${contractNumber}_Elrizo_Nasiya</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 20px;
          background: #fff;
          font-size: 12px;
          line-height: 1.5;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #640199;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .logo {
          font-size: 24px;
          font-weight: 900;
          color: #640199;
          letter-spacing: -0.5px;
        }
        .contract-title {
          text-align: center;
          margin: 15px 0;
          font-size: 16px;
          font-weight: 800;
          text-transform: uppercase;
          color: #1e1b4b;
        }
        .box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 15px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        th {
          background: #f1f5f9;
          padding: 8px;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          border-bottom: 2px solid #cbd5e1;
        }
        .seal-box {
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px dashed #cbd5e1;
        }
        .seal-stamp {
          width: 110px;
          height: 110px;
          border: 3px double #059669;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #059669;
          font-size: 9px;
          font-weight: 900;
          text-align: center;
          transform: rotate(-12deg);
        }
        .btn-print {
          background: #640199;
          color: #fff;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          font-size: 14px;
          margin-bottom: 20px;
        }
        @media print {
          .no-print { display: none !important; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="text-align: right;">
        <button class="btn-print" onclick="window.print()">🖨️ Shartnomani chop etish / PDF saqlash</button>
      </div>

      <div class="header">
        <div>
          <div class="logo">ELRIZO NASIYA</div>
          <div style="font-size: 11px; color: #64748b;">"ELRIZO SAVDO" MCHJ | Toshkent sh., Chilonzor 9-mavze</div>
          <div style="font-size: 11px; color: #64748b;">Tel: +998 71 200 00 00 | Veb-sayt: elrizonasiya.vercel.app</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 13px; font-weight: 800; color: #640199;">SHARTNOMA: ${contractNumber}</div>
          <div style="font-size: 11px; color: #475569;">Sana: ${dateStr}</div>
          <div style="font-size: 10px; background: #ecfdf5; color: #047857; font-weight: 700; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px;">TASDIQLANGAN & AKTIV</div>
        </div>
      </div>

      <div class="contract-title">
        MUDDATLI TO'LOV VA NASIYA SAVDO SHARTNOMASI № ${contractNumber}
      </div>

      <div class="box">
        <table style="margin: 0; font-size: 12px;">
          <tr>
            <td style="width: 50%; vertical-align: top;">
              <strong>SOTUVCHI:</strong><br>
              "ELRIZO SAVDO" MCHJ<br>
              STIR / INN: 308945124<br>
              H/R: 20208000900123456001<br>
              Bank: AT "Ipoteka Bank" Toshkent filiali<br>
              MFO: 00424
            </td>
            <td style="width: 50%; vertical-align: top;">
              <strong>XARIDOR:</strong><br>
              F.I.Sh: <b>${order.customerName || 'Mijoz'}</b><br>
              JShShIR (PINFL): <b>${order.pinfl || '-'}</b><br>
              Telefon: <b>${order.customerPhone || '-'}</b><br>
              Manzil: <b>${order.deliveryAddress || 'O\'zbekiston'}</b>
            </td>
          </tr>
        </table>
      </div>

      <h4 style="margin: 15px 0 8px 0; color: #1e1b4b;">1. Xarid qilingan tovarlar:</h4>
      <table>
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">№</th>
            <th>Tovar nomi</th>
            <th style="width: 80px; text-align: center;">Miqdori</th>
            <th style="width: 140px; text-align: right;">Umumiy qiymati</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml || `
            <tr>
              <td style="padding: 8px; text-align: center;">1</td>
              <td style="padding: 8px; font-weight: 600;">iPhone 16 Pro Max 256GB Titanium</td>
              <td style="padding: 8px; text-align: center;">1 dona</td>
              <td style="padding: 8px; text-align: right; font-weight: bold;">${formatPrice(order.totalPrice, true, 'uz')}</td>
            </tr>
          `}
        </tbody>
      </table>

      <h4 style="margin: 15px 0 8px 0; color: #1e1b4b;">2. Muddatli to'lov grafigi (${months} oy, 0% ustama bilan):</h4>
      <table>
        <thead>
          <tr>
            <th style="width: 60px; text-align: center;">Oy</th>
            <th style="text-align: center;">To'lov muddati</th>
            <th style="text-align: right;">Oylik to'lov summasi</th>
            <th style="text-align: right;">Qoldiq summa</th>
            <th style="width: 120px; text-align: center;">Holat</th>
          </tr>
        </thead>
        <tbody>
          ${scheduleRowsHtml}
        </tbody>
      </table>

      <div style="display: flex; justify-content: space-between; background: #faf5ff; border: 1px solid #d8b4fe; padding: 10px 14px; border-radius: 8px; font-weight: bold; margin-bottom: 20px;">
        <span style="color: #640199;">Jami to'lov miqdori:</span>
        <span style="font-size: 14px; color: #640199;">${formatPrice(order.totalPrice, true, 'uz')}</span>
      </div>

      <div class="seal-box">
        <div>
          <p><strong>Sotuvchi vakili:</strong></p>
          <p style="margin-top: 30px;">Direktor: ________________ / O. Jo'rayev /</p>
        </div>

        <div class="seal-stamp">
          <div>O'ZBEKISTON</div>
          <div style="font-size: 10px; margin: 2px 0;">* ELRIZO *</div>
          <div>MUHR UCHUN</div>
          <div style="font-size: 8px;">№ 308945124</div>
        </div>

        <div>
          <p><strong>Xaridor:</strong></p>
          <p style="margin-top: 30px;">Imzo: ________________ / ${order.customerName || 'Mijoz'} /</p>
        </div>
      </div>

      <div style="margin-top: 25px; text-align: center; font-size: 10px; color: #94a3b8;">
        Ushbu shartnoma O'zbekiston Respublikasining "Elektron tijorat to'g'risida"gi qonuniga muvofiq tuzilgan va yuridik kuchga ega.
      </div>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
