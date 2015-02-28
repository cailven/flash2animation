(function(){
    var baseURI = fl.baseURI = fl.scriptURI.slice(0, fl.scriptURI.lastIndexOf("/")) + "/";
    fl.runScript(baseURI + "lib/utils.jsfl");
    fl.runScript(baseURI + "lib/matrix.jsfl");
    
    if(!fl.doc){
        alert("请先打开动画flash文件！");
        return;
    }
    var folderURI = fl.browseForFolderURL("选择要保存数据的文件夹");
    if(!folderURI){
        alert("请先选择保存数据的文件夹！");
        return;
    }

    log("start export animation data...");
    folderURI += "/";
    var animName = fl.doc.name.split(".")[0];

    function createLayerData(){
        var layersData = [];

        fl.layers.forEach(function(layer){
            var frames = layer.frames;
            var layerData = {};
            layerData.name = layer.name.replace(/[\.\s]/g, "_");
            var framesData = layerData.frames = [];
            
            layersData.push(layerData);
            var elem = fl.getElem(layer);
            if(elem && elem.libraryItem){
                layerData.image = fl.getLibraryName(elem);
                fl.editItem(elem.libraryItem.name);
                var offsetX = fl.elem?fl.elem.left:0;
                var offsetY = fl.elem?fl.elem.top:0;
                fl.exit();
                var offsetRotation = 0;
                var lastFrame;
                for(var i = 0, l = frames.length;i < l;i ++){
                    var frame = frames[i];
                    var elem = frame.elements[0];
                    if(elem){
                        var origin = matrix.getOrigin(elem.matrix, elem.transformX, elem.transformY);
                        
                        elem = {
                            scaleX:matrix.getScaleX(elem.matrix),
                            scaleY:matrix.getScaleY(elem.matrix),
                            rotation:matrix.getRotation(elem.matrix),
                            originX:origin.x - offsetX,
                            originY:origin.y - offsetY,
                            x:elem.transformX,
                            y:elem.transformY,
                            alpha:elem.colorAlphaPercent
                        };
                        
                        if(lastFrame){
                            if(lastFrame.motionTweenRotate == "clockwise"){
                                offsetRotation += 360 * lastFrame.motionTweenRotateTimes;
                            }
                            else if(lastFrame.motionTweenRotate == "counter-clockwise"){
                                offsetRotation -= 360 * lastFrame.motionTweenRotateTimes;
                            }
                            else if(lastFrame.motionTweenRotate == "auto"){
                                if(Math.abs(lastFrame.rotation - elem.rotation) > 180){
                                    elem.rotation += elem.rotation > lastFrame.rotation?-360:360;
                                }
                            }
                            elem.rotation += offsetRotation;
                        }
                        else{
                            offsetRotation = 0;
                        }
                    }
                    
                    lastFrame = elem?{
                        motionTweenRotate:frame.motionTweenRotate,
                        motionTweenRotateTimes:frame.motionTweenRotateTimes,
                        rotation:elem.rotation - offsetRotation
                    }:null;
                    
                    framesData.push({
                        tween:frame.tweenType == "motion",
                        duration:frame.duration,
                        elem:elem
                    });
                    
                    i += frame.duration - 1;
                }
            }
        });

        return layersData;
    }

    function createExporter(){
        var myExport = fl.spriteSheetExporter||new SpriteSheetExporter();
        myExport.beginExport();
        myExport.algorithm = "maxRects";
        myExport.format = "RGBA8888";
        myExport.layoutFormat = "JSON";
        return myExport;
    }

    function createImageData(uri){  
        var myExport = createExporter();
        var names = [];
        fl.layers.forEach(function(layer){
            var elem = fl.getElem(layer);
            if(elem && elem.libraryItem){
                myExport.addSymbol(elem.libraryItem);
                names.push(elem.libraryItem.name);
            }
        });
        
        var text = myExport.exportSpriteSheet(baseURI + "temp", "png", true);
        FLfile.remove(baseURI + "temp.json");
        FLfile.remove(baseURI + "temp.png");
        
        var imageData = fl.parse(text);
        var data = {};

        for(var name in imageData.frames){
            data[name.slice(0, name.length-4)] = imageData.frames[name].frame;
        }

        if(lib.itemExists("jsv5")) lib.deleteItem("jsv5");
        if(lib.itemExists("jsv5img")) lib.deleteItem("jsv5img");
        lib.addNewItem('movie clip', "jsv5");
        fl.editItem("jsv5");

        names.forEach(function(name){
            lib.addItemToDocument({x:0, y:Math.random()}, name);
        });
        
        fl.layers[0].frames[0].elements.forEach(function(elem){
            if(!elem || !fl.getLibraryName(elem)) return;
            elem.x = imageData.frames[fl.getLibraryName(elem)+"0000"].frame.x - elem.left + elem.x;
            elem.y = imageData.frames[fl.getLibraryName(elem)+"0000"].frame.y - elem.top + elem.y;
        });
        
        fl.getItem("jsv5").exportToLibrary(1, "jsv5img");
        fl.getItem("jsv5img").exportToFile(uri);
        
        return data;
    }

    function getActionData(){
        var data = {};
        for(var i = 0;i < fl.layers.length;i ++){
            var layer = fl.layers[i];
            if(layer.name === "action"){
                var frames = layer.frames;
                for(var i = 0;i < frames.length;i++){
                    var frame = frames[i];
                    if(frame.name){
                        data[frame.name] = i;
                        i += frame.duration - 1;
                    }
                }
                return data;
            }
        }
        return data;
    }

    function getExportInfo(){
        var animationPanel = fl.swfPanels.filter(function(panel){
            return panel.name == "animationPanel";
        })[0];
        if(animationPanel){
            return {
                data:animationPanel.call("getData").slice(1, -1),
                image:animationPanel.call("getImage").slice(1, -1),
                value:animationPanel.call("getValue").slice(1, -1),
                preview:animationPanel.call("getPreview") === "true"
            }
        }
        else{
            return {
                data:animName + ".js",
                image:animName + ".png",
                value:animName,
                preview:true
            }
        }
    }
    
    function preview(dataStr, imgURI){
        var folderURI = baseURI + "preview/";
        fl.write(folderURI + "previewAnim.js", "var previewAnim = " + dataStr + ";", true);
        fl.copy(imgURI, folderURI + "previewAnim.png");
        fl.open(folderURI + "preview.html");
    }

    var exportInfo = getExportInfo();
    var data = {
        layers:createLayerData(),
        stage:{
            width:doc.width,
            height:doc.height,
            fps:doc.frameRate
        },
        actions:getActionData()
    };
    data.texture = createImageData(folderURI + exportInfo.image);

    var dataStr = JSON.stringify(data);
    var str = "var " + exportInfo.value + " = " + dataStr + ";";
    
    fl.write(folderURI + exportInfo.data, str);
    fl.exit();

    exportInfo.preview && preview(dataStr, folderURI + exportInfo.image);
})();