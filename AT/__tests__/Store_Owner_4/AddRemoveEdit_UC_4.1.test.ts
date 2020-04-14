import { Bridge, Driver } from "../../src/";
import { Store, Credentials } from "../../src/test_env/types";

describe("Add Remove Edit Products, UC: 3.2", () => {
  let _serviceBridge: Bridge;
  let _storeInformation: Store;
  let _credentials: Credentials;

  beforeEach(() => {
    _serviceBridge = Driver.makeBridge();
    _storeInformation = {
      name: "some-mock-store",
      description: "selling cool items",
      id: "id.stores.boom",
    };
    _credentials = { userName: "ron", password: "ronpwd" };
  });

  test("Create Store - Happy Path: valid store information - logged in user", () => {
    _serviceBridge.register(_credentials);
    _serviceBridge.login(_credentials);
    const { name } = _serviceBridge.addStore(_storeInformation).data;
    expect(name).toBe(_storeInformation.name);
  });

  test("Create Store - Sad Path: empty store information", () => {
    _serviceBridge.register(_credentials);
    _serviceBridge.login(_credentials);
    const error = _serviceBridge.addStore({
      name: "",
      description: "",
      id: "",
    }).error;
    expect(error).toBeDefined();
  });

  test("Create Store - Sad Path: missing name", () => {
    _serviceBridge.register(_credentials);
    _serviceBridge.login(_credentials);
    const error = _serviceBridge.addStore({
      name: "",
      description: "nice description",
      id: "cool.unique.id",
    }).error;
    expect(error).toBeDefined();
  });

  test("Create Store - Sad Path: create and create again with same info", () => {
    _serviceBridge.register(_credentials);
    _serviceBridge.login(_credentials);
    const { name } = _serviceBridge.addStore(_storeInformation).data;
    expect(name).toBe(_storeInformation.name);
    const error = _serviceBridge.addStore(_storeInformation).error;
    expect(error).toBeDefined();
  });

  test("Create Store - Sad Path: valid store information - not logged in user", () => {
    _serviceBridge.logout();
    const error = _serviceBridge.addStore(_storeInformation).error;
    expect(error).toBeDefined();
  });
});
