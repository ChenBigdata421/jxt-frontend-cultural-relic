# 视频播放功能安装说明

## 功能概述

已为媒体管理页面添加了视频播放功能，用户可以：
1. 点击操作栏的"播放"按钮打开播放对话框
2. 在对话框中输入视频文件的HTTP URL
3. 点击播放按钮播放视频
4. 使用Video.js播放器观看视频流

## 依赖安装

### 1. 安装Video.js

在 `jxt-frontend` 目录下运行以下命令：

```bash
npm install video.js --save
```

或者使用yarn：

```bash
yarn add video.js
```

### 2. 验证安装

安装完成后，检查 `package.json` 文件中是否包含：

```json
{
  "dependencies": {
    "video.js": "^8.x.x"
  }
}
```

## 文件说明

### 新增文件

1. **`src/components/VideoPlayerDialog/index.vue`**
   - 视频播放对话框组件
   - 包含URL输入框、播放按钮和Video.js播放器
   - 支持多种视频格式（MP4, WebM, FLV, M3U8等）

### 修改文件

1. **`src/views/evidencemanage/media/index.vue`**
   - 导入VideoPlayerDialog组件
   - 添加播放对话框的显示控制
   - 在handleOperation方法中处理"play"操作
   - 添加handlePlayVideo和handleVideoPlayerClose方法

## 使用方法

### 基本使用

1. 进入媒体管理页面
2. 在媒体列表的操作栏中点击"播放"按钮
3. 在弹出的对话框中输入视频URL（例如：`http://example.com/video.mp4`）
4. 点击"播放"按钮开始播放

### 支持的视频格式

- MP4 (video/mp4)
- WebM (video/webm)
- OGG (video/ogg)
- FLV (video/x-flv)
- M3U8 (application/x-mpegURL) - HLS流媒体
- TS (video/MP2T)

### 播放器功能

- 播放/暂停
- 音量控制
- 进度条拖动
- 全屏播放
- 播放速度调整
- 播放状态显示

## 技术细节

### Video.js配置

播放器使用以下配置：

```javascript
{
  controls: true,        // 显示控制条
  autoplay: true,        // 自动播放
  preload: 'auto',       // 预加载
  fluid: false,          // 固定尺寸
  width: 850,            // 宽度
  height: 500,           // 高度
  controlBar: {
    volumePanel: {
      inline: false      // 音量控制独立显示
    }
  }
}
```

### 错误处理

播放器会处理以下错误：

- **错误代码1**: 视频加载被中止
- **错误代码2**: 网络错误，无法加载视频
- **错误代码3**: 视频解码失败
- **错误代码4**: 不支持的视频格式或URL无效

### 事件监听

组件监听以下播放器事件：

- `loadstart`: 开始加载
- `canplay`: 可以播放
- `playing`: 正在播放
- `pause`: 已暂停
- `ended`: 播放结束
- `error`: 播放错误

## 后续开发建议

### 1. 集成后端API

修改 `handlePlayVideo` 方法，从媒体数据中获取视频URL：

```javascript
handlePlayVideo(row) {
  // 假设后端返回的媒体数据中包含videoUrl字段
  if (row.videoUrl) {
    this.currentVideoUrl = row.videoUrl;
  } else {
    // 或者根据媒体ID构建URL
    this.currentVideoUrl = `${process.env.VUE_APP_BASE_API}/api/media/stream/${row.mediaId}`;
  }
  this.videoPlayerVisible = true;
}
```

### 2. 添加权限验证

如果视频需要认证，可以在Video.js配置中添加请求头：

```javascript
this.player = videojs(this.$refs.videoPlayer, {
  // ... 其他配置
  html5: {
    vhs: {
      withCredentials: true
    },
    xhr: {
      beforeRequest: (options) => {
        options.headers = {
          ...options.headers,
          'Authorization': 'Bearer ' + getToken()
        }
        return options
      }
    }
  }
})
```

### 3. 添加字幕支持

```javascript
sources: [{
  src: this.videoUrl,
  type: this.getVideoType(this.videoUrl)
}],
tracks: [{
  kind: 'subtitles',
  src: '/path/to/subtitles.vtt',
  srclang: 'zh',
  label: '中文'
}]
```

### 4. 添加播放列表

可以扩展组件支持播放列表功能，允许连续播放多个视频。

### 5. 添加下载功能

在播放器下方添加下载按钮，允许用户下载视频文件。

## 故障排除

### 问题1: 视频无法播放

**可能原因**:
- URL不正确或无法访问
- 视频格式不支持
- CORS跨域问题

**解决方案**:
- 检查URL是否正确
- 确认视频格式是否支持
- 配置后端允许跨域访问

### 问题2: 播放器样式异常

**可能原因**:
- Video.js CSS未正确加载

**解决方案**:
- 确认已导入 `video.js/dist/video-js.css`
- 检查CSS加载顺序

### 问题3: 播放器初始化失败

**可能原因**:
- Video.js未正确安装
- DOM元素未准备好

**解决方案**:
- 重新安装video.js依赖
- 确保在$nextTick中初始化播放器

## 参考资料

- [Video.js官方文档](https://videojs.com/)
- [Video.js GitHub](https://github.com/videojs/video.js)
- [Video.js插件列表](https://videojs.com/plugins/)

## 版本信息

- Vue: 2.6.11
- Element UI: 2.15.6
- Video.js: 8.x (需要安装)

## 更新日志

### 2025-11-07
- ✅ 创建VideoPlayerDialog组件
- ✅ 集成到媒体管理页面
- ✅ 添加URL输入和播放功能
- ✅ 实现Video.js播放器
- ✅ 添加错误处理和状态显示
- ⏳ 待安装video.js依赖

