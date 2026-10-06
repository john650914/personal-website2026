<script setup>
import { ref } from 'vue'
import ContactForm from '@/components/ContactForm.vue'
import { useParallaxAnchor } from '@/composables/useParallaxAnchor'

const astronaut = ref(null)
useParallaxAnchor(() => [astronaut.value])
</script>

<template>
  <section id="contact" class="section section--contact">
    <!--
      太空人。舊站是 section 的 background-image 配 parallax('100%', 1)，
      改成獨立圖層：外層負責裁切（等效於背景被元素框裁掉），
      內層用 transform 位移，捲動時不重繪。
    -->
    <span ref="astronaut" class="contact__astronaut" aria-hidden="true">
      <span class="contact__astronaut-img"></span>
    </span>

    <div class="contact__content">
      <h2 class="section-title contact__title">
        <span class="visually-hidden">聯絡資訊</span>
        <span aria-hidden="true">#Contact Me</span>
      </h2>

      <p class="contact__intro">
        如果您喜歡我的作品，非常歡迎您和我聯絡，以下是我的聯絡資訊，<br />
        或是您也可以填寫下面的表單，留下您的聯絡方式，我會盡快向您回覆。
      </p>

      <p class="contact-info contact-info--phone">
        <span class="contact-info__label">電話：</span> 0986-875-711
      </p>

      <p class="contact-info contact-info--email">
        <span class="contact-info__label">信箱：</span>
        <a href="mailto:john650914@gmail.com" title="寫信給我">
          john650914@gmail.com
        </a>
      </p>

      <ContactForm />
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/scss/variables' as v;
@use '@/assets/scss/mixins' as m;

// --- 太空人（視差） ---
.contact__astronaut {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;

  // 行動版不顯示（沿用舊站的 background:none）
  @include m.tablet-down {
    display: none;
  }
}

.contact__astronaut-img {
  position: absolute;
  top: 0;
  right: 0;
  width: 465px;
  height: 580px;
  background: url('@/assets/img/astronaut.png') no-repeat 0 0;
  // 係數 1，沿用舊站的 parallax('100%', 1)
  transform: translateY(calc(var(--anchor, 0px) - var(--scroll-y)));
  will-change: transform;
}

// --- 內容 ---
.contact__content {
  position: relative;
  z-index: 1;
  padding-left: 49px;

  @include m.tablet-down {
    padding-left: 0;
  }

  @include m.mobile-down {
    padding-bottom: 80px;
  }
}

.contact__title {
  margin-bottom: 14px;
}

.contact__intro {
  margin-bottom: 25px;

  @include m.tablet-down {
    padding-bottom: 0;
  }
}

.contact-info {
  padding-left: 3px;
  color: v.$color-contact;
  font-family: v.$font-contact;
  font-size: v.$fs-contact;
  font-weight: bold;
  @include m.body-glow;

  a {
    color: inherit;
    transition: color 0.15s ease;

    &:hover {
      color: v.$color-contact-hover;
    }
  }

  // 桌機／平板用圖示取代「電話：」「信箱：」文字
  &::before {
    content: '';
    display: inline-block;
    width: 38px;
    height: 38px;
    margin-right: 5px;
    vertical-align: middle;
    background-repeat: no-repeat;
  }

  &--phone {
    margin-bottom: 17px;

    &::before {
      background-image: url('@/assets/img/icon-phone.png');
    }
  }

  &--email {
    margin-bottom: 41px;

    &::before {
      background-image: url('@/assets/img/icon-email.png');
    }
  }

  @include m.tablet-down {
    padding-left: 32px;
    padding-bottom: 0;

    &--phone {
      margin-bottom: 10px;
    }
  }

  // 手機改回顯示文字標籤（沿用舊站的行動版做法）
  @include m.mobile-down {
    font-size: v.$fs-contact-mobile;

    &::before {
      display: none;
    }
  }
}

.contact-info__label {
  @include m.visually-hidden;

  @include m.mobile-down {
    @include m.visually-shown;
  }
}
</style>
