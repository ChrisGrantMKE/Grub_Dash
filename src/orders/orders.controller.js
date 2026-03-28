const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign IDs when necessary
const nextId = require("../utils/nextId");

const VALID_STATUSES = ["pending", "preparing", "out-for-delivery", "delivered"];

function list(request, response) {
	response.json({ data: orders });
}

function orderExists(request, response, next) {
	const orderId = request.params.orderId;
	let foundOrder = null;

	for (let index = 0; index < orders.length; index++) {
		if (orders[index].id === orderId) {
			foundOrder = orders[index];
			break;
		}
	}

	if (foundOrder) {
		response.locals.order = foundOrder;
		return next();
	}

	next({ status: 404, message: `Order does not exist: ${orderId}.` });
}

function validateOrderData(request, response, next) {
	let data = request.body.data;

	if (!data) {
		data = {};
	}

	if (!data.deliverTo) {
		return next({ status: 400, message: "Order must include a deliverTo" });
	}

	if (!data.mobileNumber) {
		return next({ status: 400, message: "Order must include a mobileNumber" });
	}

	if (!data.dishes) {
		return next({ status: 400, message: "Order must include a dish" });
	}

	if (!Array.isArray(data.dishes) || !data.dishes.length) {
		return next({ status: 400, message: "Order must include at least one dish" });
	}

	for (let index = 0; index < data.dishes.length; index++) {
		const dish = data.dishes[index];

		if (!Number.isInteger(dish.quantity) || dish.quantity <= 0) {
			return next({
				status: 400,
				message: `dish ${index} must have a quantity that is an integer greater than 0`,
			});
		}
	}

	response.locals.data = data;
	next();
}

function validateOrderStatus(request, response, next) {
	const data = response.locals.data;
	let validStatus = false;

	if (!data.status) {
		return next({ status: 400, message: "Order must have a status" });
	}

	for (let index = 0; index < VALID_STATUSES.length; index++) {
		if (VALID_STATUSES[index] === data.status) {
			validStatus = true;
			break;
		}
	}

	if (!validStatus) {
		return next({
			status: 400,
			message:
				"Order must have a status of pending, preparing, out-for-delivery, delivered",
		});
	}

	next();
}

function validateOrderId(request, response, next) {
	const data = request.body.data || {};
	const { orderId } = request.params;

	if (data.id && data.id !== orderId) {
		return next({
			status: 400,
			message: `Order id does not match route id. Order: ${data.id}, Route: ${orderId}`,
		});
	}

	next();
}

function create(request, response) {
	const data = response.locals.data;
	const newOrder = {
		id: nextId(),
		deliverTo: data.deliverTo,
		mobileNumber: data.mobileNumber,
		status: data.status || "pending",
		dishes: data.dishes,
	};

	orders.push(newOrder);
	response.status(201).json({ data: newOrder });
}

function read(request, response) {
	response.json({ data: response.locals.order });
}

function update(request, response) {
	const order = response.locals.order;
	const data = response.locals.data;

	order.deliverTo = data.deliverTo;
	order.mobileNumber = data.mobileNumber;
	order.status = data.status;
	order.dishes = data.dishes;

	response.json({ data: order });
}

function validateDeleteStatus(request, response, next) {
	if (response.locals.order.status !== "pending") {
		return next({
			status: 400,
			message: "An order cannot be deleted unless it is pending",
		});
	}

	next();
}

function destroy(request, response) {
	const order = response.locals.order;
	let orderIndex = -1;

	for (let index = 0; index < orders.length; index++) {
		if (orders[index].id === order.id) {
			orderIndex = index;
			break;
		}
	}

	orders.splice(orderIndex, 1);
	response.sendStatus(204);
}

module.exports = {
	list,
	create: [validateOrderData, create],
	read: [orderExists, read],
	update: [orderExists, validateOrderId, validateOrderData, validateOrderStatus, update],
	delete: [orderExists, validateDeleteStatus, destroy],
};
