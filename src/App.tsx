import React, { useState } from 'react';
import './App.css';
import { DispatchMessage } from './types';

function App() {
    const [fetchRes, setFetchRes] = React.useState('loading');
    const [inputVal, setInputVal] = useState('143617')

    const sendRequest = () => {

        chrome.tabs && chrome.tabs.query({
            active: true,
            currentWindow: true
        }, tabs => {

            chrome.tabs.sendMessage(
                tabs[0].id || 0,
                { type: 'POST_ADD_TROLLEY', prod_id: inputVal } as DispatchMessage,
                (response) => {
                    setFetchRes(response)
                });
        });

    }

    return (
        <div className="App bg-gray-100 rounded p-6" style={{
            minWidth: 768, minHeight: 568
        }}>
            <div>
                id:<textarea value={inputVal} onChange={e => setInputVal(e.target.value)} />
            </div>
            <button className="p-2 bg-red-500" onClick={() => sendRequest()}>Request</button>
            <pre className="mt-8">{JSON.stringify(fetchRes, null, 2)}</pre>
        </div >
    );
}

export default App;
