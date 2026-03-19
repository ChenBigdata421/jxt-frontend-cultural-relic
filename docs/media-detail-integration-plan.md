# TaskProcessDialog 集成 MediaDetailDialog 方案

## 一、需求分析

在 `TaskProcessDialog.vue` 的审批处理界面中，用户需要能够点击媒体名称查看媒体详情。

### 相关文件
- `src/components/TaskProcessDialog.vue` - 审批对话框组件
- `src/components/MediaDetailDialog/index.vue` - 媒体详情对话框组件（已实现字典数据自治）
- `src/mixins/workflowMixin.js` - 工作流混入，包含任务数据结构
- `src/api/evidence/evidence_manage_query_api.js` - 媒体查询 API

## 二、数据结构分析

### 1. TaskProcessDialog 数据结构

```javascript
processForm: {
  taskData: {},              // 当前任务数据
  previousTasksHistory: [    // 历史审批记录
    {
      output: {              // 提交的数据
        mediaName: 'xxx',    // 媒体名称（用户可见）
        // 注意：mediaId 不会暴露给用户，只用于内部实现
        // ... 其他字段
      }
    }
  ]
}
```

### 2. 可用的媒体查询 API

```javascript
// 根据媒体名称获取媒体详情
GetMediaByName(mediaName)  // 返回完整媒体数据（包含 mediaId 等所有字段）

// 获取媒体播放地址
getMediaPlayURL(mediaId)
```

**重要说明**：
- `mediaId` 是内部实现字段，不会暴露给用户
- `mediaName` 是用户可见的媒体名称
- 通过 `GetMediaByName` API 可以根据媒体名称获取完整的媒体数据

## 三、实现方案

### 3.1 在 TaskProcessDialog.vue 中集成 MediaDetailDialog

#### 3.1.1 导入组件和 API

```javascript
import MediaDetailDialog from "@/components/MediaDetailDialog";
import { GetMediaByName } from "@/api/evidence/evidence_manage_query_api";
```

#### 3.1.2 注册组件

```javascript
components: {
  Treeselect,
  MediaDetailDialog,
},
```

#### 3.1.3 添加 data 数据

```javascript
data() {
  return {
    // ... 现有数据
    mediaDetailDialogVisible: false,  // 媒体详情对话框显示状态
    currentMediaData: {},            // 当前查看的媒体数据
  };
},
```

#### 3.1.4 添加 methods 方法

```javascript
methods: {
  /**
   * 处理媒体名称点击事件
   * @param {String} mediaName - 媒体名称
   */
  async handleMediaNameClick(mediaName) {
    if (!mediaName) {
      this.$message.warning('媒体名称不存在');
      return;
    }

    try {
      // 根据媒体名称获取完整媒体数据
      const response = await GetMediaByName(mediaName);

      if (response.code === 200 && response.data) {
        this.currentMediaData = response.data;
        this.mediaDetailDialogVisible = true;
      } else {
        this.$message.warning(response.msg || '获取媒体详情失败');
      }
    } catch (error) {
      console.error('获取媒体详情失败:', error);
      this.$message.error('获取媒体详情失败');
    }
  },

  /**
   * 关闭媒体详情对话框
   */
  handleMediaDetailClose() {
    this.mediaDetailDialogVisible = false;
    this.currentMediaData = {};
  },

  /**
   * 判断是否为媒体名称字段
   */
  isMediaNameField(key) {
    return key === 'mediaName' || key === 'media_name';
  },
}
```

### 3.2 修改模板 - 使媒体名称可点击

#### 3.2.1 修改流程历史中的媒体名称显示

在 `el-descriptions-item` 中，当检测到媒体名称字段时，显示为可点击的链接：

```vue
<!-- 第 117-131 行，修改 history.output 的显示逻辑 -->
<el-descriptions
  :column="2"
  border
  size="small"
>
  <el-descriptions-item
    v-for="(value, key) in history.output"
    :key="key"
    :label="getFieldLabel(key)"
  >
    <!-- 媒体名称字段：显示为可点击链接 -->
    <template v-if="isMediaNameField(key)">
      <el-button
        type="text"
        @click="handleMediaNameClick(value)"
      >
        {{ value || '-' }}
      </el-button>
    </template>

    <!-- 布尔类型字段 -->
    <template v-else-if="typeof value === 'boolean'">
      <el-tag v-if="value" type="success">是</el-tag>
      <el-tag v-else type="info">否</el-tag>
    </template>

    <!-- 默认文本显示 -->
    <template v-else>
      {{ value }}
    </template>
  </el-descriptions-item>
</el-descriptions>
```

#### 3.2.2 修改当前任务数据中的媒体显示

如果当前任务数据中也有媒体名称字段，可以使用相同逻辑。

### 3.3 添加 MediaDetailDialog 组件

在模板的 `<el-dialog>` 后面添加：

```vue
<!-- 媒体详情对话框 -->
<MediaDetailDialog
  :visible.sync="mediaDetailDialogVisible"
  :media-data="currentMediaData"
  @close="handleMediaDetailClose"
/>
```

**说明**：由于 MediaDetailDialog 已实现字典数据自治，父组件只需传递 `visible` 和 `media-data` 两个属性。

## 四、方案说明

### 4.1 优点

1. **最小侵入性** - 只需修改 TaskProcessDialog.vue，不影响其他组件
2. **复用现有组件** - 使用已创建的 MediaDetailDialog 组件（已实现字典自治）
3. **用户友好** - 直接通过媒体名称点击查看，无需关心内部 ID
4. **数据安全** - mediaId 不暴露给用户，保持内部实现细节
5. **低耦合** - MediaDetailDialog 自己管理字典数据，父组件无需传递

### 4.2 注意事项

1. **API 依赖** - 依赖 `GetMediaByName` API 根据媒体名称获取完整媒体数据
2. **媒体名称唯一性** - 确保 mediaName 在系统中是唯一的，否则可能获取到错误的媒体
3. **异常处理** - 需要处理媒体不存在或无权限访问的情况

### 4.3 后续优化建议

1. 如果需要支持多个媒体，可以扩展为媒体列表
2. 可以添加媒体缩略图预览功能
3. 可以考虑在对话框中显示媒体的基本信息（无需点击）

## 五、实施步骤

1. ✅ 分析现有代码结构和数据流
2. ✅ 确认 MediaDetailDialog 已实现字典数据自治
3. ⬜ 在 TaskProcessDialog.vue 中导入并注册 MediaDetailDialog 组件
4. ⬜ 添加相关的 data 数据和 methods 方法
5. ⬜ 修改模板，使媒体名称可点击
6. ⬜ 添加 MediaDetailDialog 组件到模板
7. ⬜ 测试功能是否正常工作

## 六、代码修改清单

### 6.1 TaskProcessDialog.vue 修改点

| 位置 | 修改内容 |
|------|----------|
| `<script>` 顶部 | 添加导入：`import MediaDetailDialog from "@/components/MediaDetailDialog";` |
| `<script>` 顶部 | 添加导入：`import { GetMediaByName } from "@/api/evidence/evidence_manage_query_api";` |
| `components` | 注册组件：`MediaDetailDialog` |
| `data()` | 添加：`mediaDetailDialogVisible: false, currentMediaData: {}` |
| `methods` | 添加：`handleMediaNameClick`, `handleMediaDetailClose`, `isMediaNameField` |
| 模板 | 修改 `el-descriptions-item` 中 mediaName 字段的显示逻辑 |
| 模板末尾 | 添加 `<MediaDetailDialog>` 组件 |

### 6.2 使用示例

```vue
<!-- 在流程历史中显示可点击的媒体名称 -->
<el-descriptions-item :label="getFieldLabel('mediaName')">
  <el-button type="text" @click="handleMediaNameClick(mediaName)">
    {{ mediaName }}
  </el-button>
</el-descriptions-item>
```
