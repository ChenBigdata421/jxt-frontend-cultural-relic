# 视频播放功能演示文档

## 📺 功能演示

### 界面预览

```
┌─────────────────────────────────────────────────────────────┐
│  视频播放                                          [×]       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 播放地址: [http://example.com/video.mp4    ] [播放] │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │                    🎥                                   │  │
│  │                                                         │  │
│  │          请输入视频URL并点击播放按钮                    │  │
│  │                                                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                    [关 闭]                   │
└─────────────────────────────────────────────────────────────┘
```

### 播放中界面

```
┌─────────────────────────────────────────────────────────────┐
│  视频播放                                          [×]       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 播放地址: [http://example.com/video.mp4    ] [播放] │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │                  [视频播放中...]                        │  │
│  │                                                         │  │
│  │  ▶ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │  │
│  │  00:30 / 05:00                              🔊 [  ]  ⛶ │  │
│  │                                                         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 播放地址: http://example.com/video.mp4                │  │
│  │ 播放状态: [播放中]                                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                          [停止播放]  [关 闭]                │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 操作流程

### 步骤1: 打开播放对话框

在媒体管理页面的操作栏中：

```
┌──────────────────────────────────────────────────────────┐
│ 媒体名称          │ 类型  │ 大小   │ 操作                │
├──────────────────────────────────────────────────────────┤
│ 执法视频_001.mp4  │ 视频  │ 50MB   │ [一键归档] [浏览]  │
│                   │       │        │ [播放] [复制地址]   │
│                   │       │        │ [删除] [视频轨迹]   │
└──────────────────────────────────────────────────────────┘
                                        ↑
                                    点击这里
```

### 步骤2: 输入视频URL

```
播放地址: [http://localhost:8080/videos/sample.mp4    ] [播放]
          ↑
      在这里输入URL
```

### 步骤3: 点击播放

```
播放地址: [http://localhost:8080/videos/sample.mp4    ] [播放]
                                                          ↑
                                                      点击这里
```

### 步骤4: 观看视频

视频开始播放，可以使用以下控制：

- **播放/暂停**: 点击视频或播放按钮
- **音量**: 调节音量滑块
- **进度**: 拖动进度条
- **全屏**: 点击全屏按钮

## 💻 代码实现

### 1. 组件集成 (index.vue)

```vue
<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <!-- 媒体选择器 -->
        <MediaSelector
          @operation="handleOperation"
        />
        
        <!-- 视频播放对话框 -->
        <VideoPlayerDialog
          :visible.sync="videoPlayerVisible"
          :initial-url="currentVideoUrl"
          @close="handleVideoPlayerClose"
        />
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import VideoPlayerDialog from "@/components/VideoPlayerDialog";

export default {
  components: {
    VideoPlayerDialog
  },
  data() {
    return {
      videoPlayerVisible: false,
      currentVideoUrl: ""
    }
  },
  methods: {
    handleOperation(row, action) {
      if (action === "play") {
        this.handlePlayVideo(row);
      }
    },
    
    handlePlayVideo(row) {
      // 设置视频URL（可以从row中获取）
      this.currentVideoUrl = "";
      this.videoPlayerVisible = true;
    },
    
    handleVideoPlayerClose() {
      this.currentVideoUrl = "";
    }
  }
}
</script>
```

### 2. 播放器组件 (VideoPlayerDialog/index.vue)

```vue
<template>
  <el-dialog
    title="视频播放"
    :visible.sync="dialogVisible"
    width="900px"
  >
    <!-- URL输入 -->
    <el-input v-model="videoUrl">
      <el-button slot="append" @click="handlePlay">
        播放
      </el-button>
    </el-input>
    
    <!-- 视频播放器 -->
    <video
      ref="videoPlayer"
      controls
      width="100%"
      height="500"
    />
    
    <!-- 播放信息 -->
    <el-descriptions>
      <el-descriptions-item label="播放地址">
        {{ videoUrl }}
      </el-descriptions-item>
      <el-descriptions-item label="播放状态">
        {{ playerStateText }}
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script>
export default {
  methods: {
    handlePlay() {
      // 验证URL
      if (!this.isValidUrl(this.videoUrl)) {
        this.$message.error('请输入有效的HTTP URL');
        return;
      }
      
      // 初始化播放器
      this.initPlayer();
    },
    
    initPlayer() {
      const videoElement = this.$refs.videoPlayer;
      videoElement.src = this.videoUrl;
      
      // 监听事件
      videoElement.addEventListener('playing', () => {
        this.playerState = 'playing';
      });
      
      // 开始播放
      videoElement.play();
    }
  }
}
</script>
```

## 🧪 测试场景

### 场景1: 播放本地视频

```javascript
// 输入URL
http://localhost:8080/videos/sample.mp4

// 预期结果
✅ 视频正常播放
✅ 控制条可用
✅ 状态显示"播放中"
```

### 场景2: 播放远程视频

```javascript
// 输入URL
http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4

// 预期结果
✅ 视频正常加载
✅ 显示加载进度
✅ 播放流畅
```

### 场景3: 无效URL

```javascript
// 输入URL
invalid-url

// 预期结果
❌ 显示错误提示: "请输入有效的HTTP URL"
❌ 不会初始化播放器
```

### 场景4: 网络错误

```javascript
// 输入URL
http://nonexistent-domain.com/video.mp4

// 预期结果
❌ 显示错误提示: "网络错误，无法加载视频"
❌ 状态显示"播放错误"
```

### 场景5: 不支持的格式

```javascript
// 输入URL
http://example.com/video.avi

// 预期结果
❌ 显示错误提示: "不支持的视频格式或URL无效"
❌ 状态显示"播放错误"
```

## 📊 状态流转

```
[未播放] 
   ↓ (点击播放)
[加载中] 
   ↓ (加载成功)
[播放中] 
   ↓ (点击暂停)
[已暂停] 
   ↓ (点击播放)
[播放中] 
   ↓ (播放结束)
[已停止]

[任意状态] 
   ↓ (发生错误)
[播放错误]
```

## 🎨 UI元素说明

### 1. URL输入框

```vue
<el-input
  v-model="videoUrl"
  placeholder="请输入视频文件的HTTP URL"
  style="width: 500px"
  clearable
>
  <el-button slot="append" icon="el-icon-video-play" @click="handlePlay">
    播放
  </el-button>
</el-input>
```

**特点**:
- 宽度500px
- 带清空按钮
- 右侧附加播放按钮
- 播放图标

### 2. 占位符

```vue
<div class="video-placeholder">
  <i class="el-icon-video-camera placeholder-icon"></i>
  <p class="placeholder-text">请输入视频URL并点击播放按钮</p>
</div>
```

**特点**:
- 渐变背景（紫色系）
- 大图标（80px）
- 提示文字
- 居中显示

### 3. 视频播放器

```vue
<video
  ref="videoPlayer"
  class="custom-video-player"
  controls
  preload="auto"
  width="100%"
  height="500"
  controlslist="nodownload"
>
```

**特点**:
- 全宽显示
- 固定高度500px
- 显示控制条
- 自动预加载
- 禁用下载按钮

### 4. 播放信息

```vue
<el-descriptions :column="2" border size="small">
  <el-descriptions-item label="播放地址">
    {{ videoUrl }}
  </el-descriptions-item>
  <el-descriptions-item label="播放状态">
    <el-tag :type="playerState === 'playing' ? 'success' : 'info'">
      {{ playerStateText }}
    </el-tag>
  </el-descriptions-item>
</el-descriptions>
```

**特点**:
- 2列布局
- 带边框
- 小尺寸
- 状态标签带颜色

## 🔧 自定义配置

### 修改播放器尺寸

```vue
<video
  width="100%"
  height="600"  <!-- 修改这里 -->
>
```

### 修改对话框宽度

```vue
<el-dialog
  width="1200px"  <!-- 修改这里 -->
>
```

### 添加自动播放

```vue
<video
  autoplay  <!-- 添加这个属性 -->
  muted     <!-- 静音才能自动播放 -->
>
```

### 修改预加载策略

```vue
<video
  preload="metadata"  <!-- none | metadata | auto -->
>
```

## 📝 注意事项

### 1. 浏览器兼容性

| 浏览器 | 版本 | 支持情况 |
|--------|------|----------|
| Chrome | 60+ | ✅ 完全支持 |
| Firefox | 55+ | ✅ 完全支持 |
| Safari | 11+ | ✅ 完全支持 |
| Edge | 79+ | ✅ 完全支持 |
| IE | 11 | ⚠️ 部分支持 |

### 2. 视频格式支持

| 格式 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| MP4 | ✅ | ✅ | ✅ | ✅ |
| WebM | ✅ | ✅ | ❌ | ✅ |
| OGG | ✅ | ✅ | ❌ | ❌ |

### 3. CORS限制

如果视频在不同域名，需要后端设置CORS头：

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
```

### 4. HTTPS要求

在HTTPS页面中，视频URL也必须是HTTPS，否则会被浏览器阻止。

## 🚀 下一步优化

1. **集成后端API** - 自动获取视频URL
2. **添加播放列表** - 支持连续播放
3. **添加字幕** - 支持VTT字幕文件
4. **添加倍速播放** - 0.5x, 1x, 1.5x, 2x
5. **添加截图功能** - 截取视频帧
6. **添加下载功能** - 下载视频文件
7. **添加画中画** - Picture-in-Picture模式
8. **添加播放统计** - 记录播放时长、次数

## 📞 技术支持

如有问题，请查看：
- `VIDEO_PLAYER_USAGE.md` - 详细使用说明
- `VIDEO_PLAYER_SETUP.md` - Video.js升级指南

