GeoBeans.BinaryComparisionFilter = GeoBeans.Class(GeoBeans.ComparisionFilter,{

	expression1	: null,
	expression2 : null,
	

	initialize : function(operator,expression1,expression2){
		GeoBeans.ComparisionFilter.prototype.initialize.apply(this,arguments);
		this.operator = operator;
		this.expression1 = expression1;
		this.expression2 = expression2;
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
		if(this.operator != null){
			clone.operator = this.operator;
		}
		return clone;
	}
});