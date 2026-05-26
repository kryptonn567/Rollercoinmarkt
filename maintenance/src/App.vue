<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import favicon from './assets/favicon.ico'

// Interactive background mouse positioning
const mouseX = ref(window.innerWidth / 2)
const mouseY = ref(window.innerHeight / 2)
const bgX = ref(50)
const bgY = ref(50)

// 3D Tilt effect for the central content
const tiltX = ref(0)
const tiltY = ref(0)

const handleMouseMove = (event) => {
  mouseX.value = event.clientX
  mouseY.value = event.clientY
  
  // Calculate tilt based on cursor distance from center of the window
  const halfWidth = window.innerWidth / 2
  const halfHeight = window.innerHeight / 2
  tiltX.value = -((event.clientY - halfHeight) / halfHeight) * 6 // Max tilt 6 deg
  tiltY.value = ((event.clientX - halfWidth) / halfWidth) * 6
}

let rAF
const updateBg = () => {
  // Target percentage positions
  const targetX = (mouseX.value / window.innerWidth) * 100
  const targetY = (mouseY.value / window.innerHeight) * 100
  
  // Linear interpolation for smooth follow (lerp)
  bgX.value += (targetX - bgX.value) * 0.08
  bgY.value += (targetY - bgY.value) * 0.08
  
  rAF = requestAnimationFrame(updateBg)
}
const canvasRef = ref(null)
let pRAF
let width, height, canvas, ctx, handleResize
const particles = []
const particleCount = 90

const setupCanvas = () => {
  canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  
  width = canvas.width = window.innerWidth
  height = canvas.height = window.innerHeight
  
  handleResize = () => {
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
  }
  window.addEventListener('resize', handleResize)
  
  for (let i = 0; i < particleCount; i++) {
    const isFast = Math.random() < 0.08 // 8% chance to be a fast particle
    if (isFast) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 30 + 20, // longer streak
        speed: Math.random() * 5.0 + 3.5, // very fast
        opacity: Math.random() * 0.08 + 0.04, // slightly less visible fast streak
        width: Math.random() * 1.2 + 0.6
      })
    } else {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: Math.random() * 10 + 4,
        speed: Math.random() * 0.8 + 0.3, // slow
        opacity: Math.random() * 0.08 + 0.03, // subtle
        width: Math.random() * 0.7 + 0.3
      })
    }
  }
  
  const drawParticles = () => {
    ctx.clearRect(0, 0, width, height)
    ctx.strokeStyle = '#ffffff'
    
    for (let i = 0; i < particleCount; i++) {
      const p = particles[i]
      ctx.lineWidth = p.width
      ctx.globalAlpha = p.opacity
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x, p.y + p.length)
      ctx.stroke()
      
      p.y += p.speed
      if (p.y > height) {
        p.y = -p.length
        p.x = Math.random() * width
      }
    }
    
    pRAF = requestAnimationFrame(drawParticles)
  }
  
  drawParticles()
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  rAF = requestAnimationFrame(updateBg)
  setupCanvas()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  cancelAnimationFrame(rAF)
  if (handleResize) window.removeEventListener('resize', handleResize)
  cancelAnimationFrame(pRAF)
})
</script>

<template>
  <div class="site-wrapper flex flex-col justify-between min-h-screen text-white select-none relative overflow-hidden">
    
    <!-- Canvas for falling particles -->
    <canvas ref="canvasRef" class="particle-canvas"></canvas>

    <!-- Moving background glow following mouse -->
    <div 
      class="ambient-glow"
      :style="{
        left: `${bgX}%`,
        top: `${bgY}%`
      }"
    ></div>

    <!-- Background Grid Overlay -->
    <div class="grid-overlay"></div>

    <!-- Spacer for Top Layout -->
    <div class="h-12"></div>

    <!-- Centered Content Wrapper (No background boxes/borders) -->
    <main class="flex-1 flex items-center justify-center p-6 relative z-10">
      <div 
        class="main-content-wrapper flex flex-col items-center gap-6 text-center max-w-2xl"
        :style="{
          transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          transition: 'transform 0.1s ease-out'
        }"
      >
        <!-- Floating Group containing logo and texts (Infinite float animation) -->
        <div class="floating-group flex flex-col items-center gap-6">
          
          <!-- Logo Section -->
          <img :src="favicon" class="logo-img w-24 h-24 md:w-32 md:h-32" alt="Logo" />

          <!-- Title Section -->
          <div class="space-y-1">
            <h1 class="text-4xl md:text-5xl font-extrabold tracking-wider font-outfit uppercase bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Rollercoinmarkt
            </h1>
          </div>

          <!-- English Notice Text Only -->
          <p class="text-sm md:text-base text-gray-400 leading-relaxed max-w-lg font-inter px-4 mt-2">
            We are currently polishing the final details to bring you the fastest, most reliable market scanning tools. Our official release is just around the corner. Stay tuned.
          </p>

        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="w-full bg-black/30 backdrop-blur-sm border-t border-[rgba(255,255,255,0.03)] py-12 px-6 text-center text-xs space-y-4 relative z-10 opacity-60 hover:opacity-100 transition-opacity duration-300">
      <div class="flex justify-center items-center gap-3">
        <span class="font-outfit uppercase font-semibold text-gray-400 tracking-widest text-[10px]">&copy; 2026 Rollercoinmarkt.com</span>
      </div>
      <p class="text-gray-600 max-w-lg mx-auto leading-relaxed">
        Rollercoinmarkt is an independent fan project. It is not affiliated with, authorized, or endorsed by RollerCoin or any of its partners.
      </p>
      <div class="flex justify-center items-center gap-1.5 text-gray-500">
        <span>developing by</span>
        <span class="creator-name">kryptonn567</span>
      </div>
    </footer>

  </div>
</template>

<style scoped>
.font-outfit {
  font-family: 'Outfit', sans-serif;
}
.font-inter {
  font-family: 'Inter', sans-serif;
}

/* Base Wrapper Background */
.site-wrapper {
  background-color: #030207;
}

/* Moving Glowing Orb behind the card */
.ambient-glow {
  position: absolute;
  width: 550px;
  height: 550px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 50%, transparent 80%);
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  z-index: 1;
  filter: blur(60px);
}

/* Subtle Grid Background overlay */
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse at center, black, transparent 80%);
  pointer-events: none;
  z-index: 2;
}

/* Content Entrance Slide-down Animation */
.main-content-wrapper {
  animation: slideDown 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  z-index: 10;
}

/* Continuous smooth floating/bobbing animation */
.floating-group {
  animation: floatUpDown 6s ease-in-out infinite;
}





/* Entrance animation */
@keyframes slideDown {
  0% {
    opacity: 0;
    transform: translateY(-50px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.particle-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* Continuous floating animation */
@keyframes floatUpDown {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(15px);
  }
}

/* Footer author name animation */
.creator-name {
  position: relative;
  display: inline-block;
  font-weight: 800;
  cursor: default;
  background: linear-gradient(135deg, #888, #fff, #444, #888);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shine-gradient 3s linear infinite;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes shine-gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
