import React, { createContext, useReducer, useCallback, useEffect } from 'react';

export const CartContext = createContext();

const initialState = {
  items: [],
  restaurantId: null,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        items: action.payload.items || [],
        restaurantId: action.payload.restaurantId || null,
      };

    case 'ADD_ITEM': {
      const { dish, newRestaurantId } = action.payload;
      
      let newState = state;
      if (newRestaurantId !== state.restaurantId && state.restaurantId !== null) {
        newState = { items: [], restaurantId: newRestaurantId };
      }

      const existingItem = newState.items.find(item => item.dish._id === dish._id);
      
      if (existingItem) {
        return {
          ...newState,
          items: newState.items.map(item =>
            item.dish._id === dish._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          restaurantId: newRestaurantId,
        };
      }

      return {
        ...newState,
        items: [...newState.items, { dish, quantity: 1 }],
        restaurantId: newRestaurantId,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { dishId, quantity } = action.payload;

      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.dish._id !== dishId),
          restaurantId: state.items.length === 1 ? null : state.restaurantId,
        };
      }

      return {
        ...state,
        items: state.items.map(item =>
          item.dish._id === dishId ? { ...item, quantity } : item
        ),
      };
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.dish._id !== action.payload),
        restaurantId: state.items.length === 1 ? null : state.restaurantId,
      };

    case 'CLEAR_CART':
      return {
        items: [],
        restaurantId: null,
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    const savedCart = localStorage.getItem('swadhan_cart');
    const savedRestaurantId = localStorage.getItem('swadhan_restaurant_id');
    if (savedCart) {
      dispatch({
        type: 'LOAD_CART',
        payload: {
          items: JSON.parse(savedCart),
          restaurantId: savedRestaurantId,
        },
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('swadhan_cart', JSON.stringify(state.items));
    localStorage.setItem('swadhan_restaurant_id', state.restaurantId || '');
  }, [state]);

  const addToCart = useCallback((dish, newRestaurantId) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { dish, newRestaurantId },
    });
  }, []);

  const updateQuantity = useCallback((dishId, quantity) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { dishId, quantity },
    });
  }, []);

  const removeFromCart = useCallback((dishId) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: dishId,
    });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const getTotal = useCallback(() => {
    return state.items
      .reduce((total, item) => total + item.dish.price * item.quantity, 0)
      .toFixed(2);
  }, [state.items]);

  const getTotalItems = useCallback(() => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  }, [state.items]);

  const getQuantity = useCallback((dishId) => {
    const item = state.items.find(i => i.dish._id === dishId);
    return item ? item.quantity : 0;
  }, [state.items]);

  const value = {
    cart: state.items,
    restaurantId: state.restaurantId,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotal,
    getTotalItems,
    getQuantity,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
