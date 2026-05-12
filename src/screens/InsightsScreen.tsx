import { useMemo } from "react";
import { Text, View, Platform, TouchableOpacity } from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { useFinanceStore } from "../store/financeStore";
import { generateInsights } from "../utils/calculations";
import { filterCurrentMonthExpenses } from "../utils/dateFilters";
import { cn } from "../utils/styles";

const InsightCard = ({ severity, message }: { severity: string, message: string }) => {
  const isWarning = severity === "warning";
  
  return (
    <View className={cn(
      "mb-3 rounded-2xl p-5 border",
      isWarning ? "bg-red-50 border-red-100" : "bg-primary-50 border-primary-100"
    )}>
      <View className="flex-row items-center mb-2">
        <View className={cn(
          "w-8 h-8 rounded-full items-center justify-center mr-3",
          isWarning ? "bg-red-100" : "bg-primary-100"
        )}>
           <Text className={cn("font-bold text-lg", isWarning ? "text-red-500" : "text-primary-500")}>
             {isWarning ? "!" : "💡"}
           </Text>
        </View>
        <Text className={cn("font-bold text-lg", isWarning ? "text-red-800" : "text-primary-800")}>
          {isWarning ? "Action Needed" : "Smart Insight"}
        </Text>
      </View>
      <Text className={cn("text-base leading-snug", isWarning ? "text-red-900" : "text-primary-900")}>
        {message}
      </Text>
    </View>
  );
};

export const InsightsScreen = ({ navigation }: { navigation?: any }) => {
  const expenses = useFinanceStore((s) => s.expenses);
  const budgets = useFinanceStore((s) => s.budgets);
  const profile = useFinanceStore((s) => s.profile);
  const error = useFinanceStore((s) => s.error);
  
  const insights = useMemo(
    () => generateInsights(filterCurrentMonthExpenses(expenses), budgets, profile),
    [expenses, budgets, profile]
  );

  return (
    <ScreenContainer
      header={
        <View className="flex-row items-center">
          {navigation?.canGoBack?.() && Platform.OS !== 'web' && (
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
              <Text className="text-xl font-bold text-gray-600">‹</Text>
            </TouchableOpacity>
          )}
          <View>
            <Text className="text-sm font-medium text-gray-500 tracking-wide uppercase">Analysis</Text>
            <Text className="text-3xl font-extrabold text-gray-900">AI Insights</Text>
            <Text className="text-base text-gray-500 mt-1">Rule-based guidance for your spending patterns.</Text>
          </View>
        </View>
      }
    >

      {error ? (
        <View className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex-row items-center">
          <Text className="text-amber-500 text-xl mr-3 font-bold">⚠️</Text>
          <View className="flex-1">
            <Text className="text-amber-800 font-bold mb-1">Sync Warning</Text>
            <Text className="text-amber-700 text-sm">{error}</Text>
          </View>
        </View>
      ) : null}

      <View className="px-1">
        {insights.length === 0 ? (
          <View className="items-center justify-center py-10 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mt-2">
            <View className="w-16 h-16 bg-primary-50 rounded-full items-center justify-center mb-4">
              <Text className="text-2xl">✨</Text>
            </View>
            <Text className="text-gray-900 font-bold text-lg text-center">Looking good!</Text>
            <Text className="text-gray-500 text-center mt-2 text-balance">
              No critical insights at the moment. Keep tracking your spending to see more recommendations.
            </Text>
          </View>
        ) : null}

        {insights.map((item) => (
          <InsightCard key={item.id} severity={item.severity} message={item.message} />
        ))}
      </View>
      
      <View className="h-6" />
    </ScreenContainer>
  );
};
