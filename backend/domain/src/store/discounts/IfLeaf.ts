import {Discount} from "./Discount";
import {BagItem} from "se-workshop-20-interfaces/dist/src/CommonInterface";

export class IfLeaf extends Discount {
    _productInDiscount: number;
    _productsInBag: number;

    public constructor(startDate: Date, duration: number, productInBag: number, productsInDiscount: number) {
        super(startDate, duration, 0, [])
        this._productsInBag = productInBag;
        this._productInDiscount = productsInDiscount;
    }

    calc(bag: BagItem[]): BagItem[] {
        return bag;
    }

    // tslint:disable-next-line:no-empty
    add(discount: Discount): void {
    }

    isRelevant(bag: BagItem[]): boolean {
        let ans: boolean = true;
        if (this._productsInBag) {
            ans = bag.some((bag) => bag.product.catalogNumber === this._productsInBag)
        } else if (this._productsInDiscount) {

        }
        return this.isValid() && ans;
    }

    // tslint:disable-next-line:no-empty
    remove(discount: Discount): void {
    }

    isComposite(): boolean {
        return false;
    }

}