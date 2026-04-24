import { Text, View, Platform } from "react-native";
import { Bar, CartesianChart } from "victory-native";
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

const MetricCard = ({ title, value, subtitle }: { title: string, value: string, subtitle?: string }) => (
  <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-1 min-w-[45%] m-1">
    <Text className="text-sm font-medium text-gray-500 mb-1">{title}</Text>
    <Text className="text-2xl font-bold text-gray-900">{value}</Text>
    {subtitle && <Text className="text-xs text-gray-400 mt-1">{subtitle}</Text>}
  </View>
);

export const DashboardScreen = () => {
  const expenses = useFinanceStore((s) => s.expenses);
  const subscriptions = useFinanceStore((s) => s.subscriptions);
  const profile = useFinanceStore((s) => s.profile);

  const totalSpend = sumExpenses(expenses);
  const ratio = savingsRatio(profile.income, totalSpend);
  const burden = subscriptionBurden(subscriptions, profile.income);
  const burn = burnRate(expenses, new Date().getDate());
  const categoryData = Object.entries(categorySpendMap(expenses)).map(([category, amount]) => ({
    category,
    amount: Number(amount),
  }));

  return (
    <ScreenContainer
      header={
        <View>
          <Text className="text-sm font-medium text-gray-500 tracking-wide uppercase">Overview</Text>
          <Text className="text-3xl font-extrabold text-gray-900">Dashboard</Text>
        </View>
      }
    >

      <View className="flex-row flex-wrap justify-between">
        <MetricCard 
          title="Total Spend" 
          value={`₹${totalSpend.toFixed(2)}`} 
          subtitle="This month"
        />
        <MetricCard 
          title="Burn Rate" 
          value={`₹${burn.toFixed(2)}`} 
          subtitle="Per day"
        />
        <MetricCard 
          title="Savings Ratio" 
          value={`${ratio.toFixed(1)}%`} 
          subtitle={`Goal: ${profile.savingsGoal}%`}
        />
        <MetricCard 
          title="Sub Burden" 
          value={`${burden.toFixed(1)}%`} 
          subtitle="Of monthly income"
        />
      </View>

      <Card title="Spending by Category" className="mt-2">
        {categoryData.length === 0 ? (
          <View className="items-center justify-center py-8">
            <Text className="text-gray-400">No expenses recorded yet.</Text>
          </View>
        ) : null}
        
        {categoryData.length > 0 ? (
          <View style={{ height: 250, justifyContent: 'center' }}>
            {Platform.OS === 'web' ? (
              <View className="items-center justify-center flex-1 bg-gray-50 rounded-xl border border-gray-100">
                <Text className="text-2xl mb-2">📊</Text>
                <Text className="text-gray-500 font-medium text-center px-4">
                  Interactive charts are optimized for the mobile app! Open on iOS or Android.
                </Text>
              </View>
            ) : (
              <CartesianChart data={categoryData} xKey="category" yKeys={["amount"]} domainPadding={20}>
                {({ points, chartBounds }) => (
                  <Bar
                    points={points.amount}
                    chartBounds={chartBounds}
                    color="#3b82f6" // primary-500
                    roundedCorners={{ topLeft: 6, topRight: 6, bottomLeft: 6, bottomRight: 6 }}
                    animate={{ type: "timing", duration: 600 }}
                    barWidth={24}
                  />
                )}
              </CartesianChart>
            )}
          </View>
        ) : null}
      </Card>
      
      <View className="h-4" /> 
    </ScreenContainer>
  );
};
