import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { notificationService } from "../services/notificationService";
import { useAuthStore } from "../store/authStore";
import { useFinanceStore } from "../store/financeStore";

export const useBoot = () => {
  const initialize = useAuthStore((s) => s.initialize);
  const syncOfflineQueue = useFinanceStore((s) => s.syncOfflineQueue);

  useEffect(() => {
    initialize().catch(console.warn);
    notificationService.requestPermissions().catch(console.warn);
  }, [initialize]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) syncOfflineQueue().catch(console.warn);
    });
    return unsubscribe;
  }, [syncOfflineQueue]);
};
