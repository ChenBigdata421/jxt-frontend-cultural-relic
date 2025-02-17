import { asyncRoutes, constantRoutes } from '@/router'
import { getRoutes } from '@/api/admin/sys-role'
import Layout from '@/layout'
// import sysuserindex from '@/views/sysuser/index'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Use names to determine if the current user has permission
 * @param names
 * @param route
 */
function hasPathPermission(paths, route) {
  if (route.path) {
    return paths.some(path => route.path === path.path)
  } else {
    return true
  }
}

/**
  * 后台查询的菜单数据拼装成路由格式的数据
  * @param routes
  */
export function generaMenu(routes, data) {
  data.forEach(item => {
    const menu = {
      path: item.path,
      component: item.component === 'Layout' ? Layout : loadView(item.component),
      hidden: item.visible !== '0',
      children: [],
      name: item.menuName,
      meta: {
        title: item.title,
        icon: item.icon,
        noCache: item.noCache
      }
    }
    if (item.children) {
      generaMenu(menu.children, item.children)
    }
    routes.push(menu)
  })
}
// @通常是一个在webpack配置中定义的别名，指向源代码的某个目录（例如src目录）。
// require是在运行时加载模块。这意味着当代码执行到require语句时，它才会去加载和执行模块的代码。
// import是在编译时加载模块。这是ES6（ECMAScript 2015）引入的新特性，它允许在代码被转换为可执行代码之前，就静态地分析模块依赖关系，并进行预加载。
export const loadView = (view) => { // 路由懒加载
  return (resolve) => require([`@/views${view}`], resolve)
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param components
 */
export function filterAsyncPathRoutes(routes, paths) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPathPermission(paths, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncPathRoutes(tmp.children, paths)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: [],
  defaultRoutes: [],
  topbarRouters: [],
  sidebarRouters: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  },
  SET_DEFAULT_ROUTES: (state, routes) => {
    state.defaultRoutes = constantRoutes.concat(routes)
  },
  SET_TOPBAR_ROUTES: (state, routes) => {
    // 顶部导航菜单默认添加统计报表栏指向首页
    // const index = [{
    //   path: 'dashboard',
    //   meta: { title: '统计报表', icon: 'dashboard' }
    // }]
    state.topbarRouters = routes // .concat(index)
  },
  SET_SIDEBAR_ROUTERS: (state, routes) => {
    state.sidebarRouters = routes
  }
}

const actions = {
  // 它会根据传入的角色信息来决定哪些路由是用户可以访问的。
  /* 总的来说，这行代码的作用是在用户登录并根据其角色动态生成相应的访问路由，
  这是实现基于角色的路由权限控制的关键步骤。通过这种方式，Vue 应用可以根据
  不同用户的角色展示不同的页面，增强了应用的安全性和用户体验。 但是从函数看，
  roles似乎没有起任何作用*/
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      const loadMenuData = []

      getRoutes().then(response => {
        // console.log(JSON.stringify(response))
        let data = response
        if (response.code !== 200) {
          this.$message({
            message: '菜单数据加载异常',
            type: 0
          })
        } else {
          data = response.data
          Object.assign(loadMenuData, data)
          generaMenu(asyncRoutes, loadMenuData)
          asyncRoutes.push({ path: '*', redirect: '/', hidden: true })
          commit('SET_ROUTES', asyncRoutes)
          const sidebarRoutes = []
          generaMenu(sidebarRoutes, loadMenuData)// 为何要多调用一次，有点冗余
          commit('SET_SIDEBAR_ROUTERS', constantRoutes.concat(sidebarRoutes))
          commit('SET_DEFAULT_ROUTES', sidebarRoutes)
          commit('SET_TOPBAR_ROUTES', sidebarRoutes)
          /* resolve(asyncRoutes) 被调用时，表示动态生成路由的异步操作已经完成。
          这里，asyncRoutes 包含了根据用户角色和后端返回的菜单数据动态生成的路由
          数组。通过调用 resolve(asyncRoutes)，generateRoutes 函数返回的
          Promise 对象的状态变为“已完成（fulfilled）”，并且 asyncRoutes 成为
          Promise 解决（resolve）时的值。这意味着在 generateRoutes 函数被调用的
          地方，可以通过 .then() 方法接收到 asyncRoutes，进而进行后续的操作，
          如添加这些路由到 Vue 路由器实例中。简而言之，resolve 在这里用于标记动
          态生成路由的异步操作已经完成，并提供生成的路由数组作为操作结果，以便进行
          后续处理。 */
          resolve(asyncRoutes)
        }
      }).catch(error => {
        console.log(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
