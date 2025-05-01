-- Addresses
INSERT INTO address (addressid, street_1, street_2, city, state, zip_code) VALUES
(1, '123 Main St', 'Apt 1A', 'Cincinnati', 'OH', '45220'),
(2, '456 Oak St', NULL, 'Columbus', 'OH', '43004'),
(3, '789 Pine Rd', 'Suite 3', 'Cleveland', 'OH', '44101');

-- Warehouses
INSERT INTO warehouse (warehouseid, location, max_capacity) VALUES
(1, 'North Warehouse', 10000),
(2, 'East Distribution', 15000);

-- Customers
INSERT INTO customer (customerid, cartid, first_name, last_name, email, balance, addressid) VALUES
(1, 1001, 'Alice', 'Johnson', 'alice.johnson@example.com', 200.00, 1),
(2, 1002, 'Bob', 'Smith', 'bob.smith@example.com', 150.00, 2);

-- Staff
INSERT INTO staff (staffid, first_name, last_name, salary, job_title, addressid, warehouseid) VALUES
(1, 'Jane', 'Doe', 60000.00, 'Manager', 2, 1),
(2, 'John', 'Roe', 45000.00, 'Picker', 3, 2);

-- Products
INSERT INTO product (productid, name, price, category, brand, size, description) VALUES
(1, 'Cool Hoodie', 29.99, 'Clothing', 'HypeBrand', 'M', 'A comfy cotton hoodie'),
(2, 'Sleek Sneakers', 59.99, 'Footwear', 'RunFast', '10', 'Stylish running shoes'),
(3, 'Wireless Earbuds', 89.99, 'Electronics', 'SoundMax', 'One Size', 'Noise-canceling earbuds'),
(4, 'Fitness Tracker', 120.00, 'Electronics', 'TrackFit', 'One Size', 'Waterproof smart fitness tracker'),
(5, 'Leather Wallet', 35.50, 'Accessories', 'UrbanStyle', 'Standard', 'Premium leather bifold wallet'),
(6, 'Gaming Mouse', 49.99, 'Electronics', 'ClickPro', 'Standard', 'RGB ergonomic gaming mouse'),
(7, 'Coffee Maker', 79.00, 'Appliances', 'BrewPro', 'Compact', 'Single-serve pod coffee maker'),
(8, 'Yoga Mat', 25.00, 'Fitness', 'ZenMat', 'Standard', 'Non-slip textured yoga mat'),
(9, 'Backpack', 45.00, 'Accessories', 'PackWell', 'Large', 'Water-resistant laptop backpack'),
(10, 'Bluetooth Speaker', 99.99, 'Electronics', 'BoomBox', 'Portable', '360-degree surround sound');

-- Stock
INSERT INTO stock (productid, warehouseid, quantity) VALUES
(1, 1, 20), (2, 1, 15), (3, 2, 10), (4, 2, 12), (5, 1, 18),
(6, 1, 25), (7, 2, 9), (8, 2, 30), (9, 1, 14), (10, 2, 11);

-- Credit Cards
INSERT INTO creditcard (card_number, customerid, expiry_date, addressid) VALUES
('1234567812345678', 1, '2026-12-31', 1),
('8765432187654321', 2, '2025-11-30', 2);

-- Shopping Cart
INSERT INTO shopping_cart (cartid, productid, buy_amount) VALUES
(1001, 1, 2), (1001, 3, 1),
(1002, 2, 1), (1002, 5, 3);

-- Orders
INSERT INTO "Order" (orderid, cartid, date, status, card_number) VALUES
(501, 1001, '2024-04-17', 'Shipped', '1234567812345678'),
(502, 1002, '2024-04-16', 'Delivered', '8765432187654321');

-- Order Items
INSERT INTO orderitem (orderid, productid, buy_amount) VALUES
(501, 1, 2), (501, 3, 1),
(502, 2, 1), (502, 5, 3);

-- Deliveries
INSERT INTO delivery (deliveryid, orderid, addressid, delivery_type, delivery_price, ship_date, delivery_date) VALUES
(1, 501, 1, 'Standard', 4.99, '2024-04-18', '2024-04-21'),
(2, 502, 2, 'Express', 9.99, '2024-04-17', '2024-04-18');
