import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { MonthlySettlementSummary, Room } from '../types';
import { translations, Language, formatCurrency, formatDigits } from '../i18n/translations';

export const generateAndSharePdf = async (
  summary: MonthlySettlementSummary,
  room: Room,
  lang: Language
) => {
  const t = translations[lang];

  const memberRowsHtml = summary.memberResults.map((m, idx) => {
    const isRefund = m.netBalance >= 0;
    const balanceText = isRefund
      ? `+${formatCurrency(m.netBalance, lang)} (${t.refund})`
      : `${formatCurrency(m.netBalance, lang)} (${t.due})`;
    const balanceColor = isRefund ? '#15803d' : '#b91c1c';

    return `
      <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
        <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">${m.userName}</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">${formatDigits(m.totalMeals, lang)}</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">${formatCurrency(m.personalMealCost, lang)}</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">${formatCurrency(m.personalUtilityShare, lang)}</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${formatCurrency(m.totalPersonalCost, lang)}</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">${formatCurrency(m.personalJoma || m.personalBazarSpent, lang)}</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold; color: ${balanceColor};">${balanceText}</td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Settlement Report - ${summary.monthString}</title>
        <style>
          body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; padding: 25px; color: #1e293b; }
          .header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #0f172a; margin: 0; }
          .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }
          .meta-grid { display: flex; justify-content: space-between; margin-bottom: 20px; background: #f1f5f9; padding: 12px; border-radius: 8px; }
          .meta-item { font-size: 13px; font-weight: 600; }
          .summary-cards { display: flex; justify-content: space-between; margin-bottom: 25px; }
          .card { flex: 1; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin: 0 4px; text-align: center; }
          .card-title { font-size: 11px; color: #166534; font-weight: 600; text-transform: uppercase; }
          .card-val { font-size: 18px; color: #0f766e; font-weight: bold; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
          th { background-color: #0d9488; color: #ffffff; padding: 10px; border: 1px solid #0f766e; text-align: center; }
          .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${room.name}</div>
          <div class="subtitle">${t.appName} — ${t.settlement} (${summary.monthString})</div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">${t.roomCode}: <strong>${room.roomCode}</strong></div>
          <div class="meta-item">${t.selectMode}: <strong>${room.mode}</strong></div>
          <div class="meta-item">${t.activeMonth}: <strong>${formatDigits(summary.monthString, lang)}</strong></div>
        </div>

        <div class="summary-cards">
          <div class="card">
            <div class="card-title">${t.mealRate}</div>
            <div class="card-val">${formatCurrency(summary.mealRate, lang)}</div>
          </div>
          <div class="card">
            <div class="card-title">${t.totalMeals}</div>
            <div class="card-val">${formatDigits(summary.totalRoomMeals, lang)}</div>
          </div>
          <div class="card">
            <div class="card-title">${t.totalBazar}</div>
            <div class="card-val">${formatCurrency(summary.totalBazarExpense, lang)}</div>
          </div>
          <div class="card">
            <div class="card-title">${t.totalUtilities}</div>
            <div class="card-val">${formatCurrency(summary.totalUtilityBills, lang)}</div>
          </div>
        </div>

        <h3 style="color: #0f172a; border-left: 4px solid #0d9488; padding-left: 8px;">${t.denaPaona} Summary Ledger</h3>

        <table>
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Meals</th>
              <th>Meal Cost</th>
              <th>Utility Share</th>
              <th>Total Cost</th>
              <th>Joma / Bazar</th>
              <th>Dena-Paona Net</th>
            </tr>
          </thead>
          <tbody>
            ${memberRowsHtml}
          </tbody>
        </table>

        <div class="footer">
          Generated automatically by Mess Meal Manager App on ${new Date().toLocaleDateString()}
        </div>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html: htmlContent });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
  }
};
