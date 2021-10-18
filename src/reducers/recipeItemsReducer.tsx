import { RecipeItemSearchResult, RecipeItem } from '../types/Cart'

function recipeItemsReducer(state: RecipeItem[], action: any): RecipeItem[] {
    switch (action.type) {
        case 'RESET_RECIPE_ITEMS':
            console.log('[ RESET_RECIPE_ITEMS ]', { action });
            return [];

        case 'ADD_RECIPE_ITEM':
            console.log('[ ADD_RECIPE_ITEM ]', { action });
            return [...state, action.payload];

        case 'UPDATE_ITEM_SEARCH_RESULTS': {
            console.log('[ UPDATE_ITEM_SEARCH_RESULTS ]', { action });
            const { recipeIndex, searchResults } = action.payload

            const newState = [...state]
            newState[recipeIndex].searchResults = searchResults as RecipeItemSearchResult[]
            return newState
        }
        default:
            throw new Error();
    }
}
export default recipeItemsReducer