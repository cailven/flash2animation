# flash to css3 animation
flash插件导出css3 animation动画

## demo 
* [animation](http://css3animation.sinaapp.com/animation/)

## 使用方法
1. 导出动画数据
   * 安装[插件](https://raw.githubusercontent.com/06wj/flash2animation/master/tools/animationPanel.zxp)，在菜单Window->Extensions打开animationPanel面板，点击导出按钮导出动画数据
   * 也可以直接双击运行tools/animationPanel/animation.jsfl
2. 播放动画
   1. 引用src/anim.js
   2. 运行anim.build(animData, container, animImage);
   
## flash动画规范
* 每个图层只允许有一个元件,元素必须先转换成元件
* 只允许使用传统补间
* 不能元件嵌套元件
* 不支持滤镜，遮罩

## 数据格式文档
* [spec](https://github.com/06wj/flash2animation/blob/master/spec.md)



## todo
* 支持元件嵌套元件
* 支持逐帧动画
