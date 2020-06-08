import {BagItem} from "se-workshop-20-interfaces/dist/src/CommonInterface";
export interface User {
    cart: Map<string, BagItem[]>;          // storename -> items
}
    // constructor(cart?:Map<string, BagItem[]> ) {
    //     this._cart = cart? new Map(cart): new Map();
    // }


    // get cart() {
    //     return this._cart;
    // }

    // removeProductFromCart(storeName: string, product: IProduct, amount: number): void {
    //     const storeCart: BagItem[] = this.cart.get(storeName);
    //     const oldBagItem: BagItem = storeCart.find((b) => b.product.catalogNumber === product.catalogNumber);
    //     const newBagItem = {product: oldBagItem.product, amount: oldBagItem.amount - amount}
    //
    //     const filteredBag = storeCart.filter((b) => b.product.catalogNumber !== product.catalogNumber)
    //     if (newBagItem.amount > 0) {
    //         this._cart.set(storeName, filteredBag.concat([newBagItem]))
    //     } else {
    //         this._cart.set(storeName, filteredBag)
    //     }
    // }
    //
    // saveProductToCart(storeName: string, product: IProduct, amount: number): void {
    //     logger.debug(`saving ${amount} of product ${product.name} to cart`)
    //     const storeBag: BagItem[] = this.cart.get(storeName);
    //     if (!storeBag) {
    //         logger.debug(`new bag for store ${storeName}`)
    //         const newBag: BagItem = {product, amount};
    //         this._cart.set(storeName, [newBag]);
    //         return
    //     }
    //     logger.debug(`add bag item to existing bag in store ${storeName}`)
    //     const oldBagItem = storeBag.find((b) => b.product.catalogNumber === product.catalogNumber)
    //     const newBagItem = oldBagItem ? {product, amount: oldBagItem.amount + amount} : {product, amount}
    //     const newStoreBag = storeBag.filter((b) => b.product.catalogNumber !== product.catalogNumber).concat([newBagItem]);
    //     this.cart.set(storeName, newStoreBag);
    // }
    //
    // resetCart() {
    //     this._cart = new Map();
    // }
// }