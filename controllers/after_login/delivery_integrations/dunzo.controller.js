const https = require('https')

// exports.getToken = async (reque, response) => {
exports.getToken = async () => {
	try {
		return new Promise(resolve => {
			var output='';
			var obj;
			const options = {
			  hostname: process.env.DUNZO_API_HOST,
			  path: process.env.DUNZO_GENERATE_TOKEN_API_PATH,
			  method: 'GET',
			  headers: {
			    'Content-Type': 'application/json',
			    'Accept-Language': 'en_US',
			    'client-id': process.env.DUNZO_CLIENT_ID,
			    'client-secret': process.env.DUNZO_CLIENT_PASSWORD
			  }
			}
			const req = https.request(options, res => {
			  res.on('data', d => {
			  	output += d;
			    // process.stdout.write(d); // printing
			  })
			  res.on('end', () => {
				obj = JSON.parse(output);
				if(obj['token'])
					resolve(obj['token']);
				else resolve(null);
			   })
			})
			req.on('error', error => {
			  resolve(null);
			  // response.status(500).send({ message: error.message });
			})
			req.end()
		});
	}
	catch(exception){
		console.log("Exception happened while getting the access token of Dunzo");
		return null;
	}
}

exports.createTask = async (data) => {
	try {
		var accessToken = await this.getToken();
		if(!accessToken)
			return null;
		var output='';
		var dunzoTaskData = {
			request_id: data.request_id,
			referrence_id: data.referrence_id,
			pickup_details: data.pick_up_details,
			drop_details: data.drop_details,
			optimised_route: true,
			payment_method: 'DUNZO_CREDIT'
		};
		const taskData = JSON.stringify(dunzoTaskData)
		const options = {
		  hostname: process.env.DUNZO_API_HOST,
		  path: process.env.DUNZO_TASK_API_PATH,
		  method: 'POST',
		  headers: {
		    'Content-Type': 'application/json',
		    'Accept-Language': 'en_US',
		    // 'Content-Length': dunzoTaskData.length,
		    'Authorization': accessToken,
		    'client-id': process.env.DUNZO_CLIENT_ID,
		    'client-secret': process.env.DUNZO_CLIENT_PASSWORD
		  }
		}

		return new Promise(resolve => {
			const req = https.request(options, res => {
			  console.log(`statusCode: ${res.statusCode}`)
			  res.on('data', d => {
			  	output += d;
			  })
			  res.on('end', () => {
				let obj = JSON.parse(output);
				// response.status(200).send(obj);
				obj = JSON.parse(output);
				resolve(obj);
			   })
			})
			req.on('error', error => {
			  resolve(null);
			})
			req.write(taskData)
			req.end()
		});
	}
	catch(exception){
		console.log("Exception happened while creating task in Dunzo");
		return null;
	}
};

exports.getStatus = async (deliveryRequest) => {
	console.log("Here 5");
	console.log("deliveryRequest deliveryRequest deliveryRequest ");
	console.log(deliveryRequest);
	console.log(deliveryRequest['order_id']);
	/*console.log("Here 5");
	console.log("deliveryRequest deliveryRequest deliveryRequest ");
	console.log(deliveryRequest);
	console.log(deliveryRequest['task_id']);
	try{
		var accessToken = await this.getToken();
		if(!accessToken)
			return null;
		var output='';
		var obj;
		const options = {
		  hostname: process.env.DUNZO_API_HOST,
		  path: 'api/v1/tasks/d694a1ec-dcb7-41cb-b9ba-a078bb6e7275/status',
		  method: 'GET',
		  headers: {
		    'Content-Type': 'application/json',
		    'Accept-Language': 'en_US',
		    'Authorization': accessToken,
		    'client-id': process.env.DUNZO_CLIENT_ID,
		    'client-secret': process.env.DUNZO_CLIENT_PASSWORD
		  }
		}
		return new Promise(resolve => {
			const req = https.request(options, res => {
			  res.on('data', d => {
			  	output += d;
			    process.stdout.write(d); // printing
			  })
			  res.on('end', () => {
			  	try{
				  	console.log("******** before parsing in  the dunzo *******");
					obj = JSON.parse(output);
					console.log("******** inside the dunzo *******");
					console.log(obj);
					resolve(obj);
				}
				catch(exception){
					console.log("Exception happened while getting the status of a task in Dunzo");
					resolve(null);
				}
			   })
			})
			req.on('error', error => {
			  resolve(null);
			  // response.status(500).send({ message: error.message });
			})
			req.end()
			
		});
	}
	catch(exception){
		console.log("Exception happened while getting the status of a task in Dunzo");
		return null;
	}*/
};





