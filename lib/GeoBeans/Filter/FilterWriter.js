GeoBeans.FilterWriter = GeoBeans.Class({
	
	initialize : function(){

	},

	write : function(xml,filter){
		if(filter == null){
			return null;
		}
		var filterXML = xml.createElement("ogc:Filter");
		var filterTypeXML = this.writeFilter(xml,filter);
		$(filterXML).append(filterTypeXML);
		return filterXML;
	},

	writeFilter : function(xml,filter){
		var type = filter.type;
		var filterXML = null;
		if(type == GeoBeans.Filter.Type.FilterID){
			filterXML = this.writeIDFilter(xml,filter);
		}else if(type == GeoBeans.Filter.Type.FilterComparsion){
			filterXML = this.writeComparsionFilter(xml,filter);
		}else if(type == GeoBeans.Filter.Type.FilterLogic){
			filterXML = this.writeLogicFilter(xml,filter);
		}else if(type == GeoBeans.Filter.Type.FilterSpatial){

		}	
		return filterXML;	
	},

	writeIDFilter : function(xml,idFilter){

	},

	writeComparsionFilter : function(xml,comparisionFilter){
		var operator = comparisionFilter.operator;
		var comparsionXML = null;

		if(operator == GeoBeans.ComparisionFilter.OperatorType.ComOprEqual){
			comparsionXML = xml.createElement("ogc:PropertyIsEqualTo");
			var expression1 = comparisionFilter.expression1;
			var expression2 = comparisionFilter.expression2;
			var expression1XML = this.writeExpression(xml,expression1);
			var expression2XML = this.writeExpression(xml,expression2);
			$(comparsionXML).append(expression1XML);
			$(comparsionXML).append(expression2XML);
		}else if(operator == GeoBeans.ComparisionFilter.OperatorType.ComOprNotEqual){
			comparsionXML = xml.createElement("ogc:PropertyIsNotEqual");
			var expression1 = comparisionFilter.expression1;
			var expression2 = comparisionFilter.expression2;
			var expression1XML = this.writeExpression(xml,expression1);
			var expression2XML = this.writeExpression(xml,expression2);
			$(comparsionXML).append(expression1XML);
			$(comparsionXML).append(expression2XML);
		}else if(operator == GeoBeans.ComparisionFilter.OperatorType.ComOprLessThan){
			comparsionXML = xml.createElement("ogc:PropertyIsLessThan");
			var expression1 = comparisionFilter.expression1;
			var expression2 = comparisionFilter.expression2;
			var expression1XML = this.writeExpression(xml,expression1);
			var expression2XML = this.writeExpression(xml,expression2);
			$(comparsionXML).append(expression1XML);
			$(comparsionXML).append(expression2XML);
		}else if(operator == GeoBeans.ComparisionFilter.OperatorType.ComOprGreaterThan){
			comparsionXML = xml.createElement("ogc:PropertyIsGreaterThan");
			var expression1 = comparisionFilter.expression1;
			var expression2 = comparisionFilter.expression2;
			var expression1XML = this.writeExpression(xml,expression1);
			var expression2XML = this.writeExpression(xml,expression2);
			$(comparsionXML).append(expression1XML);
			$(comparsionXML).append(expression2XML);
		}else if(operator == GeoBeans.ComparisionFilter.OperatorType.ComOprLessThanOrEqual){
			comparsionXML = xml.createElement("ogc:PropertyIsLessThanOrEqualTo");
			var expression1 = comparisionFilter.expression1;
			var expression2 = comparisionFilter.expression2;
			var expression1XML = this.writeExpression(xml,expression1);
			var expression2XML = this.writeExpression(xml,expression2);
			$(comparsionXML).append(expression1XML);
			$(comparsionXML).append(expression2XML);
		}else if(operator == GeoBeans.ComparisionFilter.OperatorType.ComOprGreaterThanOrEqual){
			comparsionXML = xml.createElement("ogc:PropertyIsGreaterThanOrEqualTo");
			var expression1 = comparisionFilter.expression1;
			var expression2 = comparisionFilter.expression2;
			var expression1XML = this.writeExpression(xml,expression1);
			var expression2XML = this.writeExpression(xml,expression2);
			$(comparsionXML).append(expression1XML);
			$(comparsionXML).append(expression2XML);
		}else if(operator == GeoBeans.ComparisionFilter.OperatorType.ComOprIsLike){
			comparsionXML = xml.createElement("ogc:PropertyIsIsLike");
			
		}else if(operator == GeoBeans.ComparisionFilter.OperatorType.ComOprIsNull){
			comparsionXML = xml.createElement("ogc:PropertyIsIsNull");
			
		}else if(operator == GeoBeans.ComparisionFilter.OperatorType.ComOprIsBetween){
			comparsionXML = xml.createElement("ogc:PropertyIsIsBetween");
			
		}
		return comparsionXML;

	},
	writeExpression : function(xml,expression){
		var expressionXML = null;
		var type = expression.type;
		if(type == GeoBeans.Expression.Type.Arithmetic){

		}else if(type == GeoBeans.Expression.Type.PropertyName){
			expressionXML = xml.createElement("ogc:PropertyName");
			var name = expression.name;
			$(expressionXML).text(name);
		}else if(type == GeoBeans.Expression.Type.Literal){
			expressionXML = xml.createElement("ogc:Literal");
			var value = expression.value;
			$(expressionXML).text(value);
		}else if(type == GeoBeans.Expression.Type.Function){
			
		}
		return expressionXML;
	},

	writeLogicFilter : function(xml,logicFilter){
		var operator = logicFilter.operator;
		var logicXML = null;
		if(operator == GeoBeans.LogicFilter.OperatorType.LogicOprAnd){
			logicXML = xml.createElement("ogc:And");
		}else if(operator == GeoBeans.LogicFilter.OperatorType.LogicOprOr){
			logicXML = xml.createElement("ogc:Or");
		}else if(operator == GeoBeans.LogicFilter.OperatorType.LogicOprNot){
			logicXML = xml.createElement("ogc:Not");
			var filter = logicFilter.filter;
			var filterXML = this.writeFilter(xml,filter);
			$(logicXML).append(filterXML);
			return logicXML;
		}

		var filters = logicFilter.filters;
		for(var i = 0; i < filters.length; ++i){
			var filter = filters[i];
			var filterXML = this.writeFilter(xml,filter);
			$(logicXML).append(filterXML);
		}
		return logicXML;
	}

});