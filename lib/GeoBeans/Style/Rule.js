GeoBeans.Style.Rule = GeoBeans.Class({
	
	symbolizer : null,
	filter : null,
		
	initialize : function(symbolizer, filter){
		//GeoBeans.prototype.initialize.apply(this, arguments);
		
		this.symbolizer = symbolizer;
		this.filter = filter;
	},
	
	destory : function(){
		this.filter;
		this.symbolizer = null;		
		//GeoBeans.prototype.destroy.apply(this, arguments);
	},
});