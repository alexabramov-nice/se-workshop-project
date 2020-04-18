import {Store} from './internal_api'
import {logger, BoolResponse, errorMsg, UserRole, ManagementPermission} from '../api-int/internal_api'
import {RegisteredUser, StoreOwner, StoreManager as StoreManagerUser} from "../user/internal_api";
import {Item, Product} from "../trading_system/internal_api";
import * as Res from "../api-ext/Response";
import {
    Product as ProductReq,
    ProductCatalogNumber,
    ProductWithQuantity,
    Item as ItemReq
} from "../api-ext/CommonInterface";
import * as Req from "../api-ext/Request";
import {Receipt} from "../trading_system/data/Receipt";

export class StoreManagement {

    private _stores: Store[];
    private _storeManagerAssigners: Map<RegisteredUser, RegisteredUser[]>;
    private _storeOwnerAssigners: Map<RegisteredUser, RegisteredUser[]>;


    constructor() {
        this._stores = [];
        this._storeManagerAssigners = new Map();
        this._storeOwnerAssigners = new Map();
    }

    addStore(storeName: string, owner: RegisteredUser): BoolResponse {
        if (storeName !== '') {
            const newStore = new Store(storeName);
            newStore.setFirstOwner(owner);
            this._stores.push(newStore);
            logger.debug(`successfully added store: ${JSON.stringify(newStore)} to system`)
            return {data: {result: true}}
        } else {
            logger.warn(`failed adding store ${storeName} to system`)
            return {data: {result: false}, error: {message: errorMsg.E_STORE_ADDITION}}
        }
    }

    verifyStoreExists(storeName: string): boolean {
        for (const store of this._stores) {
            if (store.storeName === storeName)
                return true;
        }
        logger.warn(`could not verify store ${storeName}`);
        return false;
    }

    verifyStore(store: Store) {
        return store.storeName && store.storeName !== '' && store.UUID && store.UUID !== '';
    }

    verifyStoreOwner(storeName: string, user: RegisteredUser): boolean {
        const store: Store = this.findStoreByName(storeName);
        return store ? store.verifyIsStoreOwner(user.name) : false;
    }

    verifyStoreManager(storeName: string, user: RegisteredUser): boolean {
        const store: Store = this.findStoreByName(storeName);
        return store ? store.verifyIsStoreManager(user.name) : false;
    }

    verifyStoreOperation(storeName: string, user: RegisteredUser): BoolResponse {
        const error: string = !this.verifyStoreExists(storeName) ? errorMsg.E_INVALID_STORE :
            !this.verifyStoreOwner(storeName, user) ? errorMsg.E_NOT_AUTHORIZED :
                !this.verifyStoreManager(storeName, user) ? errorMsg.E_NOT_AUTHORIZED : undefined;

        return error ? {data: {result: false}, error: {message: error}} : {data: {result: true}};
    }

    addItems(user: RegisteredUser, storeName: string, itemsReq: ItemReq[]): Res.ItemsAdditionResponse {
        const operationValid: BoolResponse = this.verifyStoreOperation(storeName, user);

        if (!operationValid.data.result) {
            return {data: {result: false, itemsNotAdded: itemsReq}, error: operationValid.error};
        }

        const store: Store = this.findStoreByName(storeName);
        const items: Item[] = this.getItemsFromRequest(itemsReq);
        return store.addItems(items);
    }

    removeItems(user: RegisteredUser, storeName: string, itemsReq: ItemReq[]): Res.ItemsRemovalResponse {
        const operationValid: BoolResponse = this.verifyStoreOperation(storeName, user);
        if (operationValid.error) {
            return {data: {result: false, itemsNotRemoved: itemsReq}, error: operationValid.error};
        }

        const store: Store = this.findStoreByName(storeName);
        const items: Item[] = this.getItemsFromRequest(itemsReq);
        return store.removeItems(items);

    }

    removeProductsWithQuantity(user: RegisteredUser, storeName: string, productsReq: ProductWithQuantity[]): Res.ProductRemovalResponse {
        const operationValid: BoolResponse = this.verifyStoreOperation(storeName, user);
        if (operationValid.error) {
            return {data: {result: false, productsNotRemoved: productsReq}, error: operationValid.error};
        }

        const store: Store = this.findStoreByName(storeName);
        return store.removeProductsWithQuantity(productsReq);
    }

    addNewProducts(user: RegisteredUser, storeName: string, productsReq: ProductReq[]): Res.ProductAdditionResponse {
        const operationValid: BoolResponse = this.verifyStoreOperation(storeName, user);
        if (operationValid.error) {
            return {data: {result: false, productsNotAdded: productsReq}, error: operationValid.error};
        }

        const store: Store = this.findStoreByName(storeName);
        const products: Product[] = this.getProductsFromRequest(productsReq);
        return store.addNewProducts(products);
    }

    removeProducts(user: RegisteredUser, storeName: string, products: ProductCatalogNumber[]): Res.ProductRemovalResponse {
        const operationValid: BoolResponse = this.verifyStoreOperation(storeName, user);
        if (operationValid.error) {
            return {data: {result: false, productsNotRemoved: products}, error: operationValid.error};
        }

        const store: Store = this.findStoreByName(storeName);
        return store.removeProductsByCatalogNumber(products);
    }

    assignStoreOwner(storeName: string, userToAssign: RegisteredUser, userWhoAssigns: RegisteredUser): BoolResponse {
        logger.debug(`user: ${userWhoAssigns.name} requested to assign user:
                ${userToAssign.name} as an owner in store: ${JSON.stringify(storeName)}`)

        const operationValid: BoolResponse = this.verifyStoreOperation(storeName, userWhoAssigns);
        if (!operationValid.data.result) {
            logger.warn(`user: ${userWhoAssigns.name} failed to assign user:
                ${userToAssign.name} as an owner in store: ${storeName}. error: ${operationValid.error.message}`);
            return operationValid;
        }

        const store: Store = this.findStoreByName(storeName);

        if (store.verifyIsStoreOwner(userToAssign.name)) {   // already store owner
            const error = errorMsg.E_AL;
            logger.warn(`user: ${userWhoAssigns.name} failed to assign user:
                ${userToAssign.name} as a manager in store: ${store.UUID}. error: ${error}`);
            return {data: {result: false}, error: {message: error}};
        }

        logger.debug(`successfully assigned user: ${userToAssign.name} as a manager in store: ${storeName}, assigned by user ${userWhoAssigns.name}`)
        const additionRes: Res.BoolResponse = store.addStoreOwner(userToAssign.name);
        if (additionRes.data.result)
            this.addStoreAssigner(userWhoAssigns, userToAssign, false);
        return additionRes;
    }

    assignStoreManager(storeName: string, userToAssign: RegisteredUser, userWhoAssigns: RegisteredUser): BoolResponse {
        logger.debug(`user: ${userWhoAssigns.name} requested to assign user:
                ${userToAssign.name} as a manager in store: ${storeName}`)

        const operationValid: BoolResponse = this.verifyStoreOperation(storeName, userWhoAssigns);
        if (operationValid.error) {
            logger.warn(`user: ${userWhoAssigns} failed to assign user:
                ${userToAssign} as a manager in store: ${storeName}. error: ${operationValid.error.message}`);
            return operationValid;
        }

        const store: Store = this.findStoreByName(storeName);

        if (store.verifyIsStoreManager(userToAssign.name)) {   // already store manager
            const error = errorMsg.E_AL;
            logger.warn(`user: ${userWhoAssigns.name} failed to assign user:
                ${userToAssign.name} as a manager in store: ${store.UUID}. error: ${error}`);
            return {data: {result: false}, error: {message: error}};
        }

        logger.debug(`successfully assigned user: ${userToAssign} as a manager in store: ${storeName}, assigned by user ${userWhoAssigns.name}`)
        const additionRes: Res.BoolResponse = store.addStoreManager(userToAssign.name);
        if (additionRes.data.result)
            this.addStoreAssigner(userWhoAssigns, userToAssign, true);
        return additionRes;
    }

    // addPermissionToManager(storeName: string, userToAssign: RegisteredUser, userWhoAssigns: RegisteredUser) : BoolResponse{
    //
    //
    // }

    findStoreByName(storeName: string): Store {
        for (const store of this._stores) {
            if (store.storeName === storeName)
                return store;
        }

        return undefined;
    }

    private addStoreAssigner(userToAssign: RegisteredUser, userWhoAssigns: RegisteredUser, isManager: boolean): void {
        if (isManager) {
            let usersList: RegisteredUser[] = this._storeManagerAssigners.get(userWhoAssigns);
            usersList = usersList ? usersList.concat([userToAssign]) : [userToAssign];
            this._storeManagerAssigners.set(userWhoAssigns, usersList)
        } else {
            let usersList: RegisteredUser[] = this._storeOwnerAssigners.get(userWhoAssigns);
            usersList = usersList ? usersList.concat([userToAssign]) : [userToAssign];
            this._storeOwnerAssigners.set(userWhoAssigns, usersList)
        }
    }

    private getProductsFromRequest(productsReq: ProductReq[]): Product[] {
        const products: Product[] = [];
        for (const productReq of productsReq) {
            const product: Product = new Product(productReq.name, productReq.catalogNumber, productReq.price, productReq.category);
            products.push(product);
        }

        return products;
    }

    private getItemsFromRequest(itemsReq: ItemReq[]): Item[] {
        const items: Item[] = [];
        for (const itemReq of itemsReq) {
            const item: Item = new Item(itemReq.id, itemReq.catalogNumber);
            items.push(item);
        }

        return items;
    }

    viewStorePurchaseHistory(user: RegisteredUser, shopName: string): Res.ViewShopPurchasesHistoryResponse {
        const store: Store = this.findStoreByName(shopName);
        if (!store) return {data: {purchases: []}, error: {message: errorMsg.E_NF}}
        if (!store.verifyPermission(user.name, ManagementPermission.WATCH_PURCHASES_HISTORY)) return {
            data: {purchases: []},
            error: {message: errorMsg.E_PERMISSION}
        }
        const receipts: Receipt[] = store.getPurchasesHistory();
        return {data: {purchases: receipts}}
    }
}