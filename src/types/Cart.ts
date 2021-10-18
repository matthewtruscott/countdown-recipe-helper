


export interface RecipeItem {
    index: number,
    origin: string,
    tags: string[],
    searchTags: string[],
    extra: string,
    name: string,
    unit: any,
    quantity: any,
    minQty: any,
    maxQty: any,
    disabled: boolean,
    isStaple: boolean,
    searchResults: RecipeItemSearchResult[]
}

export interface RecipeItemSearchResult {
    res: any,
    confidence: number,
}


export interface CartItem {
    type: string
}

export interface Cart {
    type: CartItem[]
}

