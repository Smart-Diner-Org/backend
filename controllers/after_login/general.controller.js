var CancellationReason = require('./../../models/CancellationReason');
var City = require('./../../models/City');
var State = require('./../../models/State');

module.exports.getCities = (req, res) => {
	City.findAll({
		attributes: ['id', 'name']
	})
	.then(cities => {
		res.json({
			status: true,
			message:'successfully fetched cities',
			cities : cities
		});
	})
	.catch(err => {
      console.log("got error while fetching cities");
      console.log(err);
      res.status(500).send({ message: err.message });
    });
}

module.exports.getStates = (req, res) => {
	State.findAll({
		attributes: ['id', 'name']
	})
	.then(states => {
		res.json({
			status: true,
			message:'successfully fetched states',
			states : states
		});
	})
	.catch(err => {
      console.log("got error while fetching states");
      console.log(err);
      res.status(500).send({ message: err.message });
    });
}

module.exports.getRestaurantCancellationReasons = (req, res) => {
	CancellationReason.findAll({
		attributes: ['id', 'reason'],
		where: {
			'type' : 'restaurant'
		}
	})
	.then(cancellationReasons => {
		res.json({
			status: true,
			message:'successfully fetched restaurant cancellationReasons',
			cancellationReasons : cancellationReasons
		});
	})
	.catch(err => console.log(err));
}

module.exports.getCustomerCancellationReasons = (req, res) => {
	CancellationReason.findAll({
		attributes: ['id', 'reason'],
		where: {
			'type' : 'customer'
		}
	})
	.then(cancellationReasons => {
		res.json({
			status: true,
			message:'successfully fetched customer cancellationReasons',
			cancellationReasons : cancellationReasons
		});
	})
	.catch(err => console.log(err));
}