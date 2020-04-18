import {
  Item,
  Response,
  Store,
  User,
  Credentials,
  SearchData,
  RATE,
  CreditCard,
  Discount,
} from "./types";
import * as DummyTypes from "../../__tests__/dummy_values/dummyValues";

export interface Bridge {
  setReal?(real: Bridge): void;
  setToken(token: string): void;
  init(cred: Credentials): DummyTypes.IBoolResponse;
  removeItem(item: Item): DummyTypes.IResponse;
  removeStore(store: Store): DummyTypes.IResponse;
  createStore(store: Store): DummyTypes.IStoreResponse;
  addItemToStore(store: Store, item: Item): DummyTypes.IResponse;
  viewStore(store: Store): DummyTypes.IStoreResponse;
  viewItem(item: Item): DummyTypes.IItemResponse;
  getLoggedInUsers(): DummyTypes.IUsersResponse;
  removeUser(user: User): DummyTypes.IResponse;
  getUserByName(user: User): DummyTypes.IUserResponse;
  login(credentials: Credentials): DummyTypes.IResponse;
  register(credentials: Credentials): DummyTypes.IResponse;
  logout(): DummyTypes.IResponse;
  getPurchaseHistory(): DummyTypes.IPurchaseHistoryResponse;
  search(input: SearchData): DummyTypes.ISearchResponse;
  rate(toRate: Store | Item, rate: RATE): DummyTypes.IResponse;
  addToCart(item: Item): DummyTypes.IResponse;
  watchCart(): DummyTypes.ICartResponse;
  checkout(creditCard: CreditCard): DummyTypes.ICheckoutResponse;
  setDiscountToStore(store: Store, discount: Discount): DummyTypes.IResponse;
  setDiscountToItem(
    store: Store,
    item: Item,
    discount: Discount
  ): DummyTypes.IResponse;
  startSession(): DummyTypes.ISessionResponse;
}
