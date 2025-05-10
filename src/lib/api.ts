import { supabase } from './supabase';

export async function saveRestaurant(restaurantId: string, userId: string) {
  const { data, error } = await supabase
    .from('saved_menus')
    .insert([{ restaurant_id: restaurantId, user_id: userId }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function unsaveRestaurant(restaurantId: string, userId: string) {
  const { error } = await supabase
    .from('saved_menus')
    .delete()
    .match({ restaurant_id: restaurantId, user_id: userId });

  if (error) {
    throw error;
  }
}

export async function isRestaurantSaved(restaurantId: string) {
  const { data, error } = await supabase
    .from('saved_menus')
    .select('id')
    .match({ restaurant_id: restaurantId })
    .maybeSingle();

  if (error) {
    throw error;
  }

  return !!data;
}

export async function getSavedRestaurants() {
  const { data, error } = await supabase
    .from('saved_menus')
    .select(`
      id,
      restaurant:profiles!restaurant_id (
        id,
        name,
        restaurant_name,
        cuisine,
        address,
        phone,
        image
      )
    `);

  if (error) {
    throw error;
  }

  return data;
}