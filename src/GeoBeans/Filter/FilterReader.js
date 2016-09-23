/**
 * @classdesc
 * XML格式过滤器转换为对象
 * @class
 */
GeoBeans.FilterReader = GeoBeans.Class({
	
	initialize : function(){

	},

	read : function(xml){
		var filter = null;
		// var filterXml = $(xml).find("Filter");
		var filterXML = xml.children();
		if(filterXML.length == 0){
			return null;
		}
		filter = this.parseFilter(filterXML[0]);
		return filter;
	},

	parseFilter : function(xml){
		var filter = null;
		var tagName = xml.tagName;
		tagName = tagName.slice(tagName.lastIndexOf(":")+1, 
				tagName.length);
		tagName = tagName.toLowerCase();
		if(tagName == "bbox"){
			filter = this.parseBBox(xml);
		}else if(tagName.indexOf("propertyis") == 0){
			filter = this.parseBinaryComparision(tagName,xml);
		}else if(tagName == "and" || tagName == "or"){
			filter = this.parseBinaryLogical(tagName,xml);
		}else if(tagName == "not"){
			filter = this.parseUnaryLogic(xml);
		}else if(tagName == "gmlobjectid" || tagName == "featureid"){
			filter = this.parseID(xml);
		}
		return filter;
	},

	parseBBox : function(xml){
		var that = this;
		var bboxFilter = new GeoBeans.Filter.BBoxFilter();
		$(xml).children().each(function(){
			var tagName = this.tagName;
			tagName = tagName.slice(tagName.lastIndexOf(":")+1, 
				tagName.length);
			tagName = tagName.toLowerCase();
			if(tagName == "propertyname"){
				var propertyName = that.parsePropertyName(this);
				bboxFilter.propertyName = propertyName;
			}else if(tagName == "envelope"){
				var envelope = that.parseEnvelope(this);
				bboxFilter.envelope = envelope;
			}
		});
		return bboxFilter;
	},

	parseBinaryComparision : function(operatorName,xml){
		var binaryComparisionFilter = new GeoBeans.Filter.BinaryComparisionFilter();
		var operator = this.parseComparisionOperator(operatorName);
		if(operator == GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprIsBetween){
			var isBetweenFilter = this.parseIsBetween(xml);
			return isBetweenFilter;
		}

		binaryComparisionFilter.operator = operator;

		var children = $(xml).children();
		if(children[0] != null){
			var xml1 = children[0];
			var expression1 = this.parseExpression(xml1);
			if(expression1 != null){
				binaryComparisionFilter.expression1 = expression1;
			}
		}

		if(children[1] != null){
			var xml2 = children[1];
			var expression2 = this.parseExpression(xml2);
			if(expression2 != null){
				binaryComparisionFilter.expression2 = expression2;
			}
		}

		return binaryComparisionFilter;
	},

	parseIsBetween : function(xml){
		var filter = new GeoBeans.Filter.IsBetweenFilter();
		var children = $(xml).children();
		for(var i = 0; i < children.length; ++i){
			var childrenXML = children[i];
			var tagName = childrenXML.tagName;
			tagName = tagName.toLowerCase();
			if(tagName == "ogc:lowerboundary"){
				var lowerXML = $(childrenXML).children();
				if(lowerXML[0] != null){
					var lowerBound = this.parseExpression(lowerXML[0]);
					filter.lowerBound = lowerBound;
				}

			}else if(tagName == "ogc:upperboundary"){
				var upperXML = $(childrenXML).children();
				if(upperXML[0] != null){
					var upperBound = this.parseExpression(upperXML[0]);
					filter.upperBound = upperBound; 
				}
			}else{
				var expression = this.parseExpression(childrenXML);
				filter.expression = expression;
			}
		}
		return filter;
	},
	parseBinaryLogical : function(operator,xml){
		var that = this;
		var binaryLogicFilter = new GeoBeans.Filter.BinaryLogicFilter();
		if(operator == "and"){
			binaryLogicFilter.operator = GeoBeans.Filter.LogicFilter.OperatorType.LogicOprAnd;
		}else if(operator == "or"){
			binaryLogicFilter.operator = GeoBeans.Filter.LogicFilter.OperatorType.LogicOprOr;
		}
		$(xml).children().each(function(){
			var filter = that.parseFilter(this);
			if(filter != null){
				binaryLogicFilter.addFilter(filter);
			}
		})

		return binaryLogicFilter;
	},

	parseUnaryLogic : function(xml){
		var unaryLogicFilter = new GeoBeans.Filter.UnaryLogicFilter();
		var xmlNode = $(xml).children()[0];
		if(xmlNode != null){
			var filter = this.parseFilter(xmlNode);
			if(filter != null){
				unaryLogicFilter.filter = filter;
				return unaryLogicFilter;
			}
		}
		return null;
	},

	parseID : function(xml){
		var doc = $(xml);
		var idFilter = new GeoBeans.Filter.IDFilter();
		while(doc.length != 0){
			var id = doc.attr("gml:id");
			if(id == null){
				id = doc.attr("gml:fid");
			}
			if(id != null){
				var idValue = id.slice(id.lastIndexOf(".") + 1,id.length);
				idFilter.addID(parseInt(idValue));
			}
			doc = doc.next();
		}
		return idFilter;
	},

	parseComparisionOperator : function(oper){
		var operator = null;		
		oper = oper.toLowerCase();
		switch(oper){
			case "propertyisequal":{
				operator = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprEqual;
				break;
			}
			case "propertyisnotequal":{
				operator = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprNotEqual;
				break;
			}
			case "propertyislessthan":{
				operator = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprLessThan;
				break;
			}
			case "propertyisgreaterthan":{
				operator = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprGreaterThan;
				break;
			}
			case "propertyislessthanorequalto":{
				operator = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprLessThanOrEqual;
				break;
			}
			case "propertyisgreaterthanorequalto":{
				operator = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprGreaterThanOrEqual;
				break;
			}
			case "propertyisislike":{
				operator = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprIsLike;
				break;
			}
			case "propertyisisnull":{
				operator = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprIsNull;
				break;
			}
			case "propertyisbetween":{
				operator = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprIsBetween;
				break;
			}
			default:{
				operator = GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprEqual;
			}	break;
		}
		return operator;
	},

	parseExpression : function(xml){
		var expression = null;
		var tagName = xml.tagName;
		tagName = tagName.slice(tagName.lastIndexOf(":")+1, 
				tagName.length);
		tagName = tagName.toLowerCase();
		if(tagName == "propertyname"){
			expression = this.parsePropertyName(xml);
		}else if(tagName == "literal"){
			expression = this.parseLiteral(xml);
		}else if(tagName == "arthmetic"){

		}else if(tagName == "function"){

		}
		return expression;		
	},

	parsePropertyName : function(xml){
		var name = $(xml).text();
		if(name != null){
			var propertyName = new GeoBeans.Expression.PropertyName();
			propertyName.name = name;
			return propertyName;
		}
		return null;
	},

	parseLiteral : function(xml){
		var value = $(xml).text();
		if(name != null){
			var literal = new GeoBeans.Expression.Literal();
			literal.value = value;
			return literal;
		}
		return null;
	},

	parseEnvelope : function(xml){
		var xmin = null;
		var ymin = null;
		var xmax = null;
		var ymax = null;
		$(xml).children().each(function(){
			var tagName = this.tagName;
			tagName = tagName.slice(tagName.lastIndexOf(":")+1, 
					tagName.length);
			tagName = tagName.toLowerCase();	
			if(tagName == "lowercorner"){
				var value = $(this).text();
				var index = value.indexOf(" ");
				var index2 = value.lastIndexOf(" ");
				xmin = value.slice(0, index);
				ymin = value.slice(index2 + 1,value.length);
			}else if(tagName == "uppercorner"){
				var value = $(this).text();
				var index = value.indexOf(" ");
				var index2 = value.lastIndexOf(" ");
				xmax = value.slice(0, index);
				ymax = value.slice(index2 + 1,value.length);
			}	
		});
		if(xmin != null && ymin != null && xmax != null && ymax != null){
			var envelope = new GeoBeans.Envelope(parseFloat(xmin),
				parseFloat(ymin),parseFloat(xmax),parseFloat(ymax));
			return envelope;
		}
		return null;
	}

});