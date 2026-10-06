import { ref } from 'vue'

// =============================================================
// 作品 lightbox 的網址狀態
//
// 每個分類有自己的網址（?works=cis），帶參數進站就直接開啟。
//
// 刻意不裝 vue-router：整個網站只有這一個「路由」需求，
// 為了一個查詢參數引入 router 太重。URLSearchParams + History API
// 就足夠，而且行為完全可控。
// =============================================================

const PARAM = 'works'

function readSlug() {
  return new URLSearchParams(window.location.search).get(PARAM)
}

/** 目前開啟的分類 slug，null 表示沒開 */
export const activeSlug = ref(readSlug())

// lightbox 是不是我們自己 pushState 開起來的。
// 如果使用者是直接帶著 ?works=... 進站，關閉時就不能用 history.back()，
// 那會把人直接送離開網站。
let pushedByUs = false

// 進站時網址就帶了分類（例如別人分享的連結）。
// 這種情況關閉 lightbox 後應該停在作品區塊，而不是頁首。
let landedWithSlug = readSlug() !== null

export function consumeLandingFlag() {
  const was = landedWithSlug
  landedWithSlug = false
  return was
}

export function openCategory(slug) {
  if (activeSlug.value === slug) return

  const url = `${window.location.pathname}?${PARAM}=${encodeURIComponent(slug)}`
  window.history.pushState({ [PARAM]: slug }, '', url)
  pushedByUs = true
  activeSlug.value = slug
}

export function closeCategory() {
  if (!activeSlug.value) return

  if (pushedByUs) {
    // 用 back() 而不是直接清掉網址，這樣「上一頁」的行為
    // 跟使用者的預期一致，也不會在歷史紀錄裡留下垃圾
    window.history.back()
    return // 後續由 popstate 處理
  }

  window.history.replaceState({}, '', window.location.pathname)
  activeSlug.value = null
}

export function initWorksRoute() {
  // 瀏覽器上一頁／下一頁都會走到這裡，lightbox 的開關因此跟著歷史紀錄同步
  window.addEventListener('popstate', () => {
    activeSlug.value = readSlug()
    if (!activeSlug.value) pushedByUs = false
  })
}
