import { useState, useMemo } from "react";
import { Text, View, TouchableOpacity, Alert, Platform } from "react-native";
import { ScreenContainer } from "../../components/ScreenContainer";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useFinanceStore } from "../../store/financeStore";
import { cn } from "../../utils/styles";

export const TransactionsScreen = () => {
  const expenses = useFinanceStore((s) => s.expenses);
  const deleteExpense = useFinanceStore((s) => s.deleteExpense);
  const updateExpense = useFinanceStore((s) => s.updateExpense);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [amountDraft, setAmountDraft] = useState("");
  const [noteDraft, setNoteDraft] = useState("");

  const startEdit = (id: string, amount: number, note: string) => {
    setEditingId(id);
    setAmountDraft(String(amount));
    setNoteDraft(note);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await updateExpense(editingId, {
      amount: Number(amountDraft),
      note: noteDraft,
    });
    setEditingId(null);
    setAmountDraft("");
    setNoteDraft("");
  };
  
  // Sort expenses by date descending
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses]);

  return (
    <ScreenContainer
      header={
        <View>
          <Text className="text-sm font-medium text-gray-500 tracking-wide uppercase">History</Text>
          <Text className="text-3xl font-extrabold text-gray-900">Transactions</Text>
        </View>
      }
    >

      {sortedExpenses.length === 0 ? (
        <View className="items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 mt-4">
          <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
             <Text className="text-gray-400 text-2xl font-bold">📄</Text>
          </View>
          <Text className="text-gray-500 font-medium text-lg">No transactions yet.</Text>
          <Text className="text-gray-400 text-sm mt-1">Your expenses will appear here.</Text>
        </View>
      ) : (
        <View className="bg-white rounded-3xl shadow-sm border border-gray-100 mt-2 overflow-hidden">
          {sortedExpenses.map((item, index) => {
            const isEditing = editingId === item.id;
            const isLast = index === sortedExpenses.length - 1;
            
            return (
              <View 
                key={item.id} 
                className={cn("p-5", !isLast && "border-b border-gray-100")}
              >
                {!isEditing ? (
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center flex-1">
                      <View className="w-12 h-12 bg-primary-50 rounded-2xl items-center justify-center mr-4">
                        <Text className="text-primary-600 font-bold uppercase text-xs">{item.category.substring(0, 2)}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-bold text-gray-900 capitalize" numberOfLines={1}>
                          {item.note || item.category}
                        </Text>
                        <Text className="text-xs text-gray-400 mt-1 capitalize">
                          {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {item.category} {!item.synced ? "• (Offline)" : ""}
                        </Text>
                      </View>
                    </View>
                    
                    <View className="items-end justify-center ml-2">
                      <Text className="text-base font-bold text-gray-900 mb-1">
                        - ₹{item.amount.toFixed(2)}
                      </Text>
                      <View className="flex-row gap-3">
                        <TouchableOpacity onPress={() => startEdit(item.id, item.amount, item.note)}>
                          <Text className="text-primary-600 font-semibold text-xs py-1">Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                          if (Platform.OS === 'web') {
                            if (window.confirm("Are you sure you want to delete this expense?")) {
                              deleteExpense(item.id);
                            }
                          } else {
                            Alert.alert("Delete", "Are you sure?", [
                              { text: "Cancel", style: "cancel" },
                              { text: "Delete", style: "destructive", onPress: () => deleteExpense(item.id) }
                            ]);
                          }
                        }}>
                          <Text className="text-red-500 font-semibold text-xs py-1">Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View className="bg-surface-dim p-4 rounded-2xl gap-3">
                    <Text className="font-bold text-gray-900 mb-1">Edit Transaction</Text>
                    <Input
                      value={amountDraft}
                      onChangeText={setAmountDraft}
                      placeholder="Amount"
                      keyboardType="decimal-pad"
                    />
                    <Input
                      value={noteDraft}
                      onChangeText={setNoteDraft}
                      placeholder="Note"
                    />
                    <View className="flex-row gap-3 mt-2">
                      <Button title="Save" onPress={saveEdit} className="flex-1" size="sm" />
                      <Button title="Cancel" variant="secondary" onPress={() => setEditingId(null)} className="flex-1" size="sm" />
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
      <View className="h-6" />
    </ScreenContainer>
  );
};
