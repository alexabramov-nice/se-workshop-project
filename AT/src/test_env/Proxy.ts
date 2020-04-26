import {Bridge} from "./Bridge";
import {Adapter} from "./Adapter";
import {
    Item,
    Response,
    Store,
    User,
    Credentials,
    Discount,
    PERMISSION,
    Product,
} from "./types";
import {
    DummyValues,
    IProductsRemovalResponse,
    IResponse,
} from "./mocks/responses";
import {Res, Req} from "service_layer/dist/src/service_facade/ServiceFacade";

let real: Partial<Bridge> = Adapter;

const Proxy: Bridge = {
    setReal(impl: Bridge) {
        real = impl;
    },

    setToken(sessionToken: string): void {
        return real && real.setToken ? real.setToken(sessionToken) : null;
    },

    startSession() {
        return real.startSession
            ? real.startSession()
            : DummyValues.SessionResponse;
    },

    removeItem(item: Item) {
        return real.removeItem ? real.removeItem(item) : DummyValues.Response;
    },

    removeStore(store: Store) {
        return real.removeStore ? real.removeStore(store) : DummyValues.Response;
    },

    createStore(store: Store) {
        return real.createStore
            ? real.createStore(store)
            : DummyValues.StoreResponse;
    },

    addItemsToStore(store: Store, items: Item[]) {
        return real.addItemsToStore
            ? real.addItemsToStore(store, items)
            : DummyValues.Response;
    },

    viewProduct(store: Store, product: Product) {
        return real.viewProduct
            ? real.viewProduct(store, product)
            : DummyValues.ViewProductResponse;
    },

    viewStore(store: Store) {
        return real.viewStore
            ? real.viewStore(store)
            : DummyValues.ViewStoreResponse;
    },

    removeUser(user: User) {
        return real.removeUser ? real.removeUser(user) : DummyValues.Response;
    },

    getUserByName(user: User) {
        return real.getUserByName
            ? real.getUserByName(user)
            : DummyValues.UserResponse;
    },

    register(credentials: Credentials) {
        return real.register ? real.register(credentials) : DummyValues.Response;
    },

    login(credentials: Credentials) {
        return real.login ? real.login(credentials) : DummyValues.Response;
    },

    logout() {
        return real.logout ? real.logout() : DummyValues.Response;
    },

    getPurchaseHistory() {
        return real.getPurchaseHistory
            ? real.getPurchaseHistory()
            : DummyValues.PurchaseHistoryResponse;
    },

    search(searchData: Req.SearchRequest): Response {
        return real.search ? real.search(searchData) : DummyValues.SearchResponse;
    },

    // rate(toRate: Store | Product, rate: RATE): Response {
    //   return real.rate ? real.rate(toRate, rate) : DummyValues.SearchResponse;
    // },

    addToCart(store: Store, product: Product, quantity: number) {
        return real.addToCart
            ? real.addToCart(store, product, quantity)
            : DummyValues.Response;
    },

    watchCart() {
        return real.watchCart ? real.watchCart() : DummyValues.CartResponse;
    },

    addProductDiscount(req: Req.AddDiscountRequest): Res.AddDiscountResponse {
        return real.addProductDiscount ? real.addProductDiscount(req) : {
            data: {
                result: true,
                discountID: "5646-435U3%^13513-5165"
            }
        };
    },

    setDiscountToStore(store: Store, discount: Discount) {
        return real.setDiscountToStore
            ? real.setDiscountToStore(store, discount)
            : DummyValues.Response;
    },

    reset() {
        return real.reset ? real.reset() : null;
    },

    setDiscountToItem(store: Store, item: Item, discount: Discount) {
        return real.setDiscountToItem
            ? real.setDiscountToItem(store, item, discount)
            : DummyValues.Response;
    },

    init(cred: Credentials) {
        return real.init ? real.init(cred) : DummyValues.Response;
    },

    assignManager(store: Store, credentials: Credentials): IResponse {
        return real.assignManager
            ? real.assignManager(store, credentials)
            : DummyValues.Response;
    },

    grantPermissions(
        credentials: Credentials,
        store: Store,
        permission: PERMISSION[]
    ): IResponse {
        return real.grantPermissions
            ? real.grantPermissions(credentials, store, permission)
            : DummyValues.Response;
    },

    addProductsToStore(store: Store, products: Product[]): IResponse {
        return real.addProductsToStore
            ? real.addProductsToStore(store, products)
            : DummyValues.Response;
    },

    removeProductsFromStore(
        store: Store,
        products: Product[]
    ): IProductsRemovalResponse {
        return real.removeProductsFromStore
            ? real.removeProductsFromStore(store, products)
            : DummyValues.ProductsRemovalResponse;
    },

    assignStoreOwner(store: Store, user: User): IResponse {
        return real.assignStoreOwner
            ? real.assignStoreOwner(store, user)
            : {data: {}};
    },

    changeProductName(
        req: Partial<Req.ChangeProductNameRequest>
    ): Res.BoolResponse {
        return real.changeProductName
            ? real.changeProductName(req)
            : {data: {result: true}};
    },
    changeProductPrice(
        req: Partial<Req.ChangeProductPriceRequest>
    ): Res.BoolResponse {
        return real.changeProductName
            ? real.changeProductPrice(req)
            : {data: {result: true}};
    },

    watchPermissions(store: Store, credentials: Credentials) {
        return real.watchPermissions(store, credentials)
            ? real.watchPermissions(store, credentials)
            : DummyValues.PermissionsResponse;
    },
    removeStoreManager(
        req: Partial<Req.RemoveStoreManagerRequest>
    ): Res.BoolResponse {
        return real.removeStoreManager
            ? real.removeStoreManager(req)
            : {data: {result: false}};
    },
    removeManagerPermissions(
        req: Req.ChangeManagerPermissionRequest
    ): Res.BoolResponse {
        return real.removeManagerPermissions
            ? real.removeManagerPermissions(req)
            : {data: {result: true}};
    },
    viewUserPurchasesHistory(
        req: Req.ViewRUserPurchasesHistoryReq
    ): Res.ViewRUserPurchasesHistoryRes {
        return real.viewUserPurchasesHistory
            ? real.viewUserPurchasesHistory(req)
            : {data: {result: false, receipts: []}};
    },
    viewStorePurchasesHistory(
        req: Req.ViewShopPurchasesHistoryRequest
    ): Res.ViewShopPurchasesHistoryResponse {
        return real.viewUserPurchasesHistory
            ? real.viewStorePurchasesHistory(req)
            : {data: {result: false, receipts: []}};
    },
    purchase(req: Req.PurchaseRequest): Res.PurchaseResponse {
        return real.purchase ? real.purchase(req) : {data: {result: false}};
    },
    saveProductToCart(req: Req.SaveToCartRequest): Res.BoolResponse {
        return real.saveProductToCart && real.saveProductToCart(req);
    },
    viewManagerPermissions(
        req: Req.ViewManagerPermissionRequest
    ): Res.ViewManagerPermissionResponse {
        return real.viewManagerPermissions && real.viewManagerPermissions(req);
    },
};

export {Proxy};
