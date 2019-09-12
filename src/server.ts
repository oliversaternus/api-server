import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import * as models from "./models/models";
import * as auth from "./tools/auth";
import * as mongo from "./tools/mongo";
import * as service from "./tools/service";
import Templates from "./tools/templates";
import * as utils from "./tools/utils";

const templates = new Templates();

const app: express.Application = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

/*
*
*
*
************************************ ADMINS **************************************
*
*
*
*/

// admin login with username and password
app.post("/api/admins/login",
    auth.loginAdmin,
    async (req, res) => {
        const admin = res.locals.admin;

        // Generate tokens
        const key: string = utils.randomString(32);
        const refreshToken: string = utils.createAdminRefreshToken(admin.name, key);
        const token: string = utils.createAdminToken(admin.name, admin.access);

        // Craft response data
        delete admin.password;
        delete admin.sessionTokens;
        const response = {
            admin,
            refreshToken,
            token
        };

        // Save refreshToken
        const saved: boolean = await mongo.addAdminSessionToken(admin._id, key);
        saved ? res.status(200).send(response) : res.sendStatus(500);
    });

// admin login with refresh-token
app.post("/api/admins/refresh", async (req, res) => {
    const refreshToken: string = req.body.token;

    if (!refreshToken) {
        res.sendStatus(401);
        return;
    }

    // Check session token
    const plainToken: any = utils.decrypt(refreshToken);
    const admin: models.IAdmin = await mongo.getAdmin(plainToken.name);
    if (!admin.sessionTokens.includes(plainToken.key)) {
        res.sendStatus(401);
        return;
    }

    // Craft response data
    const token: string = utils.createAdminToken(plainToken.name, admin.access);
    delete admin.password;
    delete admin.sessionTokens;
    const response = {
        admin,
        token
    };

    res.status(200).send(response);
});

// admin update
app.put("/api/admins",
    auth.loginAdmin,
    async (req, res) => {
        const admin = res.locals.admin;
        const updated: models.IAdmin = {
            ...admin,
            password: req.body.newPW ? utils.hash(req.body.newPW) : admin.password
        };

        const success = await mongo.updateAdmin(updated);
        res.sendStatus(success ? 200 : 500);
    });

/*
*
*
*
************************************ PRODUCTS **************************************
*
*
*
*/

// Create product
app.put("/api/products",
    auth.verifyAdmin,
    async (req, res) => {
        const product: models.IProduct = req.body as models.IProduct;
        product._id = null;
        const created = await mongo.createProduct(product);
        created ? res.status(200).send(created) : res.sendStatus(400);
    });

// Update product
app.put("/api/products/:id",
    auth.verifyAdmin,
    async (req, res) => {
        const product: models.IProduct = req.body as models.IProduct;
        const updated = await mongo.updateProduct(product);
        res.sendStatus(updated ? 200 : 500);
    });

// Delete product
app.delete("/api/products/:id",
    auth.verifyAdmin,
    async (req, res) => {
        const id: string = req.params.id;
        const deleted: boolean = await mongo.deleteProduct(id);
        res.sendStatus(deleted ? 200 : 500);
    });

// Get all products paged, sorted and filtered by categories
app.post("/api/products",
    async (req, res) => {
        const searchCategories: models.ISearchCategories = req.body as models.ISearchCategories;
        const products: models.IProduct[] = await mongo.getProducts(searchCategories);
        res.status(200).send(products);
    });

/*
*
*
*
************************************ CUSTOMERS **************************************
*
*
*
*/

// customer login with username and password
app.post("/api/customers/login",
    auth.loginCustomer,
    async (req, res) => {
        const customer = res.locals.customer;

        // Generate tokens
        const key: string = utils.randomString(32);
        const refreshToken: string =
            utils.createUserRefreshToken(customer.email, key, customer.firstName, customer.lastName);
        const token: string = utils.createUserToken(customer.email, customer.firstName, customer.lastName);

        // Craft response data
        delete customer.password;
        delete customer.sessionTokens;
        const response = {
            customer,
            refreshToken,
            token
        };

        // Save
        const success: boolean = await mongo.addCustomerSessionToken(customer._id, key);
        success ? res.status(200).send(response) : res.sendStatus(500);
    });

// customer login with refresh-token
app.post("/api/customers/refresh", async (req, res) => {
    const refreshToken: string = req.body.token;

    if (!refreshToken) {
        res.sendStatus(401);
        return;
    }

    // Check permission
    const plainToken: any = utils.decrypt(refreshToken);
    const customer: models.ICustomer = await mongo.getCustomer(plainToken.email);
    if (!customer.sessionTokens.includes(plainToken.key)) {
        res.sendStatus(401);
        return;
    }

    // Craft response data
    const token: string = utils.createUserToken(plainToken.email, plainToken.firstName, plainToken.lastName);
    delete customer.password;
    delete customer.sessionTokens;
    const response = {
        customer,
        token
    };

    res.status(200).send(response);
});

// checks if credentials are valid
app.get("/api/customers/verify", async (req, res) => {
    const success = utils.verifyUser(req.get("token"));
    if (!success) {
        res.sendStatus(401);
        return;
    }
    res.sendStatus(200);
});

// customer update
app.put("/api/customers",
    auth.loginCustomer,
    async (req, res) => {
        const customer = res.locals.customer;
        const updated: models.ICustomer = {
            ...customer, ...req.body, id: customer._id
        };

        const success = await mongo.updateCustomer(updated);
        res.sendStatus(success ? 200 : 500);
    });

// add to cart
app.put("/api/customers/cart",
    auth.verifyCustomer,
    async (req, res) => {
        const customer = res.locals.customer;
        const product = req.body as models.IProduct;

        const success = await mongo.addToCart(customer._id, product);
        res.sendStatus(success ? 200 : 500);
    });

// remove from cart
app.delete("/api/customers/cart/:cartId",
    auth.verifyCustomer,
    async (req, res) => {
        const { customer } = res.locals;
        const { cartId } = req.params;

        const success = await mongo.removeFromCart(customer._id, cartId);
        res.sendStatus(success ? 200 : 500);
    });

// purchase cart
app.put("/api/customers/purchase",
    auth.verifyCustomer,
    async (req, res) => {
        const customer = res.locals.customer;
        const success = await mongo.purchase(customer._id);
        res.sendStatus(success ? 200 : 500);
    });

/*
*
*
*
************************************ PENDING CUSTOMERS **************************************
*
*
*
*/

// Create pending customer
app.put("/api/pending",
    async (req, res) => {
        const pendingCustomer: models.IPendingCustomer = req.body as models.IPendingCustomer;
        pendingCustomer._id = null;
        pendingCustomer.token = utils.generateId();
        if (!utils.verifyCustomerData(pendingCustomer)) {
            res.sendStatus(400);
            return;
        }
        const created = await mongo.createPendingCustomer(pendingCustomer);
        const sentMail = await service.sendMail(
            "NEW_ACCOUNT",
            {
                customer: pendingCustomer.firstName + " " + pendingCustomer.lastName,
                verifycationLink: pendingCustomer.token
            },
            pendingCustomer.email,
            "Verify your Account"
        );
        (created && sentMail) ? res.status(200).send(created) : res.sendStatus(400);
    });

// Accept pending customer
app.put("/api/pending/:id/:token",
    async (req, res) => {
        const { id, token } = req.params;
        const pendingCustomer = await mongo.getPendingCustomer(id);
        if (pendingCustomer.token !== token) {
            res.sendStatus(401);
            return
        }
        delete pendingCustomer.token;
        const customer: models.ICustomer = {
            ...pendingCustomer,
            sessionTokens: [],
            cart: [],
            purchased: []
        };
        await mongo.createCustomer(customer);
        await mongo.deletePendingCustomer(id);
        res.status(200).send(templates.list['ACCOUNT_CREATED']({
            customer: customer.firstName + " " + customer.lastName,
            loginLink: "http://localhost:8989/static/test.html"
        }));
    });

/*
*
*
*
************************************ CONNECTIONS **************************************
*
*
*
*/

app.use((err: any, req: any, res: any, next: any) => {
    res.status(Number(err.message) || 500);
    res.send();
});

const server = createServer(app);
mongo.prepare().then(async () => {
    server.listen(8080, () => {
        console.log(`server started at http://localhost:8080`);
    });
});
