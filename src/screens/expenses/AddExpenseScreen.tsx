import { useState } from "react";
import { Alert, Text, View, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import Toast from "react-native-toast-message";
import { ScreenContainer } from "../../components/ScreenContainer";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useAuthStore } from "../../store/authStore";
import { useFinanceStore } from "../../store/financeStore";
import { ExpenseCategory } from "../../types/models";
import { cn } from "../../utils/styles";
import { categorySpendMap } from "../../utils/calculations";
import { filterCurrentMonthExpenses } from "../../utils/dateFilters";
import { getAllCategories } from "../../utils/categories";

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export const AddExpenseScreen = ({ navigation }: { navigation: any }) => {
  const session = useAuthStore((s) => s.session);
  const addExpense = useFinanceStore((s) => s.addExpense);
  const financeError = useFinanceStore((s) => s.error);
  const budgets = useFinanceStore((s) => s.budgets);

  const CATEGORIES = getAllCategories(budgets);

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory | string>("food");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const performSave = async (parsed: number) => {
    setLoading(true);
    try {
      await addExpense({
        id: `${Date.now()}`,
        user_id: session!.user.id,
        amount: parsed,
        category: category as ExpenseCategory,
        note,
        date: new Date().toISOString(),
      });
      setAmount("");
      setNote("");
      
      Toast.show({ type: "success", text1: "Success", text2: "Expense added!" });
      navigation?.navigate("Dashboard");
    } catch (error: any) {
      showAlert("Save failed", error?.message ?? "Unable to save expense.");
    } finally {
      setLoading(false);
    }
  };

  const onAdd = async () => {
    if (!session?.user.id) {
      showAlert("Not logged in", "Please login again.");
      return;
    }
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      showAlert("Invalid amount", "Enter an amount greater than 0.");
      return;
    }
    
    const state = useFinanceStore.getState();
    const budget = budgets.find((b) => b.category === category);
    
    if (budget) {
      const spends = categorySpendMap(filterCurrentMonthExpenses(state.expenses));
      const spent = spends[category as string] || 0;
      if (spent + parsed > budget.limit) {
        const overflow = (spent + parsed) - budget.limit;
        if (Platform.OS === 'web') {
          if (!window.confirm(`Limit Reached! This expense exceeds your ${category} budget by ₹${overflow.toFixed(2)}.\n\nDo you still want to proceed?`)) {
            return;
          }
        } else {
          Alert.alert(
            "Limit Reached",
            `This expense exceeds your ${category} budget by ₹${overflow.toFixed(2)}.\n\nDo you still want to proceed?`,
            [
               { text: "Cancel", style: "cancel" },
               { text: "Yes, Add It", style: "destructive", onPress: () => performSave(parsed) }
            ]
          );
          return;
        }
      }
    }
    
    await performSave(parsed);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-surface-dim">
      <ScreenContainer
        header={
          <View>
            <Text className="text-3xl font-extrabold text-gray-900 tracking-tight">Add Expense</Text>
            <Text className="text-base text-gray-500 mt-1">Track your spending to reach your goals.</Text>
          </View>
        }
      >

        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <Input
            label="Amount (₹)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            className="text-2xl font-semibold"
          />

          <Text className="text-gray-700 font-medium mb-3 ml-1 mt-2">Category</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.7}
                onPress={() => setCategory(cat)}
                className={cn(
                  "px-4 py-2 border rounded-full",
                  category === cat 
                    ? "bg-primary-500 border-primary-500" 
                    : "bg-white border-gray-200"
                )}
              >
                <Text 
                  className={cn(
                    "font-medium capitalize text-sm",
                    category === cat ? "text-white" : "text-gray-600"
                  )}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input 
            label="Quick Note"
            value={note} 
            onChangeText={setNote} 
            placeholder="What was this for?" 
            maxLength={100}
          />

          {financeError ? <Text className="text-red-500 text-sm mt-1 mb-3 text-center">{financeError}</Text> : null}
          
          <Button 
            title="Record Expense" 
            onPress={onAdd} 
            loading={loading}
            className="mt-4"
          />
        </View>



      </ScreenContainer>
    </KeyboardAvoidingView>
  );
};
