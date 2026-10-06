<script setup>
import { workCategories, thumbSrc } from '@/data/works'
import { openCategory } from '@/stores/worksRoute'
import WorkIcon from '@/components/WorkIcon.vue'

function onTileClick(slug, event) {
  // 讓瀏覽器原生行為照常運作：中鍵、Ctrl/Cmd+click 開新分頁、
  // 右鍵複製連結網址等等。只有單純的左鍵點擊才攔下來開 lightbox。
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return
  }

  event.preventDefault()
  openCategory(slug)
}
</script>

<template>
  <ul class="works-grid">
    <li v-for="category in workCategories" :key="category.slug">
      <!--
        用真實的 <a href> 而不是 <div @click>：
        可以用鍵盤操作、可以用中鍵開新分頁、可以複製連結分享，
        而且沒有 JS 時仍是一個有意義的連結。
      -->
      <a
        class="work-tile"
        :href="`?works=${category.slug}`"
        @click="onTileClick(category.slug, $event)"
      >
        <img
          class="work-tile__thumb"
          :src="thumbSrc(category.items[0].file)"
          alt=""
          width="180"
          height="140"
          loading="lazy"
          decoding="async"
        />
        <span class="work-tile__label">
          <WorkIcon :name="category.icon" class="work-tile__icon" />
          <span>{{ category.title }}</span>
        </span>
      </a>
    </li>
  </ul>
</template>

<style scoped lang="scss">
@use '@/assets/scss/variables' as v;
@use '@/assets/scss/mixins' as m;

// 5 欄 x 180px + 4 個 20px 間距 = 980px，剛好等於容器寬度
// （數值量測自 參考資源/my-projects.png）
.works-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: v.$tile-gap;

  @include m.tablet-down {
    grid-template-columns: repeat(3, 1fr);
    max-width: 580px;
    margin-inline: auto;
  }

  @include m.mobile-down {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    max-width: 380px;
  }
}

.work-tile {
  display: block;
  height: 100%;
  overflow: hidden;
  background: v.$color-tile;
  transition: background-color 0.2s ease;

  &:hover,
  &:focus-visible {
    background: v.$color-tile-hover;
  }

  &__thumb {
    width: 100%;
    height: auto;
    aspect-ratio: #{v.$tile-width} / #{v.$tile-thumb-height};
    object-fit: cover;
    transition: transform 0.25s ease;
  }

  &__label {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 8px 6px;
    color: v.$color-text;
    font-size: 13px;
    line-height: 18px;
  }

  // 圖示原始設計尺寸就是 14x14（參考資源/icons/*.svg 的 viewBox）
  &__icon {
    flex: 0 0 auto;
    width: 14px;
    height: 14px;
  }
}

// 舊站 hover 時是 background-position:0 -2px，等效於縮圖上移 2px
.work-tile:hover .work-tile__thumb,
.work-tile:focus-visible .work-tile__thumb {
  transform: translateY(-2px);
}
</style>
