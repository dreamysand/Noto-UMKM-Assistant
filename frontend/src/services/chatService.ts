import { db } from "./db";
import { ChatMessage } from "../types";

export const chatService = {

  /**
   * Menyimpan 1 chat message ke IndexedDB (local database)
   * @param msg ChatMessage
   * @returns Promise<number> - id auto increment dari Dexie
   */
  async addMessage(msg: ChatMessage) {
    return db.chatHistory.add(msg);
  },

  /**
   * Mengambil seluruh riwayat chat
   * @returns Promise<ChatMessage[]>
   */
  async getAllMessages(userId: number) {
    if (!userId) return 0;

    const list = await db.chatHistory
      .where('userId')
      .equals(userId)
      .sortBy('createdAt');

    return list;
  },

  /**
   * Menghapus semua chat
   * Biasanya dipakai untuk fitur "Clear Chat"
   */
  async clearAllMessages() {
    return db.chatHistory.clear();
  }
};
