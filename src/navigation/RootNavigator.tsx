import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { generateInsights } from "../utils/calculations";
import { useBoot } from "../hooks/useBoot";
import { DashboardScreen } from "../screens/DashboardScreen";
import { AddExpenseScreen } from "../screens/expenses/AddExpenseScreen";
import { TransactionsScreen } from "../screens/expenses/TransactionsScreen";
import { BudgetsScreen } from "../screens/BudgetsScreen";
import { SubscriptionsScreen } from "../screens/SubscriptionsScreen";
import { InsightsScreen } from "../screens/InsightsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { MenuScreen } from "../screens/MenuScreen";
import { ForgotPasswordScreen } from "../screens/auth/ForgotPasswordScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";
import { SplashScreen } from "../screens/auth/SplashScreen";
import { useAuthStore } from "../store/authStore";
import { useFinanceStore } from "../store/financeStore";
import { View, Text, Platform } from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = () => (
  <Tab.Navigator 
    screenOptions={({ route }) => ({ 
      headerShown: false,
      tabBarActiveTintColor: '#3b82f6', // primary-500
      tabBarInactiveTintColor: '#9ca3af', // gray-400
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingVertical: 5,
        elevation: 0,
        height: 60,
      },
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: "600",
        marginBottom: 5,
      },
      tabBarIcon: ({ color, focused }) => {
        let icon = "•";
        if (route.name === "Dashboard") icon = "📊";
        else if (route.name === "Transactions") icon = "📄";
        else if (route.name === "AddExpense") icon = "➕";
        else if (route.name === "Budgets") icon = "🎯";
        else if (route.name === "Subscriptions") icon = "🔁";
        else if (route.name === "Insights") icon = "✨";
        else if (route.name === "Menu") icon = "≡";
        else if (route.name === "Profile") icon = "👤";

        return (
          <View style={{ opacity: focused ? 1 : 0.6, transform: [{ scale: focused ? 1.1 : 1 }] }}>
            <Text style={{ fontSize: 20, color }}>{icon}</Text>
          </View>
        );
      }
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Transactions" component={TransactionsScreen} options={{ title: 'History' }} />
    <Tab.Screen name="AddExpense" component={AddExpenseScreen} options={{ title: 'Add' }} />
    <Tab.Screen name="Budgets" component={BudgetsScreen} />
    {Platform.OS === 'web' ? (
      <>
        <Tab.Screen name="Subscriptions" component={SubscriptionsScreen} options={{ title: 'Subs' }} />
        <Tab.Screen name="Insights" component={InsightsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </>
    ) : (
      <Tab.Screen name="Menu" component={MenuScreen} />
    )}
  </Tab.Navigator>
);

export const RootNavigator = () => {
  useBoot();
  const session = useAuthStore((s) => s.session);
  const initialized = useAuthStore((s) => s.initialized);
  const loadDashboard = useFinanceStore((s) => s.loadDashboard);
  const expenses = useFinanceStore((s) => s.expenses);
  const budgets = useFinanceStore((s) => s.budgets);
  const profile = useFinanceStore((s) => s.profile);
  const [seenInsights, setSeenInsights] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!session?.user.id) return;
    loadDashboard(session.user.id).catch(console.warn);
  }, [loadDashboard, session?.user.id]);

  useEffect(() => {
    if (!session?.user.id || expenses.length === 0) return;
    const insights = generateInsights(expenses, budgets, profile);
    const newSeen = new Set(seenInsights);
    let hasNew = false;
    
    insights.forEach((insight) => {
      if (!seenInsights.has(insight.id)) {
        newSeen.add(insight.id);
        hasNew = true;
        if (insight.id !== "healthy-spending" && insight.severity === "warning") {
          Toast.show({
             type: "error",
             text1: "Action Needed",
             text2: insight.message,
             position: "top",
             topOffset: 60,
             visibilityTime: 5000,
          });
        }
      }
    });

    if (hasNew) {
      setSeenInsights(newSeen);
    }
  }, [expenses, budgets, profile]);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
        {!initialized ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : !session ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Subscriptions" component={SubscriptionsScreen} />
            <Stack.Screen name="Insights" component={InsightsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
