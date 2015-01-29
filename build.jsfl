var baseURI = fl.baseURI = fl.scriptURI.slice(0, fl.scriptURI.lastIndexOf("/")) + "/";
fl.runScript(baseURI + "utils.jsfl");
log(baseURI, "start");

var data = {};
var layersData = data.layers = [];
layers.forEach(function(layer){
    var frames = layer.frames;
    var layerData = {};
	layerData.name = layer.name;
	var framesData = layerData.frames = [];
	
	layersData.push(layerData);

    if(layer.name != "action"){
        for(var i = 0, l = frames.length;i < l;i ++){
            var frame = frames[i];
            var elem = frame.elements[0];
            if(elem){
                elem = {
                   // x:elem.x,
                   // y:elem.y,
				//	w:elem.width,
				//	h:elem.height,
                  //  rotation:elem.rotation,
                    //scaleX:elem.scaleX,
                    //scaleY:elem.scaleY,
                    transformX:elem.transformX,
                    transformY:elem.transformY,
                    alpha:elem.colorAlphaPercent,
                    matrix:elem.matrix
                }
            }
            framesData.push({
                tween:frame.tweenType,
                rotateType:frame.motionTweenRotate,
                rotateTime:frame.motionTweenRotateTimes,
                duration:frame.duration,
                elem:elem
            });
            i += frame.duration - 1;
        }
    }
});

function createExporter(){
	var myExport = fl.spriteSheetExporter||new SpriteSheetExporter();
	myExport.beginExport();
	myExport.algorithm = "maxRects";
	myExport.format = "RGBA8888";
	myExport.layoutFormat = "JSON";
	return myExport;
}

function createImageData(animName){	
	var myExport = createExporter();
	var names = [];
	var nameDict = {};
	layers.forEach(function(layer){
		var elem = fl.getElem(layer);
		if(elem){
			myExport.addSymbol(elem.libraryItem);
			var name = elem.libraryItem.name;
			var arr = name.split("/");
			var n = arr[arr.length-1];
			nameDict[n] = layer.name;
			names.push(name);
		}
	});

	var text = myExport.exportSpriteSheet(baseURI + "temp", "png", true);
	FLfile.remove(baseURI + "temp.json");
	FLfile.remove(baseURI + "temp.png");
	
	var imageData = fl.parse(text);
	var data = {};

	for(var name in imageData.frames){
		var key = nameDict[name.slice(0, name.length-4)];
		data[key] = imageData.frames[name].frame;
	}

	if(lib.itemExists("jsv5")) lib.deleteItem("jsv5");
	if(lib.itemExists("jsv5img")) lib.deleteItem("jsv5img");
	lib.addNewItem('movie clip', "jsv5");
	fl.editItem("jsv5");

	names.forEach(function(name){
		lib.addItemToDocument({x:0, y:Math.random()}, name);
	});
	
	layers[0].frames[0].elements.forEach(function(elem){
		if(!elem || !fl.getLibraryName(elem)) return;
		elem.x = imageData.frames[fl.getLibraryName(elem)+"0000"].frame.x - elem.left + elem.x;
		elem.y = imageData.frames[fl.getLibraryName(elem)+"0000"].frame.y - elem.top + elem.y;
	});
	
	fl.getItem("jsv5").exportToLibrary(1, "jsv5img");
	fl.getItem("jsv5img").exportToFile(baseURI + animName + ".png");
	
    return data;
}

var animName = "anim1";
data.texture = createImageData(animName);

var str = JSON.stringify(data);
str = "var " + animName + " = " + str + ";";

//var folderURI = fl.browseForFolderURL("ss");
fl.write(baseURI + animName + ".js", str);

fl.getDocumentDOM().exitEditMode();


