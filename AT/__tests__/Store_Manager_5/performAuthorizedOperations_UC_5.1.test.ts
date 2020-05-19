import {Bridge, Driver, Store, Credentials, Item, PERMISSION, Discount, Product} from "../../";
import {ProductBuilder} from "../../src/test_env/mocks/builders/product-builder";
import {ItemBuilder} from "../../src/test_env/mocks/builders/item-builder";
import {ProductCategory} from "se-workshop-20-interfaces/dist/src/CommonInterface";
import * as utils from "../../utils"

describe("Perform authorized operations, UC: 5.1", () => {
    let _driver = new Driver;
    let _serviceBridge: Bridge;
    let _testProduct: Product;
    let _testItem: Item;
    let _testStore: Store;
    let _storeManagerCredentials: Credentials;

    beforeEach(() => {
        _serviceBridge = _driver
            .resetState()
            .startSession()
            .initWithDefaults()
            .registerWithDefaults()
            .loginWithDefaults()
            .getBridge();

        _testProduct = new ProductBuilder()
            .withName("test_name")
            .withPrice(25)
            .withCategory(ProductCategory.CLOTHING)
            .withCatalogNumber(789)
            .getProduct();
        _testItem = new ItemBuilder()
            .withId(123)
            .withCatalogNumber(789)
            .getItem();

        _testStore = {
            name: "some-mock-store",
        };
        _storeManagerCredentials = {userName: "manager-username", password: "manager-password"};

        _serviceBridge.createStore(_testStore);
        _serviceBridge.logout(); // logging out so that manager can register

        _serviceBridge.register(_storeManagerCredentials); // store manager registers

        _driver.loginWithDefaults(); // Owner is logging in again
        _serviceBridge.assignManager(_testStore, _storeManagerCredentials);
    });


    afterAll(() => {
        utils.terminateSocket();
    });


    test("Act, no permissions", () => {
        _serviceBridge.logout() // Owner signs out
        _serviceBridge.login(_storeManagerCredentials); // Manager is logged in

        const {data, error} = _serviceBridge.addProductsToStore(_testStore, [_testProduct]);
        expect(data).toBeUndefined();
        expect(error).toBeDefined();
    });

    test("Act, with permissions", () => {
        _serviceBridge.grantPermissions(_storeManagerCredentials, _testStore, [PERMISSION.MANAGE_INVENTORY]);
        _serviceBridge.logout() // Owner signs out
        _serviceBridge.login(_storeManagerCredentials); // Manager is logged in

        const {data, error} = _serviceBridge.addProductsToStore(_testStore, [_testProduct]);
        expect(error).toBeUndefined();
        expect(data).toBeDefined();
    });
});
