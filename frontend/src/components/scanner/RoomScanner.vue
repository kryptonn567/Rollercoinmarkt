<script setup>
import { formatPower, formatBonus } from '../../utils/format'

const props = defineProps({
  userData: Object,
  filteredRacks: Array,
  expandedRackId: [String, Number, null],
  currentRoomPage: Number,
  dragIndex: [Number, null],
  getRackMiners: Function
})

const emit = defineEmits(['toggleRack', 'changeRoomPage', 'pointerDown'])
</script>

<template>
  <div v-if="userData" class="room-list room-list-animate">
    <transition-group name="list-reorder" tag="div">
      <div 
        v-for="(rack, index) in filteredRacks" 
        :key="rack._id"
        class="rack-list-item glass"
        :class="{ 
          active: expandedRackId === rack._id,
          'is-dragging': dragIndex === index 
        }"
        @pointerdown="emit('pointerDown', $event, index)"
      >
        <div class="drag-handle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="drag-icon-svg">
            <polyline points="7 15 12 20 17 15"></polyline>
            <polyline points="7 9 12 4 17 9"></polyline>
          </svg>
        </div>
        <div class="rack-item-main">
          <div class="rack-info">
            <span class="r-name">{{ rack.name }}</span>
            <span class="r-stats">Bonus: {{ (rack.bonus / 100).toFixed(1) }}%</span>
          </div>
          <button @click="emit('toggleRack', rack._id)" :class="['arrow-btn', { rotated: expandedRackId === rack._id }]">
            <span class="arrow-icon">▼</span>
          </button>
        </div>

        <transition name="slide">
          <div v-if="expandedRackId === rack._id" class="rack-expanded-content">
            <div v-if="getRackMiners(rack._id).length === 0" class="empty-hint-large">
              This rack is currently empty
            </div>
            <div 
              v-for="miner in getRackMiners(rack._id)" 
              :key="miner.placement.order"
              class="expanded-miner-card"
            >
              <img 
                v-if="miner.image_name || miner.filename"
                :src="`https://static.rollercoin.com/static/img/market/miners/${miner.image_name || miner.filename}.gif`" 
                class="miner-thumbnail-small" 
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
                  <span>{{ formatBonus((miner.bonus_percent !== undefined ? miner.bonus_percent : miner.bonus) / 100) }}% Bonus</span>
                  <a :href="`https://rollercoin.com/marketplace/buy/miner/${miner.miner_id}`" target="_blank" class="ext-link-tag">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="ext-link-svg"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition-group>
  </div>

  <div v-else id="welcome-section" class="placeholder-box glass room-list-animate">
    <div class="placeholder-intro">
      <h2 class="intro-title">WELCOME TO ROLLERCOINMARKT</h2>
      <p class="intro-text">Master the RollerCoin market with precision. Use our professional scanning tools to analyze room configurations, track miner power, and optimize your collection strategy effectively.</p>
    </div>

    <div v-for="i in 8" :key="i" class="step-item">
      <div class="step-num">{{ String(i).padStart(2, '0') }}</div>
      <div class="step-content">
        <h4 class="step-header">LOREM IPSUM HEADING {{ i }}</h4>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      </div>
    </div>
  </div>

  <div v-if="userData && userData.room_data.rooms.length > 1" class="room-reel-wrapper animate-fade">
    <div class="room-reel-container glass">
      <button 
        v-for="(room, idx) in userData.room_data.rooms" 
        :key="idx"
        @click="emit('changeRoomPage', idx + 1)"
        :class="['room-reel-btn', { active: currentRoomPage === (idx + 1) }]"
      >
        <span class="room-label-tiny">ROOM</span>
        <span class="room-num-large">{{ idx + 1 }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.room-list > div {
  display: flex;
  flex-direction: column;
  gap: 10px; 
  flex: 1;
}

.rack-list-item {
  position: relative;
  border-radius: 18px;
  overflow: visible; 
  transition: all 0.3s ease;
  border: 1px solid rgba(255,255,255,0.05);
  min-height: 95px;
  display: flex;
  flex-direction: column;
}

.rack-list-item.active {
  border-color: var(--accent);
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
}

.drag-handle {
  position: absolute;
  left: -34px;
  top: 48px;
  transform: translateY(-50%);
  opacity: 0;
  cursor: n-resize;
  color: var(--accent);
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-right: none;
  border-radius: 8px 0 0 8px;
  width: 32px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 5;
}

.rack-list-item:hover .drag-handle {
  opacity: 1;
}

.drag-handle:hover {
  opacity: 1 !important;
  transform: translateY(-50%) scale(1.1) translateX(-1px);
}

.drag-icon-svg {
  width: 20px;
  height: 20px;
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.3));
}

.rack-item-main {
  padding: 22px 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;
}

.rack-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.r-name {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 1.25rem;
  color: var(--text-primary);
  line-height: 1;
}

.r-stats {
  font-size: 0.95rem;
  color: #888;
}

.arrow-btn {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.arrow-icon {
  font-size: 1.4rem;
}

.arrow-btn.rotated {
  transform: rotate(180deg);
}

.rack-list-item.is-dragging {
  border-color: #00e5ff;
  box-shadow: 0 10px 40px rgba(0, 229, 255, 0.4);
  background: rgba(0, 229, 255, 0.1);
  z-index: 9999 !important; 
  transform: scale(1.02); 
}

.rack-expanded-content {
  padding: 0 25px 25px;
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(0,0,0,0.2);
}

.expanded-miner-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  transition: all 0.2s ease;
  border-radius: 12px;
  overflow: hidden; 
}

.expanded-miner-card:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(8px);
}

.miner-thumbnail-small {
  position: absolute;
  right: 60px;
  top: 50%;
  height: 140%;
  transform: translateY(-50%) rotate(-20deg);
  opacity: 0.12;
  pointer-events: none;
  z-index: 0;
  filter: grayscale(0.3) brightness(1.1);
  transition: all 0.5s ease;
}

.expanded-miner-card:hover .miner-thumbnail-small {
  opacity: 0.35;
  transform: translateY(-50%) rotate(-12deg) scale(1.1);
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
  left: 23px;
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
  justify-content: flex-start;
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

.ext-link-svg {
  width: 13px;
  height: 13px;
  color: rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.placeholder-box {
  flex: 1;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 45px 40px 40px; 
  background: rgba(255, 255, 255, 0.02);
}

.placeholder-intro {
  margin-bottom: -5px; 
  padding-bottom: 35px; 
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  text-align: left;
}

.intro-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px; 
  letter-spacing: 1px;
}

.intro-text {
  font-size: 1.05rem;
  color: #888;
  line-height: 1.6;
  margin: 0;
  max-width: 90%;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  transition: all 0.3s ease;
  cursor: default;
}

.step-num {
  font-family: 'Outfit', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--accent);
  opacity: 0.15;
  min-width: 45px;
  padding-top: 5px;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-header {
  margin: 0;
  font-family: 'Outfit', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
  opacity: 0.8;
  text-transform: uppercase;
}

.step-item p {
  margin: 0;
  font-size: 0.95rem;
  color: #555;
  font-family: 'Inter', sans-serif;
  line-height: 1.6;
}

.room-reel-wrapper {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
}

.room-reel-container {
  display: flex;
  padding: 5px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  gap: 8px;
}

.room-reel-btn {
  background: none;
  border: none;
  padding: 6px 20px;
  border-radius: 10px;
  color: #555;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  min-width: 65px;
}

.room-reel-btn.active {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.5);
  box-shadow: inset 0 0 15px rgba(255, 255, 255, 0.05);
}

.room-label-tiny {
  font-family: 'Outfit', sans-serif;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: -1px;
  opacity: 0.6;
}

.room-num-large {
  font-family: 'Outfit', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
}

.lvl-0 { background: var(--lvl-0); box-shadow: 0 0 5px var(--lvl-0); }
.lvl-1 { background: var(--lvl-1); box-shadow: 0 0 7px var(--lvl-1); }
.lvl-2 { background: var(--lvl-2); box-shadow: 0 0 7px var(--lvl-2); }
.lvl-3 { background: var(--lvl-3); box-shadow: 0 0 7px var(--lvl-3); }
.lvl-4 { background: var(--lvl-4); box-shadow: 0 0 7px var(--lvl-4); }
.lvl-5 { background: var(--lvl-5); box-shadow: 0 0 7px var(--lvl-5); }

.glass { background: var(--panel-bg); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.05); }

.room-list-animate { animation: slideUpFade 1.2s cubic-bezier(0.16, 1, 0.3, 1); }
.animate-fade { animation: fadeIn 0.4s ease-out; }

@keyframes slideUpFade { 
  from { opacity: 0; transform: translateY(40px); } 
  to { opacity: 1; transform: translateY(0); } 
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.slide-enter-active, .slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 800px;
  overflow: hidden;
}

.slide-enter-from, .slide-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.list-reorder-move {
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;
}
</style>
