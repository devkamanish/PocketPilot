import { useState, useMemo } from "react";
import { Text, View, ScrollView } from "react-native";
import { Card } from "../components/Card";
import { ScreenContainer } from "../components/ScreenContainer";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { useAuthStore } from "../store/authStore";
import { useFinanceStore } from "../store/financeStore";
import { ExpenseCategory } from "../types/models";
import { categorySpendMap } from "../utils/calculations";
import { cn } from "../utils/styles";

const ProgressBar = ({ spent, limit }: { spent: number; limit: number }) => {
  const percentage = Math.min((spent / limit) * 100, 100);
  const isOver = spent > limit;
  const isWarning = percentage > 85 && !isOver;

  return (
    <View className="mt-3">
      <View className="flex-row justify-between mb-1.5">
        <Text className="text-xs font-semibold text-gray-500">
          ₹{spent.toFixed(0)} spent
        </Text>
        <Text className="text-xs font-semibold text-gray-500">
          ₹{limit.toFixed(0)} limit
        </Text>
      </View>
      <View className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <View 
          className={cn(
            "h-full rounded-full",
            isOver ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-primary-500"
          )}
          style={{ width: `${percentage}%` }}
        />
      </View>
      {isOver && (
        <Text className="text-xs text-red-500 mt-1 font-medium text-right">
          Over budget by ₹{(spent - limit).toFixed(0)}
        </Text>
      )}
    </View>
  );
};

export const BudgetsScreen = () => {
  const session = useAuthStore((s) => s.session);
  const budgets = useFinanceStore((s) => s.budgets);
  const expenses = useFinanceStore((s) => s.expenses);
  const upsertBudget = useFinanceStore((s) => s.upsertBudget);

  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    if (!session?.user.id || !category || !limit) return;
    setLoading(true);
    await upsertBudget({
      id: `${session.user.id}-${category.toLowerCase()}`,
      user_id: session.user.id,
      category: category.toLowerCase() as ExpenseCategory,
      limit: Number(limit),
    });
    setCategory("");
    setLimit("");
    setLoading(false);
  };

  const spends = useMemo(() => categorySpendMap(expenses), [expenses]);

  return (
    <ScreenContainer
      header={
        <View>
          <Text className="text-sm font-medium text-gray-500 tracking-wide uppercase">Planning</Text>
          <Text className="text-3xl font-extrabold text-gray-900">Budgets</Text>
        </View>
      }
    >

      <Card title="Set Category Budget" className="mb-4">
        <Input 
          label="Category"
          placeholder="e.g. food, transport"
          value={category} 
          onChangeText={setCategory} 
          autoCapitalize="none"
        />
        <Input
          label="Monthly Limit (₹)"
          value={limit}
          onChangeText={setLimit}
          keyboardType="numeric"
          placeholder="0.00"
        />
        <Button 
          title="Save Budget" 
          onPress={onSave} 
          loading={loading}
          className="mt-2"
        />
      </Card>
      
      {budgets.length > 0 && (
        <View className="px-2 mb-2 mt-2">
          <Text className="text-lg font-bold text-gray-900">Your Budgets</Text>
        </View>
      )}

      {budgets.map((b) => {
        const spent = spends[b.category] || 0;
        return (
          <Card key={b.id} className="mb-3">
            <View className="flex-row justify-between items-center mb-1">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-primary-50 items-center justify-center mr-3">
                  <Text className="text-primary-600 font-bold uppercase text-xs">{b.category.substring(0,2)}</Text>
                </View>
                <Text className="text-lg font-bold text-gray-900 capitalize">{b.category}</Text>
              </View>
              <Text className="text-base font-bold text-primary-600">
                ₹{(b.limit - spent > 0 ? b.limit - spent : 0).toFixed(0)} <Text className="text-sm font-normal text-gray-400">left</Text>
              </Text>
            </View>
            <ProgressBar spent={spent} limit={b.limit} />
          </Card>
        );
      })}
      
      {budgets.length === 0 ? (
        <View className="items-center justify-center py-10">
          <Text className="text-gray-400 text-center px-4">You haven't set any budgets yet. Add one above to start tracking your limits.</Text>
        </View>
      ) : null}
      
      <View className="h-6" />
    </ScreenContainer>
  );
};
