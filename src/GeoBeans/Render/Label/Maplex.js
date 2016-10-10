/**
 * @classdesc
 * 标注控制类，实现文字标注的碰撞检测等处理。
 * @class
 * @public
 */
GeoBeans.Maplex = GeoBeans.Class({
	map : null,


	labelSets : null,

	renderer : null,

	canvas : null,


	initialize : function(map){
		this.map = map;

		this.labelSets = [];

		this.canvas = document.createElement("canvas");
		this.canvas.height = this.map.height;
		this.canvas.width = this.map.width;

		this.renderer = new GeoBeans.Renderer(this.canvas);
	},

	cleanup : function(){
		this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
		this.labelSets = [];
	},


	draw : function(){
		this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
		for(var i = 0; i < this.labelSets.length;++i){
			var labelSet = this.labelSets[i];
			this.drawLabelSet(labelSet);
		}

		this.map.renderer.drawImage(this.canvas,0,0,this.canvas.width,this.canvas.height);
	},


	isCollision : function(label){
		if(label == null){
			return false;
		}

		for(var i = 0; i < this.labelSets.length;++i){
			var labelSet = this.labelSets[i];
			if(labelSet.isCollision(label)){
				return true;
			}
		}
		return false;
	},


	addLabel : function(setName,label){
		if(setName == null ||label == null){
			return;
		}

		var labelSet = this.getLableSet(setName);
		if(labelSet == null){
			return null;
		}

		labelSet.addLabel(label);

	},


	getLableSet : function(setName){
		
		for(var i = 0; i < this.labelSets.length;++i){
			var labelSet = this.labelSets[i];
			if(labelSet.name == setName){
				return labelSet;
			}
		}

		var labelSet = new GeoBeans.LabelSet(setName);
		this.labelSets.push(labelSet);
		return labelSet;

	},

	// 绘制每个集合
	drawLabelSet : function(labelSet){
		if(labelSet == null){
			return ;
		}
		
		var labels = labelSet.labels;
		if(labels.length == 0){
			return;
		}
		var symbolizer = labels[0].textSymbolizer;
		this.renderer.save();
		this.renderer.setSymbolizer(symbolizer);
		for(var i = 0 ; i < labels.length;++i){
			var label = labels[i];
			this.renderer.drawLabel(label);
		}
		this.renderer.restore();
	}
});
