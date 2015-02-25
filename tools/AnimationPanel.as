package {
	import flash.display.Sprite;
	import flash.display.StageScaleMode;
	import flash.events.Event;
	import flash.events.KeyboardEvent;
	import flash.events.MouseEvent;
	import adobe.utils.MMExecute;
	import flash.external.ExternalInterface;
	import fl.controls.TextInput;
	import fl.controls.CheckBox;
	import flash.text.TextFormat;

	public class AnimationPanel extends Sprite {
		public function AnimationPanel() {
			if (stage) {
				init();
			} else {
				addEventListener(Event.ADDED_TO_STAGE, init);
			}
		}

		private function init(e: Event = null): void {
			stage.scaleMode = StageScaleMode.NO_SCALE;
			this.publishBtn.addEventListener(MouseEvent.CLICK, function (e: MouseEvent): void {
				MMExecute("fl.runScript(fl.configURI + 'WindowSWF/animationPanel/animation.jsfl')");
			});

			addCallback("Image");
			addCallback("Data");
			addCallback("Value");

			var previewInput:CheckBox = this.inputPreview;
			ExternalInterface.addCallback("getPreview", function():Boolean{
				return previewInput.selected;
			});

			previewInput.setStyle("textFormat", new TextFormat(null, null, 0xffffff));
			MMExecute("fl.runScript(fl.configURI + 'WindowSWF/animationPanel/panel.jsfl')");
			MMExecute("fl.trace(\"animationPanel Initialized\");");
		}

		private function addCallback(name:String):void{
			var textInput:TextInput = this["input" + name];
			ExternalInterface.addCallback("get" + name, function():String{
				return textInput.text;
			});
			ExternalInterface.addCallback("set" + name, function(text:String):void{
				textInput.text = text;
			});
		}
	}
}












