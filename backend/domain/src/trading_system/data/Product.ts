import {ProductCategory} from "../../api-ext/CommonInterface";

export class Product {
    private readonly _catalogNumber: number;
    private readonly _name: string;
    private _price: number;
    private _category: ProductCategory;

    constructor(name: string, catalogNumber: number, price: number, productCategory: ProductCategory) {
        this._category = productCategory;
        this._name = name;
        this._catalogNumber = catalogNumber;
        this._price = price;
    }

    set price(price: number) {
        this.price = price;
    }

    get price(): number {
        return this.price;
    }

    get name(): string {
        return this._name;
    }
    get category(): ProductCategory {
        return this._category;
    }

    get catalogNumber(): number {
        return this._catalogNumber;
    }

}