/**
 * @classdesc
 * 排序类
 * @class
 */
GeoBeans.Query.OrderBy = GeoBeans.Class({
	fields : null,

	order : null,

	initialize : function(){
		this.fields = [];
	},

	destory : function(){
		this.fields = null;
	},

	addField : function(field){
		if(field != null){
			this.fields.push(field);
		}
	},

	getField : function(index){
		if(index < 0  || index >= this.fields.length){
			return null;
		}
		return this.fields[index];
	},

	getFields : function(){
		return fields;
	},

	getFieldCount : function(){
		return this.fields.length;
	},

	setOrder : function(order){
		this.order = order;
	},

	isAsc : function(){
		return this.order == GeoBeans.OrderBy.OrderType.OrderAsc;
	}

});

GeoBeans.OrderBy.OrderType = {
	OrderAsc : "asc",
	OrderDesc : "desc"
}