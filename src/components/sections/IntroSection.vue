<script setup>
import SpaceCraft from '@/components/SpaceCraft.vue'
</script>

<template>
  <section id="intro" class="section section--intro">
    <!-- z-index 讓文字疊在太空船之上 -->
    <div class="intro__content">
      <h2 class="section-title">
        <span class="visually-hidden">關於張復漢</span>
        <span aria-hidden="true">#Hello World</span>
      </h2>

      <p class="intro__lead">
        歡迎您參觀我的個人網頁
        <span class="intro__lead-sub">
          這裡記錄了我的前端開發工作歷程與實戰經驗。
        </span>
      </p>

      <p class="intro__text">
        我是張復漢，擁有十年以上的前端開發、視覺設計與團隊管理經驗，<br />
        豐富的跨領域歷練，讓我能無縫橋接程式邏輯與設計美感。<br />
        我擅長運用現代 Front-End 技術與 AI 協作來解決問題以及提升效率，<br />
        下方收錄了一些具有代表性的專案，希望有機會能一起合作。
      </p>

      <!-- 絕對定位，不佔據流排版（跟舊站一樣不影響 section 高度） -->
      <div class="scroll-down">
        <a href="#works">
          <span class="visually-hidden">往下看我的作品</span>
        </a>
      </div>
    </div>

    <!-- DOM 順序由遠到近，跟舊站一致 -->
    <SpaceCraft :variant="3" />
    <SpaceCraft :variant="2" />
    <SpaceCraft :variant="1" />
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/scss/variables' as v;
@use '@/assets/scss/mixins' as m;

.intro__content {
  position: relative;
  z-index: v.$z-content;
}

.intro__lead {
  padding: 25px 0 32px 18px;
  font-size: v.$fs-lead;
  line-height: v.$fs-lead;

  @include m.tablet-down {
    padding: 25px 0;
    font-size: v.$fs-lead-tablet;
    line-height: normal;
  }

  @include m.mobile-down {
    font-size: v.$fs-lead-mobile;
  }
}

.intro__lead-sub {
  display: block;
  padding-top: 10px;
  color: v.$color-accent;
  font-size: v.$fs-lead-sub;
  line-height: v.$fs-lead-sub;

  @include m.tablet-down {
    padding-top: 0;
    font-size: v.$fs-lead-sub-tablet;
    line-height: normal;
  }

  @include m.mobile-down {
    padding-top: 3px;
    font-size: v.$fs-lead-sub-mobile;
  }
}

.intro__text {
  padding-left: 18px;

  @include m.tablet-down {
    padding: 0 32px;
  }
}

// top:100% = 內容區塊的下緣，再往下 140px（換算自舊站的靜態位置）
.scroll-down {
  position: absolute;
  top: 100%;
  left: 50%;
  margin-top: 140px;
  transform: translateX(-50%);

  a {
    display: block;
    width: 112px;
    height: 106px;
    background: url('@/assets/img/scrolldown-arrow.png') no-repeat 0 0;
    transition: transform 0.2s ease, opacity 0.2s ease;

    &:hover {
      transform: translateY(4px);
      opacity: 0.85;
    }
  }

  @include m.tablet-down {
    display: none;
  }
}
</style>
