<template>
  <div class="cron-picker">
    <!-- 模式切换 -->
    <div class="cron-picker__mode">
      <el-radio-group v-model="mode" size="mini" @change="onModeChange">
        <el-radio-button label="date">按日期周期</el-radio-button>
        <el-radio-button label="weekday">按星期周期</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 分字段设置 -->
    <div class="cron-picker__fields">
      <div class="cron-field">
        <span class="cron-field__label">分</span>
        <el-select v-model="minuteType" size="mini" class="cron-field__type" @change="onFieldTypeChange('minute')">
          <el-option label="每分钟" value="every" />
          <el-option label="指定分钟" value="specify" />
          <el-option label="区间" value="range" />
        </el-select>
        <div v-if="minuteType === 'specify'" class="cron-field__values">
          <el-select
            v-model="minuteValues"
            multiple
            size="mini"
            collapse-tags
            placeholder="选择分钟"
            class="cron-field__select"
          >
            <el-option v-for="m in 60" :key="m - 1" :label="String(m - 1)" :value="m - 1" />
          </el-select>
        </div>
        <div v-if="minuteType === 'range'" class="cron-field__range">
          <el-input-number v-model="minuteRange[0]" size="mini" :min="0" :max="59" controls-position="right" />
          <span class="cron-field__sep">~</span>
          <el-input-number v-model="minuteRange[1]" size="mini" :min="0" :max="59" controls-position="right" />
        </div>
      </div>

      <div class="cron-field">
        <span class="cron-field__label">时</span>
        <el-select v-model="hourType" size="mini" class="cron-field__type" @change="onFieldTypeChange('hour')">
          <el-option label="每小时" value="every" />
          <el-option label="指定小时" value="specify" />
          <el-option label="区间" value="range" />
        </el-select>
        <div v-if="hourType === 'specify'" class="cron-field__values">
          <el-select
            v-model="hourValues"
            multiple
            size="mini"
            collapse-tags
            placeholder="选择小时"
            class="cron-field__select"
          >
            <el-option v-for="h in 24" :key="h - 1" :label="String(h - 1)" :value="h - 1" />
          </el-select>
        </div>
        <div v-if="hourType === 'range'" class="cron-field__range">
          <el-input-number v-model="hourRange[0]" size="mini" :min="0" :max="23" controls-position="right" />
          <span class="cron-field__sep">~</span>
          <el-input-number v-model="hourRange[1]" size="mini" :min="0" :max="23" controls-position="right" />
        </div>
      </div>

      <!-- 按日期模式：显示日/月，隐藏周 -->
      <template v-if="mode === 'date'">
        <div class="cron-field">
          <span class="cron-field__label">日</span>
          <el-select v-model="dayType" size="mini" class="cron-field__type" @change="onFieldTypeChange('day')">
            <el-option label="每日" value="every" />
            <el-option label="指定日" value="specify" />
            <el-option label="区间" value="range" />
          </el-select>
          <div v-if="dayType === 'specify'" class="cron-field__values">
            <el-select
              v-model="dayValues"
              multiple
              size="mini"
              collapse-tags
              placeholder="选择日"
              class="cron-field__select"
            >
              <el-option v-for="d in 31" :key="d" :label="String(d)" :value="d" />
            </el-select>
          </div>
          <div v-if="dayType === 'range'" class="cron-field__range">
            <el-input-number v-model="dayRange[0]" size="mini" :min="1" :max="31" controls-position="right" />
            <span class="cron-field__sep">~</span>
            <el-input-number v-model="dayRange[1]" size="mini" :min="1" :max="31" controls-position="right" />
          </div>
        </div>

        <div class="cron-field">
          <span class="cron-field__label">月</span>
          <el-select v-model="monthType" size="mini" class="cron-field__type" @change="onFieldTypeChange('month')">
            <el-option label="每月" value="every" />
            <el-option label="指定月" value="specify" />
            <el-option label="区间" value="range" />
          </el-select>
          <div v-if="monthType === 'specify'" class="cron-field__values">
            <el-select
              v-model="monthValues"
              multiple
              size="mini"
              collapse-tags
              placeholder="选择月"
              class="cron-field__select"
            >
              <el-option v-for="m in 12" :key="m" :label="m + '月'" :value="m" />
            </el-select>
          </div>
          <div v-if="monthType === 'range'" class="cron-field__range">
            <el-input-number v-model="monthRange[0]" size="mini" :min="1" :max="12" controls-position="right" />
            <span class="cron-field__sep">~</span>
            <el-input-number v-model="monthRange[1]" size="mini" :min="1" :max="12" controls-position="right" />
          </div>
        </div>
      </template>

      <!-- 按星期模式：显示周 -->
      <template v-if="mode === 'weekday'">
        <div class="cron-field">
          <span class="cron-field__label">周</span>
          <el-select v-model="weekdayType" size="mini" class="cron-field__type" @change="onFieldTypeChange('weekday')">
            <el-option label="每天" value="every" />
            <el-option label="指定星期" value="specify" />
          </el-select>
          <div v-if="weekdayType === 'specify'" class="cron-field__values">
            <el-select
              v-model="weekdayValues"
              multiple
              size="mini"
              collapse-tags
              placeholder="选择星期"
              class="cron-field__select"
            >
              <el-option v-for="(w, i) in weekdayLabels" :key="i" :label="w" :value="i" />
            </el-select>
          </div>
        </div>
      </template>
    </div>

    <!-- 中文预览 -->
    <div class="cron-picker__preview">
      <i class="el-icon-info" />
      <span>{{ humanReadable }}</span>
    </div>

    <!-- 生成的表达式 -->
    <div class="cron-picker__expression">
      <code>{{ cronExpression || '—' }}</code>
    </div>
  </div>
</template>

<script>
const WEEKDAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export default {
  name: 'CronPicker',
  props: {
    value: { type: String, default: '' }
  },
  data() {
    return {
      mode: 'date',
      // 分
      minuteType: 'every',
      minuteValues: [],
      minuteRange: [0, 59],
      // 时
      hourType: 'every',
      hourValues: [],
      hourRange: [0, 23],
      // 日
      dayType: 'every',
      dayValues: [],
      dayRange: [1, 31],
      // 月
      monthType: 'every',
      monthValues: [],
      monthRange: [1, 12],
      // 周
      weekdayType: 'every',
      weekdayValues: [],
      // 标记：是否正在从外部 value 解析，避免回写触发
      parsing: false
    }
  },
  computed: {
    weekdayLabels() {
      return WEEKDAY_LABELS
    },
    // 根据各字段状态生成 cron 表达式
    cronExpression() {
      const minute = this.buildField('minute')
      const hour = this.buildField('hour')
      let day, month, weekday

      if (this.mode === 'date') {
        day = this.buildField('day')
        month = this.buildField('month')
        weekday = '*'
      } else {
        day = '*'
        month = '*'
        weekday = this.buildWeekday()
      }

      const expr = `${minute} ${hour} ${day} ${month} ${weekday}`
      // 全部为 * 时返回空
      if (expr === '* * * * *') return ''
      return expr
    },
    // 中文可读描述
    humanReadable() {
      if (!this.cronExpression) return '未设置'

      const parts = []

      // 月
      if (this.mode === 'date') {
        parts.push(this.describeField('month', '月'))
      }

      // 日/周
      if (this.mode === 'date') {
        parts.push(this.describeField('day', '日'))
      } else {
        parts.push(this.describeWeekday())
      }

      // 时
      parts.push(this.describeTime())

      return parts.join(' ') + ' 执行'
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        if (val && val !== this.cronExpression) {
          this.parseCron(val)
        } else if (!val) {
          this.resetFields()
        }
      }
    },
    // 任何字段变化时向父组件回写
    cronExpression(val) {
      if (!this.parsing) {
        this.$emit('input', val)
      }
    }
  },
  methods: {
    // 重置所有字段到默认
    resetFields() {
      this.mode = 'date'
      this.minuteType = 'every'
      this.minuteValues = []
      this.minuteRange = [0, 59]
      this.hourType = 'every'
      this.hourValues = []
      this.hourRange = [0, 23]
      this.dayType = 'every'
      this.dayValues = []
      this.dayRange = [1, 31]
      this.monthType = 'every'
      this.monthValues = []
      this.monthRange = [1, 12]
      this.weekdayType = 'every'
      this.weekdayValues = []
    },

    // 模式切换时重置日/周字段
    onModeChange() {
      if (this.mode === 'date') {
        this.weekdayType = 'every'
        this.weekdayValues = []
      } else {
        this.dayType = 'every'
        this.dayValues = []
        this.dayRange = [1, 31]
        this.monthType = 'every'
        this.monthValues = []
        this.monthRange = [1, 12]
      }
    },

    // 字段类型切换时清空值
    onFieldTypeChange(field) {
      switch (field) {
        case 'minute':
          this.minuteValues = []
          this.minuteRange = [0, 59]
          break
        case 'hour':
          this.hourValues = []
          this.hourRange = [0, 23]
          break
        case 'day':
          this.dayValues = []
          this.dayRange = [1, 31]
          break
        case 'month':
          this.monthValues = []
          this.monthRange = [1, 12]
          break
        case 'weekday':
          this.weekdayValues = []
          break
      }
    },

    // 构建单个字段的 cron 值
    buildField(field) {
      const typeMap = {
        minute: this.minuteType,
        hour: this.hourType,
        day: this.dayType,
        month: this.monthType
      }
      const valuesMap = {
        minute: this.minuteValues,
        hour: this.hourValues,
        day: this.dayValues,
        month: this.monthValues
      }
      const rangeMap = {
        minute: this.minuteRange,
        hour: this.hourRange,
        day: this.dayRange,
        month: this.monthRange
      }

      const type = typeMap[field]
      if (type === 'every') return '*'
      if (type === 'specify') {
        const vals = valuesMap[field]
        if (!vals || vals.length === 0) return '*'
        return [...vals].sort((a, b) => a - b).join(',')
      }
      if (type === 'range') {
        const range = rangeMap[field]
        return `${range[0]}-${range[1]}`
      }
      return '*'
    },

    // 构建周字段
    buildWeekday() {
      if (this.weekdayType === 'every') return '*'
      const vals = this.weekdayValues
      if (!vals || vals.length === 0) return '*'
      return [...vals].sort((a, b) => a - b).join(',')
    },

    // 描述时间（时+分）
    describeTime() {
      const hourDesc = this.describeField('hour', '时')
      const minuteDesc = this.describeField('minute', '分')

      // 简化：如果都是"每"，显示"每分钟"
      if (this.hourType === 'every' && this.minuteType === 'every') return '每分钟'
      if (this.hourType === 'every') return '每小时' + (minuteDesc !== '每小时' ? '的' + minuteDesc : '')

      // 有具体小时
      if (this.minuteType === 'every') {
        return hourDesc + '的每分钟'
      }
      if (this.minuteType === 'specify') {
        const mins = [...this.minuteValues].sort((a, b) => a - b)
          .map(m => String(m).padStart(2, '0'))
          .join(',')
        return hourDesc + ' ' + mins + '分'
      }
      if (this.minuteType === 'range') {
        return hourDesc + ' ' + String(this.minuteRange[0]).padStart(2, '0') + '~' + String(this.minuteRange[1]).padStart(2, '0') + '分'
      }
      return hourDesc
    },

    // 描述单个字段
    describeField(field, label) {
      const typeMap = {
        minute: this.minuteType,
        hour: this.hourType,
        day: this.dayType,
        month: this.monthType
      }
      const valuesMap = {
        minute: this.minuteValues,
        hour: this.hourValues,
        day: this.dayValues,
        month: this.monthValues
      }
      const rangeMap = {
        minute: this.minuteRange,
        hour: this.hourRange,
        day: this.dayRange,
        month: this.monthRange
      }

      const type = typeMap[field]
      if (type === 'every') {
        const everyLabel = { minute: '每分钟', hour: '每小时', day: '每日', month: '每月' }
        return everyLabel[field] || '每' + label
      }
      if (type === 'specify') {
        const vals = valuesMap[field]
        if (!vals || vals.length === 0) return '每' + label
        const suffix = label === '月' ? '月' : (label === '日' ? '日' : label)
        const unit = label === '时' ? '时' : suffix
        return vals.sort((a, b) => a - b).join('、') + unit
      }
      if (type === 'range') {
        const range = rangeMap[field]
        return range[0] + '~' + range[1] + label
      }
      return '每' + label
    },

    // 描述周字段
    describeWeekday() {
      if (this.weekdayType === 'every') return '每天'
      const vals = this.weekdayValues
      if (!vals || vals.length === 0) return '每天'
      return vals.sort((a, b) => a - b).map(i => WEEKDAY_LABELS[i]).join('、')
    },

    // 从 cron 表达式解析到内部状态
    parseCron(expr) {
      if (!expr) return
      this.parsing = true
      try {
        const parts = expr.trim().split(/\s+/)
        if (parts.length < 5) { this.parsing = false; return }

        const [minute, hour, day, month, weekday] = parts

        // 判断模式：weekday 不是 * 则按星期模式
        if (weekday !== '*') {
          this.mode = 'weekday'
          this.parseWeekday(weekday)
          // 日和月锁定为 *
          this.dayType = 'every'
          this.dayValues = []
          this.monthType = 'every'
          this.monthValues = []
        } else {
          this.mode = 'date'
          this.parseSingleField(day, 'day')
          this.parseSingleField(month, 'month')
          this.weekdayType = 'every'
          this.weekdayValues = []
        }

        this.parseSingleField(minute, 'minute')
        this.parseSingleField(hour, 'hour')
      } finally {
        this.parsing = false
      }
    },

    // 解析单个字段
    parseSingleField(value, field) {
      const stateKey = field + 'Type'
      const valuesKey = field + 'Values'
      const rangeKey = field + 'Range'

      if (value === '*') {
        this[stateKey] = 'every'
        this[valuesKey] = []
        return
      }

      if (value.includes(',')) {
        this[stateKey] = 'specify'
        this[valuesKey] = value.split(',').map(Number)
        return
      }

      if (value.includes('-')) {
        const [start, end] = value.split('-').map(Number)
        this[stateKey] = 'range'
        this[rangeKey] = [start, end]
        return
      }

      // 单个值，视为指定
      this[stateKey] = 'specify'
      this[valuesKey] = [Number(value)]
    },

    // 解析周字段
    parseWeekday(value) {
      if (value === '*') {
        this.weekdayType = 'every'
        this.weekdayValues = []
        return
      }
      this.weekdayType = 'specify'
      if (value.includes(',')) {
        this.weekdayValues = value.split(',').map(Number)
      } else {
        this.weekdayValues = [Number(value)]
      }
    }
  }
}
</script>

<style scoped>
.cron-picker {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
  background: #fafafa;
}

.cron-picker__mode {
  margin-bottom: 12px;
}

.cron-picker__fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cron-field {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cron-field__label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: #409eff;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.cron-field__type {
  width: 110px;
  flex-shrink: 0;
}

.cron-field__select {
  min-width: 200px;
}

.cron-field__range {
  display: flex;
  align-items: center;
  gap: 4px;
}

.cron-field__range .el-input-number {
  width: 90px;
}

.cron-field__sep {
  color: #909399;
  font-weight: bold;
}

.cron-picker__preview {
  margin-top: 10px;
  padding: 8px 12px;
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 4px;
  font-size: 13px;
  color: #409eff;
  line-height: 1.5;
}

.cron-picker__preview i {
  margin-right: 4px;
}

.cron-picker__expression {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}

.cron-picker__expression code {
  background: #f4f4f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: Consolas, Monaco, monospace;
}
</style>
