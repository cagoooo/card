# 🃏 卡牌工坊 (Card Workshop)

這是一個完全開源、純前端（Serverless）的桌遊原形設計與列印平台。
您可以在此打造專屬的卡牌遊戲、大富翁圖板與共用卡背，並且一鍵輸出完美的 PDF 供實體列印。

## ✨ 核心特色

- **📦 本地化儲存 (Privacy First)**
  所有專案、圖板設計與卡牌資料均儲存於您的瀏覽器 (IndexedDB & LocalStorage) 之中，無需註冊，隨開即用，絕不會外洩您的設計內容。
- **🎨 視覺化設計工具**
  - **圖板設計**：支援 20/32/40/52 格，自訂名稱、顏色及 Emoji 圖標，一鍵完成大富翁風格圖板。
  - **卡牌設計**：提供多套預設主題（經典、奇幻、數字、色彩等），支援上傳圖片（自動優化壓縮）、拖拽排序花色、變更視覺主題。
  - **卡背設計**：自訂卡背底色、花紋格式、文字說明，精準輸出卡牌正反面。
- **🖨️ 精準列印輸出**
  採用標準尺寸設定（Poker、Bridge、Tarot 規格可選），運用純 CSS `@media print` 控制，列印為 PDF 即可直接送印或裁縫。
- **📂 專案管理**
  「我的專案」功能讓您可以輕鬆管理多套不同的設計進度（支援複製、重新命名與建立新版本），亦提供單項 JSON 匯出/匯入備份功能。

---

## 🚀 技術架構

- **框架**：React 19 + TypeScript 5
- **建置工具**：Vite 7
- **路由管理**：Wouter
- **視覺與設計系統**：Tailwind CSS 4 + shadcn/ui + Framer Motion
- **資料儲存**：`idb-keyval` (IndexedDB) + Custom `useLocalStorage` Hook
- **其他依賴**：
  - `@dnd-kit`：流暢的花色清單拖放排序。
  - `browser-image-compression`：自動處理並壓縮上傳的圖片。
  - `lucide-react`：簡潔現代化的圖示集。

---

## 🛠️ 本地開發與運行

本專案採用 pnpm 為套件管理工具。

### 1. 安裝套件
請於根目錄或 `artifacts/card-designer` 執行：
```bash
pnpm install
```
*(如果於 Windows 發現缺少原生相依包而報錯，可能是 pnpm 跨平台預安裝腳本攔截，請確保您的系統有正確取得 `esbuild` 與 `lightningcss` 的 Win32 二進位版本。)*

### 2. 啟動開發伺服器
```bash
pnpm --filter @workspace/card-designer dev
```
或直接在 `artifacts/card-designer` 內執行 `pnpm run dev`。預設會於 `http://localhost:3000` 運行。

### 3. 編譯正式版本
```bash
pnpm --filter @workspace/card-designer build
```
編譯產物將生成於 `dist` 資料夾中。

---

## 🌐 部署 (GitHub Pages)

本平台可無縫部署至 GitHub Pages，包含在 Repo 子目錄中運行。

1. 確認 `vite.config.ts` 中的 `base` 選項已綁定環境變數 `process.env.BASE_PATH`。
2. 配置您的 `.github/workflows/deploy.yml`（範例請參見內部 `USAGE_GUIDE.md`）。
3. Commit 並 Push 至 `main` 分支後，GitHub Actions 將會自動編譯並推送到 `gh-pages` 分支。

---

## 📝 授權與宣告

- 本平台為純開源工具，僅供個人與教學研究使用。
- 專案內部產生之設計歸使用者所有，請自行定期「匯出 JSON」備份重要設計。
