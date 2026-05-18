
1. 本地电脑改完代码后提交

在你本地项目目录执行：

git add .
git commit -m "修改页面功能"
git push
2. 登录服务器更新代码
ssh root@47.98.97.33

进入项目目录：

cd /www/heartcloud-live

拉取最新代码：

git pull

重新安装依赖，通常可以执行：

npm install

重新打包前端：

npm run build

把新的前端页面复制到 nginx 目录：

rm -rf /usr/share/nginx/html/*
cp -r dist/* /usr/share/nginx/html/

重启后端：

pm2 restart heartcloud-api

刷新页面：

http://47.98.97.33