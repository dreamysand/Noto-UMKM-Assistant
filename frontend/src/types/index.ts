// =========================
// Transaction
// =========================
export interface Transaction {
  id?: number;               // auto increment local ID (IndexedDB)
  serverId?: number;         // ID dari server jika sudah sync
  userId?: number;         // ID dari user
  
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description?: string;
  date: string;              // ISO string

  deleted?: number;         // soft delete lokal/offline
  clientUpdatedAt?: number;  // timestamp terakhir client update
  synced?: number;          // sudah terkirim ke server atau belum
}

// =========================
// Product
// =========================
export interface Product {
  id?: number;
  serverId?: number;
  userId?: number;

  name: string;
  stock: number;
  price: number;
  unit: string;

  deleted?: number;
  clientUpdatedAt?: number;
  synced?: number;
}

// =========================
// Service
// =========================
export interface Service {
  id?: number;
  serverId?: number;
  userId?: number;

  name: string;
  price: number;
  unit: string;

  deleted?: number;
  clientUpdatedAt?: number;
  synced?: number;
}

// =========================
// Chat Message
// =========================
export interface ChatMessage {
  id?: number;
  userId?: number;
  sender?: 'user' | 'assistant';
  message: string;
  createdAt: string;
}
