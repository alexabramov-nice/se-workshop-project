import {UserManager, RegisteredUser, StoreOwner} from "../user/internal_api";
import { Item, Product } from "../trading_system/internal_api"
import { StoreManager, Store } from '../store/internal_api';
import * as Res from "../api-ext/Response"
import * as Req from "../api-ext/Request"
import { errorMsg } from "../api-int/Error";
import {ExternalSystemsManager} from "../external_systems/internal_api"
import {
    BoolResponse,
    ExternalSystems,
    logger,
    OpenStoreRequest,
} from "../api-int/internal_api";


export class TradingSystemManager {
    private userManager: UserManager;
    private storeManager: StoreManager;
    private externalSystems: ExternalSystemsManager;

    constructor() {
        this.userManager = new UserManager();
        this.storeManager = new StoreManager();
        this.externalSystems = new ExternalSystemsManager();
    }

    register(userName: string, password: string): BoolResponse {
        const res = this.userManager.register(userName,password);
        return res;
    }

    getUserByName(userName: string) {
        return this.userManager.getUserByName(userName);
    }

    addItems(req: Req.ItemsAdditionRequest) : Res.ItemsAdditionResponse {
        logger.info(`trying to add items to store: ${JSON.stringify(req.body.storeName)} by user: ${JSON.stringify(req.token)}`);

        const userVerification: Res.BoolResponse = this.userManager.verifyUser(req.token, true);

        if (userVerification.error)
            return { data: {result: false, itemsNotAdded: req.body.items} , error: userVerification.error};

        return this.storeManager.addItems(this.userManager.getUserByToken(req.token), req.body.storeName, req.body.items);

    }

    removeItems(req: Req.ItemsRemovalRequest) : Res.ItemsRemovalResponse {
        logger.info(`trying to remove items from store: ${JSON.stringify(req.body.storeName)} by user: ${JSON.stringify(req.token)}`);

        const userVerification: Res.BoolResponse = this.userManager.verifyUser(req.token, true);

        if (userVerification.error)
            return { data: {result: false, itemsNotRemoved: req.body.items} , error: userVerification.error};

        return this.storeManager.removeItems(this.userManager.getUserByToken(req.token), req.body.storeName, req.body.items);
    }

    removeProductsWithQuantity(req: Req.RemoveProductsWithQuantity) : Res.ProductRemovalResponse {
        logger.info(`trying to remove items to store: ${JSON.stringify(req.body.storeName)} from user: ${JSON.stringify(req.token)}`);

        const userVerification: Res.BoolResponse = this.userManager.verifyUser(req.token, true);

        if (userVerification.error)
            return { data: {result: false, productsNotRemoved: req.body.products} , error: userVerification.error};

        return this.storeManager.removeProductsWithQuantity(this.userManager.getUserByToken(req.token), req.body.storeName, req.body.products);
    }

    addNewProducts(req: Req.AddProductsRequest) : Res.ProductAdditionResponse {
        logger.info(`trying to add products to store: ${JSON.stringify(req.body.storeName)} by user: ${JSON.stringify(req.token)}`)

        const userVerification: Res.BoolResponse = this.userManager.verifyUser(req.token, true);

        if (userVerification.error)
            return { data: {result: false, productsNotAdded: req.body.products} , error: userVerification.error};

        return this.storeManager.addNewProducts(this.userManager.getUserByToken(req.token), req.body.storeName, req.body.products);
    }

    removeProducts(req: Req.ProductRemovalRequest) : Res.ProductRemovalResponse {
        logger.info(`trying to remove products from store: ${JSON.stringify(req.body.storeName)} by user: ${JSON.stringify(req.token)}`);

        const userVerification: Res.BoolResponse = this.userManager.verifyUser(req.token, true);

        if (userVerification.error)
            return { data: {result: false, productsNotRemoved: req.body.products} , error: userVerification.error};

        return this.storeManager.removeProducts(this.userManager.getUserByToken(req.token), req.body.storeName, req.body.products);
    }

    assignStoreOwner(req: Req.AssignStoreOwnerRequest) : Res.BoolResponse {
        logger.info(`user: ${JSON.stringify(req.token)} requested to assign user:
                ${JSON.stringify(req.body.usernameToAssign)} as a manager in store: ${JSON.stringify(req.body.storeName)} `)

        const usernameWhoAssignsVerification: Res.BoolResponse = this.userManager.verifyUser(req.token, true);
        const usernameToAssignVerification: Res.BoolResponse = this.userManager.verifyUser(req.body.usernameToAssign, false);

        let error: string = usernameWhoAssignsVerification.error ? usernameWhoAssignsVerification.error.message + " " : "";
        error = usernameToAssignVerification.error ? error + usernameToAssignVerification.error.message : error + "";

        if (error.length > 0) {
            return { data: { result: false } , error: { message: error}};
        }

        const usernameWhoAssigns: RegisteredUser = this.userManager.getUserByToken(req.token);
        const usernameToAssign: RegisteredUser = this.userManager.getUserByToken(req.body.usernameToAssign);

        return this.storeManager.assignStoreOwner(req.body.storeName, usernameToAssign, usernameWhoAssigns);
    }

    connectDeliverySys(): BoolResponse{
        logger.info('Trying to connect to delivery system');
        const res:BoolResponse = this.externalSystems.connectSystem(ExternalSystems.DELIVERY);
        return res;
    }

    connectPaymentSys(): BoolResponse{
        logger.info('Trying to connect to payment system');
        const res:BoolResponse = this.externalSystems.connectSystem(ExternalSystems.PAYMENT);
        return res;
    }

    setAdmin(setAdminRequest: Req.SetAdminRequest): BoolResponse{
        logger.info(`user ${setAdminRequest.token} trying set ${setAdminRequest.body.newAdminUUID} as an admin`)
        const res:BoolResponse = this.userManager.setAdmin(setAdminRequest);
        return res;
    }

    createStore(storeReq: OpenStoreRequest) : BoolResponse{
        logger.info(`user ${storeReq.token} trying open store: ${storeReq.body.storeName}`)
        const u: RegisteredUser = this.userManager.getUserByToken(storeReq.token);
        if(!u) return {data: {result:false}, error:{message: errorMsg['E_NOT_AUTHORIZED']}}
        if(!this.userManager.isLoggedIn(u)) return {data: {result:false}, error:{message: errorMsg['E_NOT_LOGGED_IN']}}
        const res:BoolResponse = this.storeManager.addStore(storeReq.body.storeName, u);
        return res;
    }

}
