<script setup>
import { useScrollSpy } from '@/composables/useScrollSpy'

const sections = [
  { id: 'intro', label: '簡介' },
  { id: 'works', label: '我的作品' },
  { id: 'skill', label: '經歷與專長' },
  { id: 'contact', label: '聯絡資訊' },
]

// 導覽列右側的標籤。舊站的 Cross Browser / Parallax 已移除。
const tags = [
  { key: 'ai', label: 'AI Collaboration', tip: '本站由 AI 協作建置' },
]

const { activeId } = useScrollSpy(
  sections.map((s) => s.id),
  { offset: 53 }
)
</script>

<template>
  <nav class="site-nav" aria-label="主要導覽">
    <div class="site-nav__inner">
      <ul class="site-nav__menu">
        <li v-for="section in sections" :key="section.id">
          <a
            :href="`#${section.id}`"
            :class="{ 'is-active': activeId === section.id }"
            :aria-current="activeId === section.id ? 'true' : undefined"
          >
            {{ section.label }}
          </a>
        </li>
      </ul>

      <ul class="site-nav__tags">
        <li
          v-for="tag in tags"
          :key="tag.key"
          :class="`site-nav__tag site-nav__tag--${tag.key}`"
        >
          <!--
            來源：參考資源/icons/robot.svg（viewBox 0 0 17 17，
            跟標籤圖示的顯示尺寸一致）。fill 跟著 currentColor，
            hover 時與文字一起變色。
          -->
          <svg
            class="site-nav__tag-icon"
            viewBox="0 0 17 17"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M0,6.96v2.55c0,.47.39.86.86.86h.94v-4.26h-.94c-.47,0-.86.39-.86.86Z"
            />
            <path
              d="M16.14,6.1h-.94v4.26h.94c.47,0,.86-.39.86-.86v-2.55c0-.47-.39-.86-.86-.86Z"
            />
            <path
              d="M9.19,13.47h-1.37c-.21,0-1.62.34-2.32.97l-1.17,1.06h8.35l-1.17-1.06c-.7-.64-2.11-.97-2.32-.97Z"
            />
            <path
              d="M13,4H4c-.64,0-1.17.53-1.17,1.17v6.01c0,.64.53,1.17,1.17,1.17h9c.64,0,1.17-.53,1.17-1.17v-6.01c0-.64-.53-1.17-1.17-1.17ZM6.01,9.56c-.8,0-1.45-.65-1.45-1.45s.65-1.45,1.45-1.45,1.45.65,1.45,1.45-.65,1.45-1.45,1.45ZM10.99,9.56c-.8,0-1.45-.65-1.45-1.45s.65-1.45,1.45-1.45,1.45.65,1.45,1.45-.65,1.45-1.45,1.45Z"
            />
            <path d="M8.5,1.49c-.91,0-.96.73-.96,1.64h1.91c0-.91-.04-1.64-.96-1.64Z" />
          </svg>
          {{ tag.label }}
          <span class="site-nav__tip">{{ tag.tip }}</span>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped lang="scss">
@use '@/assets/scss/variables' as v;
@use '@/assets/scss/mixins' as m;

.site-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: v.$nav-height;
  background: v.$color-nav-bg;
  border-bottom: 1px solid v.$color-nav-border;
  z-index: v.$z-nav;

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    @include m.container;

    @include m.tablet-down {
      max-width: none;
      justify-content: center;
    }
  }
}

// --- 左側主選單 ---
.site-nav__menu {
  display: flex;
  gap: 2px;

  a {
    display: block;
    padding: 6px 21px;
    background: v.$color-nav-item;
    color: v.$color-nav-item-text;
    font-size: v.$fs-nav;
    transition: background-color 0.15s ease, color 0.15s ease;

    &:hover {
      background: v.$color-nav-item-hover;
    }

    &.is-active {
      background: v.$color-nav-item-active;
      color: v.$color-nav-item-active-text;
    }
  }

  // 首尾兩顆的外側圓角
  li:first-child a {
    border-radius: v.$radius 0 0 v.$radius;
  }

  li:last-child a {
    border-radius: 0 v.$radius v.$radius 0;
  }

  @include m.mobile-down {
    a {
      padding: 6px 12px;
      font-size: v.$fs-nav-mobile;
    }
  }
}

// --- 右側標籤 ---
.site-nav__tags {
  display: flex;

  @include m.tablet-down {
    display: none;
  }
}

.site-nav__tag {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  color: v.$color-nav-tag;
  font-size: v.$fs-nav-tag;
  line-height: 32px;
  cursor: default;
  transition: color 0.15s ease;

  &:hover {
    color: v.$color-nav-tag-hover;
  }
}

.site-nav__tag-icon {
  flex: 0 0 auto;
  width: 17px;
  height: 17px;
}

// 氣泡提示
//
// 舊站是用一張 240x60 的 tip_bg.png 當背景，塞進 33px 高的框裡顯示，
// 所以圖的下半部被硬切掉、而且沒有圓角（這就是「泡泡被切一半」）。
// 改成純 CSS：底色取樣自原圖，箭頭用 border 畫的三角形。
// 這樣任何文字長度與高度都不會被裁切。
.site-nav__tip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 6px;
  padding: 5px 10px 6px;
  background: v.$color-tooltip;
  border-radius: 4px;
  color: #fff;
  font-size: v.$fs-tooltip;
  line-height: 18px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s ease, visibility 0.15s ease;

  &::after {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-bottom-color: v.$color-tooltip;
  }
}

.site-nav__tag:hover .site-nav__tip {
  opacity: 1;
  visibility: visible;
}
</style>
