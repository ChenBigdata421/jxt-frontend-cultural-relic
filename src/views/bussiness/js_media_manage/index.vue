<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!--inline 属性被绑定为 true，这意味着该 <el-form> 组件将以内联形式呈现。
          内联表单通常用于在同一行上显示表单项，而不是像传统表单那样每个表单项都占据一行。
          这对于需要紧凑布局的表单来说非常有用，尤其是在需要显示多个表单项但空间有限的情况下。-->
        <el-form :inline="true">
          <el-form-item label="媒体类型">
            <el-select
              v-model="queryParams.media_cate"
              placeholder="媒体类型"
              clearable
              style="width: 170px"
            >
              <el-option
                v-for="dict in media_cate_options"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
                style="width: 150px"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="存储类型">
            <el-select
              v-model="queryParams.storage_type"
              placeholder="存储类型"
              clearable
              style="width: 170px"
            >
              <el-option
                v-for="dict in storage_type_options"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
                style="width: 150px"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="是否执法视频">
            <el-select
              v-model="queryParams.bool_enfor"
              placeholder="是否执法视频"
              clearable
              style="width: 170px"
            >
              <el-option
                v-for="dict in bool_enfor_options"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              class="filter-item"
              type="primary"
              icon="el-icon-search"
              size="mini"
              @click="handleQuery"
              >搜索</el-button
            >
          </el-form-item>
        </el-form>
        <!--orgList 是一个在组件中定义的数组，包含了表格要显示的数据。-->
        <!--row-key 是一个属性，用于指定表格行数据的唯一键。在这里，它指定了 id
          作为每行数据的唯一键。这有助于 Vue 跟踪每行数据的变化，提高渲染性能。-->
        <!--tree-props 是一个对象，用于指定树形表格的数据结构。
          children 字段指定了子节点的字段名，这里是 'children'。这意味着每个表格数据对象都可能有一个
           children 字段，该字段是一个数组，包含了该行的子行数据。
          hasChildren 字段指定了一个布尔字段名，用于表示该行是否有子节点。这里是 'hasChildren'。
          这意味着每个表格数据对象都可能有一个 hasChildren 字段，如果为 true，则表示该行有子节点。-->
        <el-table
          v-loading="loading"
          :data="js_media_list"
          row-key="id"
          default-expand-all
          border
        >
          <!--prop 属性是 <el-table-column> 中一个关键的属性，用于定义表格每一列应该显示数据对象中的哪个字段。-->
          <!--:formatter 是一个属性绑定（也称为“v-bind”或简写为冒号前缀的语法），它允许将一个方法或函数作为属性值传递给子组件，以便在特定情况下自定义数据的显示方式。-->
          <el-table-column prop="media_name" label="媒体名称" />
          <el-table-column
            prop="shot_time_start"
            label="拍摄开始时间"
            width="100"
          />
          <el-table-column prop="enfor_no" label="执法业务编号" width="100" />
          <el-table-column prop="enfor_type" label="执法类型" width="100" />
          <el-table-column prop="police_id" label="警员Id" width="100" />
          <el-table-column prop="storage_type" label="存储方式" width="120">
            <template slot-scope="{ row }">
              {{ selectDictLabel(storage_type_options, row.storage_type) }}
            </template>
          </el-table-column>
          <el-table-column prop="media_cate" label="媒体类型" width="120">
            <template slot-scope="{ row }">
              {{ selectDictLabel(media_cate_options, row.media_cate) }}
            </template>
          </el-table-column>
          <el-table-column prop="bool_enfor" label="是否是执法视频" width="140">
            <template slot-scope="{ row }">
              {{ selectDictLabel(bool_enfor_options, row.bool_enfor) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="organization_id"
            label="单位组织Id"
            width="100"
          />
          <el-table-column prop="site_no" label="采集站编号" width="100" />
          <el-table-column prop="record_id" label="执法仪ID" width="100" />
          <el-table-column prop="media_duration" label="视频时长" width="100" />
          <el-table-column prop="doc_size" label="文件大小" width="100" />
        </el-table>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { get_js_media_list } from "@/api/admin/js_media";

export default {
  data() {
    return {
      // 遮罩层
      loading: true,
      // 执法仪数据
      js_media_list: [],
      // 媒体类型数据字典
      media_cate_options: [],
      // 是否执法视频数据字典
      bool_enfor_options: [],
      // 存储方式数据字典
      storage_type_options: [],
      // 查询参数
      queryParams: {
        media_cate: undefined,
        bool_enfor: undefined,
        storage_type: undefined,
      },
    };
  },
  created() {
    this.getList();
    this.getDicts("media_type").then((response) => {
      this.media_cate_options = response.data;
    });
    this.getDicts("storage_type").then((response) => {
      this.storage_type_options = response.data;
    });
    this.getDicts("bool_enfor").then((response) => {
      this.bool_enfor_options = response.data;
    });
  },
  methods: {
    /** 查询组织列表 */
    getList() {
      this.loading = true;
      get_js_media_list(this.queryParams).then((response) => {
        // 注意：response.data是数组类型，数组的元素是对象，response.data数组只有一个元素，即只有一个对象，[{根组织的信息（其中孩子又是一个数组，包含若干个对象，即若干个子组织）}]
        this.js_media_list = response.data;
        this.loading = false;
      });
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
  },
};
</script>
