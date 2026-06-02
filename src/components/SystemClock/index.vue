<template>
  <div class="system-clock">
    <div class="clock-content">
      <span class="date-part">{{ dateStr }}</span>
      <span class="separator">|</span>
      <span class="time-part">{{ timeStr }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemClock',
  data() {
    return {
      timer: null,
      dateStr: '',
      timeStr: ''
    }
  },
  mounted() {
    this.updateClock()
    this.timer = setInterval(this.updateClock, 1000)
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },
  methods: {
    updateClock() {
      const now = new Date()
      this.dateStr = this.formatDate(now)
      this.timeStr = this.formatTime(now)
    },
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const weekDay = weekDays[date.getDay()]
      return `${year}-${month}-${day} ${weekDay}`
    },
    formatTime(date) {
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${hours}:${minutes}:${seconds}`
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/tokens/index.scss";

.system-clock {
  display: inline-flex;
  align-items: center;
  padding: 0 $spacing-3;

  .clock-content {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    font-size: 13px;
    font-weight: $font-weight-medium;
    color: #725A45; // 与铃铛颜色保持一致
    white-space: nowrap;

    .date-part {
      color: #725A45;
    }

    .separator {
      color: #725A45;
      opacity: 0.5;
      margin: 0 $spacing-1;
    }

    .time-part {
      color: #725A45;
      font-family: 'Consolas', 'Monaco', monospace; // 使用等宽字体显示时间
      font-weight: $font-weight-semibold;
    }
  }
}
</style>
