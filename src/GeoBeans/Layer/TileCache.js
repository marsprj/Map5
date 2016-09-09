GeoBeans.TileCache = GeoBeans.Class({
	
	cache : null,
	
	initialize : function(){
		this.cache = [];
	},
	
	destory : function(){
		this.cache = null;
	},
	
	putTile : function(tile){
		var url = tile.url;
		var c = this.getTile(url);
		if(c!=null){
			return false;
		}
		else{
			this.cache.push(tile);
		}
	},
	
	getTile : function(url){
		var t = null;
		var len = this.cache.length;
		for(var i=0; i<len; i++){
			t = this.cache[i];
			if(t.url == url){
				return t;
			}
		}
		return null;
	},

	removeTile : function(tile){
		if(tile == null){
			return;
		}
		var t = null;
		for(var i = 0; i < this.cache.length;++i){
			t = this.cache[i];
			if(t.url == tile.url){
				this.cache.splice(i,1);
			}
		}
	}
});
