var animationPanel = fl.swfPanels.filter(function(panel){
    return panel.name == "animationPanel";
})[0];

if(animationPanel){
    if(onDocumentChangeID){
        fl.removeEventListener("documentChanged", onDocumentChangeID);
    }
    var onDocumentChange = function(){
        var doc = fl.getDocumentDOM();
        if(doc){
            var animName = doc.name.split(".")[0];
            animationPanel.call("setValue", animName);
            animationPanel.call("setImage", animName + ".png");
            animationPanel.call("setData", animName + ".js");
        }
    };

    var onDocumentChangeID = fl.addEventListener("documentChanged", onDocumentChange);
    onDocumentChange();
}