<script setup>
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { submitContact } from '@/services/contactSubmit'
import { loadTurnstile } from '@/services/turnstile'
import { TURNSTILE_SITE_KEY } from '@/config/contact'

const FIELDS = [
  { key: 'name', label: '聯絡人姓名', placeholder: '聯絡人姓名：', type: 'text' },
  { key: 'phone', label: '您的聯絡電話', placeholder: '您的聯絡電話：', type: 'tel' },
  { key: 'email', label: 'Email', placeholder: 'Email：', type: 'email' },
]

const form = reactive({ name: '', phone: '', email: '', affair: '' })
const errors = reactive({ name: '', phone: '', email: '', affair: '' })

// idle | sending | success | error
const status = ref('idle')
const submitError = ref('')

// 表單被按過送出之後，輸入時就即時清掉錯誤訊息；
// 在那之前不要邊打字邊噴紅字，很煩
const hasSubmitted = ref(false)

// 送出時間戳，用來判斷是不是機器人（填寫太快）
const openedAt = Date.now()

// =============================================================
// Cloudflare Turnstile
//
// token 是一次性的，而且會過期，所以每次送出之後都要 reset，
// 否則第二次送出會被伺服器端判定為無效。
// =============================================================
const turnstileBox = ref(null)
const turnstileToken = ref('')
const turnstileFailed = ref(false)

let turnstileApi = null
let widgetId = null

onMounted(async () => {
  try {
    turnstileApi = await loadTurnstile()
    widgetId = turnstileApi.render(turnstileBox.value, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: 'dark',
      callback: (token) => {
        turnstileToken.value = token
        turnstileFailed.value = false
      },
      'expired-callback': () => {
        turnstileToken.value = ''
      },
      'error-callback': () => {
        turnstileToken.value = ''
        turnstileFailed.value = true
      },
    })
  } catch (error) {
    turnstileFailed.value = true
    console.error('[turnstile]', error)
  }
})

onBeforeUnmount(() => {
  if (turnstileApi && widgetId !== null) turnstileApi.remove(widgetId)
})

function resetTurnstile() {
  turnstileToken.value = ''
  if (turnstileApi && widgetId !== null) turnstileApi.reset(widgetId)
}

// 電話允許的字元：數字與電話常用符號
// （國際碼 +、分隔 - . 空白、區碼 ( )、分機 #、總機轉接 *）
const PHONE_ALLOWED = /^[\d+\-.()#*\s]+$/

function validatePhone(value) {
  if (!value) return '請務必留下您的聯絡電話'
  if (!PHONE_ALLOWED.test(value)) {
    return '電話只能包含數字與 ( ) - + # 等符號'
  }
  // 符號再怎麼排列都不算號碼，所以另外檢查數字的數量
  if (value.replace(/\D/g, '').length < 6) {
    return '請輸入完整的電話號碼'
  }
  return ''
}

function validate() {
  errors.name = form.name.trim() ? '' : '請務必留下聯絡人姓名'
  errors.phone = validatePhone(form.phone.trim())
  errors.affair = form.affair.trim() ? '' : '請留下您的聯絡事項'

  const email = form.email.trim()
  if (!email) {
    errors.email = '請務必留下您的 Email'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = '請輸入正確的 Email 格式'
  } else {
    errors.email = ''
  }

  return !Object.values(errors).some(Boolean)
}

// 按過送出之後才即時重算，讓已修正的欄位立刻把紅字收掉
function revalidate() {
  if (hasSubmitted.value) validate()
}

async function onSubmit() {
  // 送出中就直接擋掉，避免連點重複送出
  if (status.value === 'sending') return

  hasSubmitted.value = true
  submitError.value = ''

  if (!validate()) {
    status.value = 'idle'
    return
  }

  if (!turnstileToken.value) {
    status.value = 'idle'
    submitError.value = turnstileFailed.value
      ? '人機驗證元件載入失敗，請重新整理頁面，或直接寫信給我。'
      : '請先完成下方的人機驗證。'
    return
  }

  status.value = 'sending'

  try {
    await submitContact({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      affair: form.affair.trim(),
      // 從開啟頁面到送出所經過的秒數，給伺服器端判斷是否為機器人
      elapsedSeconds: Math.round((Date.now() - openedAt) / 1000),
      turnstileToken: turnstileToken.value,
    })

    status.value = 'success'
    Object.keys(form).forEach((key) => {
      form[key] = ''
    })
    hasSubmitted.value = false
  } catch (error) {
    status.value = 'error'
    submitError.value = '送出時發生問題，請稍後再試，或直接寫信給我。'
    // 真正的技術原因留在 console，不要丟給使用者看
    console.error('[contact]', error)
  } finally {
    // 不論成功失敗都要換一張新的 token
    resetTurnstile()
  }
}
</script>

<template>
  <form class="contact-form" novalidate @submit.prevent="onSubmit">
    <div
      v-for="field in FIELDS"
      :key="field.key"
      class="contact-form__field"
      :class="{ 'has-error': errors[field.key] }"
    >
      <label class="visually-hidden" :for="`contact-${field.key}`">
        {{ field.label }}
      </label>
      <input
        :id="`contact-${field.key}`"
        v-model="form[field.key]"
        :type="field.type"
        :placeholder="field.placeholder"
        :aria-invalid="errors[field.key] ? 'true' : undefined"
        :aria-describedby="
          errors[field.key] ? `contact-${field.key}-error` : undefined
        "
        @input="revalidate()"
      />
      <p
        v-if="errors[field.key]"
        :id="`contact-${field.key}-error`"
        class="contact-form__error"
      >
        {{ errors[field.key] }}
      </p>
    </div>

    <div
      class="contact-form__field"
      :class="{ 'has-error': errors.affair }"
    >
      <label class="visually-hidden" for="contact-affair">聯絡事項</label>
      <textarea
        id="contact-affair"
        v-model="form.affair"
        placeholder="聯絡事項："
        :aria-invalid="errors.affair ? 'true' : undefined"
        :aria-describedby="errors.affair ? 'contact-affair-error' : undefined"
        @input="revalidate()"
      ></textarea>
      <p v-if="errors.affair" id="contact-affair-error" class="contact-form__error">
        {{ errors.affair }}
      </p>
    </div>

    <div ref="turnstileBox" class="contact-form__turnstile"></div>

    <div class="contact-form__actions">
      <button
        class="contact-form__submit"
        type="submit"
        :disabled="status === 'sending'"
      >
        {{ status === 'sending' ? '送出中…' : '確定送出' }}
      </button>
    </div>

    <!-- role=status 讓螢幕閱讀器在狀態改變時自動播報 -->
    <p v-if="status === 'success'" class="contact-form__result" role="status">
      感謝您的留言，我會盡快回覆。
    </p>
    <p
      v-else-if="submitError"
      class="contact-form__result contact-form__result--error"
      role="status"
    >
      {{ submitError }}
    </p>
  </form>
</template>

<style scoped lang="scss">
@use '@/assets/scss/variables' as v;
@use '@/assets/scss/mixins' as m;

.contact-form {
  @include m.tablet-down {
    padding: 0 100px;
  }

  @include m.mobile-down {
    padding: 0 20px;
  }
}

.contact-form__field {
  margin-bottom: 20px;

  @include m.mobile-down {
    margin-bottom: 15px;
  }

  input,
  textarea {
    display: block;
    width: 442px;
    padding: 10px 10px 10px 12px;
    background: v.$color-input-bg;
    box-shadow: inset 0 6px 13px v.$color-input-shadow;
    border-radius: v.$radius;
    color: #222;
    font-size: v.$fs-input;

    @include m.tablet-down {
      width: 100%;
    }

    @include m.mobile-down {
      padding: 7px 7px 7px 10px;
    }
  }

  textarea {
    height: 150px;
  }

  // 舊站是疊了 7 層 0 0 3px #FFDF00 的 box-shadow 來做發光，
  // 這裡用一圈實心外框，效果清楚且只需一層
  &.has-error {
    input,
    textarea {
      box-shadow:
        inset 0 6px 13px v.$color-input-shadow,
        0 0 0 2px v.$color-error;
    }
  }
}

.contact-form__error {
  padding: 6px 0 0 2px;
  color: v.$color-error;
  font-size: 14px;
  line-height: 20px;
  text-align: left;
  text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);

  @include m.tablet-down {
    max-width: none;
    margin: 0;
    padding: 6px 0 0 2px;
    text-align: left;
  }
}

.contact-form__turnstile {
  margin-bottom: 20px;

  @include m.mobile-down {
    margin-bottom: 15px;
  }
}

.contact-form__submit {
  padding: 9px 25px;
  background: v.$color-submit;
  border-radius: v.$radius;
  color: #fff;
  font-size: v.$fs-submit;
  transition: filter 0.15s ease;

  &:hover:not(:disabled) {
    filter: brightness(1.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
}

.contact-form__result {
  padding: 14px 0 0;
  color: v.$color-accent;
  font-size: 15px;
  line-height: 22px;
  text-align: left;

  &--error {
    color: v.$color-error;
  }

  @include m.tablet-down {
    max-width: none;
    margin: 0;
    padding: 14px 0 0;
    text-align: left;
  }
}
</style>
