# 張復漢的個人網站

舊版靜態站（`../個人網站`）的翻新版本。**視覺完整保留，HTML / CSS / JavaScript 全部重寫。**

Vue 3 + Vite + Sass，無執行階段依賴（除了 Vue 本身）。

---

## 開始開發

```bash
npm install
npm.cmd run dev      # http://localhost:5173
```

> **Windows PowerShell 使用者注意**：若執行原則是 `AllSigned`，直接打 `npm run dev`
> 會被擋下（PowerShell 會去執行 `npm.ps1`，而它沒有數位簽章）。
> 加上 `.cmd` 寫成 `npm.cmd run dev`，或改用 `cmd.exe` 即可。

需要 **Node 20.19+ 或 22.12+**（Vite 8 的要求）。Node 21 不符合，而且已經 EOL。

## 指令

| 指令 | 用途 |
|---|---|
| `npm run dev` | 開發伺服器 |
| `npm run build` | 產生 `dist/` |
| `npm run preview` | 預覽 build 結果 |
| `npm run assets:works` | 從作品資料.txt 重新產生 `src/data/works.js` |
| `npm run assets:font` | 把 `days.otf` 轉成 woff2 |

---

## 目錄結構

```
apps-script/          聯絡表單後端（Google Apps Script，含部署說明）
public/images/works/  97 張作品大圖 + thumbs/ 97 張預覽圖
scripts/              一次性的素材處理腳本
src/
  assets/
    fonts/            days.woff2（標題字型）
    img/              從舊站 sprite 拆出的獨立素材
    scss/             設計系統：variables / mixins / fonts / reset / base / layout
  components/
    sections/         四個區塊
    works/            作品牆、隕石、lightbox、預覽圖條
  composables/        捲動節流、scrollspy、視差錨點
  config/             聯絡表單端點與 Turnstile site key
  data/               works.js（自動產生，勿手改）
  services/           表單送出、Turnstile 載入
  stores/             lightbox 的網址狀態
```

---

## 維護常見任務

### 修改作品說明或新增作品

1. 編輯 `../個人網站/參考資源/作品資料.txt`
2. 圖片放進 `public/images/works/`，預覽圖（180×140）放進 `public/images/works/thumbs/`
3. `npm run assets:works`

腳本會驗證分類數、每張圖是否存在、每個分類是否有對應圖示；
有任何問題會列出並拒絕寫檔，不會產生壞資料。

### 調整動畫手感

數值都在 SCSS 裡，不用動 JavaScript：

| 效果 | 位置 | 變數 |
|---|---|---|
| 太空船浮動幅度／週期 | `SpaceCraft.vue` | `--float` / `--float-duration` |
| 太空船飛出速度 | `SpaceCraft.vue` | `--fly-x` / `--fly-y` |
| 隕石橫移速度 | `MeteorField.vue` | `animation` 的 duration |
| 各層視差強度 | 各元件 | `--depth` |
| 背景視差強度 | `_base.scss` | `body::before` 的 `calc()` 係數 |

### 聯絡表單

端點與 site key 在 `src/config/contact.js`。後端程式碼與部署步驟見
[`apps-script/README.md`](./apps-script/README.md)。

---

## 部署

目標是 GitHub Pages（`john650914.github.io`）。

```bash
npm run build     # 產出 dist/
```

把 `dist/` 的內容推上去即可。`vite.config.js` 的 `base` 設成 `'./'`，
所以**不管放在網域根目錄或 `/專案名/` 子目錄都能運作**，不需要改設定。

### 上線前待辦

- [ ] 把 `og_img.jpg`（1200×630）放進 `public/images/`
- [ ] 若部署在專案 repo 而非 user site，`index.html` 的 `og:image` / `og:url`
      要補上 repo 名稱那一層（OG 規格要求絕對網址，無法用相對路徑）
- [ ] Cloudflare Turnstile 後台的 Hostname Management 確認已含正式網域

---

## 技術決策摘要

翻新過程中幾個刻意的選擇，列在這裡避免日後誤改。

**不裝 vue-router。** 全站只有「lightbox 分類」一個路由需求，用
`URLSearchParams` + History API 就夠（`src/stores/worksRoute.js`）。

**不裝 Font Awesome。** 只需要 10 個分類圖示，載入整套字型不划算。
`WorkIcon.vue` 是手繪的 inline SVG，全部加起來不到 2KB。

**Lightbox 自己寫。** 現成套件的核心假設是「把圖縮到視窗內」，
而需求是「原尺寸顯示、超高就讓容器出現捲軸」，覆寫它們的尺寸引擎
比自己寫更麻煩。

**JS 只餵一個數字給 CSS。** 所有視差都從 `:root` 的 `--scroll-y`
用 `calc()` 推導。整個頁面只有一組 scroll 監聽 + 一個
`requestAnimationFrame`（`useScrollFrame.js`）。

**版面與元件樣式零 `!important`。** 舊站的 RWD 靠 `!important` 壓桌機樣式，
根因是「覆蓋規則的來源順序無法保證」。把 modifier 與 RWD 覆蓋寫在
同一個檔案（`_layout.scss`），靠來源順序決勝即可。

唯一的例外是 `_reset.scss` 的 `prefers-reduced-motion` 區塊 ——
那裡**必須**用 `!important`，因為它的作用就是覆蓋各元件自己宣告的
動畫。使用者的系統偏好本來就該勝過作者樣式。

**捲動效果一律用 `transform`。** 舊站改 `margin` 會觸發 layout、
改 `background-position` 會造成大面積重繪。隕石與衛星都拆成
「外層裁切 + 內層位移」兩層來達成同樣視覺。

---

## 舊站刻意淘汰的寫法

| 舊站做法 | 現在 |
|---|---|
| `h1 { display: none }` | `visually-hidden`（畫面不變，但 SEO 與螢幕閱讀器讀得到） |
| `h2:after { content: "#Hello World" }` | 真實文字，可選取、可索引、可翻譯 |
| `text-indent: -9999px` | `visually-hidden` |
| `setInterval` + 相對值寫 inline style | CSS `@keyframes` |
| 攔截 `mousewheel` 劫持捲動 | 移除，恢復原生捲動 |
| jQuery `animate({scrollTop})` | `scroll-behavior: smooth` |
| 每張大圖一個 `.htm` + AJAX 載入 | 單一 lightbox 元件 + 資料陣列 |
| 前端產生的數學驗證碼（答案在 JS 變數裡） | Cloudflare Turnstile + 伺服器端限流 |
| `offset().top - 300` 魔術數字判斷選單高亮 | 判定線 + 預先量測的文件座標 |
| IE 條件註解、`zoom` fallback、UA 字串偵測 | 全部移除 |

## 無障礙

- 鍵盤可完整操作：跳過導覽連結、作品牆用真實 `<a>`、lightbox 有焦點陷阱與
  Esc／方向鍵操作、關閉後焦點回到觸發元素
- `:focus-visible` 焦點框（滑鼠點擊不顯示，鍵盤操作才顯示）
- 表單欄位有 `<label>`、錯誤用 `aria-invalid` + `aria-describedby` 關聯，
  送出結果用 `role="status"` 播報
- `prefers-reduced-motion` 會關閉所有動畫**與視差**（視差不是動畫，
  需要另外處理，見 `useScrollVar.js`）；載入指示器是例外，
  停住的轉圈圈會讓人以為卡死

> 完整的無障礙驗證需要實際用輔助技術測試並由專家審查，
> 以上只是程式層面已處理的部分。
