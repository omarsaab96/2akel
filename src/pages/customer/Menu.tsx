import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import { useTranslation } from 'react-i18next';
import Card from '../../components/common/Card';
import { supabase } from '../../lib/supabase';
import { Restaurant } from '../../types';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../stores/authStore';

const Menu = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [myPlaces, setMyPlaces] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_menus')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      renderMenus(data.map((item) => item.restaurant_id));
    } catch (err) {
      toast.error('Failed to load menus');
      console.error('Error:', err);
    } finally {
      // setLoading(false);
    }
  };

  const renderMenus = async (restaurantIds) => {
    // setLoading(true);
    const fetchedRestaurants = [];

    for (const id of restaurantIds) {
      const { data: restaurant, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching restaurant ${id}:`, error);
        continue;
      }

      fetchedRestaurants.push(restaurant);
    }

    setMyPlaces(fetchedRestaurants);
    setLoading(false);
  }

  const searchResults = searchQuery ? myPlaces.filter(item =>
    item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  ) : [];


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-baseline">
          <h1 className="text-2xl font-semibold mr-[10px]">{t('customer.myMenus.title')}</h1>
          <p className="text-sm text-gray-600">({`${myPlaces.length}`} place{`${myPlaces.length == 1 ? '' : 's'}`})</p>
        </div>

        <Link to='/places'>
          <Button variant="ghost" size="sm">
            {t('customer.myMenus.discoverMore')}
          </Button>
        </Link>
      </div>

      {loading && (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-400 rounded w-full"></div>
          <div className="flex gap-4">
            <div className="h-[200px] bg-gray-400 rounded w-1/3"></div>
            <div className="h-[200px] bg-gray-300 rounded w-1/3"></div>
            <div className="h-[200px] bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      )}

      {/* No places */}
      {myPlaces.length == 0 && !loading && (
        <Card>
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-700 mb-2">{t('customer.myMenus.noMenus.title')}</h3>
            <p className="text-gray-500 mb-3">{t('customer.myMenus.noMenus.subtitle')}</p>

            <Link to='/places'>
              <Button variant="ghost" size="sm">
                {t('customer.myMenus.noMenus.link')}
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Search bar */}
      {myPlaces.length != 0 && !loading && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm"
            placeholder="Search places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* My places */}
      {searchQuery.length == 0 && !loading && (
        <section id="myMenus" className="bg-background" >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[16px]">
              {myPlaces.map((place, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 mb-3">
                  <div className="w-full h-[100px] bg-primary/10">
                    <img
                      className="w-full h-full object-cover"
                      src={place.image}
                      alt={place.name}
                    />
                  </div>
                  <div className="info px-2 py-2">
                    <h3 className="text-lg font-bold text-gray-900">{place.name}</h3>
                    <p className="text-sm text-gray-600">{place.address}</p>
                  </div>
                  <div className="px-2 py-2 flex align-center justify-between">
                    <div className="flex items-center p-2 min-w-[30px] text-center h-[30px] leading-[15px] rounded-lg text-lg font-bold bg-accent text-white">
                      <Star fill="white" size={15} className="mr-1" />
                      {place.rating}
                    </div>

                    <Link to={`/place/${place.id}`}>
                      <Button
                        variant="link"
                        className="!p-0 !justify-end"
                        size="sm"
                        fullWidth="true"
                      >
                        {t('common.viewMore')}
                        <ArrowRight className="w-[15px]" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* search results */}
      {searchQuery.length != 0 && searchResults.length != 0 && !loading && (
        <section id="myMenus" className="bg-background" >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[16px]">
              {searchResults.map((place, index) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 mb-3">
                  <div className="w-full h-[100px] bg-primary/10">
                    <img
                      className="w-full h-full object-cover"
                      src={place.image}
                      alt={place.name}
                    />
                  </div>
                  <div className="info px-2 py-2">
                    <h3 className="text-lg font-bold text-gray-900">{place.name}</h3>
                    <p className="text-sm text-gray-600">{place.address}</p>
                  </div>
                  <div className="px-2 py-2 flex align-center justify-between">
                    <div className="flex items-center p-2 min-w-[30px] text-center h-[30px] leading-[15px] rounded-lg text-lg font-bold bg-accent text-white">
                      <Star fill="white" size={15} className="mr-1" />
                      {place.rating}
                    </div>

                    <Link to={`/place/${place.id}`}>
                      <Button
                        variant="link"
                        className="!p-0 !justify-end"
                        size="sm"
                        fullWidth="true"
                      >
                        {t('common.viewMore')}
                        <ArrowRight className="w-[15px]" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* search results empty */}
      {searchQuery.length != 0 && searchResults.length == 0 && !loading && (
        <Card>
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Results</h3>
            <p className="text-gray-500">
              Try searching for something else.
            </p>
          </div>
        </Card>
      )}

    </div >
  );
};

export default Menu;