import { CONTACT_ENDPOINT } from '@/config/contact'

/**
 * 把聯絡表單的內容送到 Apps Script Web App。
 *
 * Content-Type 刻意用 text/plain 而不是 application/json：
 * Apps Script 的 Web App 不會回應 CORS preflight（OPTIONS），
 * 所以必須讓這個請求維持在「簡單請求」的範圍內才不會被瀏覽器擋下。
 * text/plain 是簡單請求允許的型別之一；Apps Script 端再自己對
 * e.postData.contents 做 JSON.parse 即可。
 *
 * @param {object} payload
 * @returns {Promise<object>}
 */
export async function submitContact(payload) {
  if (!CONTACT_ENDPOINT) {
    throw new Error(
      'CONTACT_ENDPOINT 尚未設定：請在 src/config/contact.js 填入 Apps Script 的 /exec 網址'
    )
  }

  const response = await fetch(CONTACT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
    redirect: 'follow', // Apps Script 會 302 到 script.googleusercontent.com
  })

  if (!response.ok) {
    throw new Error(`伺服器回應 HTTP ${response.status}`)
  }

  const result = await response.json()

  if (!result.ok) {
    throw new Error(result.message || '伺服器回報送出失敗')
  }

  return result
}
