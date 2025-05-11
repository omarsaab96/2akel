import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ArrowRight, Utensils, QrCode, ShoppingBag, Users, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../components/common/Button';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { supabase } from '../lib/supabase';
import { Restaurant } from '../types';
import { toast } from 'react-hot-toast';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';

function AutoplayPlugin(slider) {
    let timeout;
    let mouseOver = false;

    function clearNextTimeout() {
        clearTimeout(timeout);
    }

    function nextTimeout() {
        clearTimeout(timeout);
        if (mouseOver) return;
        timeout = setTimeout(() => {
            slider.next();
        }, 2000); // 2 seconds delay
    }

    slider.on('created', () => {
        slider.container.addEventListener('mouseover', () => {
            mouseOver = true;
            clearNextTimeout();
        });
        slider.container.addEventListener('mouseout', () => {
            mouseOver = false;
            nextTimeout();
        });
        nextTimeout();
    });
    slider.on('dragStarted', clearNextTimeout);
    slider.on('animationEnded', nextTimeout);
    slider.on('updated', nextTimeout);
}

const Places = () => {
    const { t } = useTranslation();
    const { user } = useAuthStore();

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [featuredPlaces, setFeaturedPlaces] = useState([]);
    const [cuisinesPlaces, setCuisinesPlaces] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    useEffect(() => {
        setFeaturedPlaces(restaurants.filter(r => r.featured))

        const groupedByCuisine = restaurants.reduce((acc, restaurant) => {
            const cuisine = restaurant.cuisine;
            if (!acc[cuisine]) {
                acc[cuisine] = [];
            }
            acc[cuisine].push(restaurant);
            return acc;
        }, {});

        setCuisinesPlaces(groupedByCuisine);

    }, [restaurants]);

    const fetchRestaurants = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'restaurant');

            if (error) throw error;

            setRestaurants(data as Restaurant[]);
        } catch (err) {
            toast.error('Failed to load restaurants');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const [sliderRef] = useKeenSlider(
        {
            loop: true,
            slides: {
                perView: 1,
                spacing: 0,
            },
            breakpoints: {
                '(min-width: 640px)': {
                    slides: {
                        perView: 2,
                        spacing: 16,
                    },
                },
                '(min-width: 768px)': {
                    slides: {
                        perView: 3,
                        spacing: 16,
                    },
                },
                '(min-width: 1024px)': {
                    slides: {
                        perView: 4,
                        spacing: 16,
                    },
                },
            },
            renderMode: 'performance',
        },
        [AutoplayPlugin]
    );

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            {/* Hero section */}
            <section className="bg-gradient-to-br from-primary-light via-primary to-primary-dark text-white py-16 md:py-24" >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1">
                        <div className="space-y-6">
                            <h2 className="text-4xl md:text-5xl font-bold  leading-tight">
                                {t('places.hero.title')}
                            </h2>
                            <p className="text-lg md:text-xl opacity-90">
                                {t('places.hero.subtitle')}
                            </p>
                        </div>
                    </div>
                </div>
            </section >

            {loading ? (
                <>
                    <section className="py-16 bg-background" >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="animate-pulse space-y-4">
                                <div className="flex flex-col gap-4 w-1/2 m-auto items-center mb-10">
                                    <div className="h-[26px] bg-gray-400 rounded w-1/3"></div>
                                    <div className="h-[20px] bg-gray-300 rounded w-2/3"></div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-[200px] bg-gray-400 rounded w-1/4"></div>
                                    <div className="h-[200px] bg-gray-300 rounded w-1/4"></div>
                                    <div className="h-[200px] bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-[200px] bg-gray-100 rounded w-1/4"></div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="py-16 bg-background" >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="animate-pulse space-y-4">
                                <div className="flex flex-col gap-4 w-1/2 m-auto items-center mb-10">
                                    <div className="h-[26px] bg-gray-400 rounded w-1/3"></div>
                                    <div className="h-[20px] bg-gray-300 rounded w-2/3"></div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-[200px] bg-gray-400 rounded w-1/4"></div>
                                    <div className="h-[200px] bg-gray-300 rounded w-1/4"></div>
                                    <div className="h-[200px] bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-[200px] bg-gray-100 rounded w-1/4"></div>
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            ) : (
                <>
                    {/* Featured */}
                    <section id="featuredPlaces" className="py-16 bg-background" >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold text-gray-900 ">{t('places.featuredPlaces.title')}</h2>
                                <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">{t('places.featuredPlaces.subtitle')}</p>
                            </div>

                            {featuredPlaces.length > 4 && (
                                <div ref={sliderRef} className="keen-slider">
                                    {featuredPlaces?.map((place, index) => (
                                        <div
                                            key={index}
                                            className="keen-slider__slide bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 mb-3"
                                        >
                                            <div className="w-full h-[100px] bg-primary/10">
                                                <img
                                                    className="w-full h-full object-cover"
                                                    src={place.image}
                                                    alt={place.name}
                                                />
                                            </div>
                                            <div className="info p-2">
                                                <h3 className="text-lg font-bold text-gray-900">{place.name}</h3>
                                                <p className="text-sm text-gray-600 mb-4">{place.address}</p>
                                            </div>
                                            <div className="p-2 flex align-center justify-between">
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
                            )}

                            {featuredPlaces.length <= 4 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[16px]">
                                    {featuredPlaces?.map((place, index) => (
                                        <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                                            <Link to={`/place/${place.id}`}>
                                                <div className="w-full h-[100px] bg-primary/10">
                                                    <img className="w-full h-full object-cover" src={place.image} alt={place.name} />
                                                </div>
                                                <div className="info p-2">
                                                    <h3 className="text-lg font-bold text-gray-900">{place.name}</h3>
                                                    <p className="text-sm text-gray-600 mb-4">{place.address}</p>
                                                </div>
                                                <div className="p-2 flex align-center justify-between">
                                                    <div className="flex shrink-0 align-center p-2 min-w-[30px] text-center h-[30px] leading-[15px] rounded-lg text-lg font-bold bg-accent text-white">
                                                        <Star fill="white" size={15} className="mr-1 shrink-0" />{place.rating}
                                                    </div>


                                                    <Button variant="link" className="!p-0 !justify-end" size="sm" fullWidth="true">
                                                        {t('common.viewMore')}
                                                        <ArrowRight className="w-[15px]" />
                                                    </Button>

                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* By cuisine */}
                    <section id="cuisines" className="py-16 bg-background" >
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl font-bold text-gray-900 ">{t('places.cuisines.title')}</h2>
                                <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">{t('places.cuisines.subtitle')}</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[16px]">
                                {Object.entries(cuisinesPlaces)?.map(([cuisine, places], index) => (
                                    <div key={index}>
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">{cuisine}</h3>
                                        {places.map((place, placeIndex) => (
                                            <div key={placeIndex} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 mb-3">
                                                <Link to={`/place/${place.id}`}>
                                                    <div className="w-full h-[100px] bg-primary/10">
                                                        <img
                                                            className="w-full h-full object-cover"
                                                            src={place.image}
                                                            alt={place.name}
                                                        />
                                                    </div>
                                                    <div className="info p-2">
                                                        <h3 className="text-lg font-bold text-gray-900">{place.name}</h3>
                                                        <p className="text-sm text-gray-600 mb-4">{place.address}</p>
                                                    </div>
                                                    <div className="p-2 flex align-center justify-between">
                                                        <div className="flex shrink-0 items-center p-2 min-w-[30px] text-center h-[30px] leading-[15px] rounded-lg text-lg font-bold bg-accent text-white">
                                                            <Star fill="white" size={15} className="mr-1 shrink-0" />
                                                            {place.rating}
                                                        </div>


                                                        <Button
                                                            variant="link"
                                                            className="!p-0 !justify-end"
                                                            size="sm"
                                                            fullWidth="true"
                                                        >
                                                            {t('common.viewMore')}
                                                            <ArrowRight className="w-[15px]" />
                                                        </Button>

                                                    </div>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </>
            )}



            <Footer />
        </div >
    );
};

export default Places;