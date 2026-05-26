import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useMarketplace } from './useMarketplace'
import { useScanner } from './useScanner'

export function useApp() {
  // State & Logic via Specialized Composables
  const {
    loadingMiners, marketSearch, sortValue, priceFilter, powerFilter, bonusFilter,
    selectedWidths, selectedRarities, rarityMap, fetchMiners, toggleWidth,
    toggleRarity, changePage, paginatedItems, totalMarketPages, currentPage, maxStats
  } = useMarketplace()

  const {
    searchUsername, searching, userData, userError, expandedRackId,
    currentRoomPage, dragIndex, searchUser, toggleRack, changeRoomPage,
    getRackMiners, filteredRacks, onPointerDown
  } = useScanner()

  // UI-Only State (Layout/Interactions)
  const isSortMenuOpen = ref(false)
  const sortContainer = ref(null)
  const isReelDragging = ref(false)
  const startX = ref(0)
  const startPage = ref(1)
  const isJumpMode = ref(false)
  const jumpValue = ref('')
  const jumpError = ref(false)

  // UI Logic: Sort Menu
  const handleClickOutside = (event) => {
    if (isSortMenuOpen.value && sortContainer.value && !sortContainer.value.contains(event.target)) {
      isSortMenuOpen.value = false
    }
  }

  // UI Logic: Marketplace Reel Scrubbing
  const onReelMouseDown = (e) => {
    isReelDragging.value = true
    startX.value = e.clientX
    startPage.value = currentPage.value
    document.body.classList.add('is-scrubbing')
    window.addEventListener('mousemove', onReelMouseMove)
    window.addEventListener('mouseup', onReelMouseUp)
  }

  const onReelMouseMove = (e) => {
    if (!isReelDragging.value) return
    const deltaX = e.clientX - startX.value
    const pixelsPerPage = 55 
    const pageDelta = Math.round(-deltaX / pixelsPerPage)
    let targetPage = startPage.value + pageDelta
    targetPage = Math.max(1, Math.min(targetPage, totalMarketPages.value))
    if (targetPage !== currentPage.value) {
      changePage(targetPage, false) 
    }
  }

  const onReelMouseUp = () => {
    if (isReelDragging.value) {
      isReelDragging.value = false
      document.body.classList.remove('is-scrubbing')
      window.removeEventListener('mousemove', onReelMouseMove)
      window.removeEventListener('mouseup', onReelMouseUp)
    }
  }

  // UI Logic: Jump to Page
  const commitJump = () => {
    const target = parseInt(jumpValue.value)
    if (!isNaN(target) && target >= 1 && target <= totalMarketPages.value) {
      changePage(target, true)
    }
    isJumpMode.value = false
  }

  const currentBoxWidth = computed(() => {
    const val = isJumpMode.value ? String(jumpValue.value) : String(currentPage.value)
    return Math.max(65, (val.length || 1) * 18 + 30) + 'px'
  })

  watch(jumpValue, (newVal) => {
    if (newVal === '') return
    const num = parseInt(newVal)
    if (isNaN(num) || num < 1 || num > totalMarketPages.value) {
      jumpValue.value = ''
      jumpError.value = true
      setTimeout(() => { jumpError.value = false }, 600)
    }
  })

  // Lifecycle
  onMounted(() => {
    fetchMiners()
    window.addEventListener('mousedown', handleClickOutside)
  })

  onUnmounted(() => {
    window.removeEventListener('mousedown', handleClickOutside)
  })

  return {
    // Marketplace
    loadingMiners, marketSearch, sortValue, priceFilter, powerFilter, bonusFilter,
    selectedWidths, selectedRarities, rarityMap, toggleWidth, toggleRarity,
    changePage, paginatedItems, totalMarketPages, currentPage, maxStats,
    // Scanner
    searchUsername, searching, userData, userError, expandedRackId,
    currentRoomPage, dragIndex, searchUser, toggleRack, changeRoomPage,
    getRackMiners, filteredRacks, onPointerDown,
    // UI
    isSortMenuOpen, sortContainer, isReelDragging, isJumpMode,
    jumpValue, jumpError, currentBoxWidth,
    onReelMouseDown, commitJump
  }
}
