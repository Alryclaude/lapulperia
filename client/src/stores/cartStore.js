import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, pulperia) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (item) => item.product.id === product.id
        );

        if (existingIndex >= 0) {
          const newItems = [...items];
          newItems[existingIndex].quantity += 1;
          set({ items: newItems });
        } else {
          set({
            items: [
              ...items,
              {
                product,
                pulperia: {
                  id: pulperia.id,
                  name: pulperia.name,
                  logo: pulperia.logo,
                },
                quantity: 1,
              },
            ],
          });
        }
      },

      removeItem: (productId) => {
        const { items } = get();
        set({ items: items.filter((item) => item.product.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        const { items } = get();
        if (quantity <= 0) {
          set({ items: items.filter((item) => item.product.id !== productId) });
          return;
        }

        const newItems = items.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        );
        set({ items: newItems });
      },

      clearCart: () => set({ items: [] }),

      clearPulperiaItems: (pulperiaId) => {
        const { items } = get();
        set({ items: items.filter((item) => item.pulperia.id !== pulperiaId) });
      },

      getItemsByPulperia: () => {
        const { items } = get();
        const grouped = {};

        items.forEach((item) => {
          if (!grouped[item.pulperia.id]) {
            grouped[item.pulperia.id] = {
              pulperia: item.pulperia,
              items: [],
              total: 0,
            };
          }
          grouped[item.pulperia.id].items.push(item);
          grouped[item.pulperia.id].total += item.product.price * item.quantity;
        });

        return Object.values(grouped);
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
      },

      isInCart: (productId) => {
        const { items } = get();
        return items.some((item) => item.product.id === productId);
      },

      getItemQuantity: (productId) => {
        const { items } = get();
        const item = items.find((item) => item.product.id === productId);
        return item?.quantity || 0;
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
