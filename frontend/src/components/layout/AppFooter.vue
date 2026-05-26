<script setup>
import favicon from '../../assets/favicon.ico'
</script>

<template>
  <footer id="app-footer" class="app-footer">
    <div class="footer-content">
      <div class="footer-column brand">
        <div class="brand-logo-title">
          <img :src="favicon" class="footer-logo" alt="Logo" />
          <h2 class="vt-title-secondary">Rollercoinmarkt</h2>
        </div>
        <p>Rollercoinmarkt analyzes RollerCoin marketplace items using live marketplace data to help users evaluate value differences, identify profit opportunities and make informed trading decisions.</p>
        <div class="creator-credits">
          <span class="credit-label">built by</span>
          <span class="creator-name">kryptonn567</span>
        </div>
      </div>
      
      <div class="footer-column">
        <h3>SERVICES</h3>
        <ul>
          <li>Market Analysis</li>
          <li>Room Scanner</li>
          <li>Profit Calculator</li>
          <li>Miner Database</li>
        </ul>
      </div>

      <div class="footer-column">
        <h3>PLATFORM</h3>
        <ul>
          <li>About Us</li>
          <li>Terms of Use</li>
          <li>Privacy Policy</li>
          <li>API Docs</li>
        </ul>
      </div>

      <div class="footer-column updates">
        <h3>LATEST UPDATES</h3>
        <div class="update-item">
          <small>MAY 24, 2026</small>
          <p>Real-time room scanner logic optimized.</p>
        </div>
        <div class="update-item">
          <small>MAY 19, 2026</small>
          <p>Market data refresh rate improved.</p>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 Rollercoimarkt. Independent fan project. Not affiliated with RollerCoin.</p>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background: #000;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 80px 20px 40px;
  margin-top: 80px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 60px;
}

.footer-column h3 {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  color: #fff;
  margin-bottom: 25px;
  letter-spacing: 2px;
}

.footer-column p {
  line-height: 1.8;
  font-size: 0.95rem;
  color: #666;
}

.footer-column ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-column ul li {
  margin-bottom: 12px;
  color: #555;
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.2s;
}

.footer-column ul li:hover {
  color: var(--accent);
}

.creator-credits {
  margin-top: 25px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

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

.update-item {
  margin-bottom: 20px;
}

.update-item small {
  color: var(--accent);
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 1px;
}

.update-item p {
  margin: 5px 0 0;
  font-size: 0.85rem;
}

.footer-bottom {
  margin-top: 80px;
  padding-top: 40px;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  text-align: center;
  color: #333;
  font-size: 0.8rem;
}

.vt-title-secondary {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 2rem;
  color: #fff;
  margin: 0;
  letter-spacing: 1px;
}

.brand-logo-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.footer-logo {
  width: 36px;
  height: 36px;
  border-radius: 8px;
}

@media (max-width: 1000px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }
}

@media (max-width: 600px) {
  .footer-content {
    grid-template-columns: 1fr;
  }
}
</style>
