export const scrollToElement = (id) => {
  const el = document.getElementById(id)
  if (el) {
    const yOffset = -100 
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

export const gentleScrollToTop = () => {
  const startY = window.scrollY
  const startTime = performance.now()
  const duration = 920

  const step = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    const ease = progress < 0.5 
      ? 4 * progress * progress * progress 
      : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1
    
    window.scrollTo(0, startY * (1 - ease))
    
    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }
  requestAnimationFrame(step)
}
