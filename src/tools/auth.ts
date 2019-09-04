import * as mongo from "./mongo";
import * as utils from "./utils";

export function verifyAdmin(req: any, res: any, next: any) {

    const admin = utils.verifyAdmin(req.get("token"));
    if (!admin) {
        const err = new Error("401");
        return next(err);
    } else {
        res.locals.user = admin;
        return next();
    }
}

export function verifyCustomer(req: any, res: any, next: any) {

    const customer = utils.verifyUser(req.get("token"));
    if (!customer) {
        const err = new Error("401");
        return next(err);
    } else {
        res.locals.user = customer;
        return next();
    }
}

export async function loginAdmin(req: any, res: any, next: any) {
    const name: string = req.body.name;
    const password: string = req.body.password;
    const admin = await mongo.getAdmin(name);

    // check permission
    if (utils.hash(password) !== admin.password) {
        const err = new Error("401");
        return next(err);
    }
    res.locals.admin = admin;
    return next();
}

export async function loginCustomer(req: any, res: any, next: any) {
    const email: string = req.body.email;
    const password: string = req.body.password;
    const customer = await mongo.getCustomer(email);

    // check permission
    if (utils.hash(password) !== customer.password) {
        const err = new Error("401");
        return next(err);
    }
    res.locals.customer = customer;
    return next();
}
