/**
 * @classdesc
 * 点Label集合
 * @class
 * @private
 */
GeoBeans.PointLabel = GeoBeans.Class(GeoBeans.Label,{
	pos : null,
	extent : null,

	initialize : function(){
		this.pos = new GeoBeans.Geometry.Point(0,0);
	},

	computePosition : function(renderer,transform){

		var point = this.geometry.getCentroid();
		var sp = transform.toScreenPoint(point.x,point.y);
		this.pos.x = sp.x;
		this.pos.y = sp.y;

		var fontSize = this.textSymbolizer.font.size;
		this.extent = renderer.getTextExtent(this.text,parseInt(fontSize));

		// 向右是正
		this.pos.x += this.textSymbolizer.displaceX;
		// 向上是正
		this.pos.y -= this.textSymbolizer.displaceY;

		this.pos.x -= this.extent.getWidth() * this.textSymbolizer.anchorX;
		this.pos.y += this.extent.getHeight() * this.textSymbolizer.anchorY;
		this.extent.offset(this.pos.x,this.pos.y);
		// this.extent.scale(1.1);
	},

	adjustPosition : function(width,height){
		var offsetX = 0.0;
		var offsetY = 0.0;
		if(this.extent == null){
			return;
		}
		if(this.extent.xmin < 0){
			offsetX = -this.extent.xmin;
		}else if(this.extent.xmax > width){
			offsetX = width - this.extent.xmax - 2; 
		}

		if(this.extent.ymin < 0){
			offsetY = -this.extent.ymin;
		}else if(this.extent.ymax > height){
			offsetY = height - this.extent - 2;
		}

		this.extent.offset(offsetX,offsetY);
		this.pos.x += offsetX;
		this.pos.y += offsetY;
	},

	isCollision : function(other){
		if(other == null){
			return false;
		}

		var otherExtent = other.extent;
		return this.extent.intersects(otherExtent);
	}
});
