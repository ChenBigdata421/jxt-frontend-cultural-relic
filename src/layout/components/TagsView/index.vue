<template>
  <!--<el-tabs> 是 Element UI 中的一个组件，用于创建标签页。-->
  <!--v-model 是 Vue.js 的一个指令，用于在 input、textarea 元素和组件上创建双向数据绑定。-->
  <!--v-model 绑定到 editableTabsValue，这意味着 editableTabsValue 将保存当前激活的标签页的 name 或 label。-->
  <!--这是一个事件监听器。当标签页被移除时，tab-remove 事件会被触发，并调用 closeSelectedTag 方法。-->
  <div id="tags-view-container" class="tags-view-container">
    <el-tabs
      v-model="editableTabsValue"
      type="card"
      @tab-remove="closeSelectedTag"
    >
      <el-tab-pane
        v-for="item in visitedViews"
        :key="item.path"
        :closable="item.fullPath === '/dashboard' ? false : true"
        :name="item.fullPath"
      >
        <!--@contextmenu.prevent.native="openMenu(item,$event)": 这是一个事件监听器，用于监听原生的
        contextmenu 事件（通常是右键点击）。.prevent 修饰符会调用 event.preventDefault()，而 .native
        修饰符表示这个监听器会直接添加到原生元素上，而不是组件根元素上。当这个事件被触发时，openMenu 方法
        会被调用，并传入 item 和事件对象 $event。-->
        <router-link
          ref="tag"
          slot="label"
          tag="span"
          class="tags-view-item"
          :style="{ color: item.fullPath === $route.fullPath ? theme : '' }"
          :to="{ path: item.path, query: item.query, fullPath: item.fullPath }"
          @contextmenu.prevent.native="openMenu(item,$event)"
        >
          {{ item.title }}
        </router-link>
      </el-tab-pane>
    </el-tabs>
    <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
      <li class="tags-item" @click="refreshSelectedTag(selectedTag)" @mouseover="handleTagsOver(1)" @mouseleave="handleTagsLeave(1)">刷新当前标签页</li>
      <li v-if="!isAffix(selectedTag)" class="tags-item" @click="closeSelectedTag(selectedTag)" @mouseover="handleTagsOver(2)" @mouseleave="handleTagsLeave(2)">关闭当前标签页</li>
      <li class="tags-item" @click="closeOthersTags" @mouseover="handleTagsOver(3)" @mouseleave="handleTagsLeave(3)">关闭其他标签页</li>
      <li class="tags-item" @click="closeAllTags(selectedTag)" @mouseover="handleTagsOver(4)" @mouseleave="handleTagsLeave(4)">关闭全部标签页</li>
    </ul>
  </div>
</template>

<script>
import path from 'path'

export default {
  data() {
    return {
      editableTabsValue: '/',
      top: 0,
      left: 0,
      selectedTag: {},
      affixTags: [],
      visible: false
    }
  },
  computed: {
    visitedViews() {
      return this.$store.state.tagsView.visitedViews
    },
    routes() {
      return this.$store.state.permission.routes
    },
    theme() {
      return this.$store.state.settings.theme
    }
  },
  watch: {
    $route() {
      this.addTags()
    },
    visible(value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    }
  },
  mounted() {
    this.initTags()
    this.addTags()
    this.isActive()
    this.beforeUnload()
  },
  methods: {
    // 刷新前缓存tab
    beforeUnload() {
      // 监听页面刷新
      /* beforeunload 事件并不是 JavaScript 语言本身特有的，而是浏览器环境提供的一个事件。具体来说，
      它是 Web API 的一部分，特别是与窗口和文档对象模型（DOM）相关的事件。这个事件在各种 Web 浏览器中
      都得到了支持，以便开发者可以在用户尝试卸载（离开）当前页面时执行一些操作。 */
      window.addEventListener('beforeunload', () => {
        const tabViews = this.visitedViews.map(item => {
          return {
            fullPath: item.fullPath,
            hash: item.hash,
            meta: { ...item.meta },
            name: item.name,
            params: { ...item.params },
            path: item.path,
            query: { ...item.query },
            title: item.title
          }
        })
        // sessionStorage 是 JavaScript 的内置对象，提供了在浏览器会话中存储键值对的方法。
        /* JSON.stringify(tabViews)代码将 tabViews 对象转换（序列化）为其 JSON 字符串表示形式。
        JSON.stringify() 是一个 JavaScript 内置方法，用于将一个 JavaScript 值（对象或数组）转换为一个
        JSON 字符串。这样做是因为 sessionStorage 只能存储字符串。所以，如果你想要存储一个对象或数组，
        你需要先将其转换为字符串。 */
        sessionStorage.setItem('tabViews', JSON.stringify(tabViews))
      })
      // 页面初始化加载判断缓存中是否有数据
      const oldViews = JSON.parse(sessionStorage.getItem('tabViews')) || []
      if (oldViews.length > 0) {
        this.$store.state.tagsView.visitedViews = oldViews
      }
    },
    handleTagsOver(index) {
      const tags = document.querySelectorAll('.tags-item')
      const item = tags[index - 1]
      item.style.cssText = `color:${this.$store.state.settings.theme};background:${
        this.$store.state.settings.theme.colorRgb()
      }`
    },
    handleTagsLeave(index) {
      const tags = document.querySelectorAll('.tags-item')
      const item = tags[index - 1]
      item.style.cssText = `color:#606266`
    },
    isActive() {
      const index = this.visitedViews.findIndex(item => item.fullPath === this.$route.fullPath)
      const pathIndex = index > -1 ? index : 0
      this.editableTabsValue = this.visitedViews[pathIndex].fullPath
    },
    isAffix(tag) {
      return tag.meta && tag.meta.affix
    },
    /* 在 Vue 项目中，路由对象的 meta 属性用于存储关于该路由的额外信息。在你提供的代码片段中，meta 对象
    包含了 title、icon 和 affix 三个字段。这里的 affix 字段用于指示该路由是否应该被“固定”在标签页或
    导航栏中，通常用于重要页面，如首页或仪表盘，确保用户总是能够快速访问这些页面。
    具体来说，affix: true 的作用包括：
    固定标签：在基于标签页的界面中，affix: true 可以使得对应的路由始终被固定在标签栏中，不允许用户关闭。
    这对于一些核心页面（如首页）非常有用，因为这些页面通常需要随时可访问。
    防止关闭：用户在使用应用时可能会打开多个标签页，affix: true 确保了重要的页面（如“首页”）不能被误关闭，
    从而提高用户体验。
    快速访问：固定的标签页或导航项可以让用户更快地访问到这些重要的页面，无需在菜单中寻找。
    在实现上，你可能需要在导航栏或标签页组件中特别处理 affix 属性为 true 的路由，确保它们按预期被固定展示。
    例如，在渲染导航菜单或标签页时，检查路由的 meta.affix 字段，如果为 true，则相应地调整 UI 表现，
    如不显示关闭按钮或以特殊样式展示。 */
    filterAffixTags(routes, basePath = '/') {
      let tags = []
      routes.forEach(route => {
        if (route.meta && route.meta.affix) {
          const tagPath = path.resolve(basePath, route.path)
          tags.push({
            fullPath: tagPath,
            path: tagPath,
            name: route.name,
            meta: { ...route.meta }
          })
        }
        if (route.children) {
          const tempTags = this.filterAffixTags(route.children, route.path)
          if (tempTags.length >= 1) {
            tags = [...tags, ...tempTags]// 代码使用了扩展运算符... 来合并两个数组 tags 和 tempTags，并将结果重新赋值给 tags 变量。
          }
        }
      })
      return tags
    },
    initTags() {
      const affixTags = this.affixTags = this.filterAffixTags(this.routes)
      for (const tag of affixTags) {
        // Must have tag name
        if (tag.name) { // 该项目中，也只有“首页”需要被固定
          this.$store.dispatch('tagsView/addVisitedView', tag)
        }
      }
    },
    addTags() {
      const { name } = this.$route
      if (name) {
        this.$store.dispatch('tagsView/addView', this.$route)
        this.isActive()
      }
      return false
    },
    moveToCurrentTag() {
      const tags = this.$refs.tag
      this.$nextTick(() => {
        for (const tag of tags) {
          if (tag.to.path === this.$route.path) {
            // this.$refs.scrollPane.moveToTarget(tag)
            // when query is different then update
            if (tag.to.fullPath !== this.$route.fullPath) {
              this.$store.dispatch('tagsView/updateVisitedView', this.$route)
            }
            break
          }
        }
      })
    },
    refreshSelectedTag(view) {
      this.$store.dispatch('tagsView/delCachedView', view).then(() => {
        const { fullPath } = view
        this.$nextTick(() => {
          this.$router.replace({
            path: '/redirect' + fullPath
          })
        })
      })
    },
    closeSelectedTag(view) {
      const routerPath = view.fullPath ? view.fullPath : view
      const index = this.visitedViews.findIndex(item => item.fullPath === routerPath)
      if (index > -1) {
        const path = this.visitedViews[index]
        this.$store.dispatch('tagsView/delView', path).then(({ visitedViews }) => {
          if (this.editableTabsValue === path.fullPath) {
            this.toLastView(visitedViews, path)// 如果被删掉的tag就是当前激活的tag，那么最后一个tag将作为激活tag
          }
        })
      }
    },
    closeOthersTags() {
      this.$router.push(this.selectedTag.path).catch(e => e)
      this.$store.dispatch('tagsView/delOthersViews', this.selectedTag).then(() => {
        this.moveToCurrentTag()
      })
    },
    closeAllTags(view) {
      this.$store.dispatch('tagsView/delAllViews').then(({ visitedViews }) => {
        if (this.affixTags.some(tag => tag.path === view.path)) {
          return
        }
        this.toLastView(visitedViews, view)
      })
    },
    // slice() 是 JavaScript 数组的一个方法，用于提取数组的一部分并返回一个新的数组。
    // -1 作为 slice() 方法的参数意味着从数组的最后一个元素开始提取。
    // slice(-1) 实际上会返回一个只包含最后一个元素的新数组。
    // 这段代码的作用是获取 visitedViews 数组中的最后一个元素，并将其存储在 latestView 变量中。
    toLastView(visitedViews, view) {
      const latestView = visitedViews.slice(-1)[0]
      if (latestView) {
        this.$router.push(latestView.fullPath).catch(err => err)
      } else {
        // now the default is to redirect to the home page if there is no tags-view,
        // you can adjust it according to your needs.
        if (view.name === 'Dashboard') {
          // to reload home page
          this.$router.replace({ path: '/redirect' + view.fullPath })
        } else {
          this.$router.push('/')
        }
      }
    },
    openMenu(tag, e) {
      const menuMinWidth = 105
      const offsetLeft = this.$el.getBoundingClientRect().left // container margin left
      const offsetWidth = this.$el.offsetWidth // container width
      const maxLeft = offsetWidth - menuMinWidth // left boundary
      const left = e.clientX - offsetLeft + 15 // 15: margin right

      if (left > maxLeft) {
        this.left = maxLeft
      } else {
        this.left = left
      }

      this.top = e.clientY
      this.visible = true
      this.selectedTag = tag
    },
    closeMenu() {
      this.visible = false
    },
    /**
     * 处理下拉菜单命令
     * @param {string} command - 命令类型 (closeAll)
     */
    handleCommand(command) {
      if (command === 'closeAll') {
        this.closeAllTags(this.selectedTag)
      }
    }
  }
}

// eslint-disable-next-line no-extend-native
String.prototype.colorRgb = function() {
  let sColor = this.toLowerCase()
  const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      let sColorNew = '#'
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
      }
      sColor = sColorNew
    }
    const sColorChange = []
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)))
    }
    return 'rgba(' + sColorChange.join(',') + ',0.2)'
  } else {
    return sColor
  }
}
</script>

<style lang="scss" scoped>
.tags-view-container ::v-deep{
  height: 43px;
  width: 100%;
  background: #fff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
  padding: 0 15px;
  box-sizing: border-box;
  .el-tabs__item{
    &:hover{
      color: #000;
    }
  }
  .tags-view-item{
    height: 40px;
    display: inline-block;
  }
  .tags-view-wrapper {
    .tags-view-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      border: 1px solid #d8dce5;
      color: #495060;
      background: #fff;
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;
      &:first-of-type {
        margin-left: 15px;
      }
      &:last-of-type {
        margin-right: 15px;
      }
      &.active {
        background-color: #42b983;
        color: #fff;
        border-color: #42b983;
        &::before {
          content: '';
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        }
      }
    }
  }
  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 1px 2px 10px #ccc;
    -moz-user-select:none;
    -webkit-user-select:none;
    user-select:none;
    li {
      list-style: none;
      line-height: 36px;
      padding: 2px 20px;
      margin: 0;
      font-size: 14px;
      color: #606266;
      cursor: pointer;
      outline: 0;
      cursor: pointer;
      &:hover {
        background: #eee;
      }
    }
  }
}
</style>

<style lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      width: 16px;
      height: 16px;
      vertical-align: 2px;
      border-radius: 50%;
      text-align: center;
      transition: all .3s cubic-bezier(.645, .045, .355, 1);
      transform-origin: 100% 50%;
      &:before {
        transform: scale(.6);
        display: inline-block;
        vertical-align: -3px;
      }
      &:hover {
        background-color: #b4bccc;
        color: #fff;
      }
    }
  }
}
</style>
