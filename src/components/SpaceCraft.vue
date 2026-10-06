<script setup>
// 純裝飾元素，所以整個對輔助技術隱藏。
defineProps({
  variant: { type: Number, required: true },
})
</script>

<template>
  <div class="craft" :class="`craft--${variant}`" aria-hidden="true">
    <!--
      三層結構是刻意的：一個元素只能有一個 transform，
      而這裡有三種互不相干的變形要同時成立
        .craft       → 隨捲動飛出（translate）
        .craft__float → 上下浮動（translateY，CSS 動畫）
        .craft__wrap  → 整體縮放（scale）
    -->
    <div class="craft__float">
      <div class="craft__wrap">
        <span class="craft__flame craft__flame--1"></span>
        <span class="craft__flame craft__flame--2"></span>
        <span class="craft__body"></span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/variables' as v;
@use '@/assets/scss/mixins' as m;

// -------------------------------------------------------------
// 外層：隨捲動往右下飛出
// 舊站是 scroll 事件裡直接寫 margin-left / margin-top，
// 改 margin 會觸發 layout；這裡用 transform，只在合成層處理。
// -------------------------------------------------------------
.craft {
  position: absolute;
  transform: translate3d(
    calc(var(--scroll-y, 0px) * var(--fly-x)),
    calc(var(--scroll-y, 0px) * var(--fly-y)),
    0
  );
  will-change: transform;

  // 行動版不顯示（沿用舊站）
  @include m.tablet-down {
    display: none;
  }
}

// 位置、飛出係數、浮動幅度（係數沿用舊站的 1.5/1、1.2/0.8、0.9/0.6）
.craft--1 {
  left: 241px;
  top: 250px;
  --fly-x: 1.5;
  --fly-y: 1;
  --float: 10px;
  --float-duration: 1.9s;
}

.craft--2 {
  left: 228px;
  top: 194px;
  --fly-x: 1.2;
  --fly-y: 0.8;
  --float: 6px;
  --float-duration: 2.4s;
}

.craft--3 {
  left: 507px;
  top: 199px;
  --fly-x: 0.9;
  --fly-y: 0.6;
  --float: 4px;
  --float-duration: 2.9s;
}

// -------------------------------------------------------------
// 中層：上下浮動
// 舊站是 setInterval(180ms) 每次 margin-top '+=2'，四格一循環，
// 所以是階梯式跳動而且三架完全同步 —— 那就是「浮動不自然」的來源。
// 改成 ease-in-out 的 alternate 動畫（接近正弦曲線），
// 三架用不同週期與負的 animation-delay 錯開相位。
// -------------------------------------------------------------
.craft__float {
  animation: craft-float var(--float-duration) ease-in-out infinite alternate;
}

.craft--2 .craft__float {
  animation-delay: -0.8s;
}

.craft--3 .craft__float {
  animation-delay: -1.7s;
}

@keyframes craft-float {
  from {
    transform: translateY(calc(var(--float) * -0.5));
  }
  to {
    transform: translateY(calc(var(--float) * 0.5));
  }
}

// -------------------------------------------------------------
// 內層：整體縮放
// -------------------------------------------------------------
.craft__wrap {
  position: relative;
  width: 720px;
  height: 250px;
  transform-origin: 0 0;
}

.craft--2 .craft__wrap {
  transform: scale(0.58);
}

.craft--3 .craft__wrap {
  transform: scale(0.42);
}

// -------------------------------------------------------------
// 船身與火焰
// 座標是從舊站換算來的：舊站三個子元素都是 position:relative，
// 靠「正常流位置 + top/left 偏移」疊出來，相依於彼此的高度。
// 這裡改成 absolute 並直接寫換算後的最終座標：
//   flame1  flow y=0   + top 44   -> 44
//   flame2  flow y=137 + top -91  -> 46
//   body    flow y=274 + top -180 -> 94
// -------------------------------------------------------------
.craft__flame,
.craft__body {
  position: absolute;
  display: block;
  background-repeat: no-repeat;
}

.craft__flame {
  width: 399px;
  height: 137px;
  background-image: url('@/assets/img/craft-flame.png');
  animation: flame-flicker 0.3s ease-in-out infinite;
}

.craft__flame--1 {
  left: 147px;
  top: 44px;
}

.craft__flame--2 {
  left: 43px;
  top: 46px;
  // 兩道火焰錯開，避免同步脈動
  animation-duration: 0.42s;
  animation-delay: -0.15s;
}

.craft__body {
  left: 384px;
  top: 94px;
  width: 336px;
  height: 153px;
  background-image: url('@/assets/img/craft-body.png');
}

// 舊站是 setInterval(120ms) 在 opacity 0.9 / 1 之間硬切
@keyframes flame-flicker {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.88;
  }
}
</style>
