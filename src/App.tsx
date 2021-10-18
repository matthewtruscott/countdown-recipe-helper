import React, { useCallback, useEffect, useReducer, useState } from 'react';
import './App.css';
import { removeStopwords } from 'stopword'
import { parse } from 'recipe-ingredient-parser-v2'
import { DispatchMessage } from './types';

import { RecipeItemSearchResult, RecipeItem } from './types/Cart';
import recipeItemsReducer from './reducers/recipeItemsReducer';

const staples = [
    'oil',
    'salt',
    'pepper',
    'butter',
]

const initialState: RecipeItem[] = [];

const App = () => {
    const [recipeInputValue, setRecipeInputValue] = useState<string>('')
    const [recipeItems, dispatch] = useReducer(recipeItemsReducer, initialState);
    console.log({ recipeItems });

    const retrieveIngredientsResults = () => {
        recipeItems.forEach(recipeItem => searchIngredient(dispatch, recipeItem))
    }

    const addItemsToCart = () => {
        recipeItems.forEach((item: RecipeItem) => {
            if (item.disabled) return
            chrome.tabs && chrome.tabs.query({
                active: true,
                currentWindow: true
            }, tabs => {
                chrome.tabs.sendMessage(
                    tabs[0].id || 0,
                    { type: 'POST_ADD_TROLLEY', prod_id: item.searchResults[0].res.sku, quantity: 1 } as DispatchMessage,
                    (response) => {
                        //setFetchRes(response)
                    });
            });
        })
    }

    useEffect(() => {
        dispatch({ type: 'RESET_RECIPE_ITEMS' })
        const recipeInputArray: string[] = recipeInputValue.split(/\n/);
        if (recipeInputArray.length <= 1) return

        recipeInputArray.forEach((recipeString: string, index: number) => createRecipeItem(dispatch, recipeString, index,))
    }, [recipeInputValue])

    return (
        <div className="grid grid-cols-1 gap-6 p-8 bg-gray-100 rounded " style={{
            width: 768, minHeight: 568
        }}>
            <div className="">
                <div className="text-2xl font-bold"> Add Recipe To Trolley:</div>
                <textarea placeholder="eg. 3 tsp Garlic Powder" className="w-full h-64 px-8 py-6 mt-8 shadow-lg rounded-xl" value={recipeInputValue} onChange={e => setRecipeInputValue(e.target.value)} />
                <div className="flex justify-items-end">
                    <button className="px-4 py-2 mt-8 ml-auto text-sm text-white bg-green-600 rounded" onClick={() => retrieveIngredientsResults()}>Retrieve Results</button>
                </div>
                <div className="mt-6">
                    {recipeItems.length > 0 && recipeItems.filter(item => !item.disabled).map((recipeItem: RecipeItem, index) => (

                        <div className="flex mt-8" style={{ minHeight: 154, opacity: recipeItem.disabled ? 0.75 : 1 }}>
                            <div className="flex-shrink-0 w-48 pr-8 ">
                                <div className="text-lg font-medium text-green-600 capitalize">{recipeItem?.name}</div>
                                <div className="text-sm font-normal text-gray-500 capitalize">{recipeItem?.quantity}{" "}{recipeItem?.unit}</div>
                                <div className="text-sm italic font-normal text-gray-500 capitalize">{recipeItem?.extra}{" "}{recipeItem?.extra}</div>
                            </div>

                            <div className="grid w-full grid-cols-3 gap-6">
                                {recipeItem?.searchResults?.slice(0, 3).map((item: any, resultIndex: number) => (
                                    <div className={`p-3 flex flex-col  w-full bg-white rounded-xl shadow-lg mb-3 flex-grow ${resultIndex === 0 ? 'border-2 border-green-600' : ''}`}
                                        style={{ boxShadow: resultIndex === 0 ? '0 3px 11px -2px rgb(5 150 105 / 62%), 0 4px 6px -2px rgb(0 0 0 / 5%)' : '' }}>
                                        {item.res.images?.big && <img src={item.res.images?.big} alt="" className="p-3" />}
                                        <div className="mt-auto font-medium capitalize">{item.res?.name}</div>
                                        <div>
                                            <div>{item?.confidence}</div>
                                            <div>{item.res.price?.salePrice}</div>
                                            <div>{item.res.size?.volumeSize}</div>
                                            {/* <div>price per 100g</div> */}
                                            {/* <div>sale amount</div> */}
                                        </div>


                                    </div>
                                )
                                )}
                            </div>
                        </div>))}
                    <div className="flex justify-items-end">
                        <button
                            onClick={addItemsToCart}
                            className="px-4 py-2 mt-8 ml-auto text-sm text-white bg-green-600 rounded">
                            Add items to cart
                        </button>
                    </div>


                    <div className="mt-12 text-2xl font-medium text-gray-600">Staples</div>
                    {recipeItems.length > 0 && recipeItems.filter(item => item.disabled).map((recipeItem: RecipeItem, index) => (

                        <div className="flex mt-8" style={{ minHeight: 154, opacity: recipeItem.disabled ? 0.75 : 1 }}>
                            <div className="flex-shrink-0 w-48 pr-8 ">
                                <div className="text-lg font-medium text-gray-600 capitalize">{recipeItem?.name}</div>
                                <div className="text-sm font-normal text-gray-600 capitalize">{recipeItem?.quantity}{" "}{recipeItem?.unit}</div>
                            </div>

                            <div className="grid w-full grid-cols-3 gap-6">
                                {recipeItem?.searchResults?.slice(0, 3).map((item: any, resultIndex: number) => (
                                    <div className={`p-3 flex flex-col  w-full bg-white rounded-xl shadow-lg mb-3 flex-grow`}>
                                        {item.res.images?.big && <img src={item.res.images?.big} alt="" className="p-3" />}
                                        <div className="mt-auto font-medium capitalize">{item.res?.name}</div>
                                        <div>
                                            <div>{item.res.price?.salePrice}</div>
                                            <div>price per 100g</div>
                                            <div>sale amount</div>
                                        </div>


                                    </div>
                                )
                                )}
                            </div>
                        </div>))}
                </div>
            </div>
        </div >
    );
}

export default App;


const createRecipeItem = (dispatch: Function, recipeString: string, index: number) => {

    const { ingredient, unit, quantity, minQty, maxQty } = parse(recipeString)
    const ingredientSplit = ingredient.replace('-', ' ')
        .split(',')

    const ingredientStriped = ingredientSplit[0].replace(/[^\w\s]/gi, '').replace('taste', '')
    const tags = removeStopwords(ingredientStriped.toLowerCase().split(' '))

    const isDisabled = tags.includes('salt') && tags.includes('pepper')

    const extra = ingredientSplit[1] ? ingredientSplit[1] : ''

    const returnIsAStable = () => {
        let isStaple = false
        staples.forEach(staple => {
            if (ingredientStriped.toLowerCase().includes(staple)) isStaple = true
        })
        return isStaple
    }

    const isStaple = returnIsAStable()

    const recipeItem: RecipeItem = {
        index: index,
        origin: recipeString,
        name: ingredientSplit[0],
        tags: tags,
        extra: extra,
        searchTags: tags,
        unit: unit,
        quantity: quantity,
        minQty,
        maxQty,
        isStaple: isStaple,
        disabled: isDisabled,
        searchResults: []
    }
    dispatch({ type: 'ADD_RECIPE_ITEM', payload: recipeItem })
}


const returnConfidence = (searchTags: string[], ingredientResult: any) => {
    const resultNameArray = ingredientResult.name.split(' ')
    let wordsIncluded = 0
    searchTags.forEach(tag => {
        if (resultNameArray.includes(tag)) wordsIncluded++
    })
    const confidence = wordsIncluded / searchTags.length

    return confidence
}



const searchIngredient = (dispatch: Function, item: RecipeItem) => {
    console.log({ item })
    chrome.tabs && chrome.tabs.query({
        active: true,
        currentWindow: true
    }, tabs => {
        chrome.tabs.sendMessage(
            tabs[0].id || 0,
            { type: 'SEARCH_INGREDIENT', searchValue: item?.searchTags.join(' ') } as DispatchMessage,
            (res) => {

                const ingredientResults = res.products.items.filter((item: any) => item.type === 'Product')
                const newSearchResults: RecipeItemSearchResult[] = ingredientResults.map((ingredientResult: any) => {

                    const confidence = returnConfidence(item.searchTags, ingredientResult)
                    const itemSearchResult: RecipeItemSearchResult = {
                        res: ingredientResult,
                        confidence
                    }
                    return itemSearchResult
                })

                dispatch({
                    type: 'UPDATE_ITEM_SEARCH_RESULTS',
                    payload: {
                        recipeIndex: item.index,
                        searchResults: newSearchResults
                    }
                })

            });
    });

}