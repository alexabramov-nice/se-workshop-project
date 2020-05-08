import {ServiceFacade} from "service_layer"

/*
curl --header "Content-Type: application/json" --request POST --data '{"body": {"username": "tnewusername", "password": "newuser"}, "token": "a8658714-a66b-45c7-9c40-cc9bb6f188dd"}'   http://localhost:4000/users/register
 */
export async function register(req,res) {
    const result = ServiceFacade.registerUser(req.body);
    return res.send(result)
}

export async function login(req,res) {
    const result = ServiceFacade.loginUser(req.body);
    return res.send(result)
}

export async function logout(req,res) {
    const result = ServiceFacade.logoutUser(req.body);
    return res.send(result)
}

export async function saveProductToCart(req,res) {
    const result = ServiceFacade.saveProductToCart(req.body);
    return res.send(result)
}

export async function removeProductFromCart(req,res) {
    const result = ServiceFacade.removeProductFromCart(req.body);
    return res.send(result)
}

export async function viewCart(req,res) {
    const result = ServiceFacade.viewCart(req.body);
    return res.send(result)
}

export async function viewRegisteredUserPurchasesHistory(req,res) {
    const result = ServiceFacade.viewRegisteredUserPurchasesHistory(req.body);
    return res.send(result)
}