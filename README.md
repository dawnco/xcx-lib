# xcx-lib

## 小程序共用库使用方法

在新建一个小程序项目的时候执行clone

git clone https://github.com/dawnco/xcx-lib.git new_project_dir

cd new_project_dir

注意：project.config.json 小程序配置文件中 指明了 "miniprogramRoot" = "./root"

##目录结构
```
new_project_dir
    - root      小程序源代码目录
        - lib   库目录（由https://github.com/dawnco/xcx-lib.git维护）
        - etc   项目配置文件目录
```

##开始开发
小程序开发工具创建项目，目录选择 new_project_dir 目录就可以了

将root/etc/config_default.js   改名为  config.js

然后在root目录创建 app.js、 app.json、 app.wxss等 小程序代码文件

...