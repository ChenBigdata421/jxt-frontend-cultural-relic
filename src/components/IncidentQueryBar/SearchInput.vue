<template>
  <div class="search-input-wrapper">
    <el-input
      v-model="searchText"
      placeholder="请输入警情编号/标题/报警人"
      prefix-icon="el-icon-search"
      clearable
      @keyup.enter.native="handleSearch"
      class="search-input"
    >
      <el-button
        slot="append"
        icon="el-icon-search"
        @click="handleSearch"
      >
        搜索
      </el-button>
    </el-input>
  </div>
</template>

<script>
export default {
  name: 'SearchInput',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      searchText: this.value
    };
  },
  watch: {
    value(newVal) {
      this.searchText = newVal;
    },
    searchText(newVal) {
      this.$emit('input', newVal);
    }
  },
  methods: {
    handleSearch() {
      this.$emit('search', this.searchText);
    }
  }
};
</script>

<style lang="scss" scoped>
@import '@/styles/tokens/index.scss';

.search-input-wrapper {
  width: 100%;
  max-width: 500px;

  .search-input {
    /deep/ .el-input__inner {
      height: 36px;
      line-height: 36px;
    }

    /deep/ .el-input-group__append {
      background-color: $law-primary;
      color: $law-primary-contrast;
      border-color: $law-primary;

      .el-button {
        background-color: transparent;
        border: none;
        color: inherit;
      }
    }
  }
}
</style>
