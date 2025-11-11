# 视频播放功能使用说明

## 功能概述

已成功为媒体管理页面添加视频播放功能，**无需安装额外依赖**，使用原生HTML5 video标签实现。

## 实现的功能

### ✅ 已完成

1. **播放对话框**
   - 点击操作栏的"播放"按钮打开播放对话框
   - 对话框包含URL输入框和播放按钮
   - 美观的UI设计，带有渐变背景的占位符

2. **URL输入**
   - 文本框允许用户输入视频文件的HTTP URL
   - 支持清空按钮
   - URL格式验证（必须是http或https协议）

3. **视频播放**
   - 点击播放按钮后向URL发送HTTP GET请求
   - 使用HTML5 video标签播放视频流
   - 支持播放、暂停、音量控制、进度条等标准功能

4. **播放状态显示**
   - 实时显示播放状态（加载中、播放中、已暂停、已停止）
   - 显示当前播放的视频URL
   - 状态标签带有颜色区分

5. **错误处理**
   - URL格式验证
   - 网络错误提示
   - 视频格式不支持提示
   - 解码错误提示

## 文件结构

```
jxt-frontend/
├── src/
│   ├── components/
│   │   └── VideoPlayerDialog/
│   │       └── index.vue          # 视频播放对话框组件
│   └── views/
│       └── evidencemanage/
│           └── media/
│               └── index.vue      # 媒体管理页面（已修改）
├── VIDEO_PLAYER_SETUP.md          # 安装说明（如需使用Video.js）
└── VIDEO_PLAYER_USAGE.md          # 本文件
```

## 使用方法

### 1. 启动前端项目

```bash
cd jxt-frontend
npm run dev
```

### 2. 访问媒体管理页面

导航到：**证据管理 > 媒体管理**

### 3. 播放视频

1. 在媒体列表中找到要播放的媒体
2. 点击操作栏的"播放"按钮
3. 在弹出的对话框中输入视频URL
   - 例如：`http://localhost:8080/videos/sample.mp4`
   - 或：`https://example.com/stream/video.mp4`
4. 点击"播放"按钮
5. 视频开始播放

### 4. 控制播放

- **播放/暂停**：点击视频中央的播放按钮或使用控制条
- **音量调节**：使用控制条的音量滑块
- **进度控制**：拖动进度条
- **全屏播放**：点击全屏按钮
- **停止播放**：点击对话框底部的"停止播放"按钮

## 支持的视频格式

### 主流格式（所有现代浏览器支持）

- **MP4** (H.264编码) - 推荐
- **WebM** (VP8/VP9编码)
- **OGG** (Theora编码)

### 流媒体格式

- **HLS** (M3U8) - iOS Safari原生支持
- **DASH** - 需要额外库支持

### 其他格式

- **FLV** - 需要转码或使用flv.js
- **AVI** - 需要转码
- **MKV** - 需要转码

## 测试URL示例

### 公开测试视频

```
# Big Buck Bunny (MP4)
http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4

# Sintel (MP4)
http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4

# Elephant Dream (WebM)
http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4
```

### 本地测试

如果您有本地视频服务器：

```
http://localhost:8080/api/media/stream/123
http://127.0.0.1:8003/videos/sample.mp4
```

## 技术实现

### 组件结构

**VideoPlayerDialog组件** (`src/components/VideoPlayerDialog/index.vue`)

```vue
<template>
  <el-dialog>
    <!-- URL输入区域 -->
    <el-input v-model="videoUrl">
      <el-button @click="handlePlay">播放</el-button>
    </el-input>
    
    <!-- 视频播放区域 -->
    <video ref="videoPlayer" controls></video>
    
    <!-- 播放信息 -->
    <el-descriptions>...</el-descriptions>
  </el-dialog>
</template>
```

### 核心方法

1. **handlePlay()** - 验证URL并初始化播放器
2. **initPlayer()** - 设置视频源并绑定事件监听
3. **destroyPlayer()** - 清理播放器资源
4. **handleStop()** - 停止播放
5. **handleClose()** - 关闭对话框并清理资源

### 事件监听

```javascript
// 加载开始
videoElement.addEventListener('loadstart', () => {
  this.playerState = 'loading'
})

// 可以播放
videoElement.addEventListener('canplay', () => {
  console.log('视频可以播放')
})

// 正在播放
videoElement.addEventListener('playing', () => {
  this.playerState = 'playing'
})

// 已暂停
videoElement.addEventListener('pause', () => {
  this.playerState = 'paused'
})

// 播放结束
videoElement.addEventListener('ended', () => {
  this.playerState = 'stopped'
})

// 播放错误
videoElement.addEventListener('error', (e) => {
  this.playerState = 'error'
  // 错误处理...
})
```

## 后端集成建议

### 方案1: 直接返回视频URL

修改 `handlePlayVideo` 方法：

```javascript
handlePlayVideo(row) {
  // 假设后端API返回的媒体数据包含videoUrl字段
  if (row.videoUrl) {
    this.currentVideoUrl = row.videoUrl
  } else if (row.filePath) {
    // 或者根据文件路径构建URL
    this.currentVideoUrl = `${process.env.VUE_APP_BASE_API}${row.filePath}`
  } else {
    // 或者根据媒体ID构建流媒体URL
    this.currentVideoUrl = `${process.env.VUE_APP_BASE_API}/api/v1/media/stream/${row.mediaId}`
  }
  this.videoPlayerVisible = true
}
```

### 方案2: 后端流媒体接口

后端需要实现一个流媒体接口：

```go
// Go示例
func StreamVideo(c *gin.Context) {
    mediaID := c.Param("id")
    
    // 获取视频文件路径
    filePath := getVideoFilePath(mediaID)
    
    // 打开文件
    file, err := os.Open(filePath)
    if err != nil {
        c.JSON(404, gin.H{"error": "Video not found"})
        return
    }
    defer file.Close()
    
    // 获取文件信息
    fileInfo, _ := file.Stat()
    fileSize := fileInfo.Size()
    
    // 设置响应头
    c.Header("Content-Type", "video/mp4")
    c.Header("Content-Length", fmt.Sprintf("%d", fileSize))
    c.Header("Accept-Ranges", "bytes")
    
    // 支持Range请求（用于拖动进度条）
    rangeHeader := c.GetHeader("Range")
    if rangeHeader != "" {
        // 处理Range请求
        handleRangeRequest(c, file, fileSize, rangeHeader)
    } else {
        // 完整文件传输
        io.Copy(c.Writer, file)
    }
}
```

### 方案3: 添加认证

如果视频需要认证访问：

```javascript
// 在VideoPlayerDialog组件中添加认证头
initPlayer() {
  const videoElement = this.$refs.videoPlayer
  
  // 对于需要认证的视频，可以使用fetch API
  const token = this.$store.getters.token
  
  fetch(this.videoUrl, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.blob())
  .then(blob => {
    const url = URL.createObjectURL(blob)
    videoElement.src = url
    videoElement.play()
  })
  .catch(error => {
    this.$message.error('加载视频失败: ' + error.message)
  })
}
```

## 常见问题

### Q1: 视频无法播放？

**A:** 检查以下几点：
1. URL是否正确且可访问
2. 视频格式是否被浏览器支持
3. 是否存在CORS跨域问题
4. 网络连接是否正常

### Q2: 如何解决CORS跨域问题？

**A:** 后端需要设置CORS响应头：

```go
c.Header("Access-Control-Allow-Origin", "*")
c.Header("Access-Control-Allow-Methods", "GET, OPTIONS")
c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
```

### Q3: 如何支持更多视频格式？

**A:** 
- **方案1**: 后端转码为MP4格式
- **方案2**: 使用Video.js并安装相应插件（需要npm install video.js）
- **方案3**: 使用专门的播放器库（如flv.js, hls.js）

### Q4: 如何实现自动播放？

**A:** 现代浏览器限制自动播放，需要：
1. 视频静音（muted属性）
2. 用户交互后播放
3. 网站在浏览器的自动播放白名单中

### Q5: 如何添加字幕？

**A:** 在video标签中添加track元素：

```html
<video ref="videoPlayer" controls>
  <track
    kind="subtitles"
    src="/path/to/subtitles.vtt"
    srclang="zh"
    label="中文"
    default
  />
</video>
```

## 性能优化建议

### 1. 视频预加载策略

```html
<!-- 不预加载 -->
<video preload="none">

<!-- 只预加载元数据 -->
<video preload="metadata">

<!-- 预加载整个视频 -->
<video preload="auto">
```

### 2. 使用CDN

将视频文件部署到CDN，提高加载速度。

### 3. 视频压缩

使用FFmpeg等工具压缩视频：

```bash
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -c:a aac -b:a 128k output.mp4
```

### 4. 自适应码率

使用HLS或DASH实现自适应码率流媒体。

## 升级到Video.js

如果需要更强大的功能，可以升级到Video.js：

1. 安装依赖：
```bash
npm install video.js --save
```

2. 取消VideoPlayerDialog组件中的注释：
```javascript
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
```

3. 参考 `VIDEO_PLAYER_SETUP.md` 完成配置

## 更新日志

### 2025-11-07 v1.0
- ✅ 创建VideoPlayerDialog组件
- ✅ 使用原生HTML5 video标签
- ✅ 实现URL输入和播放功能
- ✅ 添加播放状态显示
- ✅ 实现错误处理
- ✅ 集成到媒体管理页面
- ✅ 无需额外依赖，开箱即用

## 联系支持

如有问题或建议，请联系开发团队。

