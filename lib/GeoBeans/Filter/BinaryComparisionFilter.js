GeoBeans.BinaryComparisionFilter = GeoBeans.Class(GeoBeans.ComparisionFilter,{

	expression1	: null,
	expression2 : null,
	

	initialize : function(){
		GeoBeans.ComparisionFilter.prototype.initialize.apply(this,arguments);
	},

	clone : function(){
		var clone = new GeoBeans.BinaryComparisionFilter();
		clone.type = this.type;
		if(this.expression1 != null){
			clone.expression1 = this.expression1.clone();
		}
		if(this.expression2 != null){
			clone.expression2 = this.expression2.clone();
		}
		return clone;
	}
});