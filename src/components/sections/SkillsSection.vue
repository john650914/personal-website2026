<script setup>
import { ref } from 'vue'
import skillFrontend from '@/assets/img/skill-frontend.png'
import skillAi from '@/assets/img/skill-ai.png'
import skillSysdesign from '@/assets/img/skill-sysdesign.png'
import { useParallaxAnchor } from '@/composables/useParallaxAnchor'

const satellites = [
  {
    key: 'frontend',
    image: skillFrontend,
    // 舊站把這些字用 text-indent:-9999px 藏起來當圖片容器，
    // 現在改成 visually-hidden，內容保留給螢幕閱讀器
    label:
      '現代前端技術：Vue、Vite、Pinia、JavaScript、API 整合、Git、CI/CD 部署',
  },
  {
    key: 'ai',
    image: skillAi,
    label: 'AI 協作開發：Kiro、OpenAI Codex、意圖與規則制訂、Prompt Engineering',
  },
  {
    key: 'sysdesign',
    image: skillSysdesign,
    label: '系統與介面規劃：系統架構、Headless CMS、所見即所得編輯器、UI/UX',
  },
]

// 三顆衛星是同一列的兄弟元素，文件上的頂端位置相同，
// 所以只量測外層 ul 一次，--anchor 由子元素繼承。
// （舊站是三個元素各自量一次，算出來的值其實一樣。）
const list = ref(null)
useParallaxAnchor(() => [list.value])
</script>

<template>
  <section id="skill" class="section section--skill">
    <div>
      <h2 class="section-title section-title--center skill__title">
        <span class="visually-hidden">經歷與專長</span>
        <span aria-hidden="true">#Core Skills</span>
      </h2>

      <p class="skill__intro">
        我的能力主要聚焦於「現代前端技術」、「AI 協作開發」與「整合 UI/UX
        的系統規劃」。<br />
        擁有十年以上前端開發與管理經驗，擅長運用 Vue 的現代生態系統（如
        Vite、Pinia...）建構應用，<br />
        同時導入 Kiro、Codex 等 AI Agent 進行協作，透過制訂開發意向與規則大幅提升生產力。<br />
        從需求分析、軟體 UI 到程式開發，我能無縫串起所有環節，為團隊提供最有效的解決方案。
      </p>

      <ul ref="list" class="skill__satellites">
        <li
          v-for="item in satellites"
          :key="item.key"
          class="skill__satellite"
        >
          <span
            class="skill__satellite-img"
            :style="{ backgroundImage: `url(${item.image})` }"
          ></span>
          <span class="visually-hidden">{{ item.label }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/scss/variables' as v;
@use '@/assets/scss/mixins' as m;

.skill__title {
  margin-bottom: 21px;

  @include m.tablet-down {
    margin-bottom: 11px;
  }
}

.skill__intro {
  text-align: center;
}

.skill__satellites {
  margin-top: -40px;
  text-align: center;
  // 視差係數，沿用舊站的 parallax('...', 0.5)
  --depth: 0.5;

  @include m.tablet-down {
    margin-top: -10px;
    // 行動版不做視差。舊站的 parallax 外掛在視窗寬度 < 960 時
    // 會把三顆衛星的 background-position 直接寫死，等於關閉效果。
    --depth: 0;
  }
}

// 外層負責裁切（等效於舊站用 background-position 時，
// 背景被元素框裁掉的行為）
.skill__satellite {
  display: inline-block;
  vertical-align: top;
  width: 260px;
  height: 500px;
  margin: 0 16px;
  overflow: hidden;

  @include m.tablet-down {
    height: 260px;
  }
}

// 內層負責位移。用 transform 而不是 background-position，
// 捲動時不會造成重繪。
.skill__satellite-img {
  display: block;
  width: 260px;
  height: 240px;
  background-repeat: no-repeat;
  background-position: 0 0;
  transform: translateY(
    calc((var(--anchor, 0px) - var(--scroll-y)) * var(--depth))
  );
  will-change: transform;

  // 行動版沒有視差，不需要為它開合成層
  @include m.tablet-down {
    will-change: auto;
  }
}
</style>
