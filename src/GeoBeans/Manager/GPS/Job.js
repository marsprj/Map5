GeoBeans.Job = GeoBeans.Class({
	uuid 		: null,
	oper		: null,
	params		: null,
	client		: null,
	server		: null,
	startTime	: null,
	endTime		: null,
	status		: null,


	initialize : function(uuid,oper,params,client,server,startTime,endTime,status){
		this.uuid = uuid;
		this.oper = oper;
		this.params = params;
		this.client = client;
		this.server = server;
		this.startTime = startTime;
		this.endTime = endTime;
		this.status = status;
	},

});

GeoBeans.Job.Status = {
	CANCELED 	: "Canceled",
	RUNNING 	: "Running",
	FINISHED	: "Finished"
};