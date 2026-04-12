import { useState, useEffect } from "react";

/**
 * 通用 localStorage Hook，支援 JSON 序列化和型別安全。
 * 發生讀寫錯誤時自動降級使用 defaultValue，不會造成白畫面。
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`[useLocalStorage] 寫入 "${key}" 失敗：`, e);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
