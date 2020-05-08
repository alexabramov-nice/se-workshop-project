import express from "express";
import * as StoreController from "../controllers/store_controllers";

const router = express.Router();


router.post("/viewStoreInfo", StoreController.viewStoreInfo);
router.post("/viewProductInfo", StoreController.viewProductInfo);
router.post("/search", StoreController.search);
router.post("/purchase", StoreController.purchase);
router.post("/createStore", StoreController.createStore);
router.post("/changeProductName", StoreController.changeProductName);
router.post("/changeProductPrice", StoreController.changeProductPrice);
router.post("/addItems", StoreController.addItems);
router.post("/removeItems", StoreController.removeItems);
router.post("/removeProductsWithQuantity", StoreController.removeProductsWithQuantity);
router.post("/addNewProducts", StoreController.addNewProducts);
router.post("/removeProducts", StoreController.removeProducts);
router.post("/setDiscountsPolicy", StoreController.setDiscountsPolicy);
router.post("/addDiscount", StoreController.addDiscount);
router.post("/removeProductDiscount", StoreController.removeProductDiscount);
router.post("/assignStoreOwner", StoreController.assignStoreOwner);
router.post("/removeStoreOwner", StoreController.removeStoreOwner);
router.post("/assignStoreManager", StoreController.assignStoreManager);
router.post("/addManagerPermissions", StoreController.addManagerPermissions);
router.post("/removeManagerPermissions", StoreController.removeManagerPermissions);
router.post("/viewManagerPermissions", StoreController.viewManagerPermissions);
router.post("/removeStoreManager", StoreController.removeStoreManager);
router.post("/viewUsersContactUsMessages", StoreController.viewUsersContactUsMessages);
router.post("/viewStorePurchasesHistory", StoreController.viewStorePurchasesHistory);
router.post("/setPurchasePolicy", StoreController.setPurchasePolicy);


router.get("/", (req, res) => res.send('Hello World!'));
router.get("/:storeName", (req, res) => res.send('Hello World!'));

export default router;
