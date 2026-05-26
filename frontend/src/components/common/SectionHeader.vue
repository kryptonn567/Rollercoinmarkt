<script setup>
defineProps({
  title: String
})
</script>

<template>
  <div class="title-header-box glass animate-fade">
    <h1 class="vt-title-main">{{ title }}</h1>
  </div>
</template>

<style scoped>
.title-header-box {
  height: 60px;
  border-radius: 20px 20px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0 25px;
  background: rgba(15, 15, 15, 0.98) !important;
}

.vt-title-main { 
  font-family: 'Outfit', sans-serif; 
  font-weight: 700;
  font-size: 2.2rem; 
  color: var(--text-primary); 
  margin: 0; 
  letter-spacing: 2px;
  text-transform: uppercase;
}

.glass { 
  background: var(--panel-bg); 
  backdrop-filter: blur(10px); 
  border: 1px solid rgba(255,255,255,0.05); 
}

.animate-fade { 
  animation: fadeIn 0.4s ease-out; 
}

@keyframes fadeIn { 
  from { opacity: 0; } 
  to { opacity: 1; } 
}
</style>
