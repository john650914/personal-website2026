<script setup>
import { computed } from 'vue'
import SiteNav from '@/components/SiteNav.vue'
import IntroSection from '@/components/sections/IntroSection.vue'
import WorksSection from '@/components/sections/WorksSection.vue'
import SkillsSection from '@/components/sections/SkillsSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'
import WorksLightbox from '@/components/works/WorksLightbox.vue'
import { useScrollVar } from '@/composables/useScrollVar'
import {
  activeSlug,
  closeCategory,
  initWorksRoute,
} from '@/stores/worksRoute'
import { findCategory } from '@/data/works'

// 把捲動量寫進 :root 的 --scroll-y，供所有視差效果使用
useScrollVar()

// 讓 lightbox 的開關跟著瀏覽器的上一頁／下一頁同步
initWorksRoute()

const activeCategory = computed(() => findCategory(activeSlug.value))
</script>

<template>
  <a class="skip-link" href="#main">跳到主要內容</a>

  <SiteNav />

  <main id="main" class="site-main">
    <!--
      舊站是 h1{display:none}，等於 SEO 和螢幕閱讀器都讀不到唯一的 h1。
      改成視覺隱藏：畫面完全不變，但語意保留。
    -->
    <h1 class="visually-hidden">張復漢的個人網站</h1>

    <IntroSection />
    <WorksSection />
    <SkillsSection />
    <ContactSection />
  </main>

  <!--
    lightbox 掛到 body 底下，避免被 .site-main 的 overflow:hidden
    與各區塊的 z-index 影響。
    用 :key 讓切換分類時整個元件重建，狀態不會殘留。
  -->
  <Teleport to="body">
    <WorksLightbox
      v-if="activeCategory"
      :key="activeCategory.slug"
      :category="activeCategory"
      @close="closeCategory"
    />
  </Teleport>
</template>

<style scoped lang="scss">
.site-main {
  // 隕石背景會超出 980px，用這層裁掉避免產生水平捲軸
  overflow: hidden;
}
</style>
