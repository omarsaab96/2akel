import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ArrowRight, Utensils, QrCode, ShoppingBag, Users, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../components/common/Button';
import LanguageSelector from '../components/common/LanguageSelector';
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
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    useEffect(() => {
        console.log(restaurants)

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
        setLoading(true);
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
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-primary">2akel</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Link to="/" className="text-sm font-medium text-gray-700 hover:text-primary">
                                {t('common.home')}
                            </Link>
                            <Link to="/places" className="text-sm font-medium text-gray-700 hover:text-primary">
                                {t('common.places')}
                            </Link>

                            <LanguageSelector />

                            {user == null ? (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        to="/login"
                                        className="text-sm font-medium text-gray-700 hover:text-primary"
                                    >
                                        {t('common.signIn')}
                                    </Link>
                                    <Link to="/register">
                                        <Button variant="primary" size="sm">
                                            {t('common.register')}
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <Link to={user.role == "restaurant" ? "/restaurant" : "/user"}>
                                    <Button variant="primary" size="sm">
                                        {t('common.dashboard')}
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </header >

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
                                    <div className="w-full h-[100px] bg-primary/10">
                                        <img className="w-full h-full object-cover" src={place.image} alt={place.name} />
                                    </div>
                                    <div className="info p-2">
                                        <h3 className="text-lg font-bold text-gray-900">{place.name}</h3>
                                        <p className="text-sm text-gray-600 mb-4">{place.address}</p>
                                    </div>
                                    <div className="p-2 flex align-center justify-between">
                                        <div className="flex align-center p-2 min-w-[30px] text-center h-[30px] leading-[15px] rounded-lg text-lg font-bold bg-accent text-white">
                                            <Star fill="white" size={15} className="mr-1" />{place.rating}
                                        </div>

                                        <Link to={`/place/${place.id}`}>
                                            <Button variant="link" className="!p-0 !justify-end" size="sm" fullWidth="true">
                                                {t('common.viewMore')}
                                                <ArrowRight className="w-[15px]" />
                                            </Button>
                                        </Link>
                                    </div>
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
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-800 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="text-lg font-bold mb-4 ">2akel</h3>
                            <p className="text-gray-400">
                                {t('landing.footer.description')}
                            </p>
                        </div>

                        <div>
                            <h4 className="text-md font-bold mb-4">{t('landing.footer.product.title')}</h4>
                            <ul className="space-y-2">
                                {['features', 'pricing', 'testimonials', 'faq'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-gray-400 hover:text-white">
                                            {t(`landing.footer.product.${item}`)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-md font-bold mb-4">{t('landing.footer.company.title')}</h4>
                            <ul className="space-y-2">
                                {['about', 'blog', 'careers', 'contact'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-gray-400 hover:text-white">
                                            {t(`landing.footer.company.${item}`)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-md font-bold mb-4">{t('landing.footer.legal.title')}</h4>
                            <ul className="space-y-2">
                                {['privacy', 'terms', 'cookies'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-gray-400 hover:text-white">
                                            {t(`landing.footer.legal.${item}`)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
                        <p>{t('landing.footer.copyright', { year: new Date().getFullYear() })}</p>
                    </div>
                </div>
            </footer>
        </div >
    );
};

export default Places;