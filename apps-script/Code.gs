/**
 * =============================================================
 * 聯絡表單後端（Google Apps Script）
 *
 * 這支程式不屬於前端專案的建置流程，放在 repo 裡只是為了版本控管。
 * 實際執行位置是試算表的「擴充功能 → Apps Script」。
 * 部署步驟見同目錄的 README.md。
 *
 * 設計重點：
 *   1. 試算表維持私人。Web App 以「擁有者身分」執行，所以腳本有權限
 *      寫入，但外界拿不到試算表本身。
 *   2. Turnstile 的 secret 存在 Script Properties，不在這份程式碼裡，
 *      也不在前端。
 *   3. 被判定為濫用時回傳「成功」。回報真正原因等於告訴攻擊者
 *      規則是什麼，他就能調整後繞過。
 * =============================================================
 */

// ---- 設定 ----
const SHEET_NAME = '工作表1';

/** 每日最多寫入筆數，超過就靜默丟棄 */
const DAILY_LIMIT = 50;

/** 相同 Email 或相同內容在這段時間內重複出現就丟棄（分鐘） */
const DEDUPE_MINUTES = 10;

/** 從開啟頁面到送出至少要經過幾秒，低於此值視為機器人 */
const MIN_ELAPSED_SECONDS = 3;

/** 有新留言時通知的信箱 */
const NOTIFY_EMAIL = 'john650914@gmail.com';

const TIMEZONE = 'Asia/Taipei';

// ---- 入口 ----

/**
 * 直接用瀏覽器打開 Web App 網址時的回應。
 * 單純讓它不要噴錯，也不洩漏任何資訊。
 */
function doGet() {
  return json({ ok: true, message: 'contact endpoint' });
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // --- 1. Turnstile 人機驗證 ---
    if (!verifyTurnstile(data.turnstileToken)) {
      return json({ ok: false, message: '驗證未通過，請重新整理頁面後再試。' });
    }

    // --- 2. 必填欄位 ---
    const name = trimmed(data.name);
    const phone = trimmed(data.phone);
    const email = trimmed(data.email);
    const affair = trimmed(data.affair);

    if (!name || !phone || !email || !affair) {
      return json({ ok: false, message: '必填欄位未完整。' });
    }

    // --- 3. 填寫速度 ---
    // 真人填四個欄位不可能只花兩秒。這裡回報成功是刻意的。
    const elapsed = Number(data.elapsedSeconds);
    if (isFinite(elapsed) && elapsed < MIN_ELAPSED_SECONDS) {
      return json({ ok: true });
    }

    // --- 4. 短時間重複 ---
    if (isDuplicate(email, name + '\n' + phone + '\n' + affair)) {
      return json({ ok: true });
    }

    // --- 5. 每日總量 ---
    if (!consumeDailyQuota()) {
      return json({ ok: true });
    }

    // --- 6. 寫入試算表 ---
    const now = new Date();
    appendRow([
      Utilities.formatDate(now, TIMEZONE, 'yyyy-MM-dd HH:mm:ss'),
      name,
      phone,
      email,
      affair,
    ]);

    // --- 7. 通知（寄信失敗不影響已寫入的資料）---
    notify(name, phone, email, affair);

    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return json({ ok: false, message: '伺服器處理時發生錯誤。' });
  }
}

// ---- 各步驟實作 ----

function verifyTurnstile(token) {
  const secret = PropertiesService.getScriptProperties().getProperty(
    'TURNSTILE_SECRET'
  );

  if (!secret) {
    // 設定不完整時寧可擋下，不要變成沒有驗證的公開端點
    console.error('TURNSTILE_SECRET 未設定');
    return false;
  }

  if (!token) return false;

  const response = UrlFetchApp.fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'post',
      payload: { secret: secret, response: token },
      muteHttpExceptions: true,
    }
  );

  try {
    const result = JSON.parse(response.getContentText());
    if (!result.success) {
      console.warn('Turnstile 驗證失敗：' + JSON.stringify(result['error-codes']));
    }
    return result.success === true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

/**
 * 相同 Email 或相同內容在 DEDUPE_MINUTES 內重複出現就視為重複。
 * 用 CacheService 而不是查試算表：免費、夠快，而且會自動過期。
 */
function isDuplicate(email, content) {
  const cache = CacheService.getScriptCache();
  const emailKey = 'dup_mail_' + md5(email.toLowerCase());
  const contentKey = 'dup_body_' + md5(content);
  const ttl = DEDUPE_MINUTES * 60;

  if (cache.get(emailKey) || cache.get(contentKey)) return true;

  cache.put(emailKey, '1', ttl);
  cache.put(contentKey, '1', ttl);
  return false;
}

/**
 * 取用一次每日額度，額度用完回傳 false。
 *
 * 用 LockService 包起來：讀取、判斷、寫回不是原子操作，
 * 同時進來的請求可能都讀到同一個數字，導致實際寫入超過上限。
 */
function consumeDailyQuota() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return false;

  try {
    const props = PropertiesService.getScriptProperties();
    const today = Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd');
    const parts = String(props.getProperty('DAILY_COUNT') || '').split('|');
    const count = parts[0] === today ? Number(parts[1]) || 0 : 0;

    if (count >= DAILY_LIMIT) {
      console.warn('已達每日上限 ' + DAILY_LIMIT);
      return false;
    }

    props.setProperty('DAILY_COUNT', today + '|' + (count + 1));
    return true;
  } finally {
    lock.releaseLock();
  }
}

function appendRow(values) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('找不到工作表：' + SHEET_NAME);
  sheet.appendRow(values);
}

function notify(name, phone, email, affair) {
  if (!NOTIFY_EMAIL) return;

  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: '[個人網站] 新的聯絡表單留言：' + name,
      body: [
        '姓名：' + name,
        '電話：' + phone,
        'Email：' + email,
        '',
        '聯絡事項：',
        affair,
      ].join('\n'),
    });
  } catch (error) {
    // 通知失敗不該讓使用者看到錯誤 —— 資料已經存進去了
    console.error('寄送通知失敗', error);
  }
}

// ---- 小工具 ----

function trimmed(value) {
  return String(value == null ? '' : value).trim();
}

function md5(text) {
  return Utilities.computeDigest(
    Utilities.DigestAlgorithm.MD5,
    text,
    Utilities.Charset.UTF_8
  )
    .map(function (byte) {
      return ((byte + 256) % 256).toString(16).padStart(2, '0');
    })
    .join('');
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
