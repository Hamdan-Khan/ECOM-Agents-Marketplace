"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  purchaseType: "one-time" | "subscription";
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => { success: boolean; message?: string };
  removeItem: (id: number, purchaseType: "one-time" | "subscription") => void;
  updateQuantity: (
    id: number,
    purchaseType: "one-time" | "subscription",
    quantity: number
  ) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  hasItem: (id: number, purchaseType: "one-time" | "subscription") => boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const isInitialLoad = useRef(true);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const hasItem = (id: number, purchaseType: "one-time" | "subscription"): boolean => {
    return items.some(
      (item) => item.id === id && item.purchaseType === purchaseType
    );
  };

  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    const existingItem = items.find(
      (item) => item.id === newItem.id && item.purchaseType === newItem.purchaseType
    );

    if (existingItem) {
      return {
        success: false,
        message: "This item is already in your cart"
      };
    }

    setItems((prevItems) => [...prevItems, { ...newItem, quantity: 1 }]);
    return { success: true };
  };

  const removeItem = (id: number, purchaseType: "one-time" | "subscription") => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.id === id && item.purchaseType === purchaseType)
      )
    );
  };

  const updateQuantity = (
    id: number,
    purchaseType: "one-time" | "subscription",
    quantity: number
  ) => {
    if (quantity <= 0) {
      removeItem(id, purchaseType);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.purchaseType === purchaseType
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };
  
  // Calculate totals efficiently in one pass
  const total = items.reduce(
    (acc, item) => ({
      items: acc.items + item.quantity,
      price: acc.price + item.price * item.quantity,
    }),
    { items: 0, price: 0 }
  );

  const totalItems = total.items;
  const totalPrice = total.price;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        hasItem
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
