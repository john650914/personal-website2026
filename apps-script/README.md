# 聯絡表單後端部署步驟

`Code.gs` 放在 repo 裡只是為了版本控管，它不屬於前端的建置流程。
實際執行位置是 Google 試算表的 Apps Script。

目標試算表：
`https://docs.google.com/spreadsheets/d/1NxklQOE9vHYPMC-ySQqxRzTnySnDWm1JtfAbedRJek0/edit`
工作表名稱：`工作表1`

---

## 1. 試算表加上標題列

在 `工作表1` 的第一列依序填入，方便日後閱讀：

| A | B | C | D | E |
|---|---|---|---|---|
| 時間 | 姓名 | 電話 | Email | 聯絡事項 |

## 2. 貼上程式碼

1. 打開試算表 →「擴充功能」→「Apps Script」
2. 把預設的 `Code.gs` 內容全部刪掉
3. 貼上本目錄 `Code.gs` 的完整內容
4. 存檔（Ctrl + S）

## 3. 設定 Turnstile secret

**這是唯一該存放 secret key 的地方。它不會、也不應該出現在前端或 repo 裡。**

1. Apps Script 編輯器左側 →「專案設定」（齒輪圖示）
2. 捲到最下方的「指令碼屬性」→「新增指令碼屬性」
3. 屬性名稱：`TURNSTILE_SECRET`
4. 值：貼上 Cloudflare Turnstile 的 secret key
5. 儲存

> 程式碼在 `TURNSTILE_SECRET` 未設定時會**拒絕所有請求**，而不是放行。
> 這是刻意的：設定不完整時變成一個沒有驗證的公開端點，比壞掉更糟。

## 4. 部署成網頁應用程式

1. 右上角「部署」→「新增部署作業」
2. 類型選「網頁應用程式」
3. **執行身分：我**（也就是你自己）
4. **誰可以存取：所有人**
5. 按「部署」，第一次會要求授權，依指示允許
6. 複製結尾是 `/exec` 的網址

### 這兩個設定的意義

| 設定 | 作用 |
|---|---|
| 執行身分：我 | 腳本以你的權限執行，所以有權寫入試算表。**試算表本身維持私人即可，不要開放共用。** |
| 誰可以存取：所有人 | 允許訪客的瀏覽器呼叫這個腳本。這是 Web App 的存取權，不是試算表的存取權。 |

絕對不要把試算表設成「知道連結的人都可以編輯」—— 那等於任何人拿到網址
就能清空你的留言資料。

## 5. 把網址給我填進前端

把 `/exec` 網址填進 `src/config/contact.js` 的 `CONTACT_ENDPOINT`。

## 6. Cloudflare Turnstile 的網域設定

Turnstile 預設只允許你註冊時填的網域。本機測試需要把 `localhost`
加進允許清單：

Cloudflare 後台 → Turnstile → 選擇你的 widget → Settings → Hostname Management
→ 加入 `localhost`

---

## 修改程式碼後要重新部署

Apps Script 的「網頁應用程式」是版本化的。改了 `Code.gs` 之後，
必須「部署」→「管理部署作業」→ 編輯（鉛筆）→ 版本選「新版本」→ 部署，
否則線上跑的還是舊版。網址不會變。

## 可調整的參數

都在 `Code.gs` 最上方：

| 常數 | 預設 | 說明 |
|---|---|---|
| `DAILY_LIMIT` | 50 | 每日最多寫入筆數 |
| `DEDUPE_MINUTES` | 10 | 相同 Email 或內容的去重時間 |
| `MIN_ELAPSED_SECONDS` | 3 | 低於此秒數視為機器人 |
| `NOTIFY_EMAIL` | john650914@gmail.com | 留空則不寄通知 |

## 防護機制的實際強度

| 機制 | 擋得住什麼 |
|---|---|
| Turnstile | 真正的阻擋層。自動化腳本拿不到有效 token |
| 填寫速度 | 繞過 Turnstile 的簡易腳本 |
| 10 分鐘去重 | 誤觸連送、同一則訊息重複轟炸 |
| 每日上限 | 最後一道保險，確保垃圾量有天花板 |

後三者是**限流**而不是阻擋 —— 會換 Email、換內容的攻擊者仍能寫到每日上限。
Turnstile 才是主要防線，所以它失效時程式選擇擋下而不是放行。

## 查看執行紀錄

Apps Script 編輯器左側「執行項目」可以看到每次呼叫的結果。
被 Turnstile 擋下或超過上限時，會在這裡留下 `console.warn` 的紀錄。
