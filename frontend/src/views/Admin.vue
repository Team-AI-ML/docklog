<template>
  <div class="admin-view animate-fade-in">
    <div class="view-header">
      <div class="header-info">
        <h1>Staff Management</h1>
        <p class="text-mute">
          Manage user accounts, roles, and security permissions
        </p>
      </div>
      <div class="header-actions">
        <button
          @click="userManagerRef?.openCreateModal()"
          class="premium-btn primary"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add User
        </button>
      </div>
    </div>

    <div class="admin-container mt-4">
      <!-- Header Summary Stats -->
      <div class="summary-grid animate-slide-up">
        <div class="premium-stat-card">
          <div class="stat-header">
            <div class="stat-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <span class="badge badge-dim">Active</span>
          </div>
          <div class="stat-content">
            <span class="stat-label">STAFF ACCOUNTS</span>
            <span class="stat-value">{{ staffUsersCount }}</span>
          </div>
        </div>

        <div class="premium-stat-card">
          <div class="stat-header">
            <div class="stat-icon success">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <span class="badge badge-success">Online</span>
          </div>
          <div class="stat-content">
            <span class="stat-label">SYSTEM UPTIME</span>
            <span class="stat-value">99.9%</span>
          </div>
        </div>

        <div class="premium-stat-card">
          <div class="stat-header">
            <div class="stat-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <span class="badge badge-dim">Audit</span>
          </div>
          <div class="stat-content">
            <span class="stat-label">TOTAL EVENTS</span>
            <span class="stat-value">{{ auditLogsCount }}</span>
          </div>
        </div>

        <div class="premium-stat-card">
          <div class="stat-header">
            <div class="stat-icon warning">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path
                  d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                ></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <span class="badge badge-warning">Alerts</span>
          </div>
          <div class="stat-content">
            <span class="stat-label">SECURITY ALERTS</span>
            <span class="stat-value">0</span>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div
        class="admin-main-section animate-slide-up"
        style="animation-delay: 0.1s"
      >
        <UserManager
          ref="userManagerRef"
          :token="token"
          @update-count="handleStaffCountUpdate"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import UserManager from "../components/UserManager.vue";
import { secureStorage } from "../utils/storage";

const userManagerRef = ref(null);

const token = secureStorage.getItem("token");
const staffUsersCount = ref(0);
const auditLogsCount = ref(0); // This might need a separate fetch or prop if needed

const handleStaffCountUpdate = (count) => {
  staffUsersCount.value = count;
};
</script>

<style scoped>
.admin-view {
  display: flex;
  flex-direction: column;
}

.admin-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding-bottom: 1.5rem;
}

.admin-main-section {
  display: flex;
  flex-direction: column;
}

.view-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

@media (max-width: 850px) {
  .view-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  .header-actions {
    width: 100%;
  }
  .header-actions .premium-btn {
    width: 100%;
  }
  .summary-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 1rem !important;
  }
}

@media (max-width: 480px) {
  .summary-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
