# =============================================================
# 一次性素材處理腳本
#
# 用途：把舊站 個人網站/ 的 sprite 與圖片，拆成獨立命名的素材，
#       並把作品圖檔複製到 public/。產出會進版控，平常不需重跑。
#
# 執行方式（本機執行原則為 AllSigned，無法直接跑 .ps1）：
#   Invoke-Expression (Get-Content .\scripts\prepare-assets.ps1 -Raw)
#
# 切圖座標的依據：個人網站/css/default.css 的 background-position
#   sprite.png  = 735x279
#   skills.png  = 852x240（三顆衛星各 259px 寬，間隔 37px）
# =============================================================

Add-Type -AssemblyName System.Drawing

$oldRoot = 'd:\Desktop\Business Portal\個人網站'
$newRoot = 'd:\Desktop\Business Portal\個人網站Vue'

$imgOut = Join-Path $newRoot 'src\assets\img'
$fontOut = Join-Path $newRoot 'src\assets\fonts'
$worksOut = Join-Path $newRoot 'public\images\works'
$thumbsOut = Join-Path $worksOut 'thumbs'

foreach ($d in @($imgOut, $fontOut, $worksOut, $thumbsOut)) {
  New-Item -ItemType Directory -Force -Path $d | Out-Null
}

function Export-Crop {
  param([string]$Src, [string]$Dst, [int]$X, [int]$Y, [int]$W, [int]$H)

  $srcBmp = New-Object System.Drawing.Bitmap($Src)
  $dstBmp = New-Object System.Drawing.Bitmap(
    $W, $H, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($dstBmp)
  $g.Clear([System.Drawing.Color]::Transparent)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $g.DrawImage(
    $srcBmp,
    (New-Object System.Drawing.Rectangle(0, 0, $W, $H)),
    (New-Object System.Drawing.Rectangle($X, $Y, $W, $H)),
    [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  $dstBmp.Save($Dst, [System.Drawing.Imaging.ImageFormat]::Png)
  $dstBmp.Dispose()
  $srcBmp.Dispose()
  Write-Output "  cut  $(Split-Path $Dst -Leaf)  ${W}x${H}  <- ($X,$Y)"
}

# ---------- 1. sprite.png 拆解 ----------
$sprite = Join-Path $oldRoot 'css\img\sprite.png'
Write-Output 'sprite.png ->'

# 太空船：.craft_body 336x153 @ "right top" => x = 735-336 = 399
Export-Crop $sprite (Join-Path $imgOut 'craft-body.png')          399 0   336 153
# 火焰：.flame 399x137 @ "left top"
Export-Crop $sprite (Join-Path $imgOut 'craft-flame.png')         0   0   399 137
# 向下箭頭：#scrolldown_nav a 112x106 @ -399px -173px
Export-Crop $sprite (Join-Path $imgOut 'scrolldown-arrow.png')    399 173 112 106
# 聯絡資訊 icon 38x38
Export-Crop $sprite (Join-Path $imgOut 'icon-phone.png')          240 173 38  38
Export-Crop $sprite (Join-Path $imgOut 'icon-email.png')          280 173 38  38
# 註：舊站 nav 右側三個 17x17 的技術標籤 icon（sprite 的 0/-20/-40, -173，
# hover 版在 -193）已不再使用 —— 標籤縮減為一個「AI Collaboration」，
# 改用 SiteNav.vue 裡的 inline SVG。氣泡底圖 tip_bg.png 也改成純 CSS 繪製。

# ---------- 2. skills.png 拆成三顆衛星 ----------
# 量測結果：內容分佈在 0..258 / 296..554 / 592..850，舊站用 260px 寬的框
# 搭配 background-position 0% / 50% / 100%，換算正好是 x = 0 / 296 / 592
$skills = Join-Path $oldRoot 'css\img\skills.png'
Write-Output 'skills.png ->'
Export-Crop $skills (Join-Path $imgOut 'skill-frontend.png')  0   0 260 240
Export-Crop $skills (Join-Path $imgOut 'skill-ai.png')        296 0 260 240
Export-Crop $skills (Join-Path $imgOut 'skill-sysdesign.png') 592 0 260 240

# ---------- 3. 原本就獨立的背景素材，改成 kebab-case 命名 ----------
Write-Output 'background ->'
$copyMap = @{
  'css\img\main_bg.jpg'        = 'main-bg.jpg'
  'css\img\main_bg_mobile.jpg' = 'main-bg-mobile.jpg'
  'css\img\meteor_front.png'   = 'meteor-front.png'
  'css\img\meteor_back.png'    = 'meteor-back.png'
  'css\img\astronaut.png'      = 'astronaut.png'
}
foreach ($k in $copyMap.Keys) {
  Copy-Item (Join-Path $oldRoot $k) (Join-Path $imgOut $copyMap[$k]) -Force
  Write-Output "  copy $($copyMap[$k])"
}

# ---------- 4. 標題字型 ----------
Copy-Item (Join-Path $oldRoot 'css\Days.otf') (Join-Path $fontOut 'days.otf') -Force
Write-Output 'font -> days.otf（接著用 npm run assets:font 轉成 woff2）'

# ---------- 5. 作品圖檔 ----------
$srcWorks = Join-Path $oldRoot '參考資源\作品圖檔'
Copy-Item (Join-Path $srcWorks '*.jpg') $worksOut -Force
Copy-Item (Join-Path $srcWorks 'thumbs\*.jpg') $thumbsOut -Force
$bigCount = (Get-ChildItem $worksOut -Filter *.jpg).Count
$thumbCount = (Get-ChildItem $thumbsOut -Filter *.jpg).Count
Write-Output "works -> 大圖 $bigCount 張、縮圖 $thumbCount 張"

Write-Output 'DONE'
