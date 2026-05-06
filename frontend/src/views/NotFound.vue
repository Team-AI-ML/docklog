<template>
  <div class="not-found-container flex-center">
    <div class="not-found-card glass shadow-2xl">
      <div class="error-visual">
        <div class="glow-box">
          <span class="error-code">404</span>
        </div>
        <div class="orb"></div>
      </div>

      <div class="error-content">
        <h1>Resource Not Found</h1>
        <p>
          The container or endpoint you're looking for has been terminated or
          migrated to an unknown sector.
        </p>

        <router-link to="/dashboard" class="action-btn primary">
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            stroke="currentColor"
            stroke-width="2.5"
            fill="none"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
          Return to Dashboard
        </router-link>
      </div>
    </div>

    <div class="background-decor">
      <div class="grid-lines"></div>
    </div>
  </div>
</template>

<script setup>
// No logic needed for static 404
</script>

<style scoped>
.not-found-container {
  height: 100vh;
  width: 100vw;
  background: var(--bg-main);
  position: relative;
  overflow: hidden;
}

.not-found-card {
  width: 100%;
  max-width: 500px;
  padding: 4rem 3rem;
  border-radius: 40px;
  text-align: center;
  z-index: 10;
  animation: slideUp 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.error-visual {
  position: relative;
  margin-bottom: 2.5rem;
  display: flex;
  justify-content: center;
}

.glow-box {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, var(--accent), #818cf8);
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.4);
  position: relative;
  z-index: 2;
}

.error-code {
  font-size: 2.5rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.05em;
}

.orb {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 180px;
  height: 180px;
  background: var(--accent);
  filter: blur(60px);
  opacity: 0.3;
  z-index: 1;
}

.error-content h1 {
  font-size: 1.75rem;
  font-weight: 950;
  color: var(--text-main);
  margin-bottom: 1rem;
  letter-spacing: -0.03em;
}

.error-content p {
  color: var(--text-dim);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
  font-weight: 500;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: var(--accent);
  color: #fff;
  text-decoration: none;
  border-radius: 16px;
  font-weight: 800;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(99, 102, 241, 0.4);
  background: var(--accent-hover);
}

.background-decor {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.grid-lines {
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 60px 60px;
  opacity: 0.15;
  mask-image: radial-gradient(circle at 50% 50%, black, transparent 80%);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .not-found-card {
    max-width: 90%;
    padding: 2.5rem 1.5rem;
    border-radius: 24px;
  }
  .error-code {
    font-size: 2rem;
  }
  .glow-box {
    width: 100px;
    height: 100px;
  }
  .error-content h1 {
    font-size: 1.5rem;
  }
}
</style>
