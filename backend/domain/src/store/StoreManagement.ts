import {Store} from './internal_api'
import {RegisteredUser, StoreManager, StoreOwner} from "../user/internal_api";
import {Item} from "../trading_system/internal_api";
import {Req, Res} from 'se-workshop-20-interfaces'
import {
    BagItem,
    IDiscount,
    IItem,
    IPayment,
    IProduct,
    IReceipt,
    ProductCatalogNumber,
    ProductInStore,
    ProductWithQuantity,
    Purchase,
    SearchFilters,
    SearchQuery,
    IDiscountPolicy,
    IDiscountInPolicy,
    IConditionOfDiscount,
    IPurchasePolicy,
    StoreInfo,
    IPurchasePolicyElement,
    ISimplePurchasePolicy, ManagerNamePermission
} from "se-workshop-20-interfaces/dist/src/CommonInterface";
import {ManagementPermission, Operators, ProductCategory} from "se-workshop-20-interfaces/dist/src/Enums";
import {ExternalSystemsManager} from "../external_systems/ExternalSystemsManager";
import {errorMsg, loggerW, StringTuple, UserRole} from '../api-int/internal_api'
import {Discount} from "./discounts/Discount";
import {DiscountPolicy} from "./discounts/DiscountPolicy";
import {CondDiscount} from "./discounts/CondDiscount";
import {PurchasePolicy} from "./PurchasePolicy/PurchasePolicy";
import {PurchasePolicyImpl} from "./PurchasePolicy/PurchasePolicyImpl";
import {UserPolicy} from "./PurchasePolicy/Policies/UserPolicy";
import {ProductPolicy} from "./PurchasePolicy/Policies/ProductPolicy";
import {BagPolicy} from "./PurchasePolicy/Policies/BagPolicy";
import {SystemPolicy} from "./PurchasePolicy/Policies/SystemPolicy";
import {StoreModel, StoreOwnerModel} from 'dal'
import * as StoreMapper from './StoreMapper'

const logger = loggerW(__filename)

export class StoreManagement {
    private readonly _stores: Store[];
    private _storeByStoreName: Map<string, Store>;
    private _storeManagerAssigners: Map<RegisteredUser, RegisteredUser[]>;
    private _storeOwnerAssigners: Map<RegisteredUser, RegisteredUser[]>;
    private _externalSystems: ExternalSystemsManager;

    constructor(externalSystems: ExternalSystemsManager) {
        this._externalSystems = externalSystems;
        this._stores = [];
        this._storeManagerAssigners = new Map();
        this._storeOwnerAssigners = new Map();
        this._storeByStoreName = new Map();
    }

    async addStore(storeName: string, description: string, owner: RegisteredUser): Promise<Res.BoolResponse> {
        const firstOwner = new StoreOwnerModel({name: owner.name})
        // const purchasePolicy = new PurchasePolicyModel()
        // const discountPolicy = new DiscountPolicyModel()
        try {
            await StoreModel.create({storeName, description, firstOwner})
            await firstOwner.save();
            logger.info(`successfully added store: ${storeName} with first owner: ${owner.name} to system`)
            return {data: {result: true}}
        } catch (e) {
            if (e.errors && e.errors.name && e.errors.name.kind === 'unique') {
                logger.warn(`fail to open store ,${storeName} already exist `);
                return {data: {result: false}, error: {message: errorMsg.E_STORE_EXISTS}}
            }
            return {data: {result: false}, error: {message: e.errors.name}}
        }
        return {data: {result: true}}
    }

    verifyStoreExists(storeName: string): boolean {
        for (const store of this._stores) {
            if (store.storeName === storeName)
                return true;
        }
        logger.debug(`store "${storeName}" doesn't exist`);
        return false;
    }

    isStoreLegal(store: Store): boolean {
        return store.storeName.length > 0;
    }

    async getOwnersAssignedBy(storeName: string, user: RegisteredUser): Promise<Res.GetOwnersAssignedByResponse> {
        const store: Store = await this.findStoreByName(storeName);
        if (!store)
            return {data: {result: false, owners: []}, error: {message: errorMsg.E_INVALID_STORE}}
        return {
            data: {
                result: true,
                owners: store.getStoreOwner(user.name).assignedStoreOwners.reduce((acc, curr) => acc.concat(curr.name), [])
            }
        };
    }

    async verifyStoreOwner(storeName: string, user: RegisteredUser): Promise<boolean> {
        const store: Store = await this.findStoreByName(storeName);
        return store ? store.verifyIsStoreOwner(user.name) : false;
    }

    async verifyStoreManager(storeName: string, user: RegisteredUser): Promise<boolean> {
        const store: Store = await this.findStoreByName(storeName);
        return store ? store.verifyIsStoreManager(user.name) : false;
    }

   async verifyStoreOperation(storeName: string, user: RegisteredUser, permission: ManagementPermission): Promise<Res.BoolResponse> {
        let error: string;
        const store: Store = await this.findStoreByName(storeName);
        if (!store)
            error = errorMsg.E_INVALID_STORE;
        else if (!store.verifyPermission(user.name, permission))
            error = errorMsg.E_PERMISSION;
        return error ? {data: {result: false}, error: {message: error}} : {data: {result: true}};
    }

    changeProductName = async (user: RegisteredUser, catalogNumber: number, storeName: string, newProductName: string): Promise<Res.BoolResponse> => {
        logger.debug(`changeProductName: ${user.name} changes product: ${catalogNumber} name in store: ${storeName} 
            to ${newProductName}`);
        const store: Store = await this.findStoreByName(storeName);
        if (!store)
            return {data: {result: false}, error: {message: errorMsg.E_INVALID_STORE}};
        const product: IProduct = store.getProductByCatalogNumber(catalogNumber);
        product.name = newProductName;
        logger.debug(`changeProductName: successfully changed name`);
        return {data: {result: true}};
    }

    changeProductPrice = async (user: RegisteredUser, catalogNumber: number, storeName: string, newPrice: number): Promise<Res.BoolResponse> => {
        logger.debug(`changeProductName: ${user.name} changes product: ${catalogNumber} price in store: ${storeName} 
            to ${newPrice}`);
        const store: Store = await this.findStoreByName(storeName);
        if (!store)
            return {data: {result: false}, error: {message: errorMsg.E_INVALID_STORE}};

        const product: IProduct = store.getProductByCatalogNumber(catalogNumber);

        product.price = newPrice;
        logger.debug(`changeProductName: successfully changed price`);
        return {data: {result: true}};
    }

    async addItems(user: RegisteredUser, storeName: string, itemsReq: IItem[]): Promise<Res.ItemsAdditionResponse> {
        const store: Store = await this.findStoreByName(storeName);
        const items: Item[] = this.getItemsFromRequest(itemsReq);
        return store.addItems(items);
    }

    async removeItems(user: RegisteredUser, storeName: string, itemsReq: IItem[]): Promise<Res.ItemsRemovalResponse> {
        const store: Store = await this.findStoreByName(storeName);
        const items: Item[] = this.getItemsFromRequest(itemsReq);
        return store.removeItems(items);

    }

    async removeProductsWithQuantity(user: RegisteredUser, storeName: string, productsReq: ProductWithQuantity[], isReturnItems: boolean): Promise<Res.ProductRemovalResponse> {
        const store: Store = await this.findStoreByName(storeName);
        return store.removeProductsWithQuantity(productsReq, isReturnItems);
    }

    async addNewProducts(user: RegisteredUser, storeName: string, productsReq: IProduct[]): Promise<Res.ProductAdditionResponse> {
        const storeModel = await this.findStoreModelByName(storeName);
        const store: Store = StoreMapper.storeMapperFromDB(storeModel);
        const res: Res.ProductAdditionResponse = storeModel.addNewProducts(productsReq);
        if (res.data.result) {
            try {
                await storeModel.update({ storeName }, { products: store.products });
            } catch (e) {
                return { data: { result: false, productsNotAdded: productsReq }, error: { message: errorMsg.E_DB } }
            }
        }
        return res;
    }

    async removeProducts(user: RegisteredUser, storeName: string, products: ProductCatalogNumber[]): Promise<Res.ProductRemovalResponse> {
        const store: Store = await this.findStoreByName(storeName);
        return store.removeProductsByCatalogNumber(products);
    }

    async assignStoreOwner(storeName: string, userToAssign: RegisteredUser, userWhoAssigns: RegisteredUser): Promise<Res.BoolResponse> {
        logger.debug(`user: ${userWhoAssigns.name} requested to assign user:
                ${userToAssign.name} as an owner in store: ${JSON.stringify(storeName)}`)

        let error: string;
        const store: Store = await this.findStoreByName(storeName);
        if (!store) {
            error = errorMsg.E_INVALID_STORE;
            logger.warn(`user: ${userWhoAssigns.name} failed to assign user:
                ${userToAssign.name} as an owner in store: ${storeName}. error: ${error}`);
            return {data: {result: false}, error: {message: errorMsg.E_INVALID_STORE}};
        }

        const userWhoAssignsOwner: StoreOwner = store.getStoreOwner(userWhoAssigns.name);
        if (!userWhoAssignsOwner) {
            error = errorMsg.E_NOT_AUTHORIZED;
            logger.warn(`user: ${userWhoAssigns.name} failed to assign user:
                ${userToAssign.name} as an owner in store: ${storeName}. error: ${error}`);
            return {data: {result: false}, error: {message: errorMsg.E_NOT_AUTHORIZED}};
        }

        if (store.verifyIsStoreOwner(userToAssign.name)) {   // already store manager
            error = errorMsg.E_AL;
            logger.warn(`user: ${userWhoAssigns.name} failed to assign user:
                ${userToAssign.name} as an owner in store: ${storeName}. error: ${error}`);
            return {data: {result: false}, error: {message: error}};
        }

        const newUserToAssign: StoreOwner = new StoreOwner(userToAssign.name);

        logger.debug(`successfully assigned user: ${userToAssign.name} as an owner in store: ${storeName}, assigned by user ${userWhoAssigns.name}`)
        const additionRes: Res.BoolResponse = store.addStoreOwner(newUserToAssign);
        if (additionRes.data.result)
            userWhoAssignsOwner.assignStoreOwner(newUserToAssign);
        return additionRes;
    }

    async assignStoreManager(storeName: string, userToAssign: RegisteredUser, userWhoAssigns: RegisteredUser): Promise<Res.BoolResponse> {
        logger.debug(`user: ${userWhoAssigns.name} requested to assign user:
                ${userToAssign.name} as a manager in store: ${storeName}`)
        let error: string;

        const store: Store = await this.findStoreByName(storeName);
        if (!store) {
            error = errorMsg.E_INVALID_STORE;
            logger.warn(`user: ${userWhoAssigns.name} failed to assign user:
                ${userToAssign.name} as a manager in store: ${storeName}. error: ${error}`);
            return {data: {result: false}, error: {message: errorMsg.E_INVALID_STORE}};
        }

        const userWhoAssignsOwner: StoreOwner = store.getStoreOwner(userWhoAssigns.name);
        if (!userWhoAssignsOwner) {
            error = errorMsg.E_NOT_AUTHORIZED;
            logger.warn(`user: ${userWhoAssigns.name} failed to assign user:
                ${userToAssign.name} as a manager in store: ${storeName}. error: ${error}`);
            return {data: {result: false}, error: {message: errorMsg.E_NOT_AUTHORIZED}};
        }

        if (store.verifyIsStoreManager(userToAssign.name)) {   // already store manager
            error = errorMsg.E_AL;
            logger.warn(`user: ${userWhoAssigns.name} failed to assign user:
                ${userToAssign.name} as a manager in store: ${storeName}. error: ${error}`);
            return {data: {result: false}, error: {message: error}};
        }

        const newUserToAssign: StoreManager = new StoreManager(userToAssign.name);

        logger.debug(`successfully assigned user: ${userToAssign.name} as a manager in store: ${storeName}, assigned by user ${userWhoAssigns.name}`)
        const additionRes: Res.BoolResponse = store.addStoreManager(newUserToAssign);
        if (additionRes.data.result)
            userWhoAssignsOwner.assignStoreManager(newUserToAssign);
        return additionRes;
    }

    async removeStoreOwner(storeName: string, userToRemove: RegisteredUser, userWhoRemoves: RegisteredUser, ownersToRemove: StringTuple[]): Promise<Res.BoolResponse> {
        logger.debug(`user: ${JSON.stringify(userWhoRemoves.name)} requested to remove user:
                ${JSON.stringify(userToRemove.name)} as an owner in store: ${JSON.stringify(storeName)} `)
        let error: string;

        const store: Store = await this.findStoreByName(storeName);
        if (!store) {
            error = errorMsg.E_INVALID_STORE;
            logger.warn(`user: ${userWhoRemoves.name} failed to remove user:
                ${userToRemove.name} as an owner in store: ${storeName}. error: ${error}`);
            return {data: {result: false}, error: {message: errorMsg.E_INVALID_STORE}};
        }

        const userWhoRemovesOwner: StoreOwner = store.getStoreOwner(userWhoRemoves.name);
        if (!userWhoRemovesOwner || userToRemove.name === userWhoRemoves.name) {
            error = errorMsg.E_NOT_AUTHORIZED;
            logger.warn(`user: ${userWhoRemoves.name} failed to remove user:
                ${userToRemove.name} as an owner in store: ${storeName}. error: ${error}`);
            return {data: {result: false}, error: {message: errorMsg.E_NOT_AUTHORIZED}};
        }

        const userOwnerToRemove: StoreOwner = store.getStoreOwner(userToRemove.name);
        if (!userOwnerToRemove) {   // not store owner
            error = errorMsg.E_NOT_OWNER;
            logger.warn(`user: ${userWhoRemoves.name} failed to remove user:
                ${userToRemove.name} as an owner in store: ${storeName}. error: ${error}`);
            return {data: {result: false}, error: {message: error}};
        }

        if (!userWhoRemovesOwner.isAssignerOfOwner(userOwnerToRemove)) {
            error = errorMsg.E_NOT_ASSIGNER + userOwnerToRemove.name;
            logger.warn(`user: ${userWhoRemovesOwner.name} failed to remove owner:
                ${userOwnerToRemove.name}. error: ${error}`);
            return {data: {result: false}, error: {message: error}};
        }

        const res: Res.BoolResponse = ownersToRemove.reduce((res: Res.BoolResponse, ownersTuple) => {
            if (!res.data.result)
                return res
            const currRemover: StoreOwner = store.getStoreOwner(ownersTuple[0]);
            const currToRemove: StoreOwner = store.getStoreOwner(ownersTuple[1]);

            currToRemove.assignedStoreManagers.forEach((manager: StoreManager) => {
                store.removeStoreManager(manager);
            })

            const additionRes: Res.BoolResponse = store.removeStoreOwner(currToRemove);
            if (additionRes.data.result && currRemover)
                currRemover.removeStoreOwner(currToRemove);
            return additionRes;
        }, {data: {result: true}});

        return res;
    }

    async getStoreOwnersToRemove(toRemove: string, storeName: string): Promise<StringTuple[]> {
        const store: Store = await this.findStoreByName(storeName);
        if (!store)
            return [];
        const firstOwner: StoreOwner = store.getStoreOwner(toRemove);
        return this.concatAllStoreOwnersToRemove(firstOwner);
    }

    private concatAllStoreOwnersToRemove(firstOwner: StoreOwner): StringTuple[] {
        return firstOwner.assignedStoreOwners.reduce((acc: StringTuple[], currAssigned: StoreOwner) => {
            return acc
                .concat([[firstOwner.name, currAssigned.name]])
                .concat(this.concatAllStoreOwnersToRemove(currAssigned))
        }, [])
    }

    async removeStoreManager(storeName: string, userToRemove: RegisteredUser, userWhoRemoves: RegisteredUser): Promise<Res.BoolResponse> {
        logger.debug(`user: ${JSON.stringify(userWhoRemoves.name)} requested to remove user:
                ${JSON.stringify(userToRemove.name)} as a manager in store: ${JSON.stringify(storeName)} `)
        let error: string;

        const store: Store = await this.findStoreByName(storeName);
        if (!store) {
            error = errorMsg.E_INVALID_STORE;
            logger.warn(`user: ${userWhoRemoves.name} failed to remove user:
                ${userToRemove.name} as a manager in store: ${storeName}. error: ${error}`);
            return {data: {result: false}, error: {message: errorMsg.E_INVALID_STORE}};
        }

        const userWhoRemovesOwner: StoreOwner = store.getStoreOwner(userWhoRemoves.name);
        if (!userWhoRemovesOwner || userToRemove.name === userWhoRemoves.name) {
            error = errorMsg.E_NOT_AUTHORIZED;
            logger.warn(`user: ${userWhoRemoves.name} failed to remove user:
                ${userToRemove.name} as a manager in store: ${storeName}. error: ${error}`);
            return {data: {result: false}, error: {message: errorMsg.E_NOT_AUTHORIZED}};
        }

        const userManagerToRemove: StoreManager = store.getStoreManager(userToRemove.name);
        if (!userManagerToRemove) {   // not store owner
            error = errorMsg.E_NOT_OWNER;
            logger.warn(`user: ${userWhoRemoves.name} failed to remove user:
                ${userToRemove.name} as a manager in store: ${storeName}. error: ${error}`);
            return {data: {result: false}, error: {message: error}};
        }

        if (!userWhoRemovesOwner.isAssignerOfManager(userManagerToRemove)) {
            error = errorMsg.E_NOT_ASSIGNER + userManagerToRemove.name;
            logger.warn(`user: ${userWhoRemovesOwner.name} failed to remove manager:
                ${userManagerToRemove.name}. error: ${error}`);
            return {data: {result: false}, error: {message: error}};
        }

        const additionRes: Res.BoolResponse = store.removeStoreManager(userManagerToRemove);
        if (additionRes.data.result)
            userWhoRemovesOwner.removeStoreManager(userManagerToRemove);
        return additionRes;
    }

    removeManagerPermissions = async (userWhoChanges: RegisteredUser, storeName: string, managerToChange: string, permissions: ManagementPermission[]): Promise<Res.BoolResponse> => {
        logger.debug(`user: ${JSON.stringify(userWhoChanges.name)} requested to remove permissions from user: ${managerToChange}
         in store ${storeName}`)
        let error: string;

        const store: Store = await this.findStoreByName(storeName);
        if (!store) {
            error = errorMsg.E_INVALID_STORE;
            logger.warn(`user: ${userWhoChanges.name} failed to remove permissions to user:
                ${managerToChange}. error: ${error}`);
            return {data: {result: false}, error: {message: errorMsg.E_INVALID_STORE}};
        }

        const userWhoAssignsOwner: StoreOwner = store.getStoreOwner(userWhoChanges.name);
        if (!userWhoAssignsOwner) {
            error = errorMsg.E_NOT_AUTHORIZED;
            logger.warn(`user: ${userWhoChanges.name} failed to remove permissions to user:
                ${managerToChange}. error: ${error}`);
            return {data: {result: false}, error: {message: errorMsg.E_NOT_AUTHORIZED}};
        }

        const userManagerToRemove: StoreManager = store.getStoreManager(managerToChange);
        if (!userManagerToRemove) {   // not store owner
            error = errorMsg.E_NOT_MANAGER;
            logger.warn(`user: ${userWhoChanges.name} failed to remove permissions to user:
                ${managerToChange}. error: ${error}`);
            return {data: {result: false}, error: {message: error}};
        }

        if (!userWhoAssignsOwner.isAssignerOfManager(userManagerToRemove)) {
            error = errorMsg.E_NOT_ASSIGNER + managerToChange;
            logger.warn(`user: ${userWhoChanges.name} failed to remove permissions to user:
                ${managerToChange}. error: ${error}`);
            return {data: {result: false}, error: {message: error}};
        }

        if (!this.verifyPermissions(permissions)) {
            error = errorMsg.E_INVALID_PERM;
            logger.warn(`user: ${userWhoChanges.name} failed to add permissions to user:
                ${userWhoChanges}. error: ${error}`);
            return {data: {result: false}, error: {message: error}};
        }

        permissions.forEach(permission => userManagerToRemove.removePermission(permission));
        return {data: {result: true}};
    }

    addManagerPermissions = async (userWhoChanges: RegisteredUser, storeName: string, usernameToChange: string, permissions: ManagementPermission[]): Promise<Res.BoolResponse> => {
        logger.debug(`user: ${JSON.stringify(userWhoChanges.name)} requested to add permissions from user: ${usernameToChange}
         in store ${storeName}`)
        let error: string;

        const store: Store = await this.findStoreByName(storeName);
        if (!store) {
            error = errorMsg.E_INVALID_STORE;
            logger.warn(`user: ${userWhoChanges.name} failed to add permissions to user:
                ${usernameToChange}. error: ${error}`);
            return {data: {result: false}, error: {message: errorMsg.E_INVALID_STORE}};
        }

        const userWhoAssignsOwner: StoreOwner = store.getStoreOwner(userWhoChanges.name);
        if (!userWhoAssignsOwner) {
            error = errorMsg.E_NOT_AUTHORIZED;
            logger.warn(`user: ${userWhoChanges.name} failed to add permissions to user:
                ${usernameToChange}. error: ${error}`);
            return {data: {result: false}, error: {message: errorMsg.E_NOT_AUTHORIZED}};
        }

        const userManagerToAdd: StoreManager = store.getStoreManager(usernameToChange);
        if (!userManagerToAdd) {   // not store owner
            error = errorMsg.E_NOT_MANAGER;
            logger.warn(`user: ${userWhoChanges.name} failed to add permissions to user:
                ${usernameToChange}. error: ${error}`);
            return {data: {result: false}, error: {message: error}};
        }

        if (!userWhoAssignsOwner.isAssignerOfManager(userManagerToAdd)) {
            error = errorMsg.E_NOT_ASSIGNER + usernameToChange;
            logger.warn(`user: ${userWhoChanges.name} failed to add permissions to user:
                ${usernameToChange}. error: ${error}`);
            return {data: {result: false}, error: {message: error}};
        }

        if (!this.verifyPermissions(permissions)) {
            error = errorMsg.E_INVALID_PERM;
            logger.warn(`user: ${userWhoChanges.name} failed to add permissions to user:
                ${usernameToChange}. error: ${error}`);
            return {data: {result: false}, error: {message: error}};
        }

        permissions.forEach(permission => userManagerToAdd.addPermission(permission));
        return {data: {result: true}};
    }

   async findStoreByName(storeName: string): Promise<Store> {
        try {
            logger.info(`trying to find store ${storeName} in DB`)
            const s = await StoreModel.findOne({storeName});
            const store: Store = StoreMapper.storeMapperFromDB(s);
            return store;
        } catch (e) {
            logger.warn(`User ${name} not found`)
            return undefined
        }
        return undefined;
    }

    async findStoreModelByName(storeName: string): Promise<any> {
        try {
            logger.info(`trying to find store ${storeName} in DB`)
            const s = await StoreModel.findOne({storeName});
            return s;
        } catch (e) {
            logger.warn(`User ${name} not found`)
            return undefined
        }
        return undefined;
    }

    async viewStoreInfo(storeName: string): Promise<Res.StoreInfoResponse> {
        const store = await this.findStoreByName(storeName);
        if (store) {
            return store.viewStoreInfo();
        } else {   // store not found
            return {data: {result: false}, error: {message: errorMsg.E_NF}}
        }
    }

    async viewStorePurchaseHistory(user: RegisteredUser, storeName: string): Promise<Res.ViewShopPurchasesHistoryResponse> {
        const store: Store = await this.findStoreByName(storeName);
        if (!store)
            return {data: {result: false, receipts: []}, error: {message: errorMsg.E_NF}}
        if (!store.verifyPermission(user.name, ManagementPermission.WATCH_PURCHASES_HISTORY) && (user.role !== UserRole.ADMIN))
            return {
                data: {result: false, receipts: []},
                error: {message: errorMsg.E_PERMISSION}
            }
        /*
        const iReceipts: IReceipt[] = store.getPurchasesHistory().map(r => {
            return {purchases: r.purchases, date: r.date}
        })

         */
        const iReceipts: IReceipt[] = [];
        return {data: {result: true, receipts: iReceipts}}
    }

    async viewProductInfo(req: Req.ProductInfoRequest): Promise<Res.ProductInfoResponse> {
        const store = await this.findStoreByName(req.body.storeName);
        if (!store)
            return {data: {result: false}, error: {message: errorMsg.E_NF}}
        const product = store.getProductByCatalogNumber(req.body.catalogNumber)

        const quantity: number = store.getProductQuantity(product.catalogNumber);
        return {
            data: {
                result: true,
                info: {
                    name: product.name,
                    catalogNumber: product.catalogNumber,
                    price: product.price,
                    category: product.category,
                    quantity,
                    finalPrice: store.getProductFinalPrice(req.body.catalogNumber)
                }
            }
        }
    }

    async viewUsersContactUsMessages(user: RegisteredUser, storeName: string): Promise<Res.ViewUsersContactUsMessagesResponse> {
        /*
        const store: Store = this.findStoreByName(storeName);
        if (!store) return {data: {result: false, messages: []}, error: {message: errorMsg.E_NF}}
        if (!store.verifyPermission(user.name, ManagementPermission.WATCH_USER_QUESTIONS) && (user.role !== UserRole.ADMIN)) return {
            data: {result: false, messages: []},
            error: {message: errorMsg.E_PERMISSION}
        }
        const newMessages: ContactUsMessage[] = store.concatUs;
        const newMessageI: IContactUsMessage[] = newMessages.map((contactUs) => {
            return {
                question: contactUs.question, date: contactUs.date, response: contactUs.response,
                responderName: contactUs.responderName, responseDate: contactUs.responseDate
            }
        })
        return {data: {result: true, messages: newMessageI}}

         */
        return {data: {result: true, messages: []}}
    }

    async search(filters: SearchFilters, query: SearchQuery): Promise<Res.SearchResponse> {
        if (query.storeName && query.storeName.length > 0) {
            const store: Store = await this.findStoreByName(query.storeName);
            if (!store)
                return {data: {result: false, products: []}, error: {message: errorMsg.E_INVALID_STORE}};
            if (!filters.storeRating || (filters.storeRating as unknown) === "" || filters.storeRating === store.rating)
                return {data: {result: true, products: store.search(filters, query)}};
            else
                return {data: {result: true, products: []}};
        }

        let productsFound: ProductInStore[] = [];
        for (const store of this._stores) {
            if (typeof filters.storeRating === "undefined" || (filters.storeRating as unknown) === "" || filters.storeRating === store.rating)
                productsFound = productsFound.concat(store.search(filters, query));
        }
        return {data: {result: true, products: productsFound}};
    }

    verifyPermissions(permissions: ManagementPermission[]): boolean {
        return permissions.reduce((acc, perm) => Object.values(ManagementPermission).includes(perm) || acc, false);
    }

   async verifyStoreBag(storeName: string, bagItems: BagItem[]): Promise<Res.BoolResponse> {
        const store: Store = await this.findStoreByName(storeName);
        if (!store)
            return {data: {result: false}, error: {message: errorMsg.E_INVALID_STORE}};
        const notInStock: BagItem[] = bagItems.filter((bagItem) => (store.getProductQuantity(bagItem.product.catalogNumber) - bagItem.amount) < 0)
        return notInStock.length === 0 ? {data: {result: true}} : {
            data: {result: false},
            error: {message: errorMsg.E_STOCK, options: notInStock}
        }

    }

    async purchaseFromStore(storeName: string, bagItems: BagItem[], userName: string, payment: IPayment): Promise<Purchase[]> {
        const store: Store = await this.findStoreByName(storeName);
        const purchases: Purchase[] = [];

        for (const bagItem of bagItems) {
            const items: Item[] = store.getItemsFromStock(bagItem.product, bagItem.amount)
            for (const item of items) {
                const outputItem: IItem = {catalogNumber: item.catalogNumber, id: item.id}
                purchases.push({storeName, userName, item: outputItem, price: bagItem.finalPrice / bagItem.amount})
            }
        }

        store.addReceipt(purchases, payment)
        return purchases
    }

   async calculateFinalPrices(storeName: string, bagItems: BagItem[]): Promise<BagItem[]> {
        logger.info(`calculate final prices in store ${storeName}`)
        const store: Store = await this.findStoreByName(storeName);
        // reset prices from last check
        for (const bagItem of bagItems) {
            bagItem.finalPrice = bagItem.product.price * bagItem.amount;
        }
        return store.calculateFinalPrices(bagItems)
    }

    async viewManagerPermissions(owner: RegisteredUser, manager: RegisteredUser, req: Req.ViewManagerPermissionRequest): Promise<Res.ViewManagerPermissionResponse> {
        const store: Store =await  this.findStoreByName(req.body.storeName);
        if (!store)
            return {data: {result: false}, error: {message: errorMsg.E_INVALID_STORE}};
        const storeOwner: StoreOwner = store.getStoreOwner(owner.name)
        if (!storeOwner && manager.name !== owner.name)
            return {data: {result: false}, error: {message: errorMsg.E_PERMISSION}};
        const managerToView: StoreManager = store.getStoreManager(manager.name);
        if (!managerToView)
            return {data: {result: false}, error: {message: errorMsg.E_MANGER_NOT_EXISTS}};
        const permissions = managerToView.getPermissions();
        return {data: {result: true, permissions}}
    }

    async getManagerPermissions(username: string, storeName: string): Promise<Res.ViewManagerPermissionResponse> {
        const store: Store = await this.findStoreByName(storeName);
        if (!store)
            return {data: {result: false}, error: {message: errorMsg.E_INVALID_STORE}};
        const storeOwner: StoreOwner = store.getStoreOwner(username);
        if (storeOwner)
            return {data: {result: true, permissions: this.getAllPermissions()}};
        const storeManager: StoreManager = store.getStoreManager(username);
        if (!storeManager)
            return {data: {result: false}, error: {message: errorMsg.E_PERMISSION}};
        return {data: {result: true, permissions: storeManager.getPermissions()}}

    }

    getAllPermissions(): ManagementPermission[] {
        return Object.keys(ManagementPermission).map((key: any) => ManagementPermission[key]);
    }

    async setDiscountPolicy(user: RegisteredUser, storeName: string, discounts: IDiscountPolicy): Promise<Res.BoolResponse> {
        const store: Store = await this.findStoreByName(storeName);
        if (!store)
            return {data: {result: false}, error: {message: errorMsg.E_INVALID_STORE}};
        store.setDiscountPolicy(discounts.discounts);
        return {data: {result: true}}
    }

    async getStoreDiscountPolicy(user: RegisteredUser, storeName: string): Promise<IDiscountPolicy> {
        const store: Store = await this.findStoreByName(storeName);
        const discount: DiscountPolicy = store.discountPolicy as DiscountPolicy;
        const children: Map<Discount, Operators> = discount.children;
        const discountInPolicy: IDiscountInPolicy[] = [];
        for (const [discount, operator] of children) {
            const iDiscount: IDiscount = this.convertDiscountToIDiscount(discount);
            discountInPolicy.push({discount: iDiscount, operator});
        }
        const policy: IDiscountPolicy = {discounts: discountInPolicy}

        return policy;
    }

  async getStorePurchasePolicy(user: RegisteredUser, storeName: string): Promise<IPurchasePolicy> {
        const store: Store =await this.findStoreByName(storeName);
        const purchasePolicy: PurchasePolicyImpl = store.purchasePolicy as PurchasePolicyImpl;
        const children: Map<PurchasePolicy, Operators> = purchasePolicy.children;
        const purchasePolicyElements: IPurchasePolicyElement[] = [];
        for (const [policy, operator] of children) {
            const iPurchasePolicy: ISimplePurchasePolicy = this.convertPolicyToISimplePurchasePolicy(policy);
            purchasePolicyElements.push({policy: iPurchasePolicy, operator});
        }
        const policy: IPurchasePolicy = {policy: purchasePolicyElements}

        return policy;
    }

    async verifyProductOnStock(req: Req.VerifyProductOnStock): Promise<Res.BoolResponse> {
        const store: Store =await this.findStoreByName(req.body.storeName);
        if (!store)
            return {data: {result: false}, error: {message: errorMsg.E_INVALID_STORE}};
        const product: IProduct = store.getProductByCatalogNumber(req.body.catalogNumber)
        if (!product) {
            return {data: {result: false}, error: {message: errorMsg.E_PROD_DOES_NOT_EXIST}};
        }
        const stockAmount: number = store.getProductQuantity(req.body.catalogNumber)
        if (stockAmount < req.body.amount)
            return {data: {result: false}, error: {message: errorMsg.E_STOCK, options: {available: stockAmount}}};
        return {data: {result: true}}
    }

   async verifyProducts(req: Req.VerifyProducts): Promise<Res.BoolResponse> {
        const store: Store = await this.findStoreByName(req.body.storeName);
        if (!store)
            return {data: {result: false}, error: {message: errorMsg.E_INVALID_STORE}};
        const productsNotExists = [];
        for (const catalogNumber of req.body.productsCatalogNumbers) {
            if (!store.getProductByCatalogNumber(+catalogNumber)) {
                logger.warn(`product ${catalogNumber} not found`)
                logger.warn(`products in store ${store.storeName} :` + Array.from(store.products.keys()).map((s) => s.catalogNumber))
                productsNotExists.push(catalogNumber)
            }
        }
        if (productsNotExists.length === 0) {
            return {data: {result: true}};
        } else {
            logger.warn(productsNotExists)
            return {
                data: {result: false},
                error: {message: errorMsg.E_PROD_DOES_NOT_EXIST, options: {productsNotExists}}
            }
        }
    }

    async getStoresWithOffset(limit: number, offset: number): Promise<Res.GetStoresWithOffsetResponse> {
        const storeInfos: StoreInfo[] = [];
        if (limit <= 0 || offset < 0)
            return {data: {stores: []}, error: {message: errorMsg.E_INVALID_PARAM}};

        const maxIndex = offset + limit >= this._stores.length ? this._stores.length : offset + limit;

        while (offset < maxIndex) {
            storeInfos.push(this._stores[offset].viewStoreInfo().data.info);
            offset++;
        }

        return {data: {stores: storeInfos}};
    }

    async getAllProductsInStore(storeName: string): Promise<Res.GetAllProductsInStoreResponse> {
        const productInStore: ProductInStore[] = [];
        const store: Store = this._storeByStoreName.get(storeName);
        if (!store)
            return {data: {products: []}};

        const prodIterator = store.products.keys();
        let currProd: IProduct = prodIterator.next().value;
        while (currProd) {
            const currProductInStore: ProductInStore = {
                storeName,
                storeRating: store.rating,
                product: {
                    catalogNumber: currProd.catalogNumber,
                    price: currProd.price,
                    name: currProd.name,
                    category: currProd.category,
                    rating: currProd.rating
                }
            }
            productInStore.push(currProductInStore);
            currProd = prodIterator.next().value;
        }

        return {data: {products: productInStore}};
    }

    async getAllCategoriesInStore(storeName: string): Promise<Res.GetCategoriesResponse> {
        const categoriesInStore: ProductCategory[] = [];
        if (!this._storeByStoreName.has(storeName))
            return {data: {categories: []}};

        const prodIterator = this._storeByStoreName.get(storeName).products.keys();
        let currProd: IProduct = prodIterator.next().value;
        while (currProd) {
            categoriesInStore.push(currProd.category);
            currProd = prodIterator.next().value;
        }

        return {data: {categories: categoriesInStore}};
    }

    async setPurchasePolicy(user: RegisteredUser, storeName: any, policy: IPurchasePolicy): Promise<Res.BoolResponse> {
        const store: Store = await this.findStoreByName(storeName);
        if (!store)
            return {data: {result: false}, error: {message: errorMsg.E_INVALID_STORE}};
        const setPolicyOk: boolean = store.setPurchasePolicy(policy.policy);
        return setPolicyOk ? {data: {result: true}} :
            {data: {result: setPolicyOk}, error: {message: setPolicyOk ? undefined : errorMsg.SET_POLICY_FAILED}}
    }

   async verifyStorePolicy(user: RegisteredUser, storeName: string, bagItems: BagItem[]): Promise<Res.BoolResponse> {
        logger.info(`request to verify purchase policy in store ${storeName}`)
        const store: Store = await this.findStoreByName(storeName);
        if (!store)
            return {data: {result: false}, error: {message: errorMsg.E_INVALID_STORE}};
        const isPolicyOk: boolean = store.verifyStorePolicy(user, bagItems);
        return isPolicyOk ? {data: {result: true}} : {
            data: {result: false},
            error: {message: errorMsg.VERIFY_POLICY_FAILED + "in store" + storeName}
        }
    }

    getStoresInfoOfManagedBy(username: string): StoreInfo[] {
        const stores: StoreInfo[] = [];

        this._stores.forEach(store => {
                if (store.verifyIsStoreManager(username))
                    stores.push(store.viewStoreInfo().data.info);
            }
        )
        return stores;
    }

    getStoresInfoOfOwnedBy(username: string): StoreInfo[] {
        const stores: StoreInfo[] = [];
        this._stores.forEach(store => {
                if (store.verifyIsStoreOwner(username))
                    stores.push(store.viewStoreInfo().data.info);
            }
        )
        return stores;
    }

    async getManagersPermissions(storeName: string): Promise<Res.GetAllManagersPermissionsResponse> {
        const store: Store = await this.findStoreByName(storeName);
        if (!store)
            return {data: {result: false, permissions: []}, error: {message: errorMsg.E_INVALID_STORE}}
        const permissions: ManagerNamePermission[] = [];

        store.storeManagers.forEach(storeManager => {
            permissions.push({managerName: storeManager.name, permissions: storeManager.getPermissions()})
        })
        return {data: {result: true, permissions}}
    }

   async getItemIds(storeName: string, catalogNumber: number): Promise<Res.GetItemsIdsResponse> {
        const store: Store =await  this.findStoreByName(storeName);
        if (!store)
            return {data: {result: false, items: []}, error: {message: errorMsg.E_INVALID_STORE}}

        const product: IProduct = store.getProductByCatalogNumber(catalogNumber);
        if (!product)
            return {data: {result: false, items: []}, error: {message: errorMsg.E_PROD_DOES_NOT_EXIST}}

        return {data: {result: true, items: store.products.get(product).reduce((acc, curr) => acc.concat(curr.id), [])}}
    }

    private convertDiscountToIDiscount(discount: Discount): IDiscount {
        const condDiscount: CondDiscount = discount as CondDiscount;
        let conditions: IConditionOfDiscount[];
        if (condDiscount.conditions && condDiscount.conditions.size !== 0) {
            conditions = [];
            for (const [condition, operator] of condDiscount.conditions) {
                const catalogNumber: number = condition.getCatalogNumber();
                const minPay: number = condition.getMinPay();
                const minAmount: number = condition.getMinAmount();
                if (typeof minAmount === undefined && typeof minPay === undefined) {
                    conditions.push({
                        condition: {
                            catalogNumber
                        }, operator
                    })
                } else if (minPay >= 0) {
                    conditions.push({
                        condition: {
                            minPay
                        }, operator
                    })
                } else if (minAmount >= 0) {
                    conditions.push({
                        condition: {
                            catalogNumber,
                            minAmount
                        }, operator
                    })
                }
            }
        }
        return {
            startDate: discount.startDate,
            duration: discount.duration,
            percentage: discount.percentage,
            products: discount.productsInDiscount,
            category: discount.category,
            condition: conditions
        }

    }

    // private getProductsFromRequest(productsReqs: ProductReq[]): Product[] {
    //     const products: Product[] = [];
    //     for (const productReq of productsReqs) {
    //         const product: Product = new Product(productReq.name, +productReq.catalogNumber, productReq.price, productReq.category);
    //         products.push(product);
    //     }
    //     return products;
    // }

    private getItemsFromRequest(itemsReq: IItem[]): Item[] {
        const items: Item[] = [];
        for (const itemReq of itemsReq) {
            const item: Item = new Item(itemReq.id, itemReq.catalogNumber);
            items.push(item);
        }
        return items;
    }

    private convertPolicyToISimplePurchasePolicy(policy: PurchasePolicy): ISimplePurchasePolicy {
        const tag: string = policy.getPolicyTag();
        switch (tag) {
            case "bag": {
                const bagP: BagPolicy = policy as BagPolicy;
                return {bagPolicy: {minAmount: bagP.minAmount, maxAmount: bagP.maxAmount}}
                break;
            }
            case "product": {
                const productP: ProductPolicy = policy as ProductPolicy;
                return {
                    productPolicy: {
                        catalogNumber: productP.catalogNumber,
                        minAmount: productP.minAmount,
                        maxAmount: productP.maxAmount
                    }
                }
                break;
            }
            case "system": {
                const systemP: SystemPolicy = policy as SystemPolicy;
                return {systemPolicy: {notForSellDays: systemP.notForSellDays}}
                break;
            }
            case "user": {
                const userP: UserPolicy = policy as UserPolicy;
                return {userPolicy: {countries: userP.countries}}
                break;
            }
            default: {
                return undefined
            }

        }

    }


}