/**
 * JXT ECharts 主题配置
 * 基于朱砂褐配色方案，统一图表视觉风格
 */
const jxtTheme = {
  color: [
    '#725A45', // 朱砂褐（主色）
    '#2E7D32', // 深绿（成功色）
    '#E67E22', // 深橙（警告色）
    '#2980B9', // 深蓝（信息色）
    '#7B1FA2', // 紫色
    '#C0392B', // 深红（危险色）
    '#00897B', // 青色
    '#8D6E63', // 棕色
    '#1565C0', // 深蓝
    '#DAA520'  // 品牌金
  ],
  backgroundColor: 'transparent',
  textStyle: {
    color: '#5A5C5F',
    fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", Arial, sans-serif'
  },
  title: {
    textStyle: {
      color: '#1A1B1C',
      fontWeight: 600,
      fontSize: 16
    },
    subtextStyle: {
      color: '#5A5C5F',
      fontSize: 12
    }
  },
  tooltip: {
    backgroundColor: 'rgba(51, 39, 29, 0.9)',
    borderColor: 'transparent',
    textStyle: {
      color: '#fff',
      fontSize: 13
    },
    padding: [8, 12]
  },
  legend: {
    textStyle: {
      color: '#5A5C5F',
      fontSize: 13
    }
  },
  categoryAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: '#B8BABC'
      }
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      color: '#737679',
      fontSize: 13
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
      color: '#737679',
      fontSize: 13
    },
    splitLine: {
      lineStyle: {
        color: '#F4F5F7',
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
      barBorderColor: '#B8BABC'
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
