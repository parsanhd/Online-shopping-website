CREATE TABLE Address (
    AddressID INT PRIMARY KEY,
    Street_1 VARCHAR(255),
    Street_2 VARCHAR(255),
    City VARCHAR(100),
    State VARCHAR(100),
    Zip_Code VARCHAR(20)
);
-- Warehouse Table
CREATE TABLE Warehouse (
    WarehouseID INT PRIMARY KEY,
    Location VARCHAR(255),
    Max_capacity INT
);
CREATE TABLE Customer (
    CustomerID INT PRIMARY KEY,
    CartId INT UNIQUE,
    First_name VARCHAR(100),
    Last_name VARCHAR(100),
    Email VARCHAR(255),
    Balance DECIMAL(10, 2),
    AddressID INT,
    FOREIGN KEY (AddressID) REFERENCES Address(AddressID)
);

CREATE INDEX idx_customer_email ON Customer(Email);

CREATE TABLE Staff (
    StaffID INT PRIMARY KEY,
    First_name VARCHAR(100),
    Last_name VARCHAR(100),
    Salary DECIMAL(10, 2),
    Job_title VARCHAR(100),
    AddressID INT,
    WarehouseID INT,
    FOREIGN KEY (AddressID) REFERENCES Address(AddressID),
    FOREIGN KEY (WarehouseID) REFERENCES Warehouse(WarehouseID)
);

CREATE TABLE Product (
    ProductID INT PRIMARY KEY,
    Name VARCHAR(100),
    Price DECIMAL(10, 2),
    Category VARCHAR(50),
    Brand VARCHAR(50),
    Size VARCHAR(50),
    Description TEXT
);

-- Index on Product Name for faster searches
CREATE INDEX idx_product_name ON Product(Name);
-- Index on CategoryID for faster category filtering
CREATE INDEX idx_product_category ON Product(Category);

-- Stock Table
CREATE TABLE Stock (
    ProductID INT,
    WarehouseID INT,
    Quantity INT,
    PRIMARY KEY (ProductID, WarehouseID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID),
    FOREIGN KEY (WarehouseID) REFERENCES Warehouse(WarehouseID)
);

-- Index on ProductID for faster stock lookups by product
CREATE INDEX idx_stock_product ON Stock(ProductID);
-- Index on WarehouseID for faster stock lookups by warehouse
CREATE INDEX idx_stock_warehouse ON Stock(WarehouseID);

CREATE TABLE CreditCard (
    Card_number VARCHAR(20) PRIMARY KEY,
    CustomerID INT,
    Expiry_date DATE,
    AddressID INT,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID),
    FOREIGN KEY (AddressID) REFERENCES Address(AddressID)
);
CREATE TABLE Shopping_cart (
    CartID INT,
    ProductID INT,
    Buy_amount INT,
    PRIMARY KEY (CartID, ProductID),
    FOREIGN KEY (CartID) REFERENCES Customer(CartID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);





-- Order Table
CREATE TABLE "Order" (
    OrderID INT PRIMARY KEY,
    CartID INT,
    Date DATE,
    Status VARCHAR(50),
    Card_num VARCHAR(20),
    FOREIGN KEY (CartID) REFERENCES Customer(CartID),
    FOREIGN KEY (Card_num) REFERENCES CreditCard(Card_number)
);



-- OrderItem Table
CREATE TABLE OrderItem (
    OrderID INT,
    ProductID INT,
    Buy_amount INT,
    PRIMARY KEY (OrderID, ProductID),
    FOREIGN KEY (OrderID) REFERENCES "Order"(OrderID),
    FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);

-- Delivery Table
CREATE TABLE Delivery (
    DeliveryID INT PRIMARY KEY,
    OrderID INT,
    AddressID INT,
    Delivery_type VARCHAR(50),
    Delivery_price DECIMAL(10, 2),
    Ship_date DATE,
    Delivery_date DATE,
    FOREIGN KEY (OrderID) REFERENCES "Order"(OrderID),
    FOREIGN KEY (AddressID) REFERENCES Address(AddressID)
);

select * from shopping_db
