<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { formatPower } from '../../utils/format'

const props = defineProps({
  modelValue: String,
  searching: Boolean,
  userData: Object,
  userError: String
})

const emit = defineEmits(['update:modelValue', 'search'])

const parsedError = computed(() => {
  if (!props.userError) return { message: '', status: '' }
  
  const statusRegex = /(?:\(?Status:\s*([^)]+)\)?)/i
  const match = props.userError.match(statusRegex)
  
  if (match) {
    const statusText = `Status: ${match[1]}`
    const cleanMsg = props.userError.replace(match[0], '').replace(/\(\s*\)/, '').trim()
    return {
      message: cleanMsg,
      status: statusText
    }
  }
  
  return {
    message: props.userError,
    status: ''
  }
})

const characterAge = computed(() => {
  if (!props.userData || !props.userData.profile || !props.userData.profile.registration) return 'N/A'
  try {
    const registrationDate = new Date(props.userData.profile.registration)
    const now = new Date()
    
    let years = now.getFullYear() - registrationDate.getFullYear()
    const monthDiff = now.getMonth() - registrationDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < registrationDate.getDate())) {
      years--
    }
    
    if (years < 0) years = 0
    return `${years} Years`
  } catch (e) {
    return 'N/A'
  }
})

const currentPowerPercent = computed(() => {
  if (!props.userData || !props.userData.max_power) return 0
  const percent = (props.userData.current_power / props.userData.max_power) * 100
  return Math.min(Math.max(percent, 0), 100)
})

let typingTimer = null
let deletingTimer = null

function startTypewriter() {
  clearInterval(typingTimer)
  clearInterval(deletingTimer)

  const target = 'Kryptonn'
  let current = ''
  emit('update:modelValue', '')

  let index = 0
  typingTimer = setInterval(() => {
    if (index < target.length) {
      current += target[index]
      emit('update:modelValue', current)
      index++
    } else {
      clearInterval(typingTimer)
    }
  }, 120)
}

function startBackspace() {
  clearInterval(typingTimer)
  clearInterval(deletingTimer)

  const currentVal = props.modelValue
  if (!currentVal) return

  let current = currentVal
  deletingTimer = setInterval(() => {
    if (current.length > 0) {
      current = current.slice(0, -1)
      emit('update:modelValue', current)
    } else {
      clearInterval(deletingTimer)
    }
  }, 30)
}

function handleInputFocus() {
  if ('Kryptonn'.startsWith(props.modelValue) && props.modelValue.length > 0) {
    startBackspace()
  } else if (props.modelValue === 'Kryptonn') {
    startBackspace()
  }
}

function handleInputBlur() {
  if (!props.modelValue) {
    startTypewriter()
  }
}

function handleInput(event) {
  clearInterval(typingTimer)
  clearInterval(deletingTimer)
  emit('update:modelValue', event.target.value)
}

onMounted(() => {
  if (!props.modelValue || props.modelValue === 'Kryptonn') {
    startTypewriter()
  }
})

onUnmounted(() => {
  clearInterval(typingTimer)
  clearInterval(deletingTimer)
})
</script>

<template>
  <div class="header-box glass">
    <div class="rig-search-container">
      <div class="search-input-wrapper">
        <span class="url-prefix">www.rollercoin.com/p/</span>
        <input 
          :value="modelValue"
          @input="handleInput"
          @keyup.enter="emit('search')"
          @focus="handleInputFocus"
          @blur="handleInputBlur"
          type="text" 
          placeholder=""
          class="rig-search-input"
          :class="{ 'is-default': modelValue === 'Kryptonn' }"
        />
      </div>
      <button @click="emit('search')" :disabled="searching" class="rig-scan-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="search-svg" :class="{ 'is-scanning': searching }">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </button>
    </div>
    <div v-if="userError" class="error-alert-box animate-pop">
      <div class="error-alert-content">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="alert-icon">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span class="error-message">{{ parsedError.message }}</span>
      </div>
      <span v-if="parsedError.status" class="error-status">{{ parsedError.status }}</span>
    </div>

    <div v-if="userData" class="user-identity-badge animate-pop">
      <!-- Profile Top Row -->
      <div class="profile-main-row">
        <div class="avatar-container">
          <img 
            :src="`https://avatars.rollercoin.com/static/avatars/thumbnails/145/${userData.profile.avatar_id}.png`" 
            class="avatar-img" 
            alt="Avatar" 
          />
        </div>
        <div class="user-info-wrapper">
          <div class="username-badge">
            <span class="un-label">USERNAME:</span>
            <span class="un-value">{{ userData.profile.name }}</span>
          </div>
          <div class="character-age-badge">
            <span class="ca-label">CHARACTER AGE:</span>
            <span class="ca-value">{{ characterAge }}</span>
          </div>
          <div class="league-title-badge">
            <span class="lt-label">LEAGUE NAME:</span>
            <span class="lt-value">{{ userData.profile.league?.title?.en || 'N/A' }}</span>
          </div>
        </div>

        <!-- League Icon Container -->
        <div v-if="userData.profile.league_id" class="league-badge-container">
          <img 
            :src="`https://static.rollercoin.com/static/img/icons/leagues/${userData.profile.league_id}.png`" 
            class="league-badge-img" 
            alt="League Badge" 
          />
        </div>
      </div>

      <!-- Power Progress Bars Section (Stacked & Span Full Width) -->
      <div class="user-power-bars">
        <div class="power-bar-wrapper">
          <div class="power-bar-header">
            <span class="power-bar-label">LEAGUE POWER</span>
            <span class="power-bar-value">{{ formatPower(userData.max_power) }}</span>
          </div>
          <div class="power-bar-track">
            <div class="power-bar-fill league-fill" style="width: 100%"></div>
          </div>
        </div>
        <div class="power-bar-wrapper">
          <div class="power-bar-header">
            <span class="power-bar-label">CURRENT POWER</span>
            <span class="power-bar-value">{{ formatPower(userData.current_power) }}</span>
          </div>
          <div class="power-bar-track">
            <div class="power-bar-fill current-fill" :style="{ width: currentPowerPercent + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-box { 
  padding: 25px; 
  border-radius: 0 0 20px 20px;
  text-align: center; 
  height: auto;
  min-height: 310px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  box-sizing: border-box;
  transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  border-top: none;
  position: relative;
  z-index: 1;
}

.header-box::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-image: url('https://static.rollercoin.com/static/rooms/sprites/inventory/room_background.png');
  background-size: cover;
  background-position: center;
  opacity: 0.12;
  z-index: -1;
  pointer-events: none;
  filter: grayscale(1) brightness(0.6);
}

.rig-search-container {
  display: flex;
  gap: 10px;
  width: 92%;
  margin: 0 auto 15px auto;
  transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0 15px;
  height: 44px;
  box-sizing: border-box;
  transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.search-input-wrapper:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}

.url-prefix {
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  color: #444;
  user-select: none;
  white-space: nowrap;
  padding-right: 1px;
  transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.rig-search-input {
  background: none;
  border: none !important;
  color: #ccc;
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  padding: 0;
  margin-top: -1px;
  width: 100%;
  outline: none;
  transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.rig-search-input.is-default {
  color: #5a5a5a;
}

.user-identity-badge {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 92%;
  margin: 12px auto 0;
  gap: 16px;
}

.profile-main-row {
  display: flex;
  align-items: center;
  width: 100%;
}

.avatar-container {
  width: 104px;
  height: 104px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.7); 
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.avatar-img {
  width: 85%;
  height: 85%;
  object-fit: contain;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.1));
}

.user-info-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 104px;
  margin-left: 20px;
  text-align: left;
  gap: 8px;
  box-sizing: border-box;
}

.username-badge,
.character-age-badge,
.league-title-badge {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 8px;
  text-align: left;
}

.un-label,
.ca-label,
.lt-label {
  font-family: 'Outfit', sans-serif;
  font-size: 0.7rem;
  font-weight: 700;
  color: #555;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  line-height: 1;
  width: 130px;
  flex-shrink: 0;
  white-space: nowrap;
}

.un-value,
.ca-value,
.lt-value {
  font-family: 'Outfit', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  line-height: 1;
  letter-spacing: 0.5px;
}

.rig-scan-btn {
  width: 50px;
  height: 44px; 
  background: var(--accent);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  box-sizing: border-box;
  transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
  flex-shrink: 0;
}

.rig-scan-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 0 25px rgba(255, 255, 255, 0.4);
}

.rig-scan-btn:disabled {
  background: #222;
  color: #444;
  cursor: not-allowed;
}

.search-svg {
  width: 24px;
  height: 24px;
  transition: transform 0.3s;
}

.search-svg.is-scanning {
  animation: scanningMotion 1.5s infinite ease-in-out;
}

@keyframes scanningMotion {
  0% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  100% { transform: translateX(-5px); }
}

.error-alert-box {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: rgba(255, 51, 102, 0.05);
  border: 1px solid rgba(255, 51, 102, 0.15);
  border-radius: 12px;
  padding: 28px 18px 24px 18px;
  width: 90%;
  margin: 15px auto 0 auto;
  box-sizing: border-box;
}

.error-alert-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-icon {
  width: 18px;
  height: 18px;
  color: #ff3366;
  flex-shrink: 0;
}

.error-message {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  color: #ffebef;
  font-weight: 600;
  text-align: left;
  line-height: 1.2;
  margin: 0;
  display: inline-block;
}

.error-status {
  position: absolute;
  bottom: 6px;
  right: 12px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.72rem;
  color: rgba(255, 235, 239, 0.45);
  font-weight: 700;
  letter-spacing: 0.5px;
}

.glass { 
  background: var(--panel-bg); 
  backdrop-filter: blur(10px); 
  border: 1px solid rgba(255,255,255,0.05); 
}

@keyframes popIn {
  0% { transform: scale(0.9) translateY(10px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

.animate-pop {
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
.league-badge-container {
  width: 80px;
  height: 80px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.league-badge-container:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.league-badge-img {
  width: 70%;
  height: 70%;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.15));
}

/* Power Progress Bars styles */
.user-power-bars {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  margin-top: 10px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.power-bar-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.power-bar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.power-bar-label {
  font-family: 'Outfit', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  color: #888;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.power-bar-value {
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
}

.power-bar-track {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.power-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.league-fill {
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.4);
}

.current-fill {
  background: linear-gradient(90deg, #3b82f6, #10b981);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
}
</style>
