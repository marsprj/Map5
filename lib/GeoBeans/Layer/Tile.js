GeoBeans.Tile = GeoBeans.Class({
	
	map : null,
	image : null,
	url : null,
	row : null,
	col : null,
	level : null,
	layer : null,
	
	initialize : function(map,url, layer, row, col, level){
		this.map = map;
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
		if(this.image.complete && this.image.height != 0 && this.width != 0){
			if(this.map.level == this.level){
				renderer.drawImage(this.image, x, y, w, h);	
			}
		}
		else{
			var tile = this;
			this.image.onload = function(){
				if(tile.map.level == tile.level){
					renderer.drawImage(tile.image, x, y, w, h);
				}
			};
		}
	}
});
