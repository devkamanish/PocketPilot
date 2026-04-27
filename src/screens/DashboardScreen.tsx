import { useMemo } from "react";
import { Text, View, Platform, Dimensions } from "react-native";
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

  const totalSpend = sumExpenses(expenses);
  const ratio = savingsRatio(profile.income, totalSpend);
  const burden = subscriptionBurden(subscriptions, profile.income);
  const burn = burnRate(expenses, Math.max(new Date().getDate(), 1));

  const allCategories = useMemo(() => getAllCategories(budgets), [budgets]);
  const spendMap = useMemo(() => categorySpendMap(expenses), [expenses]);

  const categoryData = useMemo(
    () => allCategories.map((category) => ({ category, amount: Number(spendMap[category] || 0) })),
    [allCategories, spendMap]
  );

  const spentCategories = categoryData.filter((d) => d.amount > 0);
  const ratioColor = ratio >= (profile.savingsGoal ?? 20) ? "#10b981" : "#ef4444";

  return (
    <ScreenContainer
      header={
        <View>
          <Text className="text-sm font-medium text-gray-500 tracking-wide uppercase">Overview</Text>
          <Text className="text-3xl font-extrabold text-gray-900">Dashboard</Text>
        </View>
      }
    >
      {/* Metric Cards */}
      <View className="flex-row flex-wrap justify-between mb-2">
        <MetricCard title="Total Spend" value={`₹${totalSpend.toFixed(0)}`} subtitle="This month" />
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
