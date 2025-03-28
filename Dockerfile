#用带有Alpine Linux的Node.js长期支持(LTS)版本作为基础镜像，并将这个阶段命名为build-stage。Alpine Linux是一个轻量级的Linux发行版，有助于减小最终镜像的大小。
FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:lts-alpine AS build-stage
#设置工作目录为/app。在Docker构建过程中，所有的命令都会在这个目录下执行。
WORKDIR /app

# 设置 Node.js 环境  
ENV NODE_OPTIONS=--openssl-legacy-provider 

#将package.json和package-lock.json（如果存在）复制到工作目录中。这是为了安装项目依赖
COPY package*.json ./
#全局安装cnpm，这是一个淘宝提供的npm镜像工具，可以加速依赖包的下载。这里指定了使用淘宝的npm镜像源。
RUN npm install -g cnpm --registry=https://registry.npmmirror.com

# 确保 Vue 2 项目使用兼容的 DevTools 版本
# RUN cnpm install -D @vue/devtools@legacy  


#使用cnpm安装webpack 4和项目依赖
RUN cnpm install webpack@4.46.0 webpack-cli@4.9.2 --save-dev && \
    cnpm install
# 可选步骤，列出项目直接依赖的npm包，用于检查依赖项是否正确安装。--depth=0表示只显示顶层依赖。
RUN cnpm list --depth=0
#将当前上下文（通常是Dockerfile所在的目录及其子目录）中的所有文件复制到工作目录中。这一步通常包括源代码文件。
COPY . .
#运行npm脚本build:prod，这通常是在package.json中定义的，用于构建生产环境的代码。
RUN npm run build:dev

# 第二个阶段开始，使用Nginx作为基础镜像。这标志着多阶段构建中生产阶段的开始。
FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/nginx:alpine  
#从build-stage阶段复制构建好的静态文件（通常位于/app/dist目录）到Nginx的默认HTML目录（/usr/share/nginx/html）。
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制自定义配置  
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf


#声明容器运行时监听的端口号80
EXPOSE 80
#设置容器启动时执行的命令。这里使用nginx命令以非守护进程模式(daemon off;)启动Nginx，这是为了让Nginx在前台运行，以便Docker可以接收到Nginx的退出信号。
CMD ["nginx", "-g", "daemon off;"]
