## 🚀 针对你的服务器的快速部署命令

基于你提供的旧配置，以下是针对服务器 `47.94.241.161` 的具体部署步骤：

### 1. 连接服务器
```bash
ssh root@47.94.241.161
```

### 2. 创建部署目录并上传文件
```bash
# 在本地执行：创建服务器目录
ssh root@47.94.241.161 "mkdir -p /usr/share/nginx/html/dsci-lab-frontend"

# 上传构建文件
scp -r dist/* root@47.94.241.161:/usr/share/nginx/html/dsci-lab-frontend/

# 上传nginx配置文件
scp nginx.conf root@47.94.241.161:/etc/nginx/sites-available/dsci-lab-frontend
```

### 3. 配置nginx
```bash
# 连接服务器
ssh root@47.94.241.161

# 如果你已经把配置写入 /etc/nginx/conf.d/default.conf，直接测试配置即可
# 测试配置
nginx -t

# 重载nginx
systemctl reload nginx
```

**注意：** 如果你使用的是 `/etc/nginx/conf.d/default.conf`，则不需要执行软链接命令。

---

## 📋 原部署指南

## 1. 构建产物说明

项目构建完成后，会在 `dist` 目录下生成以下文件：
- `index.html` - 主页面文件
- `static/` - 静态资源目录（JS、CSS、图片等）
- `assets/` - 主题样式文件
- 其他静态文件（favicon.ico、logo.svg等）

## 2. 服务器环境准备

### 2.1 安装Nginx

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install nginx
```

**CentOS/RHEL:**
```bash
sudo yum install nginx
# 或者使用 dnf (较新版本)
sudo dnf install nginx
```

### 2.2 启动Nginx服务
```bash
sudo systemctl start nginx
sudo systemctl enable nginx  # 设置开机自启
```

## 3. 部署步骤

### 3.1 上传构建产物
将 `dist` 目录下的所有文件上传到服务器，建议路径：
```bash
/usr/share/nginx/html/dsci-lab-frontend/
```

**上传命令示例：**
```bash
# 创建目录
ssh root@47.94.241.161 "mkdir -p /usr/share/nginx/html/dsci-lab-frontend"

# 上传dist目录内容
scp -r dist/* root@47.94.241.161:/usr/share/nginx/html/dsci-lab-frontend/
```

### 3.2 配置Nginx

1. 将项目根目录下的 `nginx.conf` 文件复制到服务器
2. 根据实际情况修改配置文件中的以下内容：
   - `server_name`: 替换为你的域名或IP地址
   - `root`: 替换为实际的部署路径
   - `proxy_pass`: 替换为后端API的实际地址

3. 将配置文件放置到Nginx配置目录：
```bash
# 方式1：直接替换默认配置
sudo cp nginx.conf /etc/nginx/sites-available/default

# 方式2：创建新的站点配置
sudo cp nginx.conf /etc/nginx/sites-available/dsci-lab-frontend
sudo ln -s /etc/nginx/sites-available/dsci-lab-frontend /etc/nginx/sites-enabled/
```

### 3.3 测试并重载Nginx配置
```bash
# 测试配置文件语法
sudo nginx -t

# 重载配置
sudo systemctl reload nginx
```

## 4. 域名和SSL配置（可选）

### 4.1 域名配置
如果有域名，修改 `nginx.conf` 中的 `server_name`：
```nginx
server_name your-domain.com www.your-domain.com;
```

### 4.2 SSL证书配置
```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # 其他配置...
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 5. 常见问题解决

### 5.1 页面刷新404问题
确保Nginx配置中包含以下配置（已在提供的配置文件中）：
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 5.2 API请求跨域问题
检查Nginx配置中的API代理设置，确保：
- `proxy_pass` 地址正确
- 跨域头配置正确

### 5.3 静态资源加载失败
检查：
- 文件路径是否正确
- 文件权限是否正确
- Nginx用户是否有读取权限

## 6. 性能优化建议

1. **启用Gzip压缩**（已在配置中启用）
2. **设置静态资源缓存**（已在配置中设置）
3. **使用CDN**（可选）
4. **开启HTTP/2**（需要SSL证书）

## 7. 监控和日志

- 访问日志：`/var/log/nginx/dsci-lab-frontend.access.log`
- 错误日志：`/var/log/nginx/dsci-lab-frontend.error.log`

查看日志：
```bash
# 实时查看访问日志
sudo tail -f /var/log/nginx/dsci-lab-frontend.access.log

# 查看错误日志
sudo tail -f /var/log/nginx/dsci-lab-frontend.error.log
```

## 8. 部署验证

部署完成后，通过浏览器访问你的域名或IP地址，验证：
- [ ] 页面正常加载
- [ ] 静态资源正常加载
- [ ] 路由跳转正常
- [ ] API请求正常
- [ ] 登录功能正常

---

**注意事项：**
- 确保服务器防火墙开放80端口（和443端口，如果使用HTTPS）
- 定期备份网站文件和数据库
- 监控服务器资源使用情况
- 定期更新系统和Nginx版本