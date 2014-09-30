
GeoBeans.Control = GeoBeans.Class({
	type : null,
	map : null,
	enable : true,
	
	initialize : function(name){
		//GeoBeans.Class.prototype.initialize.apply(this, arguments);
	},
	
	destory : function(){
		//GeoBeans.Class.prototype.destory.apply(this, arguments);
	},
	
	attach : function(map){
		this.map = map;
	},
	
	detach : function(){
		this.map = map;
	},
	
	enable : function(f){
		this.enable = f;
	}
});


GeoBeans.Control.Controls = GeoBeans.Class({
	map : null,
	controls : [],
	
	initialize : function(map){
		this.map = map;
	},

	destory : function(){
		this.controls = null;
	},
	
	add : function(c){
		if( (c==null) || (c=='undefined')){
			return;
		}
		var i = this.find(c.type);
		if(i<0){
			c.attach(this.map);
			this.controls.push(c);
		}
		else{
			this.controls[i] = null;
			this.controls[i] = c;
		}
	},
	
	remove : function(c){
		if( (c==null) || (c=='undefined')){
			return;
		}
		var i = this.find(c.type);
		if(i>=0){
			this.controls[i] = null;
			this.controls[i].splice(i,1);
		}
	},
	
	find : function(t){
		var len = this.controls.length;
		for(var i=0; i<len; i++){
			var c = this.controls[i];
			if(c.type==t){
				return i;
			}
		}
		return -1;
	},
	
	cleanup : function(){
		var len = this.controls.length;
		for(var i=0; i<len; i++){
			this.controls[i] = null;
		}
		this.controls = [];
	}
});