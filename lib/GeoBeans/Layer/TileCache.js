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
	}
	
});
