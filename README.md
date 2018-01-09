# 小程序项目库文件管理

## 小程序共用库使用方法

在新建一个小程序项目的时候执行clone

git clone https://github.com/dawnco/xcx-lib.git new_project_dir

cd new_project_dir

注意：project.config.json 小程序配置文件中 指明了 "miniprogramRoot" = "./root"

## GIT 忽略已入库的文件的本地修改
本地修改了非此库管理的公共文件（比如：project.config.json 等文件），注意不要不要提交到此库，请使用以下命令
git update-index --assume-unchanged FILENAME

取消这个忽略：
git update-index --no-assume-unchanged FILENAME

## 目录结构
```
new_project_dir
    - project.config.json   小程序开发工具的项目配置文件
    - root                  小程序源代码目录
        - lib               库目录（由https://github.com/dawnco/xcx-lib.git维护）
        - etc               项目配置文件目录
```


## 开始开发
小程序开发工具创建项目，目录选择 new_project_dir 目录就可以了

将root/etc/config_default.js   改名为  config.js

然后在root目录创建 app.js、 app.json、 app.wxss等 小程序代码文件

...

## lib 第三方库说明
wxParse 富文件解析，支持HTML MARKDOWN代码解析成小程序代码渲染：
https://github.com/icindy/wxParse