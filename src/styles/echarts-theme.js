/**
 * JXT ECharts 主题配置
 * 基于司法蓝配色方案，统一图表视觉风格
 */
const jxtTheme = {
  color: [
    '#1A5F7A', // 司法蓝
    '#2E7D32', // 深绿
    '#F57C00', // 深橙
    '#0277BD', // 深蓝
    '#7B1FA2', // 紫色
    '#C62828', // 深红
    '#00897B', // 青色
    '#5D4037', // 棕色
    '#1565C0', // 蓝
    '#FF8F00'  // 琥珀
  ],
  backgroundColor: 'transparent',
  textStyle: {
    color: '#616161',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif'
  },
  title: {
    textStyle: {
      color: '#212121',
      fontWeight: 600,
      fontSize: 16
    },
    subtextStyle: {
      color: '#757575',
      fontSize: 12
    }
  },
  tooltip: {
    backgroundColor: 'rgba(33, 33, 33, 0.9)',
    borderColor: 'transparent',
    textStyle: {
      color: '#fff',
      fontSize: 13
    },
    padding: [8, 12]
  },
  legend: {
    textStyle: {
      color: '#616161',
      fontSize: 12
    }
  },
  categoryAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: '#E0E0E0'
      }
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      color: '#757575',
      fontSize: 12
    },
    splitLine: {
      show: false
    }
  },
  valueAxis: {
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      color: '#757575',
      fontSize: 12
    },
    splitLine: {
      lineStyle: {
        color: '#ECEFF1',
        type: 'dashed'
      }
    }
  },
  line: {
    itemStyle: {
      borderWidth: 2
    },
    lineStyle: {
      width: 2
    },
    symbolSize: 6,
    symbol: 'circle',
    smooth: false
  },
  bar: {
    itemStyle: {
      barBorderWidth: 0,
      barBorderColor: '#E0E0E0'
    }
  },
  pie: {
    itemStyle: {
      borderColor: '#fff',
      borderWidth: 2
    }
  }
}

export default jxtTheme
