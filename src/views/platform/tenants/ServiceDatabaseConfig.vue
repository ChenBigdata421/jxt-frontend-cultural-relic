<template>
  <div class="service-db-config">
    <!-- Background grid effect -->
    <div class="grid-bg" />

    <div class="config-layout">
      <!-- Left: Service Selector Panel -->
      <aside class="service-panel">
        <div class="panel-header">
          <div class="header-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="2" y="2" width="20" height="8" rx="2" stroke-width="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" stroke-width="2" />
              <line x1="6" y1="6" x2="6" y2="6" stroke-width="3" stroke-linecap="round" />
              <line x1="6" y1="18" x2="6" y2="18" stroke-width="3" stroke-linecap="round" />
            </svg>
          </div>
          <span class="header-title">SERVICES</span>
          <span class="header-count">{{ configuredCount }}/{{ services.length }}</span>
        </div>

        <div class="service-list">
          <div
            v-for="service in services"
            :key="service.code"
            :class="['service-item', {
              'active': currentServiceCode === service.code,
              'configured': service.isConfigured,
              'pending': !service.isConfigured
            }]"
            @click="selectService(service.code)"
          >
            <div class="service-indicator">
              <span class="indicator-dot" />
            </div>
            <div class="service-info">
              <span class="service-name">{{ service.label }}</span>
              <span class="service-code">{{ service.code }}</span>
            </div>
            <div class="service-status">
              <svg v-if="service.isConfigured" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </div>
        </div>

        <div class="panel-footer">
          <button class="add-service-btn" @click="handleAddServiceClick">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Service
          </button>
        </div>
      </aside>

      <!-- Right: Configuration Panel -->
      <main class="config-panel">
        <div v-if="!currentService" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>Select a service to configure</p>
        </div>

        <template v-else>
          <!-- Config Header -->
          <header class="config-header">
            <div class="header-left">
              <div class="service-badge" :class="currentService.category">
                <span class="badge-icon">{{ getIconForService(currentServiceCode) }}</span>
                <span class="badge-text">{{ currentService.label }}</span>
              </div>
              <div class="config-meta">
                <code class="service-code-display">{{ currentServiceCode }}</code>
                <span class="config-status" :class="{ configured: currentService.isConfigured }">
                  {{ currentService.isConfigured ? 'CONFIGURED' : 'NOT CONFIGURED' }}
                </span>
              </div>
            </div>
            <div class="header-actions">
              <button
                v-if="currentService.isConfigured"
                class="action-btn danger"
                :disabled="configSaving"
                @click="confirmDelete"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Delete
              </button>
              <button class="action-btn primary" :disabled="configSaving || !hasRequiredFields" @click="testConnection">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                Test Connection
              </button>
            </div>
          </header>

          <!-- Configuration Form -->
          <div v-loading="configLoading" class="config-form">
            <!-- Connection Section -->
            <section class="form-section">
              <div class="section-header">
                <div class="section-title-line">
                  <span class="section-number">01</span>
                  <h3 class="section-title">CONNECTION</h3>
                </div>
                <div class="section-divider" />
              </div>

              <div class="form-grid">
                <div class="form-field">
                  <label class="field-label">
                    <span>Driver</span>
                    <span class="field-required">*</span>
                  </label>
                  <div class="field-wrapper">
                    <select v-model="form.driver" class="field-select" @change="handleDriverChange">
                      <option value="postgres">PostgreSQL</option>
                      <option value="mysql">MySQL</option>
                    </select>
                    <div class="field-border" />
                  </div>
                </div>

                <div class="form-field">
                  <label class="field-label">
                    <span>Host</span>
                    <span class="field-required">*</span>
                  </label>
                  <div class="field-wrapper">
                    <input
                      v-model="form.host"
                      type="text"
                      placeholder="localhost"
                      class="field-input"
                    >
                    <div class="field-border" />
                  </div>
                </div>

                <div class="form-field half">
                  <label class="field-label">
                    <span>Port</span>
                    <span class="field-required">*</span>
                  </label>
                  <div class="field-wrapper">
                    <input
                      v-model.number="form.port"
                      type="number"
                      min="1"
                      max="65535"
                      class="field-input"
                    >
                    <div class="field-border" />
                  </div>
                </div>

                <div class="form-field half">
                  <label class="field-label">
                    <span>SSL Mode</span>
                  </label>
                  <div class="field-wrapper">
                    <select v-model="form.sslMode" class="field-select">
                      <option value="disable">Disable</option>
                      <option value="require">Require</option>
                      <option value="verify-ca">Verify CA</option>
                      <option value="verify-full">Verify Full</option>
                    </select>
                    <div class="field-border" />
                  </div>
                </div>

                <div class="form-field">
                  <label class="field-label">
                    <span>Database</span>
                    <span class="field-required">*</span>
                  </label>
                  <div class="field-wrapper">
                    <input
                      v-model="form.database"
                      type="text"
                      placeholder="database_name"
                      class="field-input"
                    >
                    <div class="field-border" />
                  </div>
                </div>
              </div>
            </section>

            <!-- Credentials Section -->
            <section class="form-section">
              <div class="section-header">
                <div class="section-title-line">
                  <span class="section-number">02</span>
                  <h3 class="section-title">CREDENTIALS</h3>
                </div>
                <div class="section-divider" />
              </div>

              <div class="form-grid">
                <div class="form-field">
                  <label class="field-label">
                    <span>Username</span>
                    <span class="field-required">*</span>
                  </label>
                  <div class="field-wrapper">
                    <input
                      v-model="form.username"
                      type="text"
                      placeholder="db_user"
                      class="field-input"
                    >
                    <div class="field-border" />
                  </div>
                </div>

                <div class="form-field">
                  <label class="field-label">
                    <span>Password</span>
                    <span v-if="!form.passwordSet" class="field-required">*</span>
                  </label>
                  <div class="field-wrapper">
                    <input
                      v-model="form.password"
                      :type="showPassword ? 'text' : 'password'"
                      :placeholder="form.passwordSet && !form.password ? '•••••••• Encrypted' : 'Enter password'"
                      class="field-input"
                    >
                    <div class="field-border" />
                    <button
                      type="button"
                      class="password-toggle"
                      @click="showPassword = !showPassword"
                    >
                      <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    </button>
                  </div>
                  <div v-if="form.passwordSet && !form.password" class="field-hint">
                    Password is encrypted. Leave blank to keep existing.
                  </div>
                </div>
              </div>
            </section>

            <!-- Pool Settings Section -->
            <section class="form-section">
              <div class="section-header">
                <div class="section-title-line">
                  <span class="section-number">03</span>
                  <h3 class="section-title">CONNECTION POOL</h3>
                </div>
                <div class="section-divider" />
              </div>

              <div class="form-grid">
                <div class="form-field half">
                  <label class="field-label">
                    <span>Max Open</span>
                  </label>
                  <div class="field-wrapper">
                    <input
                      v-model.number="form.maxOpenConns"
                      type="number"
                      min="1"
                      max="100"
                      class="field-input"
                    >
                    <div class="field-border" />
                  </div>
                </div>

                <div class="form-field half">
                  <label class="field-label">
                    <span>Max Idle</span>
                  </label>
                  <div class="field-wrapper">
                    <input
                      v-model.number="form.maxIdleConns"
                      type="number"
                      min="1"
                      max="50"
                      class="field-input"
                    >
                    <div class="field-border" />
                  </div>
                </div>

                <div class="form-field half">
                  <label class="field-label">
                    <span>Idle Timeout (s)</span>
                  </label>
                  <div class="field-wrapper">
                    <input
                      v-model.number="form.connMaxIdleTime"
                      type="number"
                      min="0"
                      max="3600"
                      class="field-input"
                    >
                    <div class="field-border" />
                  </div>
                </div>

                <div class="form-field half">
                  <label class="field-label">
                    <span>Max Lifetime (s)</span>
                  </label>
                  <div class="field-wrapper">
                    <input
                      v-model.number="form.connMaxLifeTime"
                      type="number"
                      min="0"
                      max="7200"
                      class="field-input"
                    >
                    <div class="field-border" />
                  </div>
                </div>
              </div>
            </section>

            <!-- Timeout Section -->
            <section class="form-section">
              <div class="section-header">
                <div class="section-title-line">
                  <span class="section-number">04</span>
                  <h3 class="section-title">TIMEOUTS</h3>
                </div>
                <div class="section-divider" />
              </div>

              <div class="form-grid">
                <div class="form-field third">
                  <label class="field-label">
                    <span>Connect (s)</span>
                  </label>
                  <div class="field-wrapper">
                    <input
                      v-model.number="form.connectTimeout"
                      type="number"
                      min="1"
                      max="300"
                      class="field-input"
                    >
                    <div class="field-border" />
                  </div>
                </div>

                <div class="form-field third">
                  <label class="field-label">
                    <span>Read (s)</span>
                  </label>
                  <div class="field-wrapper">
                    <input
                      v-model.number="form.readTimeout"
                      type="number"
                      min="1"
                      max="300"
                      class="field-input"
                    >
                    <div class="field-border" />
                  </div>
                </div>

                <div class="form-field third">
                  <label class="field-label">
                    <span>Write (s)</span>
                  </label>
                  <div class="field-wrapper">
                    <input
                      v-model.number="form.writeTimeout"
                      type="number"
                      min="1"
                      max="300"
                      class="field-input"
                    >
                    <div class="field-border" />
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- Save Footer -->
          <footer class="config-footer">
            <div class="footer-info">
              <span v-if="form.updatedAt" class="last-modified">
                Last modified: {{ formatDate(form.updatedAt) }}
              </span>
            </div>
            <div class="footer-actions">
              <button class="footer-btn secondary" :disabled="configSaving" @click="loadCurrentConfig">
                Reset
              </button>
              <button class="footer-btn primary" :disabled="configSaving || !hasRequiredFields" @click="saveConfig">
                <svg v-if="configSaving" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                {{ configSaving ? 'Saving...' : 'Save Configuration' }}
              </button>
            </div>
          </footer>
        </template>
      </main>
    </div>

    <!-- Add Service Dialog -->
    <div v-if="showAddService" class="modal-overlay" @click.self="showAddService = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Add Service Configuration</h3>
          <button class="modal-close" @click="showAddService = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-desc">Select a service to add database configuration:</p>
          <div v-if="unconfiguredServices.length > 0" class="service-options">
            <div
              v-for="service in unconfiguredServices"
              :key="service.code"
              class="service-option"
              @click="addService(service.code)"
            >
              <span class="option-icon">{{ getIconForService(service.code) }}</span>
              <div class="option-info">
                <span class="option-label">{{ service.label }}</span>
                <span class="option-code">{{ service.code }}</span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </div>
          <div v-else class="empty-services">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <p>All services are already configured!</p>
            <p class="empty-hint">You can edit existing configurations from the service list on the left.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal danger">
        <div class="modal-header">
          <h3>Delete Configuration</h3>
          <button class="modal-close" @click="showDeleteConfirm = false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="warning-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <p class="modal-desc">Are you sure you want to delete the database configuration for <strong>{{ currentServiceCode }}</strong>?</p>
          <p class="modal-warning">This action cannot be undone. Services without a database configuration will use default settings.</p>
        </div>
        <div class="modal-footer">
          <button class="modal-btn secondary" @click="showDeleteConfirm = false">Cancel</button>
          <button class="modal-btn danger" @click="deleteConfig">Delete Configuration</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getTenantServiceConfigs,
  getTenantServiceConfig,
  updateTenantServiceConfig,
  deleteTenantServiceConfig,
  createTenantServiceConfigs
} from '@/api/platform/tenants'
import { getTenant } from '@/api/platform/tenants'

export default {
  name: 'ServiceDatabaseConfig',
  props: {
    tenantId: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      // All available services
      allServices: [
        { code: 'evidence-command', label: 'Evidence Command', category: 'write', icon: '⚡' },
        { code: 'evidence-query', label: 'Evidence Query', category: 'read', icon: '🔍' },
        { code: 'file-storage', label: 'File Storage', category: 'storage', icon: '📁' },
        { code: 'security-management', label: 'Security Management', category: 'security', icon: '🔒' },
        { code: 'process-management', label: 'Process Management', category: 'process', icon: '✍️' }
      ],

      // Configured services loaded from API
      configuredServices: [],
      tenantCode: null, // Tenant code for creating new configs

      // Current selections
      currentServiceCode: null,
      showAddService: false,
      showDeleteConfirm: false,

      // Form state
      configLoading: false,
      configSaving: false,
      showPassword: false,

      // Current service form
      form: {
        driver: 'postgres',
        host: '',
        port: 5432,
        database: '',
        username: '',
        password: '',
        passwordSet: false,
        sslMode: 'disable',
        maxOpenConns: 100,
        maxIdleConns: 20,
        connMaxIdleTime: 300,
        connMaxLifeTime: 3600,
        connectTimeout: 10,
        readTimeout: 30,
        writeTimeout: 30,
        enabled: true,
        updatedAt: null
      }
    }
  },
  computed: {
    services() {
      return this.allServices.map((s) => ({
        ...s,
        isConfigured: this.configuredServices.some((c) => c.serviceCode === s.code)
      }))
    },
    currentService() {
      return this.services.find((s) => s.code === this.currentServiceCode)
    },
    unconfiguredServices() {
      const unconfigured = this.services.filter((s) => !s.isConfigured)
      console.log('All services:', this.services.map(s => ({ code: s.code, configured: s.isConfigured })))
      console.log('Unconfigured services:', unconfigured)
      return unconfigured
    },
    configuredCount() {
      return this.configuredServices.length
    },
    hasRequiredFields() {
      return (
        this.form.driver &&
        this.form.host &&
        this.form.port &&
        this.form.database &&
        this.form.username &&
        (this.form.password || this.form.passwordSet)
      )
    }
  },
  watch: {
    tenantId: {
      immediate: true, // 设为 true 时，组件创建后会立即执行一次 handler
      handler() {
        this.loadAllConfigs()
      }
    }
  },
  methods: {
    async loadAllConfigs() {
      if (!this.tenantId) return

      this.configLoading = true
      try {
        // Load tenant info to get tenantCode
        const tenantResp = await getTenant(this.tenantId)
        if (tenantResp && tenantResp.code === 200 && tenantResp.data) {
          this.tenantCode = tenantResp.data.code || null
        }

        // Load service configurations
        const resp = await getTenantServiceConfigs(this.tenantId)
        if (resp && resp.code === 200 && resp.data) {
          this.configuredServices = resp.data || []

          // Auto-select first configured service, or first unconfigured
          if (this.configuredServices.length > 0) {
            this.currentServiceCode = this.configuredServices[0].serviceCode
            await this.loadCurrentConfig()
          } else if (this.services.length > 0) {
            this.currentServiceCode = this.services[0].code
          }
        }
      } catch (e) {
        this.$message.error('Failed to load service configurations: ' + (e.message || 'Unknown error'))
      } finally {
        this.configLoading = false
      }
    },

    async loadCurrentConfig() {
      if (!this.tenantId || !this.currentServiceCode) return

      this.configLoading = true
      try {
        const resp = await getTenantServiceConfig(this.tenantId, this.currentServiceCode)
        if (resp && resp.code === 200 && resp.data) {
          const data = resp.data
          this.form = {
            driver: data.driver || 'postgres',
            host: data.host || '',
            port: data.port || 5432,
            database: data.database || '',
            username: data.username || '',
            password: '',
            passwordSet: !!(data.username || data.host), // 如果 data.username 存在（truthy），返回 data.username，如果 data.username 不存在，返回 data.host，如果两者都不存在，返回 false；双重非运算将任何值转换为严格的布尔值
            sslMode: data.sslmode || data.sslMode || 'disable', // Handle both 'sslmode' and 'sslMode'
            maxOpenConns: data.maxOpenConns || 100,
            maxIdleConns: data.maxIdleConns || 20,
            connMaxIdleTime: data.connMaxIdleTime || 300,
            connMaxLifeTime: data.connMaxLifeTime || 3600,
            connectTimeout: data.connectTimeout || 10,
            readTimeout: data.readTimeout || 30,
            writeTimeout: data.writeTimeout || 30,
            enabled: data.enabled !== false,
            updatedAt: data.updatedAt || null
          }
        }
      } catch (e) {
        // Service not configured - reset form silently (normal for new services)
        const isNotFound = e.response?.status === 404 ||
                           e.response?.data?.msg?.toLowerCase().includes('not found')
        if (isNotFound) {
          this.resetForm()
        } else {
          this.$message.error('Failed to load configuration: ' + (e.message || 'Unknown error'))
        }
      } finally {
        this.configLoading = false
      }
    },

    resetForm() {
      const isMySQL = this.form.driver === 'mysql'
      this.form = {
        driver: this.form.driver,
        host: '',
        port: isMySQL ? 3306 : 5432,
        database: '',
        username: '',
        password: '',
        passwordSet: false,
        sslMode: 'disable',
        maxOpenConns: 100,
        maxIdleConns: 20,
        connMaxIdleTime: 300,
        connMaxLifeTime: 3600,
        connectTimeout: 10,
        readTimeout: 30,
        writeTimeout: 30,
        enabled: true,
        updatedAt: null
      }
    },

    selectService(code) {
      if (this.currentServiceCode === code) return
      this.currentServiceCode = code
      this.loadCurrentConfig()
    },

    handleAddServiceClick() {
      this.showAddService = true
    },

    addService(code) {
      this.showAddService = false
      this.selectService(code)
    },

    handleDriverChange() {
      this.form.port = this.form.driver === 'mysql' ? 3306 : 5432
    },

    async saveConfig() {
      if (!this.hasRequiredFields) {
        this.$message.error('Please fill in all required fields')
        return
      }

      if (!this.tenantCode) {
        this.$message.error('Tenant code not found. Please refresh the page.')
        return
      }

      this.configSaving = true
      try {
        const isConfigured = this.currentService?.isConfigured || false
        let resp

        if (isConfigured) {
          // Update existing config with PUT
          const data = {
            driver: this.form.driver,
            host: this.form.host,
            port: this.form.port,
            database: this.form.database,
            username: this.form.username,
            sslmode: this.form.sslMode, // Backend expects 'sslmode' (lowercase)
            maxOpenConns: this.form.maxOpenConns,
            maxIdleConns: this.form.maxIdleConns,
            connMaxIdleTime: this.form.connMaxIdleTime,
            connMaxLifeTime: this.form.connMaxLifeTime,
            connectTimeout: this.form.connectTimeout,
            readTimeout: this.form.readTimeout,
            writeTimeout: this.form.writeTimeout,
            enabled: this.form.enabled
          }

          // Only include password if it's set
          if (this.form.password) {
            data.password = this.form.password
          }

          resp = await updateTenantServiceConfig(this.tenantId, this.currentServiceCode, data)
        } else {
          // Create new config with POST
          const data = {
            tenantId: this.tenantId,
            tenantCode: this.tenantCode,
            writeServices: [
              {
                serviceCode: this.currentServiceCode,
                driver: this.form.driver,
                host: this.form.host,
                port: this.form.port,
                database: this.form.database,
                sslmode: this.form.sslMode,
                maxOpenConns: this.form.maxOpenConns,
                maxIdleConns: this.form.maxIdleConns,
                connMaxIdleTime: this.form.connMaxIdleTime,
                connMaxLifeTime: this.form.connMaxLifeTime,
                connectTimeout: this.form.connectTimeout,
                readTimeout: this.form.readTimeout,
                writeTimeout: this.form.writeTimeout
              }
            ]
          }

          resp = await createTenantServiceConfigs(data)
        }

        if (resp && resp.code === 200) {
          this.$message.success(resp.msg || 'Configuration saved successfully')
          this.form.password = ''
          this.form.passwordSet = true
          await this.loadAllConfigs()
        } else {
          this.$message.error((resp && resp.msg) || 'Failed to save configuration')
        }
      } catch (e) {
        this.$message.error('Failed to save configuration: ' + (e.message || 'Unknown error'))
      } finally {
        this.configSaving = false
      }
    },

    testConnection() {
      this.$message.info('Connection testing requires backend API support')
    },

    confirmDelete() {
      this.showDeleteConfirm = true
    },

    async deleteConfig() {
      this.showDeleteConfirm = false
      this.configSaving = true
      try {
        const resp = await deleteTenantServiceConfig(this.tenantId, this.currentServiceCode)
        if (resp && resp.code === 200) {
          this.$message.success(resp.msg || 'Configuration deleted successfully')
          await this.loadAllConfigs()
        } else {
          this.$message.error((resp && resp.msg) || 'Failed to delete configuration')
        }
      } catch (e) {
        this.$message.error('Failed to delete configuration: ' + (e.message || 'Unknown error'))
      } finally {
        this.configSaving = false
      }
    },

    getIconForService(code) {
      const service = this.allServices.find((s) => s.code === code)
      return service?.icon || '⚙️'
    },

    formatDate(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleString()
    }
  }
}
</script>

<style>
/* === CSS Variables - Light Theme (Element UI compatible) === */
.service-db-config {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f7fa;
  --bg-tertiary: #fafafa;
  --bg-elevated: #ffffff;

  --border-subtle: #dcdfe6;
  --border-medium: #c0c4cc;
  --border-strong: #909399;

  --text-primary: #303133;
  --text-secondary: #606266;
  --text-tertiary: #909399;

  --accent-blue: #409eff;
  --accent-blue-dim: rgba(64, 158, 255, 0.1);
  --accent-amber: #e6a23c;
  --accent-amber-dim: rgba(230, 162, 60, 0.1);
  --accent-green: #67c23a;
  --accent-green-dim: rgba(103, 194, 58, 0.1);
  --accent-red: #f56c6c;
  --accent-red-dim: rgba(245, 108, 108, 0.1);

  --font-display: "Consolas", "Monaco", "Courier New", monospace;
  --font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}

/* === Base Layout === */
.service-db-config {
  position: relative;
  min-height: 500px;
  background: var(--bg-primary);
  font-family: var(--font-body);
  color: var(--text-primary);
  border-radius: var(--radius-lg);
}

.grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--border-subtle) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px);
  background-size: 40px 40px;
  opacity: 0.15;
  pointer-events: none;
  border-radius: var(--radius-lg);
}

.config-layout {
  position: relative;
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 500px;
}

/* === Service Panel (Left) === */
.service-panel {
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-subtle);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-bottom: 1px solid var(--border-subtle);
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: var(--accent-blue);
}

.header-title {
  flex: 1;
  color: var(--text-secondary);
}

.header-count {
  padding: 2px 8px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--accent-blue);
}

.service-list {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  margin-bottom: 4px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.service-item:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-subtle);
}

.service-item.active {
  background: var(--accent-blue-dim);
  border-color: var(--accent-blue);
}

.service-indicator {
  display: flex;
  align-items: center;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-strong);
  transition: all 0.2s ease;
}

.service-item.configured .indicator-dot {
  background: var(--accent-green);
  box-shadow: 0 0 8px var(--accent-green-dim);
}

.service-info {
  flex: 1;
  min-width: 0;
}

.service-name {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.service-code {
  display: block;
  font-family: var(--font-display);
  font-size: 10px;
  color: var(--text-tertiary);
  text-transform: lowercase;
}

.service-status {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--text-tertiary);
}

.service-item.configured .service-status {
  color: var(--accent-green);
}

.panel-footer {
  padding: 12px;
  border-top: 1px solid var(--border-subtle);
}

.add-service-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px dashed var(--border-medium);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-service-btn:hover {
  border-color: var(--accent-blue);
  color: var(--accent-blue);
  background: var(--accent-blue-dim);
}

/* === Configuration Panel (Right) === */
.config-panel {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--text-tertiary);
}

.empty-state svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-family: var(--font-display);
  font-size: 12px;
}

/* === Config Header === */
.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-secondary);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.service-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.service-badge.write {
  background: var(--accent-amber-dim);
  color: var(--accent-amber);
  border: 1px solid rgba(255, 149, 0, 0.3);
}

.service-badge.read {
  background: var(--accent-blue-dim);
  color: var(--accent-blue);
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.service-badge.storage {
  background: var(--accent-green-dim);
  color: var(--accent-green);
  border: 1px solid rgba(0, 255, 157, 0.3);
}

.service-badge.security {
  background: var(--accent-red-dim);
  color: var(--accent-red);
  border: 1px solid rgba(255, 71, 87, 0.3);
}

.badge-icon {
  font-size: 14px;
}

.config-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-code-display {
  padding: 4px 8px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-size: 10px;
  color: var(--text-tertiary);
}

.config-status {
  font-family: var(--font-display);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
}

.config-status.configured {
  color: var(--accent-green);
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.action-btn.primary {
  background: var(--accent-blue-dim);
  color: var(--accent-blue);
  border-color: rgba(0, 212, 255, 0.3);
}

.action-btn.primary:hover:not(:disabled) {
  background: rgba(0, 212, 255, 0.2);
}

.action-btn.danger {
  background: transparent;
  color: var(--accent-red);
  border-color: var(--border-subtle);
}

.action-btn.danger:hover:not(:disabled) {
  background: var(--accent-red-dim);
  border-color: var(--accent-red);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* === Config Form === */
.config-form {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.section-title-line {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-number {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 600;
  color: var(--accent-blue);
  opacity: 0.5;
}

.section-title {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.15em;
  color: var(--text-secondary);
}

.section-divider {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--border-subtle), transparent);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field.half {
  grid-column: span 1;
}

.form-field.third {
  grid-column: span 1;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
}

.field-required {
  color: var(--accent-red);
}

.field-wrapper {
  position: relative;
}

.field-input,
.field-select {
  width: 100%;
  padding: 10px 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: 12px;
  transition: all 0.2s ease;
  outline: none;
}

.field-input:focus,
.field-select:focus {
  border-color: var(--accent-blue);
  background: var(--bg-tertiary);
}

.field-input::placeholder {
  color: var(--text-tertiary);
}

.field-border {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--accent-blue);
  transform: scaleX(0);
  transition: transform 0.2s ease;
}

.field-input:focus ~ .field-border,
.field-select:focus ~ .field-border {
  transform: scaleX(1);
}

.password-toggle {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: var(--text-secondary);
}

.field-hint {
  font-family: var(--font-display);
  font-size: 10px;
  color: var(--accent-blue);
  margin-top: 4px;
}

/* === Config Footer === */
.config-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-secondary);
}

.footer-info {
  font-family: var(--font-display);
  font-size: 10px;
  color: var(--text-tertiary);
}

.footer-actions {
  display: flex;
  gap: 8px;
}

.footer-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.footer-btn.secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
}

.footer-btn.secondary:hover:not(:disabled) {
  border-color: var(--border-medium);
  color: var(--text-primary);
}

.footer-btn.primary {
  background: var(--accent-blue);
  color: var(--bg-primary);
  border: 1px solid var(--accent-blue);
}

.footer-btn.primary:hover:not(:disabled) {
  background: #00b8e6;
  border-color: #00b8e6;
}

.footer-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* === Modal === */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 1000;
}

.modal {
  width: 420px;
  max-width: 90vw;
  background: var(--bg-primary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal.danger {
  border-color: var(--accent-red-dim);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
}

.modal-header h3 {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

.modal-body {
  padding: 20px;
}

.modal-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.modal-warning {
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: 12px;
}

.warning-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: var(--accent-red);
  background: var(--accent-red-dim);
  border-radius: 50%;
}

.service-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.service-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
}

.service-option:hover {
  border-color: var(--accent-blue);
  background: var(--accent-blue-dim);
}

.option-icon {
  font-size: 20px;
}

.option-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
}

.option-code {
  font-family: var(--font-display);
  font-size: 10px;
  color: var(--text-tertiary);
}

.service-option svg {
  color: var(--accent-blue);
}

.empty-services {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
  text-align: center;
  color: var(--text-secondary);
}

.empty-services svg {
  color: var(--accent-green);
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-services p {
  font-size: 14px;
  margin: 4px 0;
}

.empty-hint {
  font-size: 12px;
  color: var(--text-tertiary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-subtle);
}

.modal-btn {
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-btn.secondary {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
}

.modal-btn.secondary:hover {
  border-color: var(--border-medium);
  color: var(--text-primary);
}

.modal-btn.danger {
  background: var(--accent-red);
  color: white;
  border: 1px solid var(--accent-red);
}

.modal-btn.danger:hover {
  background: #e03d4d;
}

/* === Animations === */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spin {
  animation: spin 0.8s linear infinite;
}

/* === Scrollbar === */
.service-list::-webkit-scrollbar,
.config-form::-webkit-scrollbar {
  width: 6px;
}

.service-list::-webkit-scrollbar-track,
.config-form::-webkit-scrollbar-track {
  background: transparent;
}

.service-list::-webkit-scrollbar-thumb,
.config-form::-webkit-scrollbar-thumb {
  background: var(--border-subtle);
  border-radius: 3px;
}

.service-list::-webkit-scrollbar-thumb:hover,
.config-form::-webkit-scrollbar-thumb:hover {
  background: var(--border-medium);
}

/* === Responsive === */
@media (max-width: 768px) {
  .config-layout {
    grid-template-columns: 1fr;
  }

  .service-panel {
    display: none;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
