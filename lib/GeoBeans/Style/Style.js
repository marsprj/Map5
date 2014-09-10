GeoBeans.Style = GeoBeans.Class({
	rules : null,
	
	initialize : function(name){
		//GeoBeans.prototype.initialize.apply(this, arguments);
		
		this.rules = [];
	},
	
	destory : function(){
		this.rules = null;		
		//GeoBeans.prototype.destroy.apply(this, arguments);
	},
	
	addRule : function(rule){
		if(rule==null){
			return;
		}
		this.rules.push(rule);
	}
});