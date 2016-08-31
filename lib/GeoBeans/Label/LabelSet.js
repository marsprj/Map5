GeoBeans.LabelSet = GeoBeans.Class({

	name : null,

	labels : null,

	initialize : function(name){
		this.name = name;
		this.labels = [];
	},

	addLabel : function(label){
		if(label == null){
			return;
		}
		this.labels.push(label);
	},


	isCollision : function(label){
		if(label == null){
			return false;
		}

		for(var i = 0; i < this.labels.length;++i){
			var l = this.labels[i];
			if(l.isCollision(label)){
				return true;
			}
		}
		return false;
	},
});