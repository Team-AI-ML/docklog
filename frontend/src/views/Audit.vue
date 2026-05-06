<template>
  <div class="audit-view animate-fade-in">
    <div class="view-header">
      <div class="header-info">
        <h1>Security Audit Logs</h1>
        <p class="text-mute">
          Track administrative actions and system security events
        </p>
      </div>
    </div>

    <div class="audit-main mt-8">
      <AuditManager :token="token" />
    </div>
  </div>
</template>

<script setup>
import AuditManager from "../components/AuditManager.vue";
import { secureStorage } from "../utils/storage";

const token = secureStorage.getItem("token");
</script>

<style scoped>
.view-header h1 {
  font-size: 1.75rem;
  font-weight: 950;
  letter-spacing: -0.05em;
  color: var(--text-main);
  margin: 0;
}
.view-header {
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .view-header h1 {
    font-size: 1.25rem;
  }
}
</style>
