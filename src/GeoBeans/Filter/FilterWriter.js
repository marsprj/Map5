/**
 * @classdesc
 * 过滤器对象转换为XML格式
 * @class
 */
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
			filterXML = this.writeSpatialFilter(xml,filter);
		}	
		return filterXML;	
	},

	writeIDFilter : function(xml,idFilter){

	},

	writeComparsionFilter : function(xml,comparisionFilter){
		var operator = comparisionFilter.operator;
		var comparsionXML = null;

		if(operator == GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprEqual){
			comparsionXML = xml.createElement("ogc:PropertyIsEqualTo");
			var expression1 = comparisionFilter.expression1;
			var expression2 = comparisionFilter.expression2;
			var expression1XML = this.writeExpression(xml,expression1);
			var expression2XML = this.writeExpression(xml,expression2);
			$(comparsionXML).append(expression1XML);
			$(comparsionXML).append(expression2XML);
		}else if(operator == GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprNotEqual){
			comparsionXML = xml.createElement("ogc:PropertyIsNotEqualTo");
			var expression1 = comparisionFilter.expression1;
			var expression2 = comparisionFilter.expression2;
			var expression1XML = this.writeExpression(xml,expression1);
			var expression2XML = this.writeExpression(xml,expression2);
			$(comparsionXML).append(expression1XML);
			$(comparsionXML).append(expression2XML);
		}else if(operator == GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprLessThan){
			comparsionXML = xml.createElement("ogc:PropertyIsLessThan");
			var expression1 = comparisionFilter.expression1;
			var expression2 = comparisionFilter.expression2;
			var expression1XML = this.writeExpression(xml,expression1);
			var expression2XML = this.writeExpression(xml,expression2);
			$(comparsionXML).append(expression1XML);
			$(comparsionXML).append(expression2XML);
		}else if(operator == GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprGreaterThan){
			comparsionXML = xml.createElement("ogc:PropertyIsGreaterThan");
			var expression1 = comparisionFilter.expression1;
			var expression2 = comparisionFilter.expression2;
			var expression1XML = this.writeExpression(xml,expression1);
			var expression2XML = this.writeExpression(xml,expression2);
			$(comparsionXML).append(expression1XML);
			$(comparsionXML).append(expression2XML);
		}else if(operator == GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprLessThanOrEqual){
			comparsionXML = xml.createElement("ogc:PropertyIsLessThanOrEqualTo");
			var expression1 = comparisionFilter.expression1;
			var expression2 = comparisionFilter.expression2;
			var expression1XML = this.writeExpression(xml,expression1);
			var expression2XML = this.writeExpression(xml,expression2);
			$(comparsionXML).append(expression1XML);
			$(comparsionXML).append(expression2XML);
		}else if(operator == GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprGreaterThanOrEqual){
			comparsionXML = xml.createElement("ogc:PropertyIsGreaterThanOrEqualTo");
			var expression1 = comparisionFilter.expression1;
			var expression2 = comparisionFilter.expression2;
			var expression1XML = this.writeExpression(xml,expression1);
			var expression2XML = this.writeExpression(xml,expression2);
			$(comparsionXML).append(expression1XML);
			$(comparsionXML).append(expression2XML);
		}else if(operator == GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprIsLike){
			comparsionXML = xml.createElement("ogc:PropertyIsLike");
			$(comparsionXML).attr("escapeChar","!");
			$(comparsionXML).attr("singleChar","#");
			$(comparsionXML).attr("wildCard","*");
			var expression1 = comparisionFilter.expression1;
			var expression2 = comparisionFilter.expression2;
			var expression1XML = this.writeExpression(xml,expression1);
			var expression2XML = this.writeExpression(xml,expression2);
			$(comparsionXML).append(expression1XML);
			$(comparsionXML).append(expression2XML);
		}else if(operator == GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprIsNull){
			comparsionXML = xml.createElement("ogc:PropertyIsNull");
			var properyName = comparisionFilter.properyName;
			var properyNameXML = this.writeExpression(xml,properyName);
			$(comparsionXML).append(properyNameXML);
		}else if(operator == GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprIsBetween){
			comparsionXML = xml.createElement("ogc:PropertyIsBetween");
			var expression = comparisionFilter.expression;
			var expressionXML = this.writeExpression(xml,expression);
			$(comparsionXML).append(expressionXML);
			var lowerBound = comparisionFilter.lowerBound;
			var lowerExpressionXML = this.writeExpression(xml,lowerBound);
			var upperBound = comparisionFilter.upperBound;
			var upperExpressionXML = this.writeExpression(xml,upperBound);
			var lowerBoundaryXML = xml.createElement("ogc:LowerBoundary");
			$(lowerBoundaryXML).append(lowerExpressionXML);
			var upperBoundaryXML = xml.createElement("ogc:UpperBoundary");
			$(upperBoundaryXML).append(upperExpressionXML);
			$(comparsionXML).append(lowerBoundaryXML);
			$(comparsionXML).append(upperBoundaryXML);
			
		}
		return comparsionXML;

	},
	writeExpression : function(xml,expression){
		if(xml == null || expression == null){
			return "";
		}
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
	},

	writeSpatialFilter : function(xml,filter){
		var operator = filter.operator;
		var spatialXML = null;
		switch(operator){
			case GeoBeans.Filter.SpatialFilter.OperatorType.SpOprBBox:{
				spatialXML = this.writeBBoxFilter(xml,filter);
				break;
			}
			case GeoBeans.Filter.SpatialFilter.OperatorType.SpOprIntersects:{
				spatialXML = this.writeSpatialFilterIntersects(xml,filter);
				break;
			}
			case GeoBeans.Filter.SpatialFilter.OperatorType.SpOprDWithin:{
				spatialXML = this.writeSpatialFilterDWithin(xml,filter);
				break;
			}
			case GeoBeans.Filter.SpatialFilter.OperatorType.SpOprWithin:{
				spatialXML = this.writeSpatialFilterWithin(xml,filter);
				break;
			}
			case GeoBeans.Filter.SpatialFilter.OperatorType.SpOprContains:{
				spatialXML = this.writeSpatialFilterContains(xml,filter);
				break;
			}

			case GeoBeans.Filter.SpatialFilter.OperatorType.SpOprDisjoint:{
				spatialXML = this.writeSpatialFilterDisjoint(xml,filter);
				break;
			}
			case GeoBeans.Filter.SpatialFilter.OperatorType.SpOprEquals:{
				spatialXML = this.writeSpatialFilterEquals(xml,filter);
				break;
			}
			case GeoBeans.Filter.SpatialFilter.OperatorType.SpOprTouches:{
				spatialXML = this.writeSpatialFilterTouches(xml,filter);
				break;
			}
			case GeoBeans.Filter.SpatialFilter.OperatorType.SpOprCrosses:{
				spatialXML = this.writeSpatialFilterCrosses(xml,filter);
				break;
			}
			case GeoBeans.Filter.SpatialFilter.OperatorType.SpOprBeyond:{
				spatialXML = this.writeSpatialFilterBeyond(xml,filter);
				break;
			}
			case  GeoBeans.Filter.SpatialFilter.OperatorType.SpOprOverlaps:{
				spatialXML = this.writeSpatialFilterOverlaps(xml,filter);
				break;
			}
			default:
				break;
		}
		
		return spatialXML;
	},

	writeBBoxFilter : function(xml,bboxFilter){
		var filterXML = xml.createElement("ogc:BBOX");
		var propName = bboxFilter.propName;
		var prop = new GeoBeans.PropertyName();
		prop.setName(propName);
		var propXML = this.writeExpression(xml,prop);
		$(filterXML).append(propXML);
		var extent = bboxFilter.extent;
		var bboxXML = this.writeEnvelope(xml,extent);
		$(filterXML).append(bboxXML);
		return filterXML;
	},

	writeEnvelope : function(xml,extent){
		// var xmin = extent.xmin;
		// var ymin = extent.ymin;
		// var xmax = extent.xmax;
		// var ymax = extent.ymax;	
		// var bboxXML = xml.createElement("gml:Envelope");
		// var lowerXML = xml.createElement("gml:lowerCorner");
		// $(lowerXML).text(xmin + " " + ymin);
		// var upperXML = xml.createElement("gml:upperCorner");
		// $(upperXML).text(xmax + " " + ymax);
		// $(bboxXML).append(lowerXML);
		// $(bboxXML).append(upperXML);

		var bboxXML = xml.createElement("gml:Box");
		var extentXml = xml.createElement("gml:coordinates");
		var str = extent.xmin + "," + extent.ymin + " " + extent.xmax + "," + extent.ymax;
		$(extentXml).text(str);
		$(bboxXML).append(extentXml);
		return bboxXML;
	},

	writeSpatialFilterIntersects : function(xml,filter){
		var filterXML = xml.createElement("Intersects");
		var geometry  = filter.geometry;
		var propName = filter.propName;
		var gmlWriter = new GeoBeans.Format.GML.Writer(GeoBeans.Format.GML.Version.v_2_0);
		var geomGml = gmlWriter.write(geometry);
		var propXML = xml.createElement("PropertyName");
		$(propXML).text(propName);
		$(filterXML).append(propXML);
		$(filterXML).append(geomGml);
		return filterXML;
	},


	writeSpatialFilterDWithin : function(xml,filter){
		var filterXML = xml.createElement("DWithin");
		var geometry = filter.geometry;
		var distance = filter.distance;
		var propName = filter.propName;
		var gmlWriter = new GeoBeans.Format.GML.Writer(GeoBeans.Format.GML.Version.v_2_0);
		var geomGml = gmlWriter.write(geometry);

		var propXML = xml.createElement("PropertyName");
		$(propXML).text(propName);

		var distanceXML = xml.createElement("Distance");
		// $(distanceXML).attr("units","meter");
		$(distanceXML).text(distance);
		$(filterXML).append(propXML);
		$(filterXML).append(geomGml);
		$(filterXML).append(distanceXML);
		return filterXML;
	},

	writeSpatialFilterWithin : function(xml,filter){
		var filterXML = xml.createElement("Within");
		var geometry = filter.geometry;
		var propName = filter.propName;

		var gmlWriter = new GeoBeans.Format.GML.Writer(GeoBeans.Format.GML.Version.v_2_0);
		var geomGml = gmlWriter.write(geometry);

		var propXML = xml.createElement("PropertyName");
		$(propXML).text(propName);

		$(filterXML).append(propXML);
		$(filterXML).append(geomGml);
		return filterXML;
	},


	writeSpatialFilterContains : function(xml,filter){
		var filterXML = xml.createElement("Contains");
		var geometry = filter.geometry;
		var propName = filter.propName;

		var gmlWriter = new GeoBeans.Format.GML.Writer(GeoBeans.Format.GML.Version.v_2_0);
		var geomGml = gmlWriter.write(geometry);

		var propXML = xml.createElement("PropertyName");
		$(propXML).text(propName);

		$(filterXML).append(propXML);
		$(filterXML).append(geomGml);
		return filterXML;
	},


	writeSpatialFilterDisjoint : function(xml,filter){
		var filterXML = xml.createElement("Disjoint");
		var geometry = filter.geometry;
		var propName = filter.propName;

		var gmlWriter = new GeoBeans.Format.GML.Writer(GeoBeans.Format.GML.Version.v_2_0);
		var geomGml = gmlWriter.write(geometry);

		var propXML = xml.createElement("PropertyName");
		$(propXML).text(propName);

		$(filterXML).append(propXML);
		$(filterXML).append(geomGml);
		return filterXML;
	},


	writeSpatialFilterEquals : function(xml,filter){
		var filterXML = xml.createElement("Equals");
		var geometry = filter.geometry;
		var propName = filter.propName;

		var gmlWriter = new GeoBeans.Format.GML.Writer(GeoBeans.Format.GML.Version.v_2_0);
		var geomGml = gmlWriter.write(geometry);

		var propXML = xml.createElement("PropertyName");
		$(propXML).text(propName);

		$(filterXML).append(propXML);
		$(filterXML).append(geomGml);
		return filterXML;		
	},

	writeSpatialFilterTouches : function(xml,filter){
		var filterXML = xml.createElement("Touches");
		var geometry = filter.geometry;
		var propName = filter.propName;

		var gmlWriter = new GeoBeans.Format.GML.Writer(GeoBeans.Format.GML.Version.v_2_0);
		var geomGml = gmlWriter.write(geometry);

		var propXML = xml.createElement("PropertyName");
		$(propXML).text(propName);

		$(filterXML).append(propXML);
		$(filterXML).append(geomGml);
		return filterXML;		
	},

	writeSpatialFilterCrosses : function(xml,filter){
		var filterXML = xml.createElement("Crosses");
		var geometry = filter.geometry;
		var propName = filter.propName;

		var gmlWriter = new GeoBeans.Format.GML.Writer(GeoBeans.Format.GML.Version.v_2_0);
		var geomGml = gmlWriter.write(geometry);

		var propXML = xml.createElement("PropertyName");
		$(propXML).text(propName);

		$(filterXML).append(propXML);
		$(filterXML).append(geomGml);
		return filterXML;	
	},

	writeSpatialFilterBeyond : function(xml,filter){
		var filterXML = xml.createElement("Beyond");
		var geometry = filter.geometry;
		var distance = filter.distance;
		var propName = filter.propName;
		var gmlWriter = new GeoBeans.Format.GML.Writer(GeoBeans.Format.GML.Version.v_2_0);
		var geomGml = gmlWriter.write(geometry);

		var propXML = xml.createElement("PropertyName");
		$(propXML).text(propName);

		var distanceXML = xml.createElement("Distance");
		$(distanceXML).text(distance);
		$(filterXML).append(propXML);
		$(filterXML).append(geomGml);
		$(filterXML).append(distanceXML);
		return filterXML;		
	},

	writeSpatialFilterOverlaps : function(xml,filter){
		var filterXML = xml.createElement("Overlaps");
		var geometry = filter.geometry;
		var propName = filter.propName;

		var gmlWriter = new GeoBeans.Format.GML.Writer(GeoBeans.Format.GML.Version.v_2_0);
		var geomGml = gmlWriter.write(geometry);

		var propXML = xml.createElement("PropertyName");
		$(propXML).text(propName);

		$(filterXML).append(propXML);
		$(filterXML).append(geomGml);
		return filterXML;		
	},

});