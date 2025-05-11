import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Restaurant, Category, MenuItem } from '../types';
import { MapPin, Phone, Star, Trash2, ShoppingCart, X } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SaveButton from '../components/common/SaveButton';
import { useTranslation } from 'react-i18next';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useAuthStore } from '../stores/authStore';
import { useOrderStore } from '../stores/orderStore';
import { toast } from 'react-hot-toast';


const Place = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { id } = useParams();
  const { addToCart, getCart, clearCart, getCartTotal, updateCartItemQuantity, removeFromCart, placeOrder } = useOrderStore();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState([]);
  const [cartIsOpen, setCartIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const cartRef = useRef(null);
  const toggleRef = useRef(null);

  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    const footer = document.getElementById('app-footer');

    const handleScroll = () => {
      if (!footer) return;
      const rect = footer.getBoundingClientRect();
      setIsFooterVisible(rect.top < window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    fetchRestaurantDetails();
  }, [id]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  useEffect(() => {
    if (cartIsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [cartIsOpen]);

  const toggleCart = () => {
    setCartIsOpen(prev => !prev);
  }

  const handleClickOutside = (event) => {
    if (cartRef.current &&
      toggleRef.current &&
      !cartRef.current.contains(event.target) &&
      !toggleRef.current.contains(event.target)) {
      setCartIsOpen(false);
    }
  };

  const fetchRestaurantDetails = async () => {
    try {
      // Fetch restaurant profile
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (restaurantError) throw restaurantError;

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurantId', id)
        .order('displayOrder');

      if (categoriesError) throw categoriesError;

      // Fetch featured menu items
      const { data: menuItemsData, error: menuItemsError } = await supabase
        .from('menu_items')
        .select('*, categories!inner(*)')
        .eq('categories.restaurantId', id)
        .eq('available', true)
        .limit(6);

      if (menuItemsError) throw menuItemsError;

      setRestaurant(restaurantData as Restaurant);
      setCategories(categoriesData as Category[]);
      setFeaturedItems(menuItemsData as MenuItem[]);
    } catch (err) {
      setError('Failed to load restaurant details');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-[5px] border-transparent border-b-primary mx-auto"></div>
          <p className="animate-pulse font-medium mt-4 text-gray-600">Loading Place...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-error mb-4">{error || 'Restaurant not found'}</p>
          <Link to="/places">
            <Button variant="primary">Go to Places</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleAddToCart = (menuItem: MenuItem) => {
    let newCartItem = {
      id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: 1,
      subtotal: menuItem.price
    }

    addToCart(id, newCartItem)

    setCart(getCart())
    toast.success("Item added to cart")
  };

  const handleClearCart = () => {
    clearCart();
    setCart([]);
  };

  const handleUpdateCartItemQuantity = (itemid: string, itemquantity: number) => {

    updateCartItemQuantity(itemid, itemquantity)
    setCart(getCart())
  }

  const handleRemoveItem = (itemID) => {
    removeFromCart(itemID)
    setCart(getCart)
  };

  const handlePlaceOrder = (userID) => {
    placeOrder(userID)
    setCart(getCart)
  }

  return (
    <div className="min-h-screen bg-background">

      <Header />

      {/* Hero section */}
      <div className="bg-primary text-white pt-6 mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="">
            {/* {restaurant.cuisine && (
              <p className="text-sm text-accent-light">{restaurant.cuisine}</p>
            )} */}

            <h1 className="text-4xl font-bold mb-1">{restaurant.name}</h1>

            <div className="flex items-center mb-10">
              {restaurant.rating && (
                <div className="flex items-center leading-[20px]  text-white font-medium mr-[10px]">
                  <Star fill="#ffffff" size={12} className="mr-1" />
                  {restaurant.rating}
                </div>
              )}

              {restaurant.address && (
                <div className="font-light leading-[20px] mr-[10px]">
                  <span className='text-accent-light mr-[10px] inline-block'>|</span>
                  {restaurant.address}
                </div>
              )}

              {restaurant.cuisine && (
                <div className="font-light leading-[20px]">
                  <span className='text-accent-light mr-[10px] inline-block'>|</span>
                  {restaurant.cuisine}
                </div>
              )}
            </div>

            <div className="border-t border-white flex items-center py-3 gap-8 w-full">
              {restaurant.address && (
                <div className="flex items-center">
                  <a href={restaurant.phone} target='_blank' className='flex items-center'>
                    <MapPin className="h-5 w-5 mr-2" />
                    {t('common.location')}
                  </a>
                </div>
              )}
              {restaurant.phone && (
                <div className="flex items-center">
                  <a href={`tel:${restaurant.phone}`} className='flex items-center'>
                    <Phone className="h-5 w-5 mr-2" />
                    {t('common.call')}
                  </a>
                </div>
              )}
              {user?.role != "restaurant" && (
                <div className="flex items-center">
                  <SaveButton restaurantId={id} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="tabs max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
        <div className="inline-flex p-0.5 justify-center border-2 rounded-full">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-semibold text-sm rounded-[30px] ${activeTab === 'all' ? 'bg-primary text-white' : 'hover:text-primary'
              }`}
          >
            {t('place.categories.all')}
          </button>

          {(featuredItems.filter(item => item.featured).length > 0) && featuredItems.length > 0 && (
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-2 font-semibold text-sm rounded-[30px] transition-all ${activeTab === 'featured' ? 'bg-primary text-white' : 'hover:text-primary'}`}
            >
              {t('place.categories.featured')}
            </button>
          )}

          {categories.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.name)}
              className={`px-4 py-2 font-semibold text-sm rounded-[30px] ${activeTab === item.name
                ? 'bg-primary text-white'
                : 'hover:text-primary'
                }`}
            >
              {item.name}
            </button>
          ))}


        </div>
      </div>

      {(featuredItems.filter(item => item.featured).length > 0) && (activeTab === 'all' || activeTab === 'featured') && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <section className="mb-12">
            <div className="flex items-center mb-6 justify-between">
              <h2 className="text-2xl font-bold">Featured Items</h2>
            </div>

            <div className="grid gap-[16px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {featuredItems.filter(item => item.featured).map((item) => (
                <Card noPadding={true} key={item.id} hoverable className='border-2 border-accent'>
                  <div onClick={() => handleAddToCart(item)}>
                    <div className="featuredItemCard flex">
                      <div className="relative image w-[30%] bg-gray-200">
                        <img className={`w-full h-full min-h-[123px] object-cover ${item.image ? '' : 'opacity-30'} `} src={item.image || "/default.png"} alt={item.name} />
                      </div>

                      <div className="flex flex-col justify-between p-2 w-[70%]">
                        <div className='mb-4 '>
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                        <div className="flex flex-col align-center justify-between">
                          <div className="flex items-center">
                            <span className="text-accent-dark text-xs font-medium flex items-center mr-[5px]">
                              <Star className="h-3 w-3 mr-1" />
                              Featured in {categories.find(cat => cat.id === item.categoryId)?.name}
                            </span>
                          </div>

                          <div className="text-primary leading-[20px] font-semibold">
                            {formatCurrency(item.price)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

          </section>
        </div>
      )}

      {categories.map((cat) => (
        (activeTab === 'all' || activeTab === cat.name) && (
          <div key={cat.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            {featuredItems.filter(item => item.categoryId == cat.id).length > 0 && (
              <section className="mb-12">
                <div className="flex items-center mb-6 justify-between">
                  <h2 className="text-2xl font-bold">{cat.name}</h2>
                </div>

                <div className="grid gap-[16px] grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {featuredItems.filter(item => item.categoryId == cat.id).map((item) => (
                    <Card noPadding={true} key={item.id} hoverable className={item.featured ? 'border-2 border-accent relative' : ''}>

                      <div onClick={() => handleAddToCart(item)}>
                        {item.featured && (
                          <div className='absolute top-1 border border-2 border-accent-dark right-1 text-xs px-[7px] py-[4px] rounded-full bg-white z-10'>
                            <span className="text-accent-dark text-xs font-medium flex items-center">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </span>
                          </div>
                        )}

                        <div className="flex flex-col">
                          <div className="relative image bg-gray-200">
                            <img className={`w-full h-[100px] object-cover ${item.image ? '' : 'opacity-30'} `} src={item.image || "/default.png"} alt={item.name} />
                          </div>

                          <div className="flex flex-col justify-between p-2">
                            <div className='mb-4 '>
                              <h3 className="font-semibold text-lg">{item.name}</h3>
                              <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                                {item.description}
                              </p>
                            </div>
                            <div className="flex align-center justify-between">
                              <div className="text-primary leading-[20px] font-semibold">
                                {formatCurrency(item.price)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

              </section>
            )}
            {featuredItems.filter(item => item.categoryId == cat.id).length == 0 && (
              <section className="mb-12">
                <div className="flex items-center mb-6 justify-between">
                  <h2 className="text-2xl font-bold">{cat.name}</h2>
                </div>

                <div className="grid gap-[16px] grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  No items in this category
                </div>

              </section>
            )}
          </div>
        )
      ))}

      {cart && (
        <div className={`w-[400px] fixed right-5 transition-all duration-300 z-2 ${isFooterVisible ? 'bottom-16' : 'bottom-5'}`}>
          <div className='w-full text-right'>
            {cartIsOpen ? (
              <Button ref={toggleRef} variant="ghost" onClick={toggleCart} icon={X} className='bg-[rgb(248,229,231)] hover:bg-[rgb(248,229,231)]' />
            ) : (
              <Button ref={toggleRef} variant="ghost" onClick={toggleCart} icon={ShoppingCart} className='bg-primary/10'>
                {cart.items?.length || 0}
              </Button>
            )}

          </div>

          <div ref={cartRef} className={`transition-all duration-300 origin-bottom-right ${cartIsOpen
            ? 'opacity-100 translate-y-0 scale-100 h-[500px]'
            : 'opacity-100 translate-y-4 scale-[0%] h-0 pointer-events-none'
            }`}>
            <Card noPadding={true} childrenClassName="h-full" className='h-full border border-primary p-3'>
              <div className="flex items-center justify-between mb-6">

                <div className="flex items-baseline">
                  <h1 className="text-2xl font-semibold mr-[10px]">Your Cart</h1>
                  <p className="text-sm text-gray-600">
                    ({cart.items?.length || 0} item{cart.items?.length === 1 ? '' : 's'})
                  </p>
                </div>

                {cart.items?.length > 0 && (
                  <Button
                    className="w-[30%] !p-0 !justify-end focus:outline-none duration-0"
                    variant='link'
                    onClick={() => handleClearCart()}
                  >
                    Clear Cart
                  </Button>
                )}

              </div>

              {cart.items?.length > 0 ? (
                <>
                  <div className="noscrollbar mb-8 overflow-y-auto rounded-lg p-2 border border-primary h-[300px]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style>{`.noscrollbar::-webkit-scrollbar {display: none;}`}</style>
                    {cart.items?.map((item) => (
                      <div key={item.id} className="mb-2 border-b pb-2 border-gray-300 last:border-none">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-[20px] leading-[24px]">{item.name}</h3>
                          <p className="text-primary font-medium">
                            {formatCurrency(item.price)}
                          </p>
                        </div>

                        <div className="flex items-center justify-between ">
                          <div className='flex items-center gap-4'>
                            <div className="quantity flex items-center gap-3">
                              <Button
                                className="!p-0 h-[25px] w-[25px] !bg-accent-light !font-bold"
                                variant="accent"
                                onClick={() => handleUpdateCartItemQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                -
                              </Button>
                              <p className="text-gray-600 text-center text-sm w-[30px]">
                                {item.quantity}
                              </p>
                              <Button
                                className="!p-0 h-[25px] w-[25px] !bg-accent-light"
                                variant="accent"
                                onClick={() => handleUpdateCartItemQuantity(item.id, item.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                            <div>
                              <Button icon={Trash2} variant='ghost' onClick={() => handleRemoveItem(item.id)} />
                            </div>
                          </div>
                          <p className="font-semibold">
                            {formatCurrency(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className=" pt-3 mb-4 absolute w-[calc(100%-1.5rem)] bottom-0">
                    <div className="flex justify-between font-semibold text-lg mb-4">
                      <span>Total:</span>
                      <span>{formatCurrency(getCartTotal())}</span>
                    </div>
                    <Button
                      fullWidth={true}
                      variant='primary'
                      onClick={() => handlePlaceOrder(user?.id)}
                    >
                      Place Order
                    </Button>
                  </div>
                </>
              ) : (
                <div className="mb-8 text-center">
                  <p>Cart is empty</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      <Footer minimal={true} />

    </div >
  );
};

export default Place;