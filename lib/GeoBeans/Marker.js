GeoBeans.Marker = GeoBeans.Class({
	title	: null,
	icon	: null,
	mapX	: null,
	mapY	: null,
	offsetX : null,
	offsetY : null,
	image	: null,
	layer	: null,
	
	
	initialize : function(title, icon, x, y){
		this.title = title;
		this.icon  = icon;
		this.mapX  = x;
		this.mapY  = y;		
		
		this.offsetX = 0;
		this.offsetY = 0;
		
		this.image = new Image();
	},
	
	destory : function(){
		
	},
	
	setLayer : function(layer){
		this.layer = layer;
	},
	
	draw : function(){
		if(this.image==null){
			this.image = new Image();
			this.image.src = this.icon;
		}
		else if(this.image.src.length==0){
			this.image.src = this.icon;
		}
		if(this.image.complete){
			this.drarMaker();
			//this.context.drawImage(this.image, 10,10,200,200);			
		}
		else{
			var marker = this;
			this.image.onload = function(){
				marker.drarMaker();
			};
		}
	},
	
	drarMaker : function(){
		var transformation = this.layer.map.transformation;
		var sp = transformation.toScreenPoint(this.mapX, this.mapY);
		
		var renderer = this.layer.map.renderer;
		renderer.context.drawImage(this.image, sp.x, sp.y);	
	},
	
	//addEventListener : function(type, handler){
//		if(this.image!=null){
//			var marker = this;
//			this.image.addEventListener("click", function(evt){
//				handler(marker);
//			});
//			//this.image.click = function(evt){
//			//	handler(marker);
//			//}
//		}
//	}
});