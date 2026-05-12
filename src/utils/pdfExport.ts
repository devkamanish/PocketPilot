import { Expense } from "../types/models";
import { categorySpendMap, sumExpenses } from "./calculations";
import { getMonthLabel } from "./dateFilters";

/**
 * Generates professional HTML for the expense report.
 */
const generateExpenseHTML = (
  expenses: Expense[],
  year: number,
  month: number,
  income: number,
  savingsGoal: number
): string => {
  const monthLabel = getMonthLabel(year, month);
  const total = sumExpenses(expenses);
  const categoryMap = categorySpendMap(expenses);
  const savings = income > 0 ? ((income - total) / income) * 100 : 0;
  const dailyAvg = expenses.length > 0
    ? total / new Date(year, month + 1, 0).getDate()
    : 0;
  const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];

  const sorted = [...expenses].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const categoryRows = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => {
      const pct = total > 0 ? ((amount / total) * 100).toFixed(1) : "0";
      const txnCount = expenses.filter((e) => e.category === cat).length;
      return `<tr>
        <td style="padding:10px 14px;text-transform:capitalize;border-bottom:1px solid #f1f5f9;">${cat}</td>
        <td style="padding:10px 14px;text-align:right;font-weight:700;border-bottom:1px solid #f1f5f9;">₹${amount.toFixed(2)}</td>
        <td style="padding:10px 14px;text-align:right;color:#6b7280;border-bottom:1px solid #f1f5f9;">${pct}%</td>
        <td style="padding:10px 14px;text-align:center;color:#6b7280;border-bottom:1px solid #f1f5f9;">${txnCount}</td>
      </tr>`;
    })
    .join("");

  const txnRows = sorted
    .map((e, i) => `<tr>
      <td style="padding:8px 12px;text-align:center;color:#9ca3af;border-bottom:1px solid #f1f5f9;font-size:11px;">${i + 1}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;">${new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
      <td style="padding:8px 12px;text-transform:capitalize;border-bottom:1px solid #f1f5f9;">${e.category}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#374151;">${e.note || "—"}</td>
      <td style="padding:8px 12px;text-align:right;font-weight:600;border-bottom:1px solid #f1f5f9;">₹${e.amount.toFixed(2)}</td>
    </tr>`)
    .join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>PocketPilot — ${monthLabel}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#111827;background:#fff;}
.header{background:#3b82f6;color:#fff;padding:24px 28px;}
.header h1{font-size:24px;margin-bottom:2px;}
.header .sub{font-size:12px;opacity:0.85;}
.header .period{font-size:14px;margin-top:4px;font-weight:600;}
.content{padding:24px 28px;}
.summary{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:28px;}
.summary-card{flex:1;min-width:140px;background:#f8fafc;border-radius:12px;padding:14px;border:1px solid #e2e8f0;}
.summary-card .label{font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;}
.summary-card .value{font-size:20px;font-weight:800;}
.section-title{font-size:16px;font-weight:700;margin-bottom:10px;color:#1e293b;}
table{width:100%;border-collapse:collapse;margin-bottom:28px;}
th{text-align:left;padding:10px 14px;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#fff;background:#3b82f6;}
th:last-child{text-align:right;}
.total-row td{font-weight:700;background:#eff6ff;border-top:2px solid #3b82f6;}
.footer{text-align:center;font-size:10px;color:#9ca3af;padding:16px 0;border-top:1px solid #e2e8f0;margin-top:20px;}
@media print{body{padding:0;}.header{print-color-adjust:exact;-webkit-print-color-adjust:exact;}th{print-color-adjust:exact;-webkit-print-color-adjust:exact;}}
</style></head><body>
<div class="header">
  <h1>PocketPilot</h1>
  <div class="sub">Monthly Expense Report</div>
  <div class="period">${monthLabel}</div>
</div>
<div class="content">
  <div class="summary">
    <div class="summary-card"><div class="label">Total Spent</div><div class="value" style="color:#ef4444;">₹${total.toFixed(2)}</div></div>
    <div class="summary-card"><div class="label">Transactions</div><div class="value" style="color:#3b82f6;">${expenses.length}</div></div>
    <div class="summary-card"><div class="label">Daily Average</div><div class="value" style="color:#8b5cf6;">₹${dailyAvg.toFixed(2)}</div></div>
    ${topCategory ? `<div class="summary-card"><div class="label">Top Category</div><div class="value" style="color:#f59e0b;font-size:16px;text-transform:capitalize;">${topCategory[0]}</div></div>` : ""}
    ${income > 0 ? `
    <div class="summary-card"><div class="label">Income</div><div class="value" style="color:#10b981;">₹${income.toFixed(0)}</div></div>
    <div class="summary-card"><div class="label">Savings Rate</div><div class="value" style="color:${savings >= savingsGoal ? '#10b981' : '#ef4444'};">${savings.toFixed(1)}%</div></div>
    ` : ""}
  </div>

  <h2 class="section-title">Category Breakdown</h2>
  <table>
    <thead><tr><th>Category</th><th style="text-align:right">Amount</th><th style="text-align:right">Share</th><th style="text-align:center">Txns</th></tr></thead>
    <tbody>${categoryRows || '<tr><td colspan="4" style="text-align:center;padding:20px;color:#9ca3af;">No expenses</td></tr>'}</tbody>
  </table>

  <h2 class="section-title">All Transactions</h2>
  <table>
    <thead><tr><th style="text-align:center">#</th><th>Date</th><th>Category</th><th>Note</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>
      ${txnRows || '<tr><td colspan="5" style="text-align:center;padding:20px;color:#9ca3af;">No transactions</td></tr>'}
      ${expenses.length > 0 ? `<tr class="total-row"><td></td><td></td><td></td><td style="padding:10px 12px;text-align:right;">Total</td><td style="padding:10px 12px;text-align:right;">₹${total.toFixed(2)}</td></tr>` : ""}
    </tbody>
  </table>

  <div class="footer">
    Generated by PocketPilot on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
  </div>
</div>
</body></html>`;
};

/**
 * Native PDF export — generates PDF via expo-print and shares via expo-sharing.
 */
export const exportMonthlyPDF = async (
  expenses: Expense[],
  year: number,
  month: number,
  income: number,
  savingsGoal: number
): Promise<void> => {
  const html = generateExpenseHTML(expenses, year, month, income, savingsGoal);
  const monthLabel = getMonthLabel(year, month).replace(/\s+/g, "_");

  const Print = await import("expo-print");
  const Sharing = await import("expo-sharing");

  const { uri } = await Print.printToFileAsync({ html, base64: false });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `PocketPilot_${monthLabel}`,
      UTI: "com.adobe.pdf",
    });
  }
};
