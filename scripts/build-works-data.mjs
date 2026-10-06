// =============================================================
// 從「參考資源/作品資料.txt」產生 src/data/works.js
//
// 執行：npm run assets:works
//
// 之後要改作品說明，直接改 作品資料.txt 再重跑這支腳本即可，
// 不用手動維護 97 筆資料。
//
// 大圖的實際寬高會直接從 JPEG 檔頭讀出來寫進資料裡，
// lightbox 需要它來決定「原尺寸顯示」還是「縮到視窗寬度」，
// 也能在圖片載入前就預留正確空間，避免版面跳動。
// =============================================================

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(here, '..')
const sourceTxt = resolve(
  projectRoot,
  '../個人網站/參考資源/作品資料.txt'
)
const worksDir = resolve(projectRoot, 'public/images/works')
const thumbsDir = join(worksDir, 'thumbs')
const outFile = resolve(projectRoot, 'src/data/works.js')

// 分類代號 -> 標籤圖示（WorkIcon.vue 裡的 name）
const ICONS = {
  'no-code': 'editor',
  datahub: 'database',
  telecom: 'broadcast',
  'social-media': 'users',
  'game-web': 'gamepad',
  'corporate-web': 'globe',
  'business-web': 'briefcase',
  uiux: 'mobile',
  cis: 'compass',
  graphic: 'print',
}

// 作品資料.txt 裡仍是舊的拼字，實際檔名已更正
const FILENAME_FIXES = [['social-midea-', 'social-media-']]

/**
 * 從 JPEG 檔頭讀出尺寸。
 * 掃描 SOFn 標記（0xFFC0–0xFFCF，排除 C4/C8/CC 這三個非 SOF 的），
 * 後面接著 1 byte 精度 + 2 byte 高 + 2 byte 寬。
 */
function readJpegSize(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    throw new Error('不是 JPEG')
  }

  let offset = 2
  while (offset < buffer.length - 1) {
    if (buffer[offset] !== 0xff) {
      offset += 1
      continue
    }

    const marker = buffer[offset + 1]

    // 無酬載的標記
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      offset += 2
      continue
    }

    const length = buffer.readUInt16BE(offset + 2)
    const isStartOfFrame =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc

    if (isStartOfFrame) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      }
    }

    offset += 2 + length
  }

  throw new Error('找不到 SOF 標記')
}

function fixFilename(name) {
  let fixed = name
  for (const [from, to] of FILENAME_FIXES) fixed = fixed.replace(from, to)
  return fixed
}

/** 由檔名推出分類代號：business-web-03.jpg -> business-web */
function slugFromFilename(name) {
  return name.replace(/-\d+\.jpg$/i, '')
}

function parseSource(text) {
  const categories = []
  let current = null
  let pendingFile = null

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()

    if (!line || /^-{5,}$/.test(line)) continue

    const titleMatch = line.match(/^\[(.+)\]$/)
    if (titleMatch) {
      current = { title: titleMatch[1].trim(), items: [] }
      categories.push(current)
      pendingFile = null
      continue
    }

    if (/\.jpg$/i.test(line)) {
      pendingFile = fixFilename(line)
      continue
    }

    // 檔名的下一行就是說明文字
    if (pendingFile && current) {
      current.items.push({ file: pendingFile, caption: line })
      pendingFile = null
    }
  }

  return categories
}

// ---------------------------------------------------------------

const text = await readFile(sourceTxt, 'utf8')
const categories = parseSource(text)

if (categories.length !== 10) {
  throw new Error(`預期 10 個分類，實際解析到 ${categories.length} 個`)
}

const existingLarge = new Set(await readdir(worksDir))
const existingThumbs = new Set(await readdir(thumbsDir))
const problems = []
let total = 0

for (const category of categories) {
  category.slug = slugFromFilename(category.items[0].file)
  category.icon = ICONS[category.slug]

  if (!category.icon) problems.push(`分類 ${category.slug} 沒有對應的圖示`)

  for (const item of category.items) {
    total += 1

    if (!existingLarge.has(item.file)) {
      problems.push(`缺大圖：${item.file}`)
      continue
    }
    if (!existingThumbs.has(item.file)) {
      problems.push(`缺縮圖：thumbs/${item.file}`)
    }

    const buffer = await readFile(join(worksDir, item.file))
    const { width, height } = readJpegSize(buffer)
    item.width = width
    item.height = height
  }
}

if (problems.length) {
  console.error('資料有問題，未寫出檔案：')
  problems.forEach((p) => console.error('  - ' + p))
  process.exit(1)
}

const body = categories
  .map((category) => {
    const items = category.items
      .map(
        (item) =>
          `      {\n` +
          `        file: '${item.file}',\n` +
          `        caption: '${item.caption.replace(/'/g, "\\'")}',\n` +
          `        width: ${item.width},\n` +
          `        height: ${item.height},\n` +
          `      },`
      )
      .join('\n')

    return (
      `  {\n` +
      `    slug: '${category.slug}',\n` +
      `    title: '${category.title}',\n` +
      `    icon: '${category.icon}',\n` +
      `    items: [\n${items}\n    ],\n` +
      `  },`
    )
  })
  .join('\n')

const output = `// 自動產生的檔案 —— 請勿手動編輯。
//
// 來源：個人網站/參考資源/作品資料.txt
// 重新產生：npm run assets:works
//
// 分類順序依照 參考資源/my-projects.png 的排版。

const IMAGE_BASE = 'images/works/'

/** 作品大圖路徑 */
export function largeSrc(file) {
  return IMAGE_BASE + file
}

/** 作品預覽圖路徑（180x140） */
export function thumbSrc(file) {
  return IMAGE_BASE + 'thumbs/' + file
}

export const workCategories = [
${body}
]

/** 依 slug 取分類，給 URL 參數用 */
export function findCategory(slug) {
  return workCategories.find((category) => category.slug === slug) ?? null
}
`

await mkdir(dirname(outFile), { recursive: true })
await writeFile(outFile, output, 'utf8')

console.log(`寫出 src/data/works.js`)
console.log(`  分類 ${categories.length} 個、作品 ${total} 張`)
categories.forEach((c) =>
  console.log(`  ${c.slug.padEnd(15)} ${String(c.items.length).padStart(2)} 張  ${c.title}`)
)
