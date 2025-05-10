import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Category, MenuItem } from '../types';
import { supabase } from '../lib/supabase';
import { uploadMenuImage, deleteMenuImage } from '../utils/storage';

interface MenuState {
  categories: Category[];
  menuItems: MenuItem[];
  isLoading: boolean;

  // Category actions
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, data: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  reorderCategories: (categoryIds: string[]) => Promise<void>;

  // Menu item actions
  addMenuItem: (item: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>, image?: File) => Promise<MenuItem>;
  updateMenuItem: (id: string, data: Partial<MenuItem>, newImage?: File) => Promise<MenuItem>;
  deleteMenuItem: (id: string) => Promise<void>;

  // Getters
  getCategoriesByRestaurant: (restaurantId: string) => Category[];
  getMenuItemsByCategory: (categoryId: string) => MenuItem[];
  getMenuItemById: (id: string) => MenuItem | undefined;

  hydrateFromDB: () => Promise<void>;
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set, get) => ({
      categories: [],
      menuItems: [],
      isLoading: false,

      // Category actions
      addCategory: async (categoryData) => {
        const { data, error } = await supabase
          .from('categories')
          .insert([categoryData])
          .select()
          .single();

        if (error) throw error;

        const newCategory = data;
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));

        return newCategory;
      },

      updateCategory: async (id, data) => {
        const { data: updatedCategory, error } = await supabase
          .from('categories')
          .update(data)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? updatedCategory : category
          ),
        }));

        return updatedCategory;
      },

      deleteCategory: async (id) => {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);

        if (error) throw error;

        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
          menuItems: state.menuItems.filter((item) => item.categoryId !== id),
        }));
      },

      reorderCategories: async (categoryIds) => {
        const updates = categoryIds.map((id, index) => ({
          id,
          displayOrder: index,
        }));

        for (const { id, displayOrder } of updates) {
          const { error } = await supabase
            .from('categories')
            .update({ displayOrder })
            .eq('id', id);

          if (error) throw error;

          set((state) => {
            const updatedCategories = [...state.categories];
            categoryIds.forEach((id, index) => {
              const categoryIndex = updatedCategories.findIndex((c) => c.id === id);
              if (categoryIndex !== -1) {
                updatedCategories[categoryIndex] = {
                  ...updatedCategories[categoryIndex],
                  displayOrder: index,
                };
              }
            });
            return { categories: updatedCategories };
          });
        }


      },

      // Menu item actions
      addMenuItem: async (itemData, image) => {
        let imageUrl = undefined;

        if (image) {
          // Get restaurant ID from the category
          const category = get().categories.find(c => c.id === itemData.categoryId);
          if (!category) throw new Error('Category not found');

          imageUrl = await uploadMenuImage(image, category.restaurantId);
        }

        const { data, error } = await supabase
          .from('menu_items')
          .insert([{ ...itemData, image_url: imageUrl }])
          .select()
          .single();

        if (error) {
          // If there was an error, delete the uploaded image
          if (imageUrl) {
            await deleteMenuImage(imageUrl).catch(console.error);
          }
          throw error;
        }

        const newItem = data;
        set((state) => ({
          menuItems: [...state.menuItems, newItem],
        }));

        return newItem;
      },

      updateMenuItem: async (id, data, newImage) => {
        const currentItem = get().menuItems.find(item => item.id === id);
        if (!currentItem) throw new Error('Menu item not found');

        let imageUrl = data.image_url;

        if (newImage) {
          // Get restaurant ID from the category
          const category = get().categories.find(c => c.id === (data.categoryId || currentItem.categoryId));
          if (!category) throw new Error('Category not found');

          // Upload new image
          imageUrl = await uploadMenuImage(newImage, category.restaurantId);

          // Delete old image if it exists
          if (currentItem.image_url) {
            await deleteMenuImage(currentItem.image_url).catch(console.error);
          }
        }

        const { data: updatedItem, error } = await supabase
          .from('menu_items')
          .update({ ...data, image_url: imageUrl })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          // If there was an error and we uploaded a new image, delete it
          if (newImage && imageUrl) {
            await deleteMenuImage(imageUrl).catch(console.error);
          }
          throw error;
        }

        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === id ? updatedItem : item
          ),
        }));

        return updatedItem;
      },

      deleteMenuItem: async (id) => {
        const item = get().menuItems.find(item => item.id === id);
        if (!item) throw new Error('Menu item not found');

        const { error } = await supabase
          .from('menu_items')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // Delete the image if it exists
        if (item.image_url) {
          await deleteMenuImage(item.image_url).catch(console.error);
        }

        set((state) => ({
          menuItems: state.menuItems.filter((item) => item.id !== id),
        }));
      },

      // Getters
      getCategoriesByRestaurant: (restaurantId) => {
        return get().categories
          .filter((category) => category.restaurantId === restaurantId)
          .sort((a, b) => a.displayOrder - b.displayOrder);
      },

      getMenuItemsByCategory: (categoryId) => {
        return get().menuItems.filter((item) => item.categoryId === categoryId);
      },

      getMenuItemById: (id) => {
        return get().menuItems.find((item) => item.id === id);
      },

      hydrateFromDB: async () => {
        set({ isLoading: true });

        const [catRes, itemRes] = await Promise.all([
          supabase.from('categories').select('*'),
          supabase.from('menu_items').select('*'),
        ]);

        if (catRes.error || itemRes.error) {
          throw catRes.error || itemRes.error;
        }

        set({
          categories: catRes.data,
          menuItems: itemRes.data,
          isLoading: false,
        });
      },
    }),
    {
      name: 'menu-storage',
    }
  )
);