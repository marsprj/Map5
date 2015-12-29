GeoBeans.IsLikeFilter = GeoBeans.Class(GeoBeans.ComparisionFilter,{
	properyName : null,
	literal 	: null,

	initialize : function(){
		GeoBeans.ComparisionFilter.prototype.initialize.apply(this,arguments);
		this.operator = GeoBeans.ComparisionFilter.OperatorType.ComOprIsLike;
	}
});