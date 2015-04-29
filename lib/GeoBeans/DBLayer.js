GeoBeans.Layer.DBLayer = GeoBeans.Class(GeoBeans.Layer,{
	queryable : null,

	initialize : function(){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
	}
});