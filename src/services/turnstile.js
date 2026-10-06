const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let loadPromise = null

/**
 * 載入 Cloudflare Turnstile。
 *
 * 用 render=explicit 並在 onMounted 時才載入，而不是寫在 index.html：
 * 這樣首頁的初始載入不會被這支外部腳本拖慢，而且 widget 的生命週期
 * 由元件自己掌握（送出後要 reset，token 是一次性的）。
 *
 * 多次呼叫共用同一個 Promise，腳本只會載入一次。
 *
 * @returns {Promise<object>} window.turnstile
 */
export function loadTurnstile() {
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve(window.turnstile)
      return
    }

    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true

    script.onload = () => {
      if (window.turnstile) resolve(window.turnstile)
      else reject(new Error('Turnstile 已載入但沒有掛上 window.turnstile'))
    }

    script.onerror = () => {
      // 讓下一次呼叫可以重試（例如使用者網路恢復後）
      loadPromise = null
      reject(new Error('Turnstile 腳本載入失敗'))
    }

    document.head.appendChild(script)
  })

  return loadPromise
}
