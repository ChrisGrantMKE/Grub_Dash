const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

function list(request, response) {
	response.json({ data: dishes });
}

function dishExists(request, response, next) {
	const dishId = request.params.dishId;
	let foundDish = null;

	for (let index = 0; index < dishes.length; index++) {
		if (dishes[index].id === dishId) {
			foundDish = dishes[index];
			break;
		}
	}

	if (foundDish) {
		response.locals.dish = foundDish;
		return next();
	}

	next({ status: 404, message: "Dish does not exist: " + dishId + "." });
}

function validateDishData(request, response, next) {
	let data = request.body.data;

	if (!data) {
		data = {};
	}

	if (!data.name) {
		return next({ status: 400, message: "Dish must include a name" });
	}

	if (!data.description) {
		return next({ status: 400, message: "Dish must include a description" });
	}

	if (!data.image_url) {
		return next({ status: 400, message: "Dish must include a image_url" });
	}

	if (!Number.isInteger(data.price) || data.price <= 0) {
		return next({
			status: 400,
			message: "Dish must have a price that is an integer greater than 0",
		});
	}

	response.locals.data = data;
	next();
}

function validateDishId(request, response, next) {
	let data = request.body.data;
	const dishId = request.params.dishId;

	if (!data) {
		data = {};
	}

	if (data.id && data.id !== dishId) {
		return next({
			status: 400,
			message:
				"Dish id does not match route id. Dish: " + data.id + ", Route: " + dishId,
		});
	}

	next();
}

function create(request, response) {
	const data = response.locals.data;
	const newDish = {
		id: nextId(),
		name: data.name,
		description: data.description,
		price: data.price,
		image_url: data.image_url,
	};

	dishes.push(newDish);
	response.status(201).json({ data: newDish });
}

function read(request, response) {
	response.json({ data: response.locals.dish });
}

function update(request, response) {
	const dish = response.locals.dish;
	const data = response.locals.data;

	dish.name = data.name;
	dish.description = data.description;
	dish.price = data.price;
	dish.image_url = data.image_url;

	response.json({ data: dish });
}

module.exports = {
	list,
	create: [validateDishData, create],
	read: [dishExists, read],
	update: [dishExists, validateDishId, validateDishData, update],
};