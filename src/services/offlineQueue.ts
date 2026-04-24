import AsyncStorage from "@react-native-async-storage/async-storage";
import { OfflineAction } from "../types/models";

const QUEUE_KEY = "@pocketpilot_sync_queue";

export const offlineQueue = {
  async getQueue(): Promise<OfflineAction[]> {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as OfflineAction[]) : [];
  },

  async enqueue(action: OfflineAction) {
    const queue = await this.getQueue();
    queue.push(action);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  async clearQueue() {
    await AsyncStorage.removeItem(QUEUE_KEY);
  },
};
