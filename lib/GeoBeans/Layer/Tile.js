GeoBeans.Tile = GeoBeans.Class({
	
	image : null,
	url : null,
	row : null,
	col : null,
	level : null,
	layer : null,
	
	initialize : function(url, layer, row, col, level){
		this.url = url;
		this.row = row;
		this.col = col;
		this.level = level;
		this.layer = layer;
	},
	
	draw : function(x, y, w, h){
		var renderer = this.layer.map.renderer;
		if(this.image==null){
			this.image = new Image();
			this.image.src = this.url;
		}
		if(this.image.complete){
			renderer.drawImage(this.image, x, y, w, h);	
		}
		else{
			var tile = this;
			this.image.onload = function(){
				renderer.drawImage(tile.image, x, y, w, h);
			};
		}
	}
});
