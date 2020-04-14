interface Error {
    message: string;
    options?: any;
}

interface ErrorMessages {
    [key: string]:string;
}


const errorMsg:ErrorMessages = {
    E_NF: "Not found",
    E_CON: "Connection failed",
    E_AL: "Already at this state",
    E_NAL: "User is not at that state.",
    E_PROD_ADD: "Could not add products.",
    E_PROD_REM: "Could not remove products.",
    E_PROD_EXISTS: "Product already exists in store.",
    E_PROD_DOES_NOT_EXIST: "Product does not exist in store.",
    E_USER_DOES_NOT_EXIST: "User does not exist.",
    E_ITEMS_ADD:  "Could not add items.",
    E_ITEMS_REM: "Could not remove items.",
    E_NOT_LOGGED_IN: "User is not logged in.",
    E_INVALID_STORE: "Store does not exist.",
    E_NOT_AUTHORIZED: "User is not authorized.",
    E_STORE_ADDITION: "Could not add store.",
    E_ASSIGN: "Failed assigning",
    E_INVALID_PROD: "Invalid product."



};

export { Error, ErrorMessages, errorMsg };