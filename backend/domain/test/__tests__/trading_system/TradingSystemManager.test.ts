import {Store, StoreManagement} from "../../../src/store/internal_api";
import * as Res from "../../../src/api-ext/Response";
import {StoreOwner, RegisteredUser} from "../../../src/user/internal_api";
import { TradingSystemManager } from "../../../src/trading_system/TradingSystemManager";
import {Item, Product} from "../../../src/trading_system/internal_api";
import {ExternalSystemsManager} from '../../../src/external_systems/ExternalSystemsManager'
import {UserManager} from '../../../src/user/UserManager';
import {mocked} from "ts-jest/utils";
import * as Req from "../../../src/api-ext/Request";
import {Product as ProductReq, ProductCatalogNumber, ProductCategory} from "../../../src/api-ext/external_api";
import {ProductWithQuantity} from "../../../src/api-ext/CommonInterface";
jest.mock('../../../src/user/UserManager');
jest.mock('../../../src/store/StoreManagement');
jest.mock('../../../src/external_systems/ExternalSystemsManager');
jest.mock('../../../src/user/UserManager');

describe("Store Management Unit Tests", () => {
    let tradingSystemManager: TradingSystemManager;
    let store: Store;
    let user: StoreOwner;
    const mockToken: string = "mock-token";

    beforeEach(() => {
        store = new Store("store");
        user = new StoreOwner("name");
        mocked(UserManager).mockClear();
        mocked(StoreManagement).mockClear();
    });

    function prepareAddItemMock(isLoggedIn: boolean, isSuccess: boolean) {
        prepareMocksForInventoryManagement(isLoggedIn);
        const operationResMock: Res.BoolResponse = isSuccess ? {data: {result: true}} : {data: {result: false}, error: {message: 'mock err'}};
        mocked(StoreManagement).mockImplementation(() :any => {
            return {
                addItems: () => operationResMock
            }
        });
    }

    test("addItems success", () => {
        const numOfItems: number = 5;
        const items: Item[] = generateItems(numOfItems);
        const isLoggedIn: boolean = true;
        const isSuccess: boolean = true;

        prepareAddItemMock(isLoggedIn, isSuccess);

        tradingSystemManager = new TradingSystemManager();
        const req: Req.ItemsAdditionRequest = { token: mockToken, body: {storeName: store.storeName, items: items}}
        let res: Res.ItemsAdditionResponse = tradingSystemManager.addItems(req)

        expect(res.data.result).toBeTruthy();
    });

    test("addItems failure - not logged in", () => {
        const numOfItems: number = 5;
        const items: Item[] = generateItems(numOfItems);
        const isLoggedIn: boolean = false;
        const isSuccess: boolean = true;

        prepareAddItemMock(isLoggedIn, isSuccess);
        tradingSystemManager = new TradingSystemManager();
        const req: Req.ItemsAdditionRequest = { token: mockToken, body: {storeName: store.storeName, items: items}}
        let res: Res.ItemsAdditionResponse = tradingSystemManager.addItems(req)

        expect(res.data.result).toBeFalsy();
    });


    function prepareRemoveItemsMock(isLoggedIn: boolean, isSuccess: boolean) {
        prepareMocksForInventoryManagement(isLoggedIn);
        const operationResMock: Res.BoolResponse = isSuccess ? {data: {result: true}} : {data: {result: false}, error: {message: 'mock err'}};
        mocked(StoreManagement).mockImplementation(() :any => {
            return {
                removeItems: () => operationResMock
            }
        });
    }

    test("removeItems success", () => {
        const numOfItems: number = 5;
        const items: Item[] = generateItems(numOfItems);
        const isLoggedIn: boolean = true;
        const isSuccess: boolean = true;

        prepareRemoveItemsMock(isLoggedIn, isSuccess);
        tradingSystemManager = new TradingSystemManager();

        const req: Req.ItemsRemovalRequest = { token: mockToken, body: {storeName: store.storeName, items: items}}
        let res: Res.ItemsRemovalResponse = tradingSystemManager.removeItems(req)

        expect(res.data.result).toBeTruthy();
    });

    test("removeItems failure - not logged in", () => {
        const numOfItems: number = 5;
        const items: Item[] = generateItems(numOfItems);
        const isLoggedIn: boolean = false;
        const isSuccess: boolean = true;
        prepareRemoveItemsMock(isLoggedIn, isSuccess);
        jest.spyOn(store, "removeItems").mockReturnValue(undefined);

        tradingSystemManager = new TradingSystemManager();
        const req: Req.ItemsRemovalRequest = { token: mockToken, body: {storeName: store.storeName, items: items}}
        let res: Res.ItemsRemovalResponse = tradingSystemManager.removeItems(req)

        expect(res.data.result).toBeFalsy();
        expect(store.removeItems).toBeCalledTimes(0);
    });


    function prepareRemoveProductsWithQuantityMock(isLoggedIn: boolean, isSuccess: boolean) {
        prepareMocksForInventoryManagement(isLoggedIn);
        const operationResMock: Res.BoolResponse = isSuccess ? {data: {result: true}} : {data: {result: false}, error: {message: 'mock err'}};
        mocked(StoreManagement).mockImplementation(() :any => {
            return {
                removeProductsWithQuantity: () => operationResMock
            }
        });
    }

    test("removeProductsWithQuantity success", () => {
        const numOfItems: number = 5;
        const products: ProductReq[] = generateProducts(numOfItems);
        const isLoggedIn: boolean = true;
        const isSuccess: boolean = true;
        let productsWithQuantity: ProductWithQuantity[] = [];

        for (let i = 0 ; i< numOfItems ; i++){
            const currProduct: ProductWithQuantity = {catalogNumber: products[i].catalogNumber, quantity: i}
            productsWithQuantity.push(currProduct);
        }

        prepareRemoveProductsWithQuantityMock(isLoggedIn, isSuccess);
        tradingSystemManager = new TradingSystemManager();

        const req: Req.RemoveProductsWithQuantity = { token: mockToken, body: {storeName: store.storeName, products: productsWithQuantity}};
        let res: Res.ProductRemovalResponse = tradingSystemManager.removeProductsWithQuantity(req);

        expect(res.data.result).toBeTruthy();
    });

    test("removeProductsWithQuantity failure - not logged in", () => {
        const numOfItems: number = 5;
        const products: ProductReq[] = generateProducts(numOfItems);
        const isLoggedIn: boolean = false;
        const isSuccess: boolean = true;
        let productsWithQuantity: ProductWithQuantity[] = [];

        for (let i = 0 ; i< numOfItems ; i++){
            const currProduct: ProductWithQuantity = {catalogNumber: products[i].catalogNumber, quantity: i}
            productsWithQuantity.push(currProduct);
        }

        prepareRemoveProductsWithQuantityMock(isLoggedIn, isSuccess);
        jest.spyOn(store, "removeProductsWithQuantity").mockReturnValue(undefined);

        tradingSystemManager = new TradingSystemManager();
        const req: Req.RemoveProductsWithQuantity = { token: mockToken, body: {storeName: store.storeName, products: productsWithQuantity}};
        let res: Res.ProductRemovalResponse = tradingSystemManager.removeProductsWithQuantity(req);

        expect(res.data.result).toBeFalsy();
        expect(store.removeProductsWithQuantity).toBeCalledTimes(0);
    });


    function prepareAddNewProductsMock(isLoggedIn: boolean, isSuccess: boolean) {
        prepareMocksForInventoryManagement(isLoggedIn);
        const operationResMock: Res.BoolResponse = isSuccess ? {data: {result: true}} : {data: {result: false}, error: {message: 'mock err'}};
        mocked(StoreManagement).mockImplementation(() :any => {
            return {
                addNewProducts: () => operationResMock
            }
        });
    }

    test("addNewProducts success", () => {
        const numOfItems: number = 5;
        const products: ProductReq[] = generateProducts(numOfItems);
        const isLoggedIn: boolean = true;
        const isSuccess: boolean = true;

        prepareAddNewProductsMock(isLoggedIn, isSuccess);
        tradingSystemManager = new TradingSystemManager();

        const productsReq: ProductReq[] = [];
        for (let prod of products) {
            const prodReq: ProductReq = {catalogNumber: prod.catalogNumber, name: prod.name, price: prod.price, category: ProductCategory.Electronics};
            productsReq.push(prodReq);
        }


        const req: Req.AddProductsRequest = { token: mockToken, body: {storeName: store.storeName, products: productsReq}};
        let res: Res.ProductAdditionResponse = tradingSystemManager.addNewProducts(req)

        expect(res.data.result).toBeTruthy();
    });

    test("addNewProducts failure - not logged in", () => {
        const numOfItems: number = 5;
        const products: ProductReq[] = generateProducts(numOfItems);
        const isLoggedIn: boolean = false;
        const isSuccess: boolean = true;

        prepareAddNewProductsMock(isLoggedIn, isSuccess);
        jest.spyOn(store, "addNewProducts").mockReturnValue(undefined);

        tradingSystemManager = new TradingSystemManager();
        const productsReq: ProductReq[] = [];
        for (let prod of products) {
            const prodReq: ProductReq = {catalogNumber: prod.catalogNumber, name: prod.name, price: prod.price, category: ProductCategory.Electronics};
            productsReq.push(prodReq);
        }

        const req: Req.AddProductsRequest = { token: mockToken, body: {storeName: store.storeName, products: productsReq}};
        let res: Res.ProductAdditionResponse = tradingSystemManager.addNewProducts(req)

        expect(res.data.result).toBeFalsy();
        expect(store.addNewProducts).toBeCalledTimes(0);
    });


    function prepareRemoveProductsMock(isLoggedIn: boolean, isSuccess: boolean) {
        prepareMocksForInventoryManagement(isLoggedIn);
        const operationResMock: Res.BoolResponse = isSuccess ? {data: {result: true}} : {data: {result: false}, error: {message: 'mock err'}};
        mocked(StoreManagement).mockImplementation(() :any => {
            return {
                removeProducts: () => operationResMock
            }
        });
    }

    test("removeProducts success", () => {
        const numOfItems: number = 5;
        const products: ProductReq[] = generateProducts(numOfItems);
        const isLoggedIn: boolean = true;
        const isSuccess: boolean = true;

        prepareRemoveProductsMock(isLoggedIn, isSuccess);
        tradingSystemManager = new TradingSystemManager();
        const productsReq: ProductCatalogNumber[] = [];
        for (let prod of products) {
            const prodReq: ProductCatalogNumber = {catalogNumber: prod.catalogNumber};
            productsReq.push(prodReq);
        }

        const req: Req.ProductRemovalRequest = { token: mockToken, body: {storeName: store.storeName, products: productsReq}};
        let res: Res.ProductRemovalResponse = tradingSystemManager.removeProducts(req)

        expect(res.data.result).toBeTruthy();
    });

    test("removeProducts failure - not logged in", () => {
        const numOfItems: number = 5;
        const products: ProductReq[] = generateProducts(numOfItems);
        const isLoggedIn: boolean = false;
        const isSuccess: boolean = true;

        prepareRemoveProductsMock(isLoggedIn, isSuccess);
        jest.spyOn(store, "removeProductsByCatalogNumber").mockReturnValue(undefined);

        tradingSystemManager = new TradingSystemManager();
        const productsReq: ProductCatalogNumber[] = [];
        for (let prod of products) {
            const prodReq: ProductCatalogNumber = {catalogNumber: prod.catalogNumber};
            productsReq.push(prodReq);
        }

        const req: Req.ProductRemovalRequest = { token: mockToken, body: {storeName: store.storeName, products: productsReq}};
        let res: Res.ProductRemovalResponse = tradingSystemManager.removeProducts(req)

        expect(res.data.result).toBeFalsy();
        expect(store.removeProductsByCatalogNumber).toBeCalledTimes(0);
    });


    function prepareAssignStoreOwnerMock(isLoggedIn: boolean, isSuccess: boolean) {
        prepareMocksForInventoryManagement(isLoggedIn);
        const operationResMock: Res.BoolResponse = isSuccess ? {data: {result: true}} : {data: {result: false}, error: {message: 'mock err'}};
        mocked(StoreManagement).mockImplementation(() :any => {
            return {
                assignStoreOwner: () => operationResMock
            }
        });
    }

    test("assignStoreOwner success", () => {
        const numOfItems: number = 5;
        const products: ProductReq[] = generateProducts(numOfItems);
        const isLoggedIn: boolean = true;
        const isSuccess: boolean = true;

        prepareAssignStoreOwnerMock(isLoggedIn, isSuccess);
        tradingSystemManager = new TradingSystemManager();
        const productsReq: ProductCatalogNumber[] = [];
        for (let prod of products) {
            const prodReq: ProductCatalogNumber = {catalogNumber: prod.catalogNumber};
            productsReq.push(prodReq);
        }

        const req: Req.AssignStoreOwnerRequest = { token: mockToken, body: {storeName: store.storeName, usernameToAssign: 'user'}};
        let res: Res.BoolResponse = tradingSystemManager.assignStoreOwner(req)

        expect(res.data.result).toBeTruthy();
    });

    test("assignStoreOwner failure - not logged in", () => {
        const numOfItems: number = 5;
        const products: ProductReq[] = generateProducts(numOfItems);
        const isLoggedIn: boolean = false;
        const isSuccess: boolean = true;

        prepareAssignStoreOwnerMock(isLoggedIn, isSuccess);
        jest.spyOn(store, "removeProductsByCatalogNumber").mockReturnValue(undefined);

        tradingSystemManager = new TradingSystemManager();
        const productsReq: ProductCatalogNumber[] = [];
        for (let prod of products) {
            const prodReq: ProductCatalogNumber = {catalogNumber: prod.catalogNumber};
            productsReq.push(prodReq);
        }

        const req: Req.AssignStoreOwnerRequest = { token: mockToken, body: {storeName: store.storeName, usernameToAssign: 'user'}};
        let res: Res.BoolResponse = tradingSystemManager.assignStoreOwner(req)

        expect(res.data.result).toBeFalsy();
        expect(store.removeProductsByCatalogNumber).toBeCalledTimes(0);
    });


    function prepareAssignStoreManagerMock(isLoggedIn: boolean, isSuccess: boolean) {
        prepareMocksForInventoryManagement(isLoggedIn);
        const operationResMock: Res.BoolResponse = isSuccess ? {data: {result: true}} : {data: {result: false}, error: {message: 'mock err'}};
        mocked(StoreManagement).mockImplementation(() :any => {
            return {
                assignStoreManager: () => operationResMock
            }
        });
    }

    test("assignStoreManager success", () => {
        const numOfItems: number = 5;
        const products: ProductReq[] = generateProducts(numOfItems);
        const isLoggedIn: boolean = true;
        const isSuccess: boolean = true;

        prepareAssignStoreManagerMock(isLoggedIn, isSuccess);
        tradingSystemManager = new TradingSystemManager();
        const productsReq: ProductCatalogNumber[] = [];
        for (let prod of products) {
            const prodReq: ProductCatalogNumber = {catalogNumber: prod.catalogNumber};
            productsReq.push(prodReq);
        }

        const req: Req.AssignStoreOwnerRequest = { token: mockToken, body: {storeName: store.storeName, usernameToAssign: 'user'}};
        let res: Res.BoolResponse = tradingSystemManager.assignStoreManager(req)

        expect(res.data.result).toBeTruthy();
    });

    test("assignStoreManager failure - not logged in", () => {
        const numOfItems: number = 5;
        const products: ProductReq[] = generateProducts(numOfItems);
        const isLoggedIn: boolean = false;
        const isSuccess: boolean = true;

        prepareAssignStoreManagerMock(isLoggedIn, isSuccess);
        jest.spyOn(store, "removeProductsByCatalogNumber").mockReturnValue(undefined);

        tradingSystemManager = new TradingSystemManager();
        const productsReq: ProductCatalogNumber[] = [];
        for (let prod of products) {
            const prodReq: ProductCatalogNumber = {catalogNumber: prod.catalogNumber};
            productsReq.push(prodReq);
        }

        const req: Req.AssignStoreOwnerRequest = { token: mockToken, body: {storeName: store.storeName, usernameToAssign: 'user'}};
        let res: Res.BoolResponse = tradingSystemManager.assignStoreManager(req)

        expect(res.data.result).toBeFalsy();
        expect(store.removeProductsByCatalogNumber).toBeCalledTimes(0);
    });


    function prepareRemoveStoreOwnerMock(isLoggedIn: boolean, isSuccess: boolean) {
        prepareMocksForInventoryManagement(isLoggedIn);
        const operationResMock: Res.BoolResponse = isSuccess ? {data: {result: true}} : {data: {result: false}, error: {message: 'mock err'}};
        mocked(StoreManagement).mockImplementation(() :any => {
            return {
                removeStoreOwner: () => operationResMock
            }
        });
    }

    test("removeStoreOwner success", () => {
        const isLoggedIn: boolean = true;
        const isSuccess: boolean = true;

        prepareRemoveStoreOwnerMock(isLoggedIn, isSuccess);
        tradingSystemManager = new TradingSystemManager();

        const req: Req.RemoveStoreOwnerRequest = { token: mockToken, body: {storeName: store.storeName, usernameToRemove: 'user'}};
        let res: Res.BoolResponse = tradingSystemManager.removeStoreOwner(req)

        expect(res.data.result).toBeTruthy();
    });

    test("removeStoreOwner failure - not logged in", () => {
        const isLoggedIn: boolean = false;
        const isSuccess: boolean = true;

        prepareRemoveStoreOwnerMock(isLoggedIn, isSuccess);
        tradingSystemManager = new TradingSystemManager();

        const req: Req.RemoveStoreOwnerRequest = { token: mockToken, body: {storeName: store.storeName, usernameToRemove: 'user'}};
        let res: Res.BoolResponse = tradingSystemManager.removeStoreOwner(req)

        expect(res.data.result).toBeFalsy();
    });

    test("removeStoreOwner failure", () => {
        const isLoggedIn: boolean = true;
        const isSuccess: boolean = false;

        prepareRemoveStoreOwnerMock(isLoggedIn, isSuccess);
        tradingSystemManager = new TradingSystemManager();

        const req: Req.RemoveStoreOwnerRequest = { token: mockToken, body: {storeName: store.storeName, usernameToRemove: 'user'}};
        let res: Res.BoolResponse = tradingSystemManager.removeStoreOwner(req)

        expect(res.data.result).toBeFalsy();
    });





    test("connectDeliverySys success", () => {
        const connectSystemRes: Res.BoolResponse = {data: {result: true }};
        mocked(ExternalSystemsManager).mockImplementation(() :any => {
            return { connectSystem: () => connectSystemRes }
        });

        tradingSystemManager = new TradingSystemManager();
        const req: Req.Request = {body:{} ,token:"1"};
        const res: Res.BoolResponse = tradingSystemManager.connectDeliverySys(req);

        expect(res.data.result).toBeTruthy();
    });

    test("connectDeliverySys failure", () => {
        const connectSystemRes: Res.BoolResponse = {data: {result: false }};
        mocked(ExternalSystemsManager).mockImplementation(() :any => {
            return { connectSystem: () => connectSystemRes }
        });

        tradingSystemManager = new TradingSystemManager();
        const req: Req.Request = {body:{} ,token:"1"};
        const res: Res.BoolResponse = tradingSystemManager.connectDeliverySys(req);

        expect(res.data.result).toBeFalsy();
    });


    test("connectPaymentSys success", () => {
        const connectSystemRes: Res.BoolResponse = {data: {result: true }};
        mocked(ExternalSystemsManager).mockImplementation(() :any => {
            return { connectSystem: () => connectSystemRes }
        });

        tradingSystemManager = new TradingSystemManager();
        const req: Req.Request = {body:{} ,token:"1"};
        const res: Res.BoolResponse = tradingSystemManager.connectPaymentSys(req);

        expect(res.data.result).toBeTruthy();
    });

    test("connectPaymentSys failure", () => {
        const connectSystemRes: Res.BoolResponse = {data: {result: false }};
        mocked(ExternalSystemsManager).mockImplementation(() :any => {
            return { connectSystem: () => connectSystemRes }
        });

        tradingSystemManager = new TradingSystemManager();
        const req: Req.Request = {body:{} ,token:"1"};
        const res: Res.BoolResponse = tradingSystemManager.connectPaymentSys(req);

        expect(res.data.result).toBeFalsy();

    });


    test("setAdmin success", () => {
        const setAdminRes: Res.BoolResponse = {data: {result: true }};
        mocked(UserManager).mockImplementation(() :any => {
            return { setAdmin: () => setAdminRes }
        });
        const setAdminRequest: Req.SetAdminRequest = {body: {newAdminUserName: "mock-admin"} ,token: "1"};

        tradingSystemManager = new TradingSystemManager();
        const res: Res.BoolResponse = tradingSystemManager.setAdmin(setAdminRequest);

        expect(res.data.result).toBeTruthy();
    });

    test("setAdmin failure", () => {
        const setAdminRes: Res.BoolResponse = {data: {result: false }};
        mocked(UserManager).mockImplementation(() :any => {
            return { setAdmin: () => setAdminRes }
        });
        const setAdminRequest: Req.SetAdminRequest = {body: {newAdminUserName: "mock-admin"} ,token: "1"};
        tradingSystemManager = new TradingSystemManager();
        const res: Res.BoolResponse = tradingSystemManager.setAdmin(setAdminRequest);
        expect(res.data.result).toBeFalsy();

    });


    test("Create store success", () => {
        prepereMocksForCreateStore(true);
        const createStoreRequest: Req.OpenStoreRequest = {body: {storeName: "new store"} ,token: "1"};
        tradingSystemManager = new TradingSystemManager();
        const res: Res.BoolResponse = tradingSystemManager.createStore(createStoreRequest);
        expect(res.data.result).toBeTruthy();

    });

    test("Create store failure", () => {
        prepereMocksForCreateStore(false);
        const createStoreRequest: Req.OpenStoreRequest = {body: {storeName: "new store"} ,token: "1"};
        tradingSystemManager = new TradingSystemManager();
        const res: Res.BoolResponse = tradingSystemManager.createStore(createStoreRequest);
        expect(res.data.result).toBeFalsy();
    });


    function prepereMocksForCreateStore(succ: boolean){
        const getUserByToken: RegisteredUser= new RegisteredUser("tal","tal123");
        const createStoreRes: Res.BoolResponse = {data: {result: succ }};
        mocked(UserManager).mockImplementation(() :any => {
            return {
                getLoggedInUserByToken: () => getUserByToken, isLoggedIn: () => succ
            }
        });
        mocked(StoreManagement).mockImplementation(() :any => {
            return { addStore: () => createStoreRes}
        });
    }

    function prepareMocksForInventoryManagement(isLoggedIn: boolean) {
        const verifyResMock: Res.BoolResponse = isLoggedIn ? {data: {result: true}} : {data: {result: false}, error: {message: 'mock err'}};

        mocked(UserManager).mockImplementation(() :any => {
            return {
                verifyUser: () => verifyResMock,
                getUserByToken: () => user,
                setUserRole: () => true,
                assignStoreManagerBasicPermissions: () => true,
                getLoggedInUserByToken: () => isLoggedIn ? user : undefined
            }
        });
    }

    function generateItems(numOfItems: number): Item[] {
        let items: Item[] = [];
        for (let i = 0; i < numOfItems; i ++)
            items.push(new Item(1, 2));

        return items;
    }

    function generateProducts(numOfItems: number): ProductReq[] {
        let products: ProductReq[] = [];
        for (let i = 0; i < numOfItems; i ++)
            products.push({name: 'name', catalogNumber: 2, price: 5, category: ProductCategory.Electronics});

        return products;
    }


});
