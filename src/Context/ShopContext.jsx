import React, { createContext } from 'react'
import all_product from "../Components/Assets/all_product"
import { useState } from 'react';
import Item from '../Components/Item/Item';

export const ShopContext = createContext(null);

const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index < all_product.length+1; index++){
        cart[index] = 0;
    }
    return cart;
}

const ShopContextProvider = (props) => {

    const [cartItems,setCartItems] = useState(getDefaultCart());
    // const contextValue = {all_product,cartItems};

    const addToCart = (ItemId) => {
        setCartItems((prev) => ({...prev,[ItemId]:prev[ItemId] + 1}))
    }

    const removeFromCart = (ItemId) => {
        setCartItems((prev) => ({...prev,[ItemId]:prev[ItemId] - 1}))
    }

    const contextValue = {all_product,cartItems,addToCart,removeFromCart};

    return(
       <ShopContext.Provider value={contextValue}>
            {props.children}
       </ShopContext.Provider> 
    )
}

export default ShopContextProvider;


