
import { DispatchMessage } from '../types';


const messagesFromReactAppListener = (request: DispatchMessage, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => {
    console.log('[content.js]. Message received', request);

    handle(request).then(res => {
        console.log({ res })
        sendResponse(res)
    });
    return true; // return true to indicate you want to send a response asynchronously
}


function handle(request: any) {
    return new Promise(async (resolve) => {

        if (request.type === 'POST_ADD_TROLLEY') {
            console.log('Starting : "POST_ADD_TROLLEY"')

            const response = await fetch('https://shop.countdown.co.nz/api/v1/trolleys/my/items', {
                'method': 'POST',
                'body': JSON.stringify({
                    sku: request.prod_id,
                    quantity: request.quantity,
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'OnlineShopping.WebApp',
                },
            })

            const res = await response.json();
            console.log('[content.js POST_ADD_TROLLEY]. Message response', res);
            resolve(res);
        }

        if (request.type === 'SEARCH_INGREDIENT') {
            console.log('Starting : "SEARCH_INGREDIENT"')

            const response = await fetch('https://shop.countdown.co.nz/api/v1/products?target=search&search=' + request.searchValue, {
                'method': 'GET',
                headers: {
                    'X-Requested-With': 'OnlineShopping.WebApp',
                },
            })

            const res = await response.json();
            console.log('[content.js SEARCH_INGREDIENT]. Message response', res);
            resolve(res);
        }
    });
}



/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime?.onMessage.addListener(messagesFromReactAppListener);

// alert('hello')
console.log('HELLO')