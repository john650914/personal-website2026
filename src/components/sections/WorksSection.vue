<script setup>
import WorksGrid from '@/components/works/WorksGrid.vue'
import MeteorField from '@/components/works/MeteorField.vue'
</script>

<template>
  <section id="works" class="section section--works">
    <div class="section__inner">
      <h2 class="section-title section-title--center works__title">
        <span class="visually-hidden">我的作品</span>
        <span aria-hidden="true">#My Projects</span>
      </h2>

      <p class="works__intro">
        這裡收錄了我個人職業生涯中的代表作品，橫跨各個專業領域，<br />
        每一項專案皆著重於解決真實痛點並提供流暢的使用者體驗。
      </p>

      <div class="works__list">
        <WorksGrid />
      </div>
    </div>

    <!-- 隕石背景（z-index 為負，疊在內容之下） -->
    <MeteorField />
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/scss/variables' as v;
@use '@/assets/scss/mixins' as m;

.works__title {
  margin-bottom: 11px;
}

.works__intro {
  text-align: center;
}

.works__list {
  position: relative;
  @include m.container;
  padding-top: 70px;

  // 窄螢幕要留左右呼吸空間，不然分類磚會貼齊螢幕邊緣
  @include m.tablet-down {
    padding: 0 28px;
  }

  @include m.mobile-down {
    padding: 0 20px;
  }
}
</style>
