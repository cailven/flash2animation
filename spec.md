## 动画格式

```
{
    //图层数据，按从上到下排列
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
                        "alpha": 100
                    }
                }
            ]
        }
    ],
    "texture":{
        "img1":{
            "x":20, //在大图中的位置x
            "y":50, //在大图中的位置y
            "w":100,
            "h":200
        }
    },
    "stage":{
        "width":550,
        "height":400,
        "fps":24
    }
}

```