<script setup>
import { ref, onMounted } from 'vue'
import { scrollToElement } from '../../utils/scroll'
import favicon from '../../assets/favicon.ico'

const showToast = ref(false)

onMounted(() => {
  setTimeout(() => {
    showToast.value = true
    setTimeout(() => {
      showToast.value = false
    }, 8000)
  }, 500)
})
</script>

<template>
  <transition name="toast-pop">
    <div v-if="showToast" class="performance-toast">
      <div class="toast-inner">
        <div class="toast-content">
          <img :src="favicon" class="toast-favicon" alt="Icon" />
          <p class="toast-text">
            For the best user experience, please configure your 
            <span class="toast-link" @click="scrollToElement('app-footer')">language settings</span> 
            and follow the 
            <span class="toast-link" @click="scrollToElement('welcome-section')">getting started guide</span>.
          </p>
        </div>
        <button @click="showToast = false" class="toast-close">✕</button>
      </div>
      <div class="toast-progress-bar"></div>
    </div>
  </transition>
</template>

<style scoped>
.performance-toast {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 80px);
  max-width: 1350px;
  background: #111111c7;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-top: none;
  border-radius: 0 0 12px 12px;
  z-index: 10000;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.toast-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 25px;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.toast-favicon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 6px;
}

.toast-text {
  margin: 0;
  color: var(--text-secondary);
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.toast-link {
  color: #fff;
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  padding: 0 2px;
}

.toast-link:hover {
  color: var(--accent);
  text-decoration-style: solid;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.toast-close {
  background: none;
  border: none;
  color: #555;
  cursor: pointer;
  font-size: 1.1rem;
  transition: color 0.2s;
  padding: 5px;
}

.toast-close:hover {
  color: #fff;
}

.toast-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: var(--accent);
  width: 100%;
  transform-origin: left;
  animation: toastProgress 8s linear forwards;
}

@keyframes toastProgress {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

.toast-pop-enter-active {
  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-pop-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-pop-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-100%);
}
.toast-pop-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px) scale(0.98);
}
</style>
