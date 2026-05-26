import { ref, computed, watch } from 'vue'
import { gentleScrollToTop } from '../utils/scroll'

export function useScanner() {
  const searchUsername = ref('Kryptonn')
  const searching = ref(false)
  const userData = ref(null)
  const userError = ref(null)
  const expandedRackId = ref(null)
  const currentRoomPage = ref(1)
  const dragIndex = ref(null)
  const isDragging = ref(false)
  
  const API_BASE = import.meta.env.VITE_API_URL || ''

  const searchUser = async () => {
    if (!searchUsername.value) return
    searching.value = true
    userError.value = null
    userData.value = null
    
    try {
      const response = await fetch(`${API_BASE}/api/search_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: searchUsername.value })
      })
      const result = await response.json()
      if (result.success) {
        userData.value = result
        expandedRackId.value = null 
        currentRoomPage.value = 1
      } else {
        userError.value = result.error
      }
    } catch (err) {
      userError.value = 'Sunucu bağlantı hatası!'
    } finally {
      searching.value = false
    }
  }

  const toggleRack = (rackId) => {
    expandedRackId.value = expandedRackId.value === rackId ? null : rackId
  }

  const changeRoomPage = (page) => {
    if (currentRoomPage.value === page) return
    currentRoomPage.value = page
    expandedRackId.value = null
    gentleScrollToTop()
  }

  const getRackMiners = (rackId) => {
    if (!userData.value || !userData.value.room_data.miners) return []
    return userData.value.room_data.miners.filter(m => m.placement.user_rack_id === rackId)
  }

  const filteredRacks = computed(() => {
    if (!userData.value || !userData.value.room_data) return []
    const rd = userData.value.room_data
    const allRacks = rd.racks || (rd.data && rd.data.racks) || []
    const allRooms = rd.rooms || (rd.data && rd.data.rooms) || []
    const pageIdx = currentRoomPage.value - 1
    const targetRoom = allRooms.find(r => r.room_info && Number(r.room_info.level) === pageIdx)
    if (!targetRoom) return []
    const tId = String(targetRoom._id || "").trim()
    return allRacks.filter(r => String(r.user_room_id || r.placement?.user_room_id || "").trim() === tId)
  })

  // Drag and Drop logic
  const onPointerMove = (event) => {
    if (!isDragging.value || dragIndex.value === null) return
    const y = event.clientY
    const allRacks = userData.value.room_data.racks || []
    if (allRacks.length === 0) return

    const rackElements = document.querySelectorAll('.rack-list-item')
    let targetIndex = -1
    
    rackElements.forEach((el, idx) => {
      if (idx === dragIndex.value) return 
      const rect = el.getBoundingClientRect()
      const centerY = rect.top + 48 
      if (dragIndex.value < idx && y > centerY) targetIndex = idx
      else if (dragIndex.value > idx && y < centerY) targetIndex = idx
    })

    if (targetIndex !== -1 && targetIndex !== dragIndex.value) {
      const draggedRackId = filteredRacks.value[dragIndex.value]._id
      const targetRackId = filteredRacks.value[targetIndex]._id
      const actualDragIdx = allRacks.findIndex(r => r._id === draggedRackId)
      const actualTargetIdx = allRacks.findIndex(r => r._id === targetRackId)
      const movedItem = allRacks.splice(actualDragIdx, 1)[0]
      allRacks.splice(actualTargetIdx, 0, movedItem)
      dragIndex.value = targetIndex
    }
  }

  const onPointerUp = () => {
    if (isDragging.value) {
      isDragging.value = false
      dragIndex.value = null
      document.body.classList.remove('is-dragging-active')
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }

  const onPointerDown = (event, index) => {
    if (!event.target.closest('.drag-handle')) return
    dragIndex.value = index
    isDragging.value = true
    document.body.classList.add('is-dragging-active')
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  watch(searchUsername, (newVal) => {
    if (typeof newVal === 'string' && newVal.includes('rollercoin.com/p/')) {
      const match = newVal.match(/\/p\/([^\/\?#]+)/)
      if (match && match[1]) searchUsername.value = match[1]
    }
  })

  return {
    searchUsername,
    searching,
    userData,
    userError,
    expandedRackId,
    currentRoomPage,
    dragIndex,
    isDragging,
    searchUser,
    toggleRack,
    changeRoomPage,
    getRackMiners,
    filteredRacks,
    onPointerDown
  }
}
