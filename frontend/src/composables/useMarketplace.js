import { ref, computed, watch } from 'vue'
import { gentleScrollToTop } from '../utils/scroll'

export function useMarketplace() {
  const miners = ref([])
  const loadingMiners = ref(true)
  const marketError = ref(null)
  const currentPage = ref(1)
  const sortValue = ref('power_desc')
  const marketSearch = ref('')
  
  const priceFilter = ref({ min: 0, max: 1000000000 })
  const powerFilter = ref({ min: 0, max: 100000000000 })
  const bonusFilter = ref({ min: 0, max: 10000 })
  const selectedWidths = ref([1, 2])
  const selectedRarities = ref([0, 1, 2, 3, 4, 5])

  const itemsPerPage = 18
  const API_BASE = import.meta.env.VITE_API_URL || ''

  const rarityMap = [
    { id: 0, name: 'Common' },
    { id: 1, name: 'Uncommon' },
    { id: 2, name: 'Rare' },
    { id: 3, name: 'Epic' },
    { id: 4, name: 'Legendary' },
    { id: 5, name: 'Unreal' }
  ]

  const fetchMiners = async () => {
    loadingMiners.value = true
    try {
      const response = await fetch(`${API_BASE}/api/miners`)
      if (!response.ok) throw new Error('Market verileri alınamadı!')
      miners.value = await response.json()
    } catch (err) {
      marketError.value = err.message
    } finally {
      loadingMiners.value = false
    }
  }

  const toggleWidth = (w) => {
    const idx = selectedWidths.value.indexOf(w)
    if (idx > -1) selectedWidths.value.splice(idx, 1)
    else selectedWidths.value.push(w)
  }

  const toggleRarity = (rId) => {
    const idx = selectedRarities.value.indexOf(rId)
    if (idx > -1) selectedRarities.value.splice(idx, 1)
    else selectedRarities.value.push(rId)
  }

  const changePage = (page, shouldScroll = true) => {
    if (page < 1 || page > totalMarketPages.value) return
    if (currentPage.value === page) return 
    currentPage.value = page
    if (shouldScroll) gentleScrollToTop()
  }

  const sortedMiners = computed(() => {
    let data = [...miners.value]
    data = data.filter(m => {
      const nameMatch = !marketSearch.value || m.name.toLowerCase().includes(marketSearch.value.toLowerCase())
      const priceMatch = m.price >= priceFilter.value.min && m.price <= priceFilter.value.max
      const powerMatch = m.power >= powerFilter.value.min && m.power <= powerFilter.value.max
      const bonusMatch = m.bonus >= bonusFilter.value.min && m.bonus <= bonusFilter.value.max
      const widthMatch = selectedWidths.value.includes(m.width || 1)
      let mRarityId = m.level
      if (mRarityId === undefined || mRarityId === null || mRarityId < 0) mRarityId = 6
      return nameMatch && priceMatch && powerMatch && bonusMatch && widthMatch && selectedRarities.value.includes(mRarityId)
    })
    const [key, order] = sortValue.value.split('_')
    data.sort((a, b) => {
      const valA = a[key] || 0
      const valB = b[key] || 0
      return order === 'asc' ? valA - valB : valB - valA
    })
    return data
  })

  const totalMarketPages = computed(() => Math.ceil(sortedMiners.value.length / itemsPerPage))
  const paginatedItems = computed(() => sortedMiners.value.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage))

  watch(sortValue, () => (currentPage.value = 1))

  const maxStats = computed(() => {
    if (miners.value.length === 0) return { price: 100000, power: 2000000000, bonus: 100 }
    return {
      price: Math.ceil(Math.max(...miners.value.map(m => m.price || 0))),
      power: Math.ceil(Math.max(...miners.value.map(m => m.power || 0))),
      bonus: Math.ceil(Math.max(...miners.value.map(m => m.bonus || 0)))
    }
  })

  return {
    miners,
    loadingMiners,
    marketError,
    currentPage,
    sortValue,
    marketSearch,
    priceFilter,
    powerFilter,
    bonusFilter,
    selectedWidths,
    selectedRarities,
    rarityMap,
    fetchMiners,
    toggleWidth,
    toggleRarity,
    changePage,
    paginatedItems,
    totalMarketPages,
    maxStats
  }
}
