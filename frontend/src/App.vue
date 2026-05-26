<script setup>
import { ref, computed } from 'vue'
import PerformanceToast from './components/layout/PerformanceToast.vue'
import AppFooter from './components/layout/AppFooter.vue'
import SectionHeader from './components/common/SectionHeader.vue'
import UserSearch from './components/scanner/UserSearch.vue'
import RoomScanner from './components/scanner/RoomScanner.vue'
import MarketFilters from './components/marketplace/MarketFilters.vue'
import MarketList from './components/marketplace/MarketList.vue'
import { useApp } from './composables/useApp'
import favicon from './assets/favicon.ico'
import emptyImg from './assets/empty.png'

const {
  loadingMiners, marketSearch, sortValue, priceFilter, powerFilter, bonusFilter,
  selectedWidths, selectedRarities, rarityMap, toggleWidth, toggleRarity,
  changePage, paginatedItems, totalMarketPages, currentPage,
  searchUsername, searching, userData, userError, expandedRackId,
  currentRoomPage, dragIndex, searchUser, toggleRack, changeRoomPage,
  getRackMiners, filteredRacks, onPointerDown,
  isSortMenuOpen, sortContainer, isJumpMode, jumpValue, jumpError,
  currentBoxWidth, onReelMouseDown, commitJump, maxStats
} = useApp()

const isPlugModalOpen = ref(false)
const isPlugModalMinimized = ref(false)
const isResizingOrDragging = ref(false)

const modalX = ref(null)
const modalY = ref(null)
const modalWidth = ref(340)
const modalHeight = ref(560)

let isDragging = false
let startX = 0
let startY = 0
let startLeft = 0
let startTop = 0
let startWidth = 0
let startHeight = 0
let resizeDirection = ''

const openModal = () => {
  isPlugModalOpen.value = true
  isPlugModalMinimized.value = false
  modalX.value = null
  modalY.value = null
  modalWidth.value = 340
  modalHeight.value = 560
  isResizingOrDragging.value = false
}

const toggleMinimize = () => {
  isPlugModalMinimized.value = !isPlugModalMinimized.value
  if (!isPlugModalMinimized.value) {
    modalX.value = null
    modalY.value = null
    modalWidth.value = 340
    modalHeight.value = 560
  }
  isResizingOrDragging.value = false
}

const minimizedStyle = computed(() => {
  if (!isPlugModalMinimized.value) {
    return {}
  }
  const leftVal = modalX.value !== null ? `${modalX.value}px` : 'calc(100vw - 380px)'
  const topVal = modalY.value !== null ? `${modalY.value}px` : 'calc(100vh - 600px)'
  return {
    left: leftVal,
    top: topVal,
    width: `${modalWidth.value}px`,
    height: `${modalHeight.value}px`,
    right: 'auto',
    bottom: 'auto'
  }
})

const onHeaderPointerDown = (event) => {
  if (!isPlugModalMinimized.value) return
  if (event.target.closest('button') || event.target.closest('img')) return

  isDragging = true
  isResizingOrDragging.value = true
  const modalEl = event.currentTarget.closest('.plug-modal')
  if (modalEl) {
    const rect = modalEl.getBoundingClientRect()
    startLeft = rect.left
    startTop = rect.top
  } else {
    startLeft = modalX.value || (window.innerWidth - 380)
    startTop = modalY.value || (window.innerHeight - 600)
  }

  startX = event.clientX
  startY = event.clientY

  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  event.preventDefault()
}

const onPointerMove = (event) => {
  if (!isDragging) return
  const deltaX = event.clientX - startX
  const deltaY = event.clientY - startY
  
  let newLeft = startLeft + deltaX
  let newTop = startTop + deltaY
  
  const minX = 0
  const maxX = window.innerWidth - modalWidth.value
  const minY = 0
  const maxY = window.innerHeight - modalHeight.value
  
  newLeft = Math.max(minX, Math.min(newLeft, maxX))
  newTop = Math.max(minY, Math.min(newTop, maxY))

  modalX.value = newLeft
  modalY.value = newTop
}

const onPointerUp = () => {
  isDragging = false
  isResizingOrDragging.value = false
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
}

const onResizeStart = (event, direction) => {
  resizeDirection = direction
  isDragging = false
  isResizingOrDragging.value = true
  
  const modalEl = event.currentTarget.closest('.plug-modal')
  if (modalEl) {
    const rect = modalEl.getBoundingClientRect()
    startLeft = rect.left
    startTop = rect.top
    startWidth = rect.width
    startHeight = rect.height
    
    modalX.value = rect.left
    modalY.value = rect.top
    modalWidth.value = rect.width
    modalHeight.value = rect.height
  }

  startX = event.clientX
  startY = event.clientY

  window.addEventListener('pointermove', onResizeMove)
  window.addEventListener('pointerup', onResizeEnd)
  event.preventDefault()
  event.stopPropagation()
}

const onResizeMove = (event) => {
  const deltaX = event.clientX - startX
  const deltaY = event.clientY - startY
  
  let newWidth = startWidth
  let newHeight = startHeight
  let newLeft = startLeft
  let newTop = startTop

  const minW = 340
  const minH = 560
  
  const maxW = window.innerWidth
  const maxH = window.innerHeight

  if (resizeDirection.includes('r')) {
    newWidth = Math.max(minW, Math.min(startWidth + deltaX, maxW - startLeft))
  }
  if (resizeDirection.includes('b')) {
    newHeight = Math.max(minH, Math.min(startHeight + deltaY, maxH - startTop))
  }

  if (resizeDirection.includes('l')) {
    const possibleWidth = startWidth - deltaX
    if (possibleWidth >= minW) {
      newWidth = possibleWidth
      newLeft = startLeft + deltaX
    } else {
      newWidth = minW
      newLeft = startLeft + (startWidth - minW)
    }
  }
  if (resizeDirection.includes('t')) {
    const possibleHeight = startHeight - deltaY
    if (possibleHeight >= minH) {
      newHeight = possibleHeight
      newTop = startTop + deltaY
    } else {
      newHeight = minH
      newTop = startTop + (startHeight - minH)
    }
  }

  if (newLeft < 0) {
    newWidth += newLeft
    newLeft = 0
  }
  if (newTop < 0) {
    newHeight += newTop
    newTop = 0
  }

  modalWidth.value = newWidth
  modalHeight.value = newHeight
  modalX.value = newLeft
  modalY.value = newTop
}

const onResizeEnd = () => {
  isResizingOrDragging.value = false
  window.removeEventListener('pointermove', onResizeMove)
  window.removeEventListener('pointerup', onResizeEnd)
}
</script>

<template>
  <div class="site-wrapper">
    <PerformanceToast />

    <div class="page-container">
      <div class="split-wrapper">
        <!-- Left Side: Rig Showcase -->
        <div class="section left-side">
          <div class="header-group">
            <SectionHeader title="RIG SHOWCASE" />
            <UserSearch 
              v-model="searchUsername"
              :searching="searching"
              :userData="userData"
              :userError="userError"
              @search="searchUser"
            />
          </div>

          <RoomScanner 
            :userData="userData"
            :filteredRacks="filteredRacks"
            :expandedRackId="expandedRackId"
            :currentRoomPage="currentRoomPage"
            :dragIndex="dragIndex"
            :getRackMiners="getRackMiners"
            @toggleRack="toggleRack"
            @changeRoomPage="changeRoomPage"
            @pointerDown="onPointerDown"
          />

          <div v-if="!userData && totalMarketPages > 1" class="pagination-spacer"></div>
        </div>

        <!-- Right Side: Marketplace -->
        <div class="section right-side">
          <div class="header-group" ref="sortContainer">
            <SectionHeader title="MARKETPLACE" />
            <MarketFilters 
              v-model:marketSearch="marketSearch"
              v-model:sortValue="sortValue"
              :priceFilter="priceFilter"
              :powerFilter="powerFilter"
              :bonusFilter="bonusFilter"
              :selectedWidths="selectedWidths"
              :selectedRarities="selectedRarities"
              :isSortMenuOpen="isSortMenuOpen"
              :rarityMap="rarityMap"
              :maxStats="maxStats"
              @toggleWidth="toggleWidth"
              @toggleRarity="toggleRarity"
              @toggleSortMenu="isSortMenuOpen = !isSortMenuOpen"
            />
          </div>

          <MarketList 
            :loadingMiners="loadingMiners"
            :paginatedItems="paginatedItems"
            :currentPage="currentPage"
            :totalMarketPages="totalMarketPages"
            :isJumpMode="isJumpMode"
            v-model:jumpValue="jumpValue"
            :jumpError="jumpError"
            :currentBoxWidth="currentBoxWidth"
            @changePage="changePage"
            @onReelMouseDown="onReelMouseDown"
            @enterJumpMode="isJumpMode = true; jumpValue = currentPage"
            @commitJump="commitJump"
            @cancelJump="isJumpMode = false"
          />
        </div>
      </div>
    </div>

    <!-- Floating Console Button (White background, Receipt/Order icon) -->
    <div class="plug-btn" @click="openModal" v-if="!isPlugModalOpen" title="System Console">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
        <path d="M16 8H8" />
        <path d="M16 12H8" />
        <path d="M13 16H8" />
      </svg>
    </div>

    <!-- Backdrop & Modal Console with Vue Transitions -->
    <Transition name="fade">
      <div v-if="isPlugModalOpen && !isPlugModalMinimized" class="plug-backdrop" @click="isPlugModalOpen = false"></div>
    </Transition>
    
    <Transition name="modal">
      <div v-if="isPlugModalOpen" class="plug-modal" :class="{ 'is-minimized': isPlugModalMinimized, 'no-transition': isResizingOrDragging }" :style="minimizedStyle">
        <div class="plug-modal-header" @pointerdown="onHeaderPointerDown">
          <div class="plug-modal-title-wrapper">
            <img :src="favicon" class="plug-modal-favicon" alt="Favicon" />
            <h2>ROLLERCOINMARKT SESSION REPORT</h2>
          </div>
          <div class="plug-modal-actions">
            <button class="plug-modal-minimize" @click="toggleMinimize" :title="isPlugModalMinimized ? 'Maximize' : 'Minimize'">
              <svg v-if="isPlugModalMinimized" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h6v6" />
                <path d="M9 21H3v-6" />
                <path d="M21 3l-7 7" />
                <path d="M3 21l7-7" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <rect x="12" y="12" width="9" height="9" rx="1" fill="currentColor" fill-opacity="0.15" />
              </svg>
            </button>
            <button class="plug-modal-close" @click="isPlugModalOpen = false" title="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div class="plug-modal-content">
          <div v-if="!userData" class="empty-state-wrapper">
            <img :src="emptyImg" class="empty-state-img" alt="No User Searched" />
            <h3 class="empty-state-title">No Active Session Found</h3>
            <p class="empty-state-text">You must search for a username to view the session report.</p>
          </div>
          <div v-else>
            <!-- Report contents will go here -->
          </div>
        </div>
        <!-- Resize Handles -->
        <div v-if="isPlugModalMinimized" class="resize-handle resizer-t" @pointerdown="onResizeStart($event, 't')"></div>
        <div v-if="isPlugModalMinimized" class="resize-handle resizer-r" @pointerdown="onResizeStart($event, 'r')"></div>
        <div v-if="isPlugModalMinimized" class="resize-handle resizer-b" @pointerdown="onResizeStart($event, 'b')"></div>
        <div v-if="isPlugModalMinimized" class="resize-handle resizer-l" @pointerdown="onResizeStart($event, 'l')"></div>
        <div v-if="isPlugModalMinimized" class="resize-handle resizer-tl" @pointerdown="onResizeStart($event, 'tl')"></div>
        <div v-if="isPlugModalMinimized" class="resize-handle resizer-tr" @pointerdown="onResizeStart($event, 'tr')"></div>
        <div v-if="isPlugModalMinimized" class="resize-handle resizer-bl" @pointerdown="onResizeStart($event, 'bl')"></div>
        <div v-if="isPlugModalMinimized" class="resize-handle resizer-br" @pointerdown="onResizeStart($event, 'br')"></div>
      </div>
    </Transition>

    <AppFooter />
  </div>
</template>


