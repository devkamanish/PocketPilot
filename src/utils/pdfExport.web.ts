import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Expense } from "../types/models";
import { categorySpendMap, sumExpenses } from "./calculations";
import { getMonthLabel } from "./dateFilters";

/**
 * Web-specific PDF export using jsPDF — triggers a real .pdf download.
 */
export const exportMonthlyPDF = async (
  expenses: Expense[],
  year: number,
  month: number,
  income: number,
  savingsGoal: number
): Promise<void> => {
  const monthLabel = getMonthLabel(year, month);
  const total = sumExpenses(expenses);
  const categoryMap = categorySpendMap(expenses);
  const sorted = [...expenses].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const dailyAvg = expenses.length > 0
    ? total / new Date(year, month + 1, 0).getDate()
    : 0;

  // Find top category
  const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── Header ──
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("PocketPilot", 14, 16);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Monthly Expense Report", 14, 23);
  doc.setFontSize(11);
  doc.text(monthLabel, 14, 30);
  doc.setFontSize(9);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
    pageWidth - 14,
    30,
    { align: "right" }
  );

  // ── Summary Section ──
  let y = 46;
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 14, y);
  y += 2;

  const summaryData: string[][] = [
    ["Total Spent", `₹${total.toFixed(2)}`],
    ["Transactions", `${expenses.length}`],
    ["Daily Average", `₹${dailyAvg.toFixed(2)}`],
  ];

  if (topCategory) {
    summaryData.push(["Top Category", `${topCategory[0]} (₹${topCategory[1].toFixed(2)})`]);
  }
  if (income > 0) {
    const savings = ((income - total) / income) * 100;
    summaryData.push(["Monthly Income", `₹${income.toFixed(2)}`]);
    summaryData.push(["Savings Rate", `${savings.toFixed(1)}%`]);
    summaryData.push(["Savings Goal", `${savingsGoal}%`]);
  }

  autoTable(doc, {
    startY: y,
    head: [],
    body: summaryData,
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: "bold", textColor: [107, 114, 128], cellWidth: 50 },
      1: { fontStyle: "bold", textColor: [17, 24, 39] },
    },
    margin: { left: 14, right: 14 },
  });

  // ── Category Breakdown ──
  y = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("Category Breakdown", 14, y);
  y += 2;

  const categoryRows = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => {
      const pct = total > 0 ? ((amount / total) * 100).toFixed(1) : "0";
      const txnCount = expenses.filter((e) => e.category === cat).length;
      return [cat.charAt(0).toUpperCase() + cat.slice(1), `₹${amount.toFixed(2)}`, `${pct}%`, `${txnCount}`];
    });

  if (categoryRows.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Category", "Amount", "Share", "Txns"]],
      body: categoryRows,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246], fontSize: 9, fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "center" },
      },
      margin: { left: 14, right: 14 },
    });
  }

  // ── All Transactions ──
  y = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 12 : y + 10;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text("All Transactions", 14, y);
  y += 2;

  const txnRows = sorted.map((e, i) => [
    `${i + 1}`,
    new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    e.category.charAt(0).toUpperCase() + e.category.slice(1),
    e.note || "—",
    `₹${e.amount.toFixed(2)}`,
  ]);

  // Add total row
  txnRows.push(["", "", "", "Total", `₹${total.toFixed(2)}`]);

  autoTable(doc, {
    startY: y,
    head: [["#", "Date", "Category", "Note", "Amount"]],
    body: txnRows,
    theme: "striped",
    headStyles: { fillColor: [59, 130, 246], fontSize: 9, fontStyle: "bold" },
    styles: { fontSize: 8.5, cellPadding: 3.5 },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: 28 },
      2: { cellWidth: 30 },
      4: { halign: "right", fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
    didParseCell: (data: any) => {
      // Bold total row
      if (data.row.index === txnRows.length - 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [239, 246, 255];
      }
    },
  });

  // ── Footer on every page ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      "PocketPilot — Monthly Expense Report",
      14,
      doc.internal.pageSize.getHeight() - 10
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 10,
      { align: "right" }
    );
  }

  // ── Trigger download ──
  const fileName = `PocketPilot_${monthLabel.replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
};
