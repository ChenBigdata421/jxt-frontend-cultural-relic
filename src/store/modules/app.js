import Cookies from 'js-cookie'
/* !!这种操作常用于将变量或表达式的结果转换为明确的布尔值，为后续的判断或逻辑操作提供便利。
例如，当有一个变量a，其默认值为undefined时，!a的结果是true，因为undefined在布尔上下文中被视为false，
取反后得到true,而!!a则是false，这就将undefined明确转换为false。再如空字符串‘’，被视为false，通过使用!!运算符，
可将空字符串明确转换为布尔值false。
所以，通过使用!!运算符，我们可以将非布尔值明确地转换为布尔值。
在JavaScript中，一元加号运算符 + 尝试将其后的操作数转换为一个数字。如果操作数是一个可以被解析为数字的
字符串（比如 "123" 或 "-45.6"），那么 + 运算符会返回相应的数字值。如果字符串不能被解析为一个数字
（比如 "abc" 或 "true"），那么结果会是 NaN（表示“不是一个数字”）
如果 'sidebarStatus' 这个cookie不存在，Cookies.get('sidebarStatus') 通常会返回 undefined。
在这种情况下，+undefined 的结果是 NaN
如果Cookies.get('sidebarStatus')为undefined，则视为false，所以三元式的取值为冒号后的true
如果Cookies.get('sidebarStatus')为字符串‘0’,则视为true，所以三元式的取值为冒号前的false，‘0‘先转为数字0，两次取反后为false*/
const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false
  },
  device: 'desktop',
  size: Cookies.get('size') || 'medium'
}

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
    } else {
      Cookies.set('sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  SET_SIZE: (state, size) => {
    state.size = size
    Cookies.set('size', size)
  }
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  setSize({ commit }, size) {
    commit('SET_SIZE', size)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
