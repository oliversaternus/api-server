const fs = require('fs');
const path = require('path');
const MongoClient = require('mongodb').MongoClient;
const hashJS = require('hash.js');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, "../", "/config.json"), "utf-8"));
const url = "mongodb://127.0.0.1:27017/";

function hash(data) {
    const result = hashJS.sha256().update(data).digest("hex");
    return result;
}

async function createAdmin(admin) {
    try {
        const res = await conn.db("express-shop").collection("admins")
            .insertOne(admin);
        return !!res.insertedCount;

    } catch (e) {
        return false;
    }
}

async function initialize() {
    try {
        conn = await MongoClient.connect(url, { useNewUrlParser: true });

        // create collections
        await conn.db("express-shop").createCollection("customers");
        await conn.db("express-shop").createCollection("products");
        await conn.db("express-shop").createCollection("admins");
        await conn.db("express-shop").createCollection("pending_customers");

        // create TTL index
        await conn.db("express-shop").collection("pending_customers")
            .createIndex({ date: 1 }, { expireAfterSeconds: 1200 });

        // create super-admin
        const superAdmin = config.superAdmin;
        superAdmin.password = hash(config.superAdmin.password);
        await createAdmin(superAdmin);
        console.log('MongoDB initialized');
    } catch (e) {
        console.log(e);
    }
}

async function flush() {
    try {
        conn = await MongoClient.connect(url, { useNewUrlParser: true });

        // drop all collections
        await conn.db("express-shop").collection("customers").drop();
        await conn.db("express-shop").collection("products").drop();
        await conn.db("express-shop").collection("admins").drop();
        await conn.db("express-shop").collection("pending_customers").drop();

        // create collections
        await conn.db("express-shop").createCollection("customers");
        await conn.db("express-shop").createCollection("products");
        await conn.db("express-shop").createCollection("admins");
        await conn.db("express-shop").createCollection("pending_customers");

        // create TTL index
        await conn.db("express-shop").collection("pending_customers")
            .createIndex({ date: 1 }, { expireAfterSeconds: 1200 });
        
        // create super-admin
        const superAdmin = config.superAdmin;
        superAdmin.password = hash(config.superAdmin.password);
        await createAdmin(superAdmin);

        console.log('MongoDB flushed and initialized');
    } catch (e) {
        console.log(e);
    }
}

flush();