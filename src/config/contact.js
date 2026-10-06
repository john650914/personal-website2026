// =============================================================
// 聯絡表單設定
// =============================================================

/**
 * Google Apps Script 部署後的 Web App 網址（/exec 結尾）。
 *
 * 這個網址本身不是機密（它是個公開端點），真正的防護在伺服器端：
 * Turnstile 驗證、重複內容過濾、每日上限。
 *
 * 修改 Code.gs 之後要重新部署「新版本」，網址不會變。
 */
export const CONTACT_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbxf5uUVRyb8N0bCv9CZx1J-ncIGvm_UyXluw_c2WIPHirtFf08CVQuIGm9XAPapoWjTYA/exec'

/**
 * Cloudflare Turnstile 的 site key。
 *
 * 這把金鑰是設計上公開的資訊（它會出現在 HTML 裡給瀏覽器用），
 * 放在前端沒有問題。
 *
 * 對應的 secret key 絕對不能出現在這個專案的任何地方 ——
 * 它只能存在 Apps Script 的 Script Properties 裡，由伺服器端持有，
 * 用來向 Cloudflare 驗證使用者傳回的 token。
 */
export const TURNSTILE_SITE_KEY = '0x4AAAAAAFMdUeKgfYMsUyu4'
