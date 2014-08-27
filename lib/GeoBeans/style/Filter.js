GeoBeans.Filter = GeoBeans.Class({
	field : null,
	value : null,
	
	initialize : function(field, value){
		this.field = field;
		this.value = value;
	},
	
	destory : function(){
		this.field = null;
		this.value = null;
	}
});
