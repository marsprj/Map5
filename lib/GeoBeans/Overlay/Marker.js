GeoBeans.Overlay.Marker = GeoBeans.Class(GeoBeans.Overlay,{
	// name : null,
	// icon : null,
	// image : null,
	// offsetX : 0,
	// offsetY : 0,

	image : null,

	type : GeoBeans.Overlay.Type.MARKER,

	// initialize : function(name,point,icon,offsetX,offsetY){
	// 	GeoBeans.Overlay.prototype.initialize.apply(this, arguments);
	// 	this.name = name;
	// 	this.geometry = point,
	// 	this.icon = icon;
	// 	this.offsetX = offsetX;
	// 	this.offsetY = offsetY;
	// },


	initialize : function(geometry,symbolizer){
		GeoBeans.Overlay.prototype.initialize.apply(this, arguments);
	},

	draw : function(){
		if(!this.visible){
			return;
		}
		var that = this;
		var icon = this.symbolizer.icon_url;
		var x = this.geometry.x;
		var y = this.geometry.y;

		var transformation = this.layer.map.transformation;
		var sp = transformation.toScreenPoint(x,y);
		this.layer.renderer.setSymbolizer(this.symbolizer);

		if(this.image == null){
			this.image = new Image();
			this.image.src = icon;
		}
		if(this.image.complete){
			this.loadFlag = GeoBeans.Overlay.Flag.LOADED;
			this.layer.renderer.drawIcon(this.image,sp.x,sp.y,this.symbolizer);
		}else{
			this.image.onload = function(){
				that.loadFlag = GeoBeans.Overlay.Flag.LOADED;
				that.layer.renderer.drawIcon(that.image,sp.x,sp.y,that.symbolizer);
				that.layer.draw();
				// that.layer.map.drawLayersAll();	
			}
		}	
	}
})