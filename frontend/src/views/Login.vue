<template>
  <div class="login-overlay">
    <div class="login-card glass animate-slide-up">
      <div class="login-header">
        <div class="logo-box">
          <img src="/logo-icon.png" alt="DockLog" class="login-logo-img" />
        </div>
        <h1>DockLog</h1>
        <p class="text-mute">Enterprise Container Observability</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label>Username</label>
          <div class="premium-input-wrapper">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <input v-model="username" type="text" placeholder="e.g. admin" required />
          </div>
        </div>

        <div class="input-group">
          <label>Password</label>
          <div class="premium-input-wrapper">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <input v-model="password" type="password" placeholder="••••••••" required />
          </div>
        </div>

        <button type="submit" :disabled="loading" class="premium-btn primary full-width login-btn">
          {{ loading ? "Authenticating..." : "Access Dashboard" }}
        </button>

        <Transition name="fade">
          <p v-if="error" class="error-msg">{{ error }}</p>
        </Transition>
      </form>

      <div class="login-footer">
        <span>v2.0.4 Platinum Edition</span>
        <div class="dot-sep"></div>
        <span>Secure Protocol</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { secureStorage } from "../utils/storage";
import { sharedState } from "../utils/sharedState";

const router = useRouter();
const username = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

const handleLogin = async () => {
  loading.value = true;
  error.value = "";

  try {
    const formData = new FormData();
    formData.append("username", username.value);
    formData.append("password", password.value);

    const res = await fetch("/api/token", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      secureStorage.setItem("token", data.access_token);
      sharedState.forcePasswordChange = data.password_changed === false;
      sharedState.showPasswordModal = data.password_changed === false;
      router.push("/dashboard");
    } else {
      error.value = "Invalid credentials";
    }
  } catch (err) {
    error.value = "System connection failed";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-overlay {
  position: fixed;
  inset: 0;
  background: #020617;
  background-image: 
    radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.1) 0px, transparent 50%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 480px;
  padding: 4rem;
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(40px);
  box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.5);
}

.login-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.logo-box {
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
}

.login-logo-img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
}

.login-header h1 {
  font-size: 2.25rem;
  font-weight: 950;
  letter-spacing: -0.05em;
  color: #fff;
  margin: 0;
}

.login-header p {
  font-size: 0.9rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group label {
  display: block;
  font-size: 0.7rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 0.75rem;
}

.premium-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.premium-input-wrapper svg {
  position: absolute;
  left: 1.25rem;
  color: rgba(255, 255, 255, 0.2);
  transition: color 0.3s;
}

.premium-input-wrapper input {
  width: 100%;
  padding: 1.15rem 1.25rem 1.15rem 3.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s;
}

.premium-input-wrapper input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.premium-input-wrapper input:focus + svg {
  color: var(--accent);
}

.login-btn {
  height: 60px;
  font-size: 1rem;
  margin-top: 1rem;
}

.error-msg {
  color: #ef4444;
  font-size: 0.85rem;
  text-align: center;
  font-weight: 700;
  background: rgba(239, 68, 68, 0.1);
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.login-footer {
  margin-top: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 0.65rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.2);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.dot-sep {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 480px) {
  .login-card {
    padding: 2.5rem 1.5rem;
    border-radius: 24px;
  }
  .login-header h1 {
    font-size: 1.75rem;
  }
  .login-header {
    margin-bottom: 2.5rem;
  }
  .logo-box {
    width: 48px;
    height: 48px;
    border-radius: 14px;
  }
  .logo-box svg {
    width: 24px;
    height: 24px;
  }
}
</style>
