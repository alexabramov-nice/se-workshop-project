import {getInstance, CreateInstance} from "domain_layer/dist/src/api-ext/external_api";
import * as Req from "domain_layer/dist/src/api-ext/Request";
import * as Res from "domain_layer/dist/src/api-ext/Response";
import {TradingSystemManager as TS} from "domain_layer/dist/src/trading_system/TradingSystemManager";
import {ViewCartReq} from "domain_layer/dist/src/api-ext/Request";

export const registerUser = (req: Req.RegisterRequest, ts: TS): Res.BoolResponse => {
    return ts.register(req);
}

export const loginUser = (req: Req.LoginRequest, ts: TS): Res.BoolResponse => {
    return ts.login(req);
}

export const logoutUser = (req: Req.LogoutRequest, ts: TS): Res.BoolResponse => {
    return ts.logout(req);
}

 export const saveProductToCart = (req:Req.SaveToCartRequest,ts: TS):Res.BoolResponse =>{
    return ts.saveProductToCart(req);
}

export const removeProductFromCart = (req:Req.RemoveProductRequest,ts: TS):Res.BoolResponse => {
    return ts.removeProductFromCart(req);
}

export const viewCart=(req:ViewCartReq,ts:TS):Res.ViewCartRes => {
    return ts.viewCart(req);
}



    export const viewRegisteredUserPurchasesHistory = (req: Req.ViewRUserPurchasesHistoryReq,ts: TS): Res.ViewRUserPurchasesHistoryRes => {
    return ts.viewRegisteredUserPurchasesHistory(req);
}
