## 动画格式

```
{
    //图层数据，按层级从上到下排列
    "layers":[
        {
            "name":"head",
            "image":"img1",//对应texture中的键值
            //关键帧数据
            "frames":[
                {
                    "tween": true, //是否缓动
                    "duration": 10, //持续帧数
                    "elem": {
                        "scaleX": 1,
                        "scaleY": 1,
                        "rotation": 30,
                        "originX": 46.5,
                        "originY": 76.5,
                        "x": 108.5,
                        "y": 507.5,
                        "alpha": 100 //透明度，范围0~100，0完全透明，100完全不透明
                    }
                }
            ]
        }
    ],
    //素材数据
    "texture":{
        "img1":{
            "x":20, //在大图中的位置x
            "y":50, //在大图中的位置y
            "w":100,
            "h":200
        }
    },
    //舞台数据
    "stage":{
        "width":550, //动画容器宽
        "height":400, //动画容器高
        "fps":24 //帧频
    },
    //动作数据
    "actions":{
        "anim_die":12 //{动作名：帧数}
    }
}

```