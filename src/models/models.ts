export interface ICustomer {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    country: string;
    password: string;
    sessionTokens: string[];
    cart: Array<{
        cartId: string,
        product: IProduct,
        date: number
    }>;
    purchased: Array<{
        purchaseId: string,
        product: IProduct,
        date: number
    }>;
}

export interface IAdmin {
    _id: string;
    name: string;
    password: string;
    access: string;
    sessionTokens: string[];
}

export interface IProduct {
    _id: string;
    name: string;
    description_short: string;
    description_long: string;
    amount: number;
    price: number;
    delivery: any;
    images: string[];
    mainImage: string;
    categories: ICategory;
}

export interface IPendingCustomer {
    _id: string;
    email: string;
    token: string;
    date: number;
}

export interface IPurchase {
    _id: string;
}

export interface ICategory {
    tags: string[];
}

export interface ISearchCategories {
    tags: string[];
    price: [number, number];
    keyword: string;
    sort: {
        [key: string]: number;
    };
    page: number;
    pageSize: number;
}

export interface ICartItem {
    _id: string;
    name: string;
    price: number;
}

export interface IConnection {
    _id: string;
    ip: string;
    customer: {
        email: string;
        firstName: string;
        lastName: string;
    };
}
