<template>
  <div class="health-container">
    <!-- Header with Filters -->
    <div class="section-header animate-slide-up">
      <div class="header-content">
        <h3>System Diagnostics</h3>
        <p class="text-mute">Historical resource utilization metrics</p>
      </div>
      <div class="header-actions">
        <div class="filter-pills glass">
          <button
            v-for="f in filters"
            :key="f.label"
            @click="activeFilter = f.value"
            :class="['range-pill', { active: activeFilter === f.value }]"
          >
            {{ f.short }}
          </button>
          <button
            class="range-pill"
            @click="showCustomModal = true"
            :class="{ active: activeFilter === 'custom' }"
          >
            Custom
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="summary-grid animate-slide-up" style="animation-delay: 0.1s">
      <div class="premium-stat-card">
        <div class="stat-header">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <span class="badge badge-dim">Average</span>
        </div>
        <div class="stat-content">
          <span class="stat-label">AVG CPU LOAD</span>
          <span class="stat-value">{{ avgCpu }}%</span>
        </div>
      </div>

      <div class="premium-stat-card">
        <div class="stat-header">
          <div class="stat-icon error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <span class="badge badge-error">Peak</span>
        </div>
        <div class="stat-content">
          <span class="stat-label">PEAK CPU SPIKE</span>
          <span class="stat-value">{{ maxCpu }}%</span>
        </div>
      </div>

      <div class="premium-stat-card">
        <div class="stat-header">
          <div class="stat-icon success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
              <line x1="6" y1="6" x2="6.01" y2="6"></line>
              <line x1="6" y1="18" x2="6.01" y2="18"></line>
            </svg>
          </div>
          <span class="badge badge-success">Memory</span>
        </div>
        <div class="stat-content">
          <span class="stat-label">AVG MEMORY USAGE</span>
          <span class="stat-value">{{ avgMem }} GB</span>
        </div>
      </div>

      <div class="premium-stat-card">
        <div class="stat-header">
          <div class="stat-icon warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
          </div>
          <span class="badge badge-warning">Max</span>
        </div>
        <div class="stat-content">
          <span class="stat-label">PEAK MEMORY LOAD</span>
          <span class="stat-value">{{ maxMem }} GB</span>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="health-grid animate-slide-up" style="animation-delay: 0.2s">
      <div class="chart-section glass">
        <div class="chart-header">
          <h4>CPU Utilization History</h4>
          <span class="unit-badge">% Load</span>
        </div>
        <div class="chart-container">
          <Line
            v-if="chartData.cpu.labels.length"
            :data="chartData.cpu"
            :options="cpuChartOptions"
          />
          <div v-else class="chart-placeholder">
            <div class="shimmer"></div>
          </div>
        </div>
      </div>

      <div class="chart-section glass">
        <div class="chart-header">
          <h4>Memory Consumption</h4>
          <span class="unit-badge">Gigabytes</span>
        </div>
        <div class="chart-container">
          <Line
            v-if="chartData.mem.labels.length"
            :data="chartData.mem"
            :options="memChartOptions"
          />
          <div v-else class="chart-placeholder">
            <div class="shimmer"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom Range Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showCustomModal" class="modal-overlay">
          <div class="modal-content shadow-2xl">
            <div class="modal-header">
              <h3>Custom Range</h3>
            </div>
            <div class="modal-body">
              <div class="input-group">
                <label>Start Date</label>
                <input type="date" v-model="tempStart" :max="today" class="premium-input" />
              </div>
              <div class="input-group">
                <label>End Date</label>
                <input type="date" v-model="tempEnd" :max="today" class="premium-input" />
              </div>
              <p v-if="modalError" class="error-text">{{ modalError }}</p>
            </div>
            <div class="modal-actions">
              <button @click="showCustomModal = false" class="modal-btn cancel">Cancel</button>
              <button @click="applyCustomRange" class="modal-btn confirm">Apply Range</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  Filler,
} from "chart.js";
import { secureStorage } from "../utils/storage";
import { sharedState } from "../utils/sharedState";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  Filler,
);

const isDark = computed(() => sharedState.theme === 'dark');

const filters = [
  { label: "1H", short: "1H", note: "Last hour", value: 1 },
  { label: "6H", short: "6H", note: "Last 6 hours", value: 6 },
  { label: "12H", short: "12H", note: "Last 12 hours", value: 12 },
  { label: "24H", short: "24H", note: "Last 24 hours", value: 24 },
];

const activeFilter = ref(24);
const customStart = ref("");
const customEnd = ref("");
const tempStart = ref("");
const tempEnd = ref("");
const showCustomModal = ref(false);
const modalError = ref("");
const today = new Date().toISOString().split("T")[0];

const history = ref([]);
const chartData = ref({
  cpu: { labels: [], datasets: [] },
  mem: { labels: [], datasets: [] },
});

const activeHistory = computed(() => {
  let start, end;
  if (activeFilter.value === "custom") {
    if (!customStart.value || !customEnd.value) return history.value;
    start = new Date(customStart.value);
    end = new Date(customEnd.value);
    end.setHours(23, 59, 59);
  } else {
    end = new Date();
    start = new Date(end.getTime() - activeFilter.value * 60 * 60 * 1000);
  }
  return history.value.filter((h) => {
    const t = new Date(h.timestamp);
    return t >= start && t <= end;
  });
});

const avgCpu = computed(() => {
  if (!activeHistory.value.length) return 0;
  return (activeHistory.value.reduce((acc, h) => acc + h.cpu, 0) / activeHistory.value.length).toFixed(1);
});

const maxCpu = computed(() => {
  if (!activeHistory.value.length) return 0;
  return Math.max(...activeHistory.value.map((h) => h.cpu)).toFixed(1);
});

const avgMem = computed(() => {
  if (!activeHistory.value.length) return 0;
  return (activeHistory.value.reduce((acc, h) => acc + h.memory, 0) / (activeHistory.value.length * 1024 * 1024 * 1024)).toFixed(2);
});

const maxMem = computed(() => {
  if (!activeHistory.value.length) return 0;
  return (Math.max(...activeHistory.value.map((h) => h.memory)) / (1024 * 1024 * 1024)).toFixed(2);
});

const applyCustomRange = () => {
  if (!tempStart.value || !tempEnd.value) {
    modalError.value = "Select both dates";
    return;
  }
  customStart.value = tempStart.value;
  customEnd.value = tempEnd.value;
  activeFilter.value = "custom";
  showCustomModal.value = false;
};

const makeChartOptions = (unit) => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 1000, easing: "easeOutQuart" },
  interaction: { mode: "index", intersect: false },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: isDark.value ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)" },
      ticks: {
        color: isDark.value ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)",
        font: { size: 10, family: "JetBrains Mono" },
      },
    },
    x: {
      grid: { display: false },
      ticks: {
        color: isDark.value ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.3)",
        font: { size: 9, family: "JetBrains Mono" },
        maxRotation: 0,
        maxTicksLimit: 8,
      },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: isDark.value ? "#0f172a" : "#ffffff",
      titleColor: isDark.value ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
      bodyColor: isDark.value ? "#fff" : "#000",
      borderColor: "var(--border)",
      borderWidth: 1,
      padding: 12,
      cornerRadius: 12,
      displayColors: false,
      callbacks: {
        label: (item) => `${item.formattedValue} ${unit}`,
      },
    },
  },
  elements: {
    point: { radius: 0, hoverRadius: 6 },
    line: { tension: 0.4 },
  },
});

const cpuChartOptions = makeChartOptions("%");
const memChartOptions = makeChartOptions("GB");

const fetchData = async () => {
  try {
    const token = secureStorage.getItem("token");
    const res = await fetch("/api/system/history", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      history.value = data.reverse();
      updateCharts();
    }
  } catch (err) {
    console.error(err);
  }
};

const updateCharts = () => {
  const sorted = [...activeHistory.value].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  const labels = sorted.map(h => new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  
  chartData.value.cpu = {
    labels,
    datasets: [{
      label: "CPU Load",
      data: sorted.map(h => h.cpu),
      borderColor: "#6366f1",
      backgroundColor: "rgba(99, 102, 241, 0.1)",
      fill: true,
      borderWidth: 3,
    }]
  };

  chartData.value.mem = {
    labels,
    datasets: [{
      label: "Memory Usage",
      data: sorted.map(h => h.memory / (1024 * 1024 * 1024)),
      borderColor: "#10b981",
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      fill: true,
      borderWidth: 3,
    }]
  };
};

watch([activeFilter, customStart, customEnd], updateCharts);

onMounted(fetchData);
</script>

<style scoped>
.health-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content p {
  margin: 0.25rem 0 0;
  font-size: 0.85rem;
  font-weight: 500;
}

.filter-pills {
  display: flex;
  gap: 0.5rem;
  padding: 0.4rem;
  border-radius: 12px;
  background: var(--bg-input);
  border: 1px solid var(--border);
}

.range-pill {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--text-mute);
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
}

.range-pill:hover {
  color: var(--text-main);
  background: var(--bg-subtle);
}

.range-pill.active {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.health-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.chart-section {
  padding: 1.5rem;
  border-radius: 24px;
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header h4 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 900;
  color: var(--text-main);
}

.unit-badge {
  font-size: 0.65rem;
  font-weight: 900;
  color: var(--text-mute);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0.25rem 0.6rem;
  background: var(--bg-input);
  border-radius: 6px;
}

.chart-container {
  height: 350px;
  position: relative;
}

.chart-placeholder {
  height: 100%;
  background: var(--bg-input);
  border-radius: 16px;
  overflow: hidden;
}

@media (max-width: 1200px) {
  .health-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1024px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  
  .header-actions {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    -webkit-overflow-scrolling: touch;
  }
  
  .filter-pills {
    width: max-content;
  }
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 1rem !important;
  }
  
  .chart-container {
    height: 300px;
  }
}

@media (max-width: 480px) {
  .summary-grid {
    grid-template-columns: 1fr !important;
  }
  
  .chart-container {
    height: 250px;
  }
  
  .health-container {
    gap: 1.5rem;
  }
}
</style>
