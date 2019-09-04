import fs from "fs";
import * as hashJS from "hash.js";
import http from "http";
import path from "path";
import * as crypt from "./crypt";

const alphabet: string = "4fPwKEjkGrBJst2MpFVZx9y5lIm6A7LDinQzgOhqaWC3obXuv0H1cNde8Y";
const config: any = JSON.parse(fs.readFileSync(path.join(__dirname, "../", "../", "/config.json"), "utf-8"));
const secret: string = config.secret;
export const wsKey: string = config.wsKey;

export function randomString(length: number): string {
    let result: string = "";
    for (let i = 0; i < length; i++) {
        result += alphabet[Math.floor((Math.random() * 58))];
    }
    return result;
}

export function generateId(): string {
    let result: string = "";
    for (let i = 0; i < 12; i++) {
        result += alphabet[Math.floor((Math.random() * 58))];
    }
    return result + Date.now();
}

export function verifyUser(token: string): string {
    if (!token) {
        return "";
    }
    const plainToken = JSON.parse(crypt.decrypt(token));
    if (plainToken.sec !== secret || plainToken.role !== "customer" || plainToken.exp < Date.now()) {
        return "";
    }
    return plainToken.email;
}

export function verifyAdmin(token: string): string {
    if (!token) {
        return "";
    }
    const plainToken = JSON.parse(crypt.decrypt(token));
    if (plainToken.sec !== secret || plainToken.role !== "admin" || plainToken.exp < Date.now()) {
        return "";
    }
    return plainToken.name;
}

export function hash(data: string): string {
    const result = hashJS.sha256().update(data).digest("hex");
    return result;
}

export function createUserToken(email: string, firstName: string, lastName: string) {
    return crypt.encrypt(JSON.stringify({
        email,
        exp: (Date.now() + 1200000),
        firstName,
        lastName,
        role: "customer",
        sec: secret
    }));
}

export function createUserRefreshToken(email: string, key: string, firstName: string, lastName: string) {
    return crypt.encrypt(JSON.stringify({
        email,
        exp: (Date.now() + 604800000),
        firstName,
        key,
        lastName
    }));
}

export function createAdminToken(name: string, access: string) {
    return crypt.encrypt(JSON.stringify({
        access,
        exp: (Date.now() + 1200000),
        name,
        role: "admin",
        sec: secret
    }));
}

export function createAdminRefreshToken(name: string, key: string) {
    return crypt.encrypt(JSON.stringify({
        exp: (Date.now() + 604800000),
        key,
        name
    }));
}

export function decrypt(token: string): any {
    return JSON.parse(crypt.decrypt(token));
}

export function triggerUpdateHook(product: any) {
    const req = http.request({
        headers: {
            "Content-Type": "application/json",
            "key": wsKey
        },
        host: "127.0.0.1",
        method: "POST",
        path: "/update",
        port: "4143"
    });
    req.write(JSON.stringify(product));
    req.end();
}
