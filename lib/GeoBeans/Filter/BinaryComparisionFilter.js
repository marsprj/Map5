GeoBeans.BinaryComparisionFilter = GeoBeans.Class(GeoBeans.ComparisionFilter,{

	expression1	: null,
	expression2 : null,
	

	initialize : function(){
		GeoBeans.ComparisionFilter.prototype.initialize.apply(this,arguments);
	}
});