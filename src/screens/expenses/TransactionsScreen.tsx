import { useState, useMemo, useCallback } from "react";
import { Text, View, TouchableOpacity, Alert, Platform, ActivityIndicator } from "react-native";
import Svg, { Path } from "react-native-svg";
import { ScreenContainer } from "../../components/ScreenContainer";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { useFinanceStore } from "../../store/financeStore";
import { filterExpensesByMonth, getMonthLabel } from "../../utils/dateFilters";
import { exportMonthlyPDF } from "../../utils/pdfExport";
import { cn } from "../../utils/styles";

// ─── SVG Icons ─────────────────────────────────────────────────────────────────
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
const DownloadIcon = ({ color = "#3b82f6", size = 16 }: { color?: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3v12m0 0l-4-4m4 4l4-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export const TransactionsScreen = () => {
  const expenses = useFinanceStore((s) => s.expenses);
  const profile = useFinanceStore((s) => s.profile);
  const deleteExpense = useFinanceStore((s) => s.deleteExpense);
  const updateExpense = useFinanceStore((s) => s.updateExpense);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [amountDraft, setAmountDraft] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  // ── Month filter state ──
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [showAll, setShowAll] = useState(false);

  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth();
  const monthLabel = getMonthLabel(selectedYear, selectedMonth);

  const goToPreviousMonth = useCallback(() => {
    setShowAll(false);
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  }, [selectedMonth]);

  const goToNextMonth = useCallback(() => {
    if (isCurrentMonth) return;
    setShowAll(false);
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  }, [selectedMonth, isCurrentMonth]);

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

  // ── Filtered & sorted expenses ──
  const filteredExpenses = useMemo(() => {
    if (showAll) return expenses;
    return filterExpensesByMonth(expenses, selectedYear, selectedMonth);
  }, [expenses, selectedYear, selectedMonth, showAll]);

  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredExpenses]);

  // ── PDF Export ──
  const handleExportPDF = useCallback(async () => {
    setPdfLoading(true);
    try {
      await exportMonthlyPDF(
        filteredExpenses,
        selectedYear,
        selectedMonth,
        profile.income,
        profile.savingsGoal ?? 20
      );
    } catch (e) {
      console.warn("PDF export failed:", e);
    } finally {
      setPdfLoading(false);
    }
  }, [filteredExpenses, selectedYear, selectedMonth, profile.income, profile.savingsGoal]);

  // ── Count + total for header info ──
  const monthTotal = useMemo(
    () => filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
    [filteredExpenses]
  );

  return (
    <ScreenContainer
      header={
        <View>
          <Text className="text-sm font-medium text-gray-500 tracking-wide uppercase">History</Text>
          <Text className="text-3xl font-extrabold text-gray-900">Transactions</Text>
        </View>
      }
    >
      {/* Month Selector */}
      <View className="bg-white rounded-2xl px-3 py-2.5 mb-2 border border-gray-100 shadow-sm">
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={goToPreviousMonth}
            disabled={showAll}
            style={{
              width: 36, height: 36, borderRadius: 12,
              backgroundColor: showAll ? '#f9fafb' : '#f3f4f6',
              alignItems: 'center', justifyContent: 'center',
            }}
            activeOpacity={0.7}
          >
            <ChevronLeft color={showAll ? "#d1d5db" : "#374151"} size={16} />
          </TouchableOpacity>

          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: showAll ? '#9ca3af' : '#111827' }}>
              {showAll ? "All Months" : monthLabel}
            </Text>
            {!showAll && isCurrentMonth && (
              <Text style={{ fontSize: 10, color: '#3b82f6', fontWeight: '600', marginTop: 1 }}>
                Current Month
              </Text>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {/* Download PDF */}
            <TouchableOpacity
              onPress={handleExportPDF}
              disabled={pdfLoading || filteredExpenses.length === 0 || showAll}
              style={{
                width: 36, height: 36, borderRadius: 12,
                backgroundColor: filteredExpenses.length > 0 && !showAll ? '#eff6ff' : '#f9fafb',
                alignItems: 'center', justifyContent: 'center',
              }}
              activeOpacity={0.7}
            >
              {pdfLoading ? (
                <ActivityIndicator size="small" color="#3b82f6" />
              ) : (
                <DownloadIcon color={filteredExpenses.length > 0 && !showAll ? "#3b82f6" : "#d1d5db"} size={16} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goToNextMonth}
              disabled={isCurrentMonth || showAll}
              style={{
                width: 36, height: 36, borderRadius: 12,
                backgroundColor: isCurrentMonth || showAll ? '#f9fafb' : '#f3f4f6',
                alignItems: 'center', justifyContent: 'center',
              }}
              activeOpacity={0.7}
            >
              <ChevronRight color={isCurrentMonth || showAll ? "#d1d5db" : "#374151"} size={16} />
            </TouchableOpacity>
          </View>
        </View>

        {/* All Months Toggle */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
          <TouchableOpacity
            onPress={() => setShowAll(!showAll)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 5,
              borderRadius: 20,
              backgroundColor: showAll ? '#3b82f6' : '#f3f4f6',
            }}
            activeOpacity={0.7}
          >
            <Text style={{
              fontSize: 11,
              fontWeight: '700',
              color: showAll ? '#ffffff' : '#6b7280',
            }}>
              {showAll ? "✓ All Months" : "Show All Months"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Pill */}
      {filteredExpenses.length > 0 && (
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          paddingHorizontal: 4, marginBottom: 8, marginTop: 4,
        }}>
          <Text style={{ fontSize: 13, color: '#6b7280' }}>
            {sortedExpenses.length} transaction{sortedExpenses.length !== 1 ? 's' : ''}
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>
            Total: ₹{monthTotal.toFixed(2)}
          </Text>
        </View>
      )}

      {sortedExpenses.length === 0 ? (
        <View className="items-center justify-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100 mt-4">
          <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
             <Text className="text-gray-400 text-2xl font-bold">📄</Text>
          </View>
          <Text className="text-gray-500 font-medium text-lg">No transactions{!showAll ? ` in ${monthLabel}` : ""}.</Text>
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
                          {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: showAll ? 'numeric' : undefined })} • {item.category} {!item.synced ? "• (Offline)" : ""}
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
