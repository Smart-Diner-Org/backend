var Menu = require('./../../models/Menu');
var MenuQuantityMeasurePrice = require('./../../models/MenuQuantityMeasurePrice');
var MenuCategory = require('./../../models/MenuCategory');

exports.getMenuCategoriesList =  async (req, res) => {
	var menuCategories = await MenuCategory.findAll({
		attributes: ['id', 'name'],
		where: {
			status: true
		}
	}).catch((err) => {
		console.log(err);
		res.status(500).send({ message: err.message });
	});
	if(!menuCategories || menuCategories === undefined){
		return res.status(404).send({ message: "Could not found menu categories." });
	}
	res.status(200).send({
		menuCategories: menuCategories
	});
};

exports.addMenuCategories = async (req, res) => {
	console.log("menuCategories...");
	console.log(req.body.menuCategories);
	if(!req.body.menuCategories || !(req.body.menuCategories && req.body.menuCategories.length <= 0)){
		return res.status(404).send({ message: "Menu categories list is missing" });
	}
	var menuCategoriesToSave = [];
	req.body.menuCategories.forEach((category, index)  => {
		menuCategoriesToSave.push({'name': category.toLowerCase()});
	});
	console.log("category...");
	console.log(menuCategoriesToSave);
	var savedMenuCategories = await MenuCategory.bulkCreate(menuCategoriesToSave)
	// .catch((err) => {
	// 	console.log(err);
	// 	res.status(500).send({ message: err.message });
	// })
	;
	if(!savedMenuCategories || savedMenuCategories === undefined){
		return res.status(404).send({ message: "Something happened while saving. couldn't save the menu categories" });
	}
	else{
		res.status(200).send({
			savedMenuCategories: savedMenuCategories
		});
	}
};