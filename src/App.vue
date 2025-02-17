<template>
  <div id="app">
    <!-- 当你导航到不同的路由时，Vue Router 将根据路由规则找到匹配的组件，
      并将其渲染到 <router-view></router-view> 所在的位置-->
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
<script>
// 声明: 百度统计统计相关下载使用量无别的用途
// 可自行删除
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?1d2d61263f13e4b288c8da19ad3ff56d";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();
</script>

