
<template>
  <!--ESLint 是一个广泛使用的 JavaScript 代码静态分析工具，用于检查和规范 JavaScript 代码的书写风格。-->
  <!--它禁用了 vue/require-component-is 规则，这个规则通常要求在使用 <component> 标签时
    提供一个 is 属性来明确要渲染的组件。但是，由于这里使用了 v-bind 来动态绑定属性，可能不需要
    明确指定 is 属性，因此禁用了这个规则。-->
  <!-- eslint-disable vue/require-component-is -->
  <component v-bind="linkProps(to)">
    <slot />
  </component>
</template>

<script>
import { isExternal } from '@/utils/validate'

export default {
  props: {
    to: {
      type: String,
      required: true
    }
  },
  methods: {
    linkProps(url) {
      if (isExternal(url)) {
        return {
          is: 'a',
          href: url,
          target: '_blank',
          rel: 'noopener'
        }
      }
      return {
        is: 'router-link',
        to: url
      }
    }
  }
}
</script>
