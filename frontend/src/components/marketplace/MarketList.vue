<script setup>
import { formatPower, formatBonus } from '../../utils/format'

const props = defineProps({
  loadingMiners: Boolean,
  paginatedItems: Array,
  currentPage: Number,
  totalMarketPages: Number,
  isJumpMode: Boolean,
  jumpValue: [String, Number],
  jumpError: Boolean,
  currentBoxWidth: String
})

const emit = defineEmits([
  'changePage', 
  'onReelMouseDown', 
  'enterJumpMode', 
  'commitJump', 
  'cancelJump',
  'update:jumpValue'
])

const vFocus = {
  mounted: (el) => el.focus()
}
</script>

<template>
  <div class="market-list-vertical">
    <div v-if="loadingMiners" class="loading-spinner">Loading Market Data...</div>
    <div v-for="miner in paginatedItems" :key="miner.id" class="market-entry-card glass">
      <img 
        v-if="miner.filename"
        :src="`https://static.rollercoin.com/static/img/market/miners/${miner.filename}.gif`" 
        class="miner-thumbnail" 
        alt="" 
      />
      <div class="entry-sidebar">
        <div :class="['status-dot', `lvl-${miner.level}`]"></div>
      </div>
      <div class="width-indicator-group">
        <div v-for="w in (miner.width || 1)" :key="w" class="width-bar"></div>
      </div>
      <div class="entry-details">
        <p class="entry-name">{{ miner.name }}</p>
        <div class="entry-stats">
          <span>{{ formatPower(miner.power) }}</span>
          <div class="stat-divider"></div>
          <span>{{ formatBonus(miner.bonus) }}% Bonus</span>
        </div>
      </div>
      <div class="entry-price-group">
        <span class="price-from">from:</span>
        <div class="price-value-row">
          <img src="https://rollercoincalculator.app/assets/rlt--ASCWsvx.svg" class="rlt-icon" alt="RLT" />
          <div class="price-value">
            {{ miner.price }} <span class="rlt-suffix">RLT</span>
          </div>
        </div>
        <div class="quantity-row">
          Quantity: {{ miner.count || 0 }}
          <a :href="`https://rollercoin.com/marketplace/buy/miner/${miner.id}`" target="_blank" class="ext-link-tag">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ext-link-svg"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
        </div>
      </div>
    </div>
  </div>

  <div v-if="totalMarketPages > 1" class="reel-pagination-wrapper animate-fade">
    <button @click="emit('changePage', 1, true)" :disabled="currentPage === 1" class="reel-edge-btn left">
      |<
    </button>
    
    <div class="reel-viewport-container glass" @mousedown="emit('onReelMouseDown', $event)">
      <div 
        class="reel-track" 
        :style="{ transform: `translateX(calc(50% - ${(currentPage - 0.5) * 55}px))` }"
      >
        <div 
          v-for="p in totalMarketPages" 
          :key="p" 
          class="reel-num-item"
          :class="{ active: p === currentPage }"
        >
          <template v-if="isJumpMode && p === currentPage">
            <input 
              type="number"
              :value="jumpValue"
              @input="emit('update:jumpValue', $event.target.value)"
              @keyup.enter="emit('commitJump')"
              @keyup.esc="emit('cancelJump')"
              @blur="emit('cancelJump')"
              class="reel-jump-input"
              :style="{ width: currentBoxWidth }"
              :class="{ 'jump-error-shake': jumpError }"
              v-focus
            />
          </template>
          <template v-else>
            <span 
              class="num-text" 
              @click="p !== currentPage ? emit('changePage', p, true) : null"
              @dblclick="p === currentPage ? emit('enterJumpMode') : null"
            >
              {{ p }}
            </span>
          </template>
        </div>
      </div>
      <div class="reel-fade left"></div>
      <div class="reel-fade right"></div>
      <div 
        class="reel-focus-ring" 
        :class="{ 'focus-ring-hidden': isJumpMode }"
        :style="{ width: currentBoxWidth }"
      ></div>
    </div>

    <button @click="emit('changePage', totalMarketPages, true)" :disabled="currentPage === totalMarketPages" class="reel-edge-btn right">
      >|
    </button>
  </div>
</template>

<style scoped>
.market-list-vertical { 
  display: flex; 
  flex-direction: column; 
  gap: 12px; 
  flex: 1; 
  min-height: 1914px;
}

.market-entry-card { 
  position: relative;
  padding: 22px 25px; border-radius: 18px; 
  display: flex; align-items: center; justify-content: space-between;
  transition: all 0.2s ease;
  border: 1px solid rgba(255,255,255,0.05);
  height: 95px; 
  box-sizing: border-box;
  overflow: hidden; 
}

.market-entry-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 30px rgba(0,0,0,0.6);
  transform: translateY(-5px);
}

.miner-thumbnail {
  position: absolute;
  right: 120px;
  top: 50%;
  height: 160%;
  transform: translateY(-50%) rotate(-25deg);
  opacity: 0.15; 
  pointer-events: none;
  z-index: 0;
  filter: grayscale(0.3) brightness(1.1); 
  transition: all 0.7s cubic-bezier(0.15, 0, 0.15, 1);
}

.market-entry-card:hover .miner-thumbnail {
  opacity: 0.4; 
  transform: translateY(-51%) rotate(-18deg) scale(1.1);
  filter: grayscale(0) brightness(1.2);
}

.status-dot { 
  width: 10px; 
  height: 10px; 
  border-radius: 50%; 
  flex-shrink: 0; 
}

.entry-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 25px; 
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.width-indicator-group {
  position: absolute;
  bottom: 0;
  left: 30px;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  gap: 3px;
  pointer-events: none;
  z-index: 3; 
}

.width-bar {
  width: 5px;
  height: 18px;
  flex-shrink: 0;
  border-radius: 2px 2px 0 0;
  background: rgba(255, 255, 255, 0.15); 
  transition: all 0.3s ease;
}

.entry-details { 
  flex: 1; 
  min-width: 0; 
  display: flex; 
  flex-direction: column; 
  align-items: flex-start;
  text-align: left;
  position: relative;
  z-index: 2;
}

.entry-name { 
  font-family: 'Outfit', sans-serif; 
  font-weight: 600;
  font-size: 1.15rem; 
  margin: 0; 
  color: #fff; 
  width: 100%;
}

.entry-stats { 
  font-size: 0.85rem; 
  color: #888; 
  margin-top: 4px;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 5px;
  letter-spacing: 0.5px;
}

.stat-divider {
  width: 2px;
  height: 14px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0;
  user-select: none;
}

.entry-price-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  min-width: 130px;
  gap: 2px;
  position: relative;
  z-index: 2;
}

.price-from {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.2);
  font-weight: 300;
}

.price-value-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rlt-icon {
  width: 20px;
  height: 20px;
}

.price-value {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  color: #03e1e4;
  font-size: 1.2rem;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.rlt-suffix {
  font-size: 0.85rem;
  opacity: 0.6;
  font-weight: 400;
}

.quantity-row {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.3);
  margin-top: -2px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.ext-link-tag {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.ext-link-svg {
  width: 13px;
  height: 13px;
  color: rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.ext-link-tag:hover .ext-link-svg {
  color: #fff;
  transform: scale(1.15);
}

.lvl-0 { background: var(--lvl-0); box-shadow: 0 0 5px var(--lvl-0); }
.lvl-1 { background: var(--lvl-1); box-shadow: 0 0 7px var(--lvl-1); }
.lvl-2 { background: var(--lvl-2); box-shadow: 0 0 7px var(--lvl-2); }
.lvl-3 { background: var(--lvl-3); box-shadow: 0 0 7px var(--lvl-3); }
.lvl-4 { background: var(--lvl-4); box-shadow: 0 0 7px var(--lvl-4); }
.lvl-5 { background: var(--lvl-5); box-shadow: 0 0 7px var(--lvl-5); }

.reel-pagination-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0; 
  width: 100%;
  margin-top: 40px;
}

.reel-edge-btn {
  background: none;
  border: none;
  color: #333;
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: -1px;
  padding: 0 15px;
  height: 60px;
  cursor: pointer; 
  transition: all 0.2s;
  flex-shrink: 0;
  z-index: 10;
}

.reel-edge-btn:hover:not(:disabled) {
  color: #fff;
  text-shadow: 0 0 10px #fff;
}

.reel-edge-btn:disabled {
  opacity: 0; 
  cursor: default;
}

.reel-viewport-container {
  flex: none;
  width: 275px; 
  height: 60px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  cursor: default; 
  user-select: none;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.reel-track {
  display: flex;
  height: 100%;
  align-items: center;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform;
}

.reel-num-item {
  min-width: 55px; 
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  color: #444;
  transition: all 0.3s;
}

.num-text {
  cursor: pointer; 
  padding: 5px 10px;
}

.reel-num-item.active {
  color: #fff;
  font-size: 1.6rem;
  font-weight: 700;
  text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
}

.reel-jump-input {
  min-width: 60px; 
  height: 48px; 
  background: rgba(255, 255, 255, 0.08); 
  border: 2px solid #fff;
  border-radius: 10px;
  color: #fff;
  text-align: center;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1.5rem; 
  outline: none;
  padding: 0 10px; 
}

.reel-fade {
  position: absolute;
  top: 0;
  height: 100%;
  width: 60px; 
  pointer-events: none;
  z-index: 5;
}

.reel-fade.left { left: 0; background: linear-gradient(to right, #000 0%, rgba(0,0,0,0) 100%); }
.reel-fade.right { right: 0; background: linear-gradient(to left, #000 0%, rgba(0,0,0,0) 100%); }

.reel-focus-ring {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  min-width: 60px;
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  height: 50px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  pointer-events: none;
  z-index: 4;
}

.focus-ring-hidden { border-color: transparent !important; }

.glass { background: var(--panel-bg); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.05); }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.animate-fade { animation: fadeIn 0.4s ease-out; }

.loading-spinner {
  text-align: center;
  padding: 40px;
  color: #888;
  font-family: 'Outfit', sans-serif;
}
</style>
