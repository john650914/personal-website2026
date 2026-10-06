// 把標題字型 Days.otf 轉成 woff2
//
// 舊站的 @font-face 是壞的：寫了兩個 src、format 標在 .eot 上、沒有 woff2，
// 等於每個瀏覽器都在亂猜。新版只提供 woff2（所有現代瀏覽器都支援）。
//
// 執行：npm run assets:font

import { readFile, writeFile, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import wawoff2 from 'wawoff2'

const here = dirname(fileURLToPath(import.meta.url))
const fontDir = resolve(here, '../src/assets/fonts')
const input = resolve(fontDir, 'days.otf')
const output = resolve(fontDir, 'days.woff2')

const source = await readFile(input)
const converted = await wawoff2.compress(source)
await writeFile(output, converted)

const before = (await stat(input)).size
const after = (await stat(output)).size
const saved = Math.round((1 - after / before) * 100)

console.log(`days.otf   ${before.toLocaleString()} bytes`)
console.log(`days.woff2 ${after.toLocaleString()} bytes  (-${saved}%)`)
