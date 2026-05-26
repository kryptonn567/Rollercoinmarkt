<script setup>
import { ref, computed } from 'vue'
import { getPercent } from '../../utils/math'

const props = defineProps({
  marketSearch: String,
  priceFilter: Object,
  powerFilter: Object,
  bonusFilter: Object,
  selectedWidths: Array,
  selectedRarities: Array,
  sortValue: String,
  isSortMenuOpen: Boolean,
  rarityMap: Array,
  maxStats: {
    type: Object,
    default: () => ({ price: 100000, power: 2000000000, bonus: 100 })
  }
})

const emit = defineEmits([
  'update:marketSearch', 
  'update:sortValue', 
  'toggleWidth', 
  'toggleRarity', 
  'toggleSortMenu'
])

// Track which thumb was last interacted with for z-index
const activeThumb = ref({ price: 'max', power: 'max', bonus: 'max' })

function handleRangeInput(filter, type, event, statKey) {
  const val = parseInt(event.target.value) || 0
  activeThumb.value[statKey] = type

  if (type === 'min') {
    if (val >= filter.max) {
      filter.min = filter.max
      event.target.value = filter.max
    } else {
      filter.min = val
    }
  } else {
    if (val <= filter.min) {
      filter.max = filter.min
      event.target.value = filter.min
    } else {
      filter.max = val
    }
  }
}

// Power formatting helper and computed properties
function getUnitInfo(val) {
  if (val >= 1000000000) return { unit: 'Eh/S', mult: 1000000000 }
  if (val >= 1000000) return { unit: 'Ph/S', mult: 1000000 }
  if (val >= 1000) return { unit: 'Th/S', mult: 1000 }
  return { unit: 'Gh/S', mult: 1 }
}

const minPowerDisplay = computed({
  get() {
    const val = props.powerFilter.min
    const { mult } = getUnitInfo(val)
    return Number((val / mult).toFixed(2))
  },
  set(newVal) {
    const parsed = parseFloat(newVal)
    if (isNaN(parsed)) return
    const { mult } = getUnitInfo(props.powerFilter.min)
    props.powerFilter.min = Math.round(parsed * mult)
  }
})

const minPowerUnit = computed(() => {
  return getUnitInfo(props.powerFilter.min).unit
})

const maxPowerDisplay = computed({
  get() {
    const val = props.powerFilter.max
    if (val >= props.maxStats.power) return ''
    const { mult } = getUnitInfo(val)
    return Number((val / mult).toFixed(2))
  },
  set(newVal) {
    if (newVal === '') {
      props.powerFilter.max = props.maxStats.power
      return
    }
    const parsed = parseFloat(newVal)
    if (isNaN(parsed)) return
    const currentRefVal = props.powerFilter.max >= props.maxStats.power ? props.maxStats.power : props.powerFilter.max
    const { mult } = getUnitInfo(currentRefVal)
    props.powerFilter.max = Math.round(parsed * mult)
  }
})

const maxPowerUnit = computed(() => {
  if (props.powerFilter.max >= props.maxStats.power) {
    return getUnitInfo(props.maxStats.power).unit
  }
  return getUnitInfo(props.powerFilter.max).unit
})

// Non-linear power slider scale helpers (fourth-power)
function powerToSlider(val, maxPower) {
  if (!maxPower || val <= 0) return 0
  if (val >= maxPower) return 1000
  return Math.round(1000 * Math.pow(val / maxPower, 0.25))
}

function sliderToPower(sliderVal, maxPower) {
  if (!maxPower || sliderVal <= 0) return 0
  if (sliderVal >= 1000) return maxPower
  return Math.round(maxPower * Math.pow(sliderVal / 1000, 4))
}

function handlePowerRangeInput(type, event) {
  const sliderVal = parseInt(event.target.value) || 0
  activeThumb.value.power = type

  const actualVal = sliderToPower(sliderVal, props.maxStats.power)

  if (type === 'min') {
    if (actualVal >= props.powerFilter.max) {
      props.powerFilter.min = props.powerFilter.max
      event.target.value = powerToSlider(props.powerFilter.max, props.maxStats.power)
    } else {
      props.powerFilter.min = actualVal
    }
  } else {
    if (actualVal <= props.powerFilter.min) {
      props.powerFilter.max = props.powerFilter.min
      event.target.value = powerToSlider(props.powerFilter.min, props.maxStats.power)
    } else {
      props.powerFilter.max = actualVal
    }
  }
}

function selectSortOption(val) {
  emit('update:sortValue', val)
  emit('toggleSortMenu')
}
</script>

<template>
  <div class="market-header-box glass">
    <div class="market-filters-grid">
      <!-- Row 1: Search and Sort -->
      <div class="filter-row search-sort-row">
        <div class="market-search-wrapper">
          <input 
            :value="marketSearch"
            @input="emit('update:marketSearch', $event.target.value)"
            type="text" 
            placeholder="Search miners..."
            class="market-search-input"
          />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="m-search-icon">
            <circle cx="11" cy="11" r="7"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <div class="sort-dropdown-container">
          <button @click="emit('toggleSortMenu')" class="sort-trigger-btn" :class="{ active: isSortMenuOpen }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="sort-icon-svg">
              <path d="M11 6h10M11 12h7M11 18h4"></path>
              <path d="M4 18V6M4 18l-3-3M4 18l3-3"></path>
            </svg>
          </button>
          <transition name="menu-pop">
            <div v-if="isSortMenuOpen" class="sort-menu glass">
              <div v-for="(opt, idx) in [
                {v:'price_desc', c:'Price', l:'High-Low', t:'artan'}, {v:'price_asc', c:'Price', l:'Low-High', t:'azalan'},
                {v:'sep'},
                {v:'count_desc', c:'Quantity', l:'High-Low', t:'artan'}, {v:'count_asc', c:'Quantity', l:'Low-High', t:'azalan'},
                {v:'sep'},
                {v:'power_desc', c:'Power', l:'High-Low', t:'artan'}, {v:'power_asc', c:'Power', l:'Low-High', t:'azalan'},
                {v:'sep'},
                {v:'bonus_desc', c:'Bonus', l:'High-Low', t:'artan'}, {v:'bonus_asc', c:'Bonus', l:'Low-High', t:'azalan'}
              ]" :key="idx">
                <div v-if="opt.v === 'sep'" class="sort-divider"></div>
                <div v-else 
                  @click="selectSortOption(opt.v)"
                  class="sort-option" :class="{ selected: sortValue === opt.v }">
                  <span class="opt-label"><span class="opt-cat">{{ opt.c }}:</span> {{ opt.l }}</span>
                  <svg v-if="opt.t === 'artan'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="sort-trend-icon artan">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="sort-trend-icon azalan">
                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                    <polyline points="17 18 23 18 23 12"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Row 2: Range Sliders -->
      <div class="filter-row range-sliders-row">
        <!-- Price Slider -->
        <div class="range-group-horizontal">
          <span class="group-label">Price:</span>
          <div class="dual-range-slider">
            <input type="range" min="0" :max="maxStats.price" :value="priceFilter.min" 
              @input="handleRangeInput(priceFilter, 'min', $event, 'price')" 
              class="range-thumb" :style="{ zIndex: activeThumb.price === 'min' ? 5 : 4 }" />
            <input type="range" min="0" :max="maxStats.price" :value="priceFilter.max" 
              @input="handleRangeInput(priceFilter, 'max', $event, 'price')" 
              class="range-thumb" :style="{ zIndex: activeThumb.price === 'max' ? 5 : 4 }" />
            <div class="range-track"></div>
            <div class="range-progress" :style="{ 
              left: getPercent(priceFilter.min, maxStats.price) + '%', 
              right: (100 - getPercent(priceFilter.max, maxStats.price)) + '%' 
            }"></div>
          </div>
          <div class="range-values">
            <div class="range-field-with-unit">
              <input type="number" v-model.number="priceFilter.min" class="range-input-small" />
              <span class="unit-label">RLT</span>
            </div>
            <span class="range-sep">-</span>
            <div class="range-field-with-unit">
              <input type="text" 
                class="range-input-small"
                :placeholder="priceFilter.max >= maxStats.price ? '∞' : ''"
                :value="priceFilter.max >= maxStats.price ? '' : priceFilter.max"
                @input="priceFilter.max = $event.target.value === '' ? 1000000000 : (parseInt($event.target.value) || 0)"
                @blur="($event.target.value === '') && (priceFilter.max = 1000000000)" />
              <span class="unit-label">RLT</span>
            </div>
          </div>
        </div>

        <!-- Power Slider -->
        <div class="range-group-horizontal">
          <span class="group-label">Power:</span>
          <div class="dual-range-slider">
            <input type="range" min="0" max="1000" :value="powerToSlider(powerFilter.min, maxStats.power)" 
              @input="handlePowerRangeInput('min', $event)" 
              class="range-thumb" :style="{ zIndex: activeThumb.power === 'min' ? 5 : 4 }" />
            <input type="range" min="0" max="1000" :value="powerToSlider(powerFilter.max, maxStats.power)" 
              @input="handlePowerRangeInput('max', $event)" 
              class="range-thumb" :style="{ zIndex: activeThumb.power === 'max' ? 5 : 4 }" />
            <div class="range-track"></div>
            <div class="range-progress" :style="{ 
              left: (powerToSlider(powerFilter.min, maxStats.power) / 10) + '%', 
              right: (100 - (powerToSlider(powerFilter.max, maxStats.power) / 10)) + '%' 
            }"></div>
          </div>
          <div class="range-values">
            <div class="range-field-with-unit">
              <input type="number" v-model.number="minPowerDisplay" class="range-input-small" step="any" />
              <span class="unit-label">{{ minPowerUnit }}</span>
            </div>
            <span class="range-sep">-</span>
            <div class="range-field-with-unit">
              <input type="text" 
                class="range-input-small"
                :placeholder="powerFilter.max >= maxStats.power ? '∞' : ''"
                v-model="maxPowerDisplay"
                @blur="($event.target.value === '') && (powerFilter.max = maxStats.power)" />
              <span class="unit-label">{{ maxPowerUnit }}</span>
            </div>
          </div>
        </div>

        <!-- Bonus Slider -->
        <div class="range-group-horizontal">
          <span class="group-label">Bonus:</span>
          <div class="dual-range-slider">
            <input type="range" min="0" :max="maxStats.bonus" :value="bonusFilter.min" 
              @input="handleRangeInput(bonusFilter, 'min', $event, 'bonus')" 
              class="range-thumb" :style="{ zIndex: activeThumb.bonus === 'min' ? 5 : 4 }" />
            <input type="range" min="0" :max="maxStats.bonus" :value="bonusFilter.max" 
              @input="handleRangeInput(bonusFilter, 'max', $event, 'bonus')" 
              class="range-thumb" :style="{ zIndex: activeThumb.bonus === 'max' ? 5 : 4 }" />
            <div class="range-track"></div>
            <div class="range-progress" :style="{ 
              left: getPercent(bonusFilter.min, maxStats.bonus) + '%', 
              right: (100 - getPercent(bonusFilter.max, maxStats.bonus)) + '%' 
            }"></div>
          </div>
          <div class="range-values">
            <div class="range-field-with-unit">
              <input type="number" v-model.number="bonusFilter.min" class="range-input-small" />
              <span class="unit-label">%</span>
            </div>
            <span class="range-sep">-</span>
            <div class="range-field-with-unit">
              <input type="text" 
                class="range-input-small"
                :placeholder="bonusFilter.max >= maxStats.bonus ? '∞' : ''"
                :value="bonusFilter.max >= maxStats.bonus ? '' : bonusFilter.max"
                @input="bonusFilter.max = $event.target.value === '' ? 10000 : (parseInt($event.target.value) || 0)"
                @blur="($event.target.value === '') && (bonusFilter.max = 10000)" />
              <span class="unit-label">%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 3: Toggles -->
      <div class="filter-row toggles-row">
        <div class="toggle-group">
          <span class="group-label">Cells:</span>
          <div class="toggle-buttons">
            <button v-for="w in [1, 2]" :key="w" 
              @click="emit('toggleWidth', w)"
              :class="['toggle-btn', { active: selectedWidths.includes(w) }]">
              {{ w }}
            </button>
          </div>
        </div>
        <div class="toggle-group">
          <span class="group-label">Rarity:</span>
          <div class="toggle-buttons rarity-buttons">
            <button v-for="r in rarityMap" :key="r.id" 
              @click="emit('toggleRarity', r.id)"
              :class="['toggle-btn', { active: selectedRarities.includes(r.id) }]">
              {{ r.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.market-header-box {
  padding: 25px; 
  border-radius: 0 0 20px 20px;
  height: auto;
  min-height: 310px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  transition: all 1.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  z-index: 100;
}

.market-header-box::before {
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
  border-radius: 0 0 20px 20px;
}

.market-filters-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.search-sort-row {
  justify-content: flex-start;
  gap: 20px;
}

.market-search-input {
  width: 100%;
  height: 40px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0 40px 0 15px;
  color: #fff;
  font-family: 'Outfit', sans-serif;
  outline: none;
  transition: all 0.3s;
  box-sizing: border-box;
}

.market-search-wrapper {
  position: relative;
  flex: 1;
}

.m-search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: rgba(255, 255, 255, 0.5);
  pointer-events: none;
  z-index: 10;
}

.sort-dropdown-container {
  position: relative;
}

.sort-trigger-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.sort-trigger-btn:hover, .sort-trigger-btn.active {
  color: var(--accent);
  border-color: var(--accent);
  background: rgba(255, 255, 255, 0.1);
}

.sort-menu {
  position: absolute;
  top: 50px;
  right: 0;
  width: 180px;
  background: rgba(8, 8, 8, 0.98);
  border-radius: 12px;
  padding: 5px;
  z-index: 1000;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.06);
  border: none;
  transform-origin: top right;
}

.sort-option {
  padding: 7px 10px;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #888;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sort-option:hover, .sort-option.selected {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.sort-option.selected .opt-cat {
  color: #fff;
}

.opt-cat {
  color: #bbb;
  font-weight: 700;
  margin-right: 4px;
}

.sort-trend-icon {
  width: 12px;
  height: 12px;
  opacity: 0.2;
  transition: all 0.2s;
}

.sort-option:hover .sort-trend-icon, .sort-option.selected .sort-trend-icon {
  opacity: 1;
}

.sort-trend-icon.artan {
  stroke: #4ade80; /* green */
}

.sort-trend-icon.azalan {
  stroke: #f87171; /* red */
}

.sort-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  margin: 4px 6px;
}

.range-sliders-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.range-group-horizontal {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.group-label {
  min-width: 65px;
  font-size: 0.8rem;
  color: #666;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.range-values {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unit-label {
  font-size: 0.6rem;
  color: #555;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: 30px;
}

.range-field-with-unit {
  display: flex;
  align-items: center;
  gap: 5px;
  width: 95px;
}

.range-sep {
  color: #555;
  font-weight: 700;
}

.range-input-small {
  width: 60px;
  height: 28px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  color: #fff;
  font-size: 0.75rem;
  text-align: center;
  line-height: 28px;
  padding: 0;
  outline: none;
  transition: all 0.2s;
}

.dual-range-slider {
  position: relative;
  flex: 1;
  height: 20px;
  display: flex;
  align-items: center;
}

.range-track {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.range-progress {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 4px;
  background: #fff;
  border-radius: 2px;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
}

.range-thumb {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: none;
  pointer-events: none;
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}

.range-thumb::-webkit-slider-thumb {
  pointer-events: auto;
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
  position: relative;
  transition: transform 0.2s;
}

.range-thumb::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.toggles-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.toggle-group {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.toggle-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.toggle-btn {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: #666;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn.active {
  background: #fff;
  color: #000;
  border-color: #fff;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
}

.rarity-buttons .toggle-btn {
  padding: 4px 10px;
  font-size: 0.7rem;
}

.glass { 
  background: var(--panel-bg); 
  backdrop-filter: blur(10px); 
  border: 1px solid rgba(255,255,255,0.05); 
}

.menu-pop-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.menu-pop-leave-active {
  transition: all 0.18s cubic-bezier(0.4, 0, 1, 1);
}
.menu-pop-enter-from, .menu-pop-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.9);
}
</style>
