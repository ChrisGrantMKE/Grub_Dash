const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign IDs when necessary
const nextId = require("../utils/nextId");

const VALID_STATUSES = ["pending", "preparing", "out-for-delivery", "delivered"];

function list(request, response) {
	response.json({ data: orders });
}
