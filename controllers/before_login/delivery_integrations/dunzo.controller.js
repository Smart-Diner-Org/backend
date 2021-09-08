var DeliveryRequest = require('./../../../models/DeliveryRequest');
var constants = require('./../../../config/constants');
var Order = require('./../../../models/Order');
var Customer = require('./../../../models/Customer');

exports.handleTaskStatusWebhook= async (req, res) => {
	console.log("dunzo webhook handler");
	console.log("**************---------**********\n\n\n\n");
	console.log(req.body);

	try{
		if(req.body && req.body.task_id && req.body.state){
			var deliveryRequest = await DeliveryRequest.findOne({
				where: {
					task_id: req.body.task_id
				}
			});
			var deliveryRequestStageId = null;
			var runnerDetail = null;
			var orderStageId = null;
			var price=-1;
			if(deliveryRequest){
				switch(req.body.state){
					case 'runner_accepted': //Save runner detail
						deliveryRequestStageId = constants.deliveryStages['accepted'];
						if(req.body['runner']){
							runnerDetail = req.body['runner'];
						}
						else{
							console.log("Runner details is not available in the dunzo webhook");
						}
						break;
					case 'reached_for_pickup': //Save runner detail
						//should add a new stage in the delivery request table - later
						deliveryRequestStageId = constants.deliveryStages['reachedForPickup'];
						if(req.body['runner']){
							runnerDetail = req.body['runner'];
						}
						else{
							console.log("Runner details is not available in the dunzo webhook");
						}
						// Send a push notification
						break;
					case 'pickup_complete':
					case 'started_for_delivery':
						//should add a new stage in the delivery request table - later
						//update order stage as well
						deliveryRequestStageId = constants.deliveryStages['picked'];
						orderStageId = constants.orderStatges['outForDelivery'];
						break;
					case 'reached_for_delivery':
						//should add a new stage in the delivery request table
						deliveryRequestStageId = constants.deliveryStages['reachedForDelivery'];
						break;					
					case 'delivered': // Need to save "price" as well here
						//update order stage as well
						deliveryRequestStageId = constants.deliveryStages['completed'];
						orderStageId = constants.orderStatges['delivered'];
						price = req.body['price'];
						break;
					case 'runner_cancelled':
						deliveryRequestStageId = constants.deliveryStages['runnerCancelled'];
						break;
					case 'queued': // Should go to default
					case 'location_added': //(in case of return task, first location_cancelled event is sent and then location_added event is sent)
					case 'location_cancelled': //(sent if client cancels drop (can only do before runner purchase) or a return is created by operator. In case of return, first location_cancelled event is sent and then location_added event is sent)
					default:
				}
				if(deliveryRequestStageId){
					var dataToUpdateDeliveryRequest = {
						delivery_stage_id : deliveryRequestStageId
					};
					if(runnerDetail){
						var deliveyPersonId = null;
						var deliveryAgent = await Customer.findOne({
							where: {
								mobile: runnerDetail['phone_number'],
								role_id: constants.roles['deliveryAgent']
							}
						});
						if(!deliveryAgent){
							var dataToSave = {
							    name: runnerDetail['name'],
							    mobile: runnerDetail['phone_number'],
							    role_id: constants.roles['deliveryAgent']
							};
							var savedCustomer = await Customer.create(dataToSave);
							if(!savedCustomer){
								console.log("Could not create the customer entry in the dunzo webhook");
							}
							else deliveyPersonId = savedCustomer.id;
						}
						else deliveyPersonId = deliveryAgent.id;
						if(deliveyPersonId){
							dataToUpdateDeliveryRequest['delivery_person_id'] = deliveyPersonId;
						}
					}
					if(price > -1){
						dataToUpdateDeliveryRequest['price'] = price;
					}
					var updatedDeliveryRequest = await deliveryRequest.update(dataToUpdateDeliveryRequest);
					if(!updatedDeliveryRequest){
						console.log("Update Delivery Request failed in the dunzo webhook");
					}
				}
				if(orderStageId){
					var updatedOrder = await Order.update(
						{ stage_id: req.body.orderStageId },
						{ where: { id: deliveryRequest.order_id }}
					);
					if(!updatedOrder){
						console.log("Update Order stage failed in the dunzo webhook");
					}
				}

			}
			else console.log("Dunzo webhook. Could not find Delivery request for the task.");
		}
		else {
			console.log("Dunzo webhook did not provide the task id or the state value");
			res.status(402).send({ message: "Couldn't found the task id or the state value" });
		}
	}
	catch(exception){
		console.log("Exception happened while handling the dunzo webhook.");
	}

	return res.status(200).send({ message: "Success" });
};