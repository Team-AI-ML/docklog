<template>
  <div class="audit-manager">
    <!-- TOOLBAR -->
    <div class="audit-toolbar">
      <div class="search-box glass">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          v-model="auditSearch"
          placeholder="Search by user, action, or container..."
        />
      </div>

      <div class="filter-group">
        <button
          @click="showDateModal = true"
          class="premium-btn glass mini date-trigger"
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          {{ dateLabel }}
        </button>
        <button
          @click="fetchAuditLogs"
          class="icon-btn refresh-btn"
          :class="{ rotating: loadingLogs }"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
          >
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- DATA TABLE -->
    <div class="premium-table-container glass mt-4">
      <table class="premium-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Initiator</th>
            <th>Action</th>
            <th>Resource</th>
            <th>Status</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody v-if="filteredLogs.length > 0">
          <tr v-for="log in filteredLogs" :key="log.id" class="audit-row">
            <td class="time-cell" data-label="Time">
              <span class="date-part">{{
                formatAuditDate(log.timestamp)
              }}</span>
              <span class="time-part">{{
                formatAuditTimeOnly(log.timestamp)
              }}</span>
            </td>
            <td data-label="Initiator">
              <div class="user-pill">
                <div class="mini-avatar">
                  {{ log.username[0].toUpperCase() }}
                </div>
                <span class="user-label">{{ log.username }}</span>
              </div>
            </td>
            <td data-label="Action">
              <span :class="['action-badge', getActionClass(log.action)]">
                {{ log.action.toUpperCase() }}
              </span>
            </td>
            <td data-label="Resource">
              <code class="resource-code">{{ log.resource }}</code>
            </td>
            <td data-label="Status">
              <div
                :class="[
                  'status-indicator',
                  log.status === 'success' ? 'is-success' : 'is-error',
                ]"
              >
                <span class="status-dot-mini"></span>
                {{ log.status }}
              </div>
            </td>
            <td class="message-cell" data-label="Details">
              <p class="truncate-msg" :title="log.message">{{ log.message }}</p>
            </td>
          </tr>
        </tbody>
        <!-- CENTERED EMPTY STATE -->
        <tbody v-else>
          <tr>
            <td colspan="6">
              <div class="empty-state-wrapper">
                <div class="empty-state-content">
                  <div class="empty-icon-box">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <path
                        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                      ></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                    </svg>
                  </div>
                  <h4 class="empty-title">No Audit Logs Found</h4>
                  <p class="empty-text">
                    We couldn't find any activity matching your current filters.
                  </p>
                  <button
                    v-if="hasFilters"
                    @click="resetFilters"
                    class="btn-secondary mini mt-4"
                  >
                    Clear Date Filters
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- DATE RANGE MODAL -->
    <Teleport to="body">
      <Transition name="modal-bounce">
        <div v-if="showDateModal" class="modal-overlay">
          <div class="modal-card wide-modal glass shadow-2xl">
            <div class="modal-card-header">
              <div class="header-content">
                <div class="header-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                  </svg>
                </div>
                <div>
                  <h3 class="modal-title">Time Filter</h3>
                  <p class="modal-subtitle">
                    Narrow down logs by a specific window
                  </p>
                </div>
              </div>
              <button class="close-btn" @click="showDateModal = false">
                ×
              </button>
            </div>

            <div class="modal-card-body">
              <div class="form-grid dual">
                <div class="input-group">
                  <label class="label-caps">From</label>
                  <input
                    type="datetime-local"
                    v-model="dateRange.from"
                    class="premium-input"
                  />
                </div>
                <div class="input-group">
                  <label class="label-caps">To</label>
                  <input
                    type="datetime-local"
                    v-model="dateRange.to"
                    class="premium-input"
                  />
                </div>
              </div>

              <div class="perm-section">
                <label class="label-caps mb-3">Quick Presets</label>
                <div class="preset-grid">
                  <button @click="setPreset('today')" class="preset-tag">
                    Today
                  </button>
                  <button @click="setPreset('yesterday')" class="preset-tag">
                    Yesterday
                  </button>
                  <button @click="setPreset('7d')" class="preset-tag">
                    Last 7 Days
                  </button>
                  <button @click="setPreset('30d')" class="preset-tag">
                    Last 30 Days
                  </button>
                </div>
              </div>
            </div>

            <div class="modal-card-footer">
              <button @click="showDateModal = false" class="btn-secondary">
                Cancel
              </button>
              <button @click="applyDateRange" class="btn-primary">
                Apply Window
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps(["token"]);
const emit = defineEmits(["update-count"]);

const auditLogs = ref([]);
const loadingLogs = ref(false);
const auditSearch = ref("");
const showDateModal = ref(false);
const dateRange = ref({ from: "", to: "" });

const dateLabel = computed(() => {
  if (!dateRange.value.from || !dateRange.value.to) return "Filter Date";
  const f = new Date(dateRange.value.from).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
  const t = new Date(dateRange.value.to).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
  return `${f} - ${t}`;
});

const hasFilters = computed(() => dateRange.value.from || dateRange.value.to);

const filteredLogs = computed(() => {
  if (!auditSearch.value) return auditLogs.value;
  const q = auditSearch.value.toLowerCase();
  return auditLogs.value.filter(
    (l) =>
      l.username.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.resource.toLowerCase().includes(q) ||
      l.message.toLowerCase().includes(q),
  );
});

const getActionClass = (action) => {
  const a = action.toLowerCase();
  if (a.includes("delete") || a.includes("stop")) return "action-danger";
  if (a.includes("start") || a.includes("create")) return "action-success";
  if (a.includes("restart") || a.includes("update")) return "action-warning";
  return "action-default";
};

const fetchAuditLogs = async () => {
  loadingLogs.value = true;
  try {
    let url = "/api/admin/audit";
    if (dateRange.value.from && dateRange.value.to) {
      const from = dateRange.value.from.replace("T", " ") + ":00";
      const to = dateRange.value.to.replace("T", " ") + ":59";
      url += `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    }
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${props.token}` },
    });
    if (res.ok) {
      auditLogs.value = await res.json();
      emit("update-count", auditLogs.value.length);
    }
  } catch (err) {
    console.error(err);
  } finally {
    loadingLogs.value = false;
  }
};

const setPreset = (type) => {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const nowTime = now.toTimeString().split(" ")[0].substring(0, 5);

  if (type === "today") {
    dateRange.value = { from: `${today}T00:00`, to: `${today}T${nowTime}` };
  } else if (type === "yesterday") {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yStr = yesterday.toISOString().split("T")[0];
    dateRange.value = { from: `${yStr}T00:00`, to: `${yStr}T23:59` };
  } else if (type === "7d") {
    const start = new Date(now);
    start.setDate(now.getDate() - 7);
    dateRange.value = {
      from: start.toISOString().substring(0, 16),
      to: now.toISOString().substring(0, 16),
    };
  } else if (type === "30d") {
    const start = new Date(now);
    start.setDate(now.getDate() - 30);
    dateRange.value = {
      from: start.toISOString().substring(0, 16),
      to: now.toISOString().substring(0, 16),
    };
  }
};

const applyDateRange = () => {
  showDateModal.value = false;
  fetchAuditLogs();
};

const resetFilters = () => {
  dateRange.value = { from: "", to: "" };
  fetchAuditLogs();
};

const formatAuditDate = (ts) =>
  new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
const formatAuditTimeOnly = (ts) =>
  new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

onMounted(fetchAuditLogs);
</script>

<style scoped>
/* Toolbar & Search */
.audit-toolbar {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  justify-content: space-between;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1.25rem;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: 14px;
  margin-bottom: 15px;
}

.search-box input {
  background: none;
  border: none;
  color: var(--text-main);
  font-size: 0.9rem;
  font-weight: 600;
  width: 100%;
}

.search-box input:focus {
  outline: none;
}

.filter-group {
  display: flex;
  gap: 0.75rem;
}

.date-trigger {
  padding: 0.7rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
}

/* Table Enhancements */
.premium-table-container {
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.audit-row:hover {
  background: rgba(var(--accent-rgb), 0.02);
}

.time-cell {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.date-part {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--text-mute);
  text-transform: uppercase;
}
.time-part {
  font-size: 0.85rem;
  font-weight: 700;
  font-family: "JetBrains Mono", monospace;
  color: var(--text-main);
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-subtle);
  padding: 0.25rem 0.6rem 0.25rem 0.25rem;
  border-radius: 8px;
  width: fit-content;
}

.mini-avatar {
  width: 20px;
  height: 20px;
  background: var(--accent);
  color: white;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-label {
  font-size: 0.75rem;
  font-weight: 800;
}

.resource-code {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.75rem;
  background: var(--bg-input);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  color: var(--accent);
}

/* Status UI */
.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: capitalize;
}

.status-dot-mini {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.is-success {
  color: var(--success);
}
.is-success .status-dot-mini {
  background: var(--success);
  box-shadow: 0 0 8px var(--success);
}
.is-error {
  color: var(--stop);
}
.is-error .status-dot-mini {
  background: var(--stop);
  box-shadow: 0 0 8px var(--stop);
}

/* Action Badges */
.action-badge {
  font-size: 0.65rem;
  font-weight: 900;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  border: 1px solid transparent;
}

.action-success {
  background: rgba(var(--success-rgb), 0.1);
  color: var(--success);
  border-color: rgba(var(--success-rgb), 0.2);
}
.action-danger {
  background: rgba(var(--stop-rgb), 0.1);
  color: var(--stop);
  border-color: rgba(var(--stop-rgb), 0.2);
}
.action-warning {
  background: rgba(var(--warning-rgb), 0.1);
  color: var(--warning);
  border-color: rgba(var(--warning-rgb), 0.2);
}
.action-default {
  background: var(--bg-input);
  color: var(--text-mute);
}

.message-cell {
  max-width: 250px;
}
.truncate-msg {
  font-size: 0.75rem;
  color: var(--text-mute);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

/* Modal Specifics */
.preset-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.preset-tag {
  background: var(--bg-input);
  border: 1px solid var(--border);
  color: var(--text-main);
  padding: 0.6rem;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-tag:hover {
  background: var(--bg-subtle);
  border-color: var(--accent);
  color: var(--accent);
}

/* Shared Modal Styles (Consistent with User Manager) */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-card {
  width: 100%;
  max-width: 550px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 24px;
  overflow: hidden;
}

.modal-card-header {
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}
.header-content {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.header-icon {
  width: 42px;
  height: 42px;
  background: var(--bg-subtle);
  color: var(--accent);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
}
.modal-subtitle {
  font-size: 0.8rem;
  color: var(--text-mute);
  margin: 0;
}
.close-btn {
  background: none;
  border: none;
  color: var(--text-mute);
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-card-body {
  padding: 1.5rem 2rem;
}
.modal-card-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.label-caps {
  display: block;
  text-transform: uppercase;
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--text-mute);
  margin-bottom: 0.5rem;
}
.premium-input {
  width: 100%;
  background: var(--bg-input);
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 0.75rem 1rem;
  color: var(--text-main);
  font-family: inherit;
}

.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}
.btn-secondary {
  background: var(--bg-subtle);
  color: var(--text-main);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
}

/* Empty State Styling (Shared) */
.empty-state-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 350px;
}
.empty-state-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.empty-icon-box {
  width: 80px;
  height: 80px;
  background: var(--bg-input);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-mute);
  opacity: 0.5;
  margin-bottom: 1.5rem;
  border: 1px dashed var(--border);
}
.empty-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}
.empty-text {
  font-size: 0.85rem;
  color: var(--text-mute);
  max-width: 250px;
  line-height: 1.6;
}

/* Animations */
.rotating {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.modal-bounce-enter-active {
  animation: bounce 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes bounce {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Responsive Overrides */
@media (max-width: 1024px) {
  .audit-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  .search-box {
    margin-bottom: 0;
  }
  .filter-group {
    justify-content: space-between;
  }
  .date-trigger {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 850px) {
  .premium-table thead {
    display: none;
  }
  .premium-table, .premium-table tbody, .premium-table tr, .premium-table td {
    display: block;
    width: 100%;
  }
  .premium-table-container {
    background: transparent;
    border: none;
    box-shadow: none;
    min-height: auto;
  }
  .audit-row {
    margin-bottom: 1.25rem;
    padding: 1.25rem;
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
  .audit-row td {
    padding: 0.6rem 0;
    border: none;
    text-align: left !important;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  .audit-row td::before {
    content: attr(data-label);
    display: block;
    font-size: 0.65rem;
    font-weight: 800;
    color: var(--text-mute);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .message-cell {
    max-width: 100%;
  }
  .truncate-msg {
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
  }
  .time-cell {
    flex-direction: row !important;
    gap: 0.5rem;
    align-items: baseline;
  }
}

@media (max-width: 480px) {
  .audit-row {
    padding: 1rem;
    margin-bottom: 1rem;
    border-radius: 16px;
  }
  .search-box {
    padding: 0.6rem 1rem;
  }
  .filter-group {
    gap: 0.5rem;
  }
  .date-trigger {
    padding: 0.6rem 0.75rem;
    font-size: 0.75rem;
  }
  .user-pill {
    padding: 0.2rem 0.5rem 0.2rem 0.2rem;
  }
}
</style>
