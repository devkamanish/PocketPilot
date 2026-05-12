import { useMemo, useState, useCallback } from "react";
import { Text, View, Platform, Dimensions, TouchableOpacity, ActivityIndicator } from "react-native";
import { Bar, CartesianChart } from "victory-native";
import { useFont } from "@shopify/react-native-skia";
import { Card } from "../components/Card";
import { ScreenContainer } from "../components/ScreenContainer";
import { useFinanceStore } from "../store/financeStore";
import {
  burnRate,
  categorySpendMap,
  savingsRatio,
  subscriptionBurden,
  sumExpenses,
} from "../utils/calculations";
import { getAllCategories } from "../utils/categories";
import {
  filterExpensesByMonth,
  getAvailableMonths,
  getMonthLabel,
} from "../utils/dateFilters";
import { exportMonthlyPDF } from "../utils/pdfExport";
import Svg, { Path, Rect } from "react-native-svg";

const SCREEN_WIDTH = Dimensions.get("window").width;

const BAR_COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#f97316", // orange
  "#ec4899", // pink
];

// ─── Download Icon (SVG) ───────────────────────────────────────────────────────
const DownloadIcon = ({ color = "#3b82f6", size = 18 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Chevron Icons ─────────────────────────────────────────────────────────────
const ChevronLeft = ({ color = "#6b7280", size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ChevronRight = ({ color = "#6b7280", size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M9 18l6-6-6-6" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// ─── Metric Card ───────────────────────────────────────────────────────────────
const MetricCard = ({
  title,
  value,
  subtitle,
  accent,
}: {
  title: string;
  value: string;
  subtitle?: string;
  accent?: string;
}) => (
  <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-1 min-w-[45%] m-1">
    <Text className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">{title}</Text>
    <Text
      className="text-xl font-extrabold"
      style={{ color: accent ?? "#111827" }}
      numberOfLines={1}
      adjustsFontSizeToFit
    >
      {value}
    </Text>
    {subtitle && <Text className="text-xs text-gray-400 mt-1">{subtitle}</Text>}
  </View>
);

// ─── Breakdown Row ─────────────────────────────────────────────────────────────
const CategoryRow = ({
  category,
  amount,
  color,
  total,
}: {
  category: string;
  amount: number;
  color: string;
  total: number;
}) => {
  const pct = total > 0 ? (amount / total) * 100 : 0;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginRight: 8 }} />
      <Text style={{ fontSize: 12, color: "#4b5563", textTransform: "capitalize", flex: 1 }}>{category}</Text>
      <Text style={{ fontSize: 12, fontWeight: "700", color: "#111827", marginRight: 8 }}>₹{amount.toFixed(0)}</Text>
      <Text style={{ fontSize: 11, color: "#9ca3af", width: 36, textAlign: "right" }}>{pct.toFixed(0)}%</Text>
    </View>
  );
};

// ─── Chart (mobile only) ───────────────────────────────────────────────────────
const ChartView = ({ categoryData }: { categoryData: { category: string; amount: number }[] }) => {
  const font = useFont(require("../../assets/fonts/Inter-Regular.ttf"), 10);

  const count = categoryData.length;
  const chartWidth = SCREEN_WIDTH - 64;
  const barWidth = Math.min(28, Math.max(10, Math.floor((chartWidth * 0.5) / Math.max(count, 1))));

  return (
    <View style={{ height: 220 }}>
      <CartesianChart
        data={categoryData}
        xKey="category"
        yKeys={["amount"]}
        domainPadding={{ left: 24, right: 24, top: 20 }}
        axisOptions={{
          font,
          labelOffset: { x: 0, y: 8 },
          formatXLabel: (val) => {
            const s = String(val);
            return s.length > 5 ? s.slice(0, 4) + "…" : s;
          },
        }}
      >
        {({ points, chartBounds }) =>
          points.amount.map((point, i) => (
            <Bar
              key={i}
              points={[point]}
              chartBounds={chartBounds}
              color={BAR_COLORS[i % BAR_COLORS.length]}
              roundedCorners={{ topLeft: 5, topRight: 5, bottomLeft: 0, bottomRight: 0 }}
              animate={{ type: "timing", duration: 500 }}
              barWidth={barWidth}
            />
          ))
        }
      </CartesianChart>
    </View>
  );
};

// ─── Dashboard Screen ──────────────────────────────────────────────────────────
export const DashboardScreen = () => {
  const expenses = useFinanceStore((s) => s.expenses);
  const subscriptions = useFinanceStore((s) => s.subscriptions);
  const profile = useFinanceStore((s) => s.profile);
  const budgets = useFinanceStore((s) => s.budgets);

  // ── Month selector state ──
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [pdfLoading, setPdfLoading] = useState(false);

  // Available months for navigation bounds
  const availableMonths = useMemo(() => getAvailableMonths(expenses), [expenses]);

  // Check if we can navigate forward/backward
  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth();

  const goToPreviousMonth = useCallback(() => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  }, [selectedMonth]);

  const goToNextMonth = useCallback(() => {
    if (isCurrentMonth) return; // Don't go beyond current month
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  }, [selectedMonth, isCurrentMonth]);

  // ── Filtered expenses for selected month ──
  const monthlyExpenses = useMemo(
    () => filterExpensesByMonth(expenses, selectedYear, selectedMonth),
    [expenses, selectedYear, selectedMonth]
  );

  const totalSpend = sumExpenses(monthlyExpenses);
  const daysInSelectedMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const daysElapsed = isCurrentMonth
    ? Math.max(now.getDate(), 1)
    : daysInSelectedMonth; // For past months, use all days
  const ratio = savingsRatio(profile.income, totalSpend);
  const burden = subscriptionBurden(subscriptions, profile.income);
  const burn = burnRate(monthlyExpenses, daysElapsed);

  const allCategories = useMemo(() => getAllCategories(budgets), [budgets]);
  const spendMap = useMemo(() => categorySpendMap(monthlyExpenses), [monthlyExpenses]);

  const categoryData = useMemo(
    () => allCategories.map((category) => ({ category, amount: Number(spendMap[category] || 0) })),
    [allCategories, spendMap]
  );

  const spentCategories = categoryData.filter((d) => d.amount > 0);
  const ratioColor = ratio >= (profile.savingsGoal ?? 20) ? "#10b981" : "#ef4444";

  const monthLabel = getMonthLabel(selectedYear, selectedMonth);

  // ── PDF Export ──
  const handleExportPDF = useCallback(async () => {
    setPdfLoading(true);
    try {
      await exportMonthlyPDF(monthlyExpenses, selectedYear, selectedMonth, profile.income, profile.savingsGoal ?? 20);
    } catch (e) {
      console.warn("PDF export failed:", e);
    } finally {
      setPdfLoading(false);
    }
  }, [monthlyExpenses, selectedYear, selectedMonth, profile.income, profile.savingsGoal]);

  return (
    <ScreenContainer
      header={
        <View>
          <Text className="text-sm font-medium text-gray-500 tracking-wide uppercase">Overview</Text>
          <Text className="text-3xl font-extrabold text-gray-900">Dashboard</Text>
        </View>
      }
    >
      {/* Month Selector */}
      <View className="flex-row items-center justify-between bg-white rounded-2xl px-3 py-2.5 mb-3 border border-gray-100 shadow-sm">
        <TouchableOpacity
          onPress={goToPreviousMonth}
          style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}
          activeOpacity={0.7}
        >
          <ChevronLeft color="#374151" size={16} />
        </TouchableOpacity>

        <View style={{ alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
            {monthLabel}
          </Text>
          {isCurrentMonth && (
            <Text style={{ fontSize: 10, color: '#3b82f6', fontWeight: '600', marginTop: 1 }}>
              Current Month
            </Text>
          )}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {/* PDF Download Button */}
          <TouchableOpacity
            onPress={handleExportPDF}
            disabled={pdfLoading || monthlyExpenses.length === 0}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: monthlyExpenses.length > 0 ? '#eff6ff' : '#f9fafb',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            {pdfLoading ? (
              <ActivityIndicator size="small" color="#3b82f6" />
            ) : (
              <DownloadIcon color={monthlyExpenses.length > 0 ? "#3b82f6" : "#d1d5db"} size={16} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goToNextMonth}
            disabled={isCurrentMonth}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: isCurrentMonth ? '#f9fafb' : '#f3f4f6',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <ChevronRight color={isCurrentMonth ? "#d1d5db" : "#374151"} size={16} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Metric Cards */}
      <View className="flex-row flex-wrap justify-between mb-2">
        <MetricCard title="Total Spend" value={`₹${totalSpend.toFixed(0)}`} subtitle={isCurrentMonth ? "This month" : monthLabel} />
        <MetricCard title="Daily Burn" value={`₹${burn.toFixed(0)}`} subtitle="Per day" />
        <MetricCard
          title="Savings"
          value={`${ratio.toFixed(1)}%`}
          subtitle={`Goal: ${profile.savingsGoal}%`}
          accent={ratioColor}
        />
        <MetricCard title="Sub Burden" value={`${burden.toFixed(1)}%`} subtitle="Of income" />
      </View>

      {/* Chart Card */}
      <Card title="Spending by Category" className="mt-2">
        {Platform.OS === "web" ? (
          <View className="items-center justify-center py-10 bg-gray-50 rounded-xl border border-gray-100">
            <Text className="text-4xl mb-2">📊</Text>
            <Text className="text-gray-500 font-medium text-center">
              Interactive charts are available in the mobile app.
            </Text>
          </View>
        ) : categoryData.length === 0 ? (
          <View className="items-center justify-center py-10">
            <Text className="text-4xl mb-3">💸</Text>
            <Text className="text-gray-400 text-center">No expenses yet. Add your first expense!</Text>
          </View>
        ) : (
          <ChartView categoryData={categoryData} />
        )}
      </Card>

      {/* Breakdown Legend */}
      {spentCategories.length > 0 && (
        <Card title="Breakdown" className="mt-3">
          {spentCategories.map((item) => (
            <CategoryRow
              key={item.category}
              category={item.category}
              amount={item.amount}
              color={BAR_COLORS[categoryData.findIndex((d) => d.category === item.category) % BAR_COLORS.length]}
              total={totalSpend}
            />
          ))}
        </Card>
      )}

      <View className="h-6" />
    </ScreenContainer>
  );
};
