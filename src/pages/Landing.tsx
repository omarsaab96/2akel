import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ArrowRight, Utensils, QrCode, ShoppingBag, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../components/common/Button';
import LanguageSelector from '../components/common/LanguageSelector';
import PricingSection from '../components/common/Pricing';

const Landing = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

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
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold  leading-tight">
                {t('landing.hero.title')}
              </h2>
              <p className="text-lg md:text-xl opacity-90">
                {t('landing.hero.subtitle')}
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                {user == null ? (
                  <Link to="/register">
                    <Button variant="accent" size="lg">
                      {t('landing.hero.registerButton')}
                      <ArrowRight className="ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Link to={user.role == "restaurant" ? "/restaurant" : "/user"}>
                    <Button variant="accent" size="lg">
                      {t('landing.hero.goToDashboard')}
                      <ArrowRight className="ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt={t('landing.hero.imageAlt')}
                className="rounded-lg shadow-2xl max-h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section >

      {/* Features section */}
      <section id="features" className="py-16 bg-background" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 ">{t('landing.features.title')}</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Utensils,
                title: t('landing.features.digital.title'),
                description: t('landing.features.digital.description')
              },
              {
                icon: QrCode,
                title: t('landing.features.qr.title'),
                description: t('landing.features.qr.description')
              },
              {
                icon: ShoppingBag,
                title: t('landing.features.ordering.title'),
                description: t('landing.features.ordering.description')
              },
              {
                icon: Users,
                title: t('landing.features.accounts.title'),
                description: t('landing.features.accounts.description')
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-5">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <PricingSection />
      </section>

      {/* Testimonials section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 ">{t('landing.testimonials.title')}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="text-gray-600 italic mb-4">{t(`landing.testimonials.${index}.quote`)}</div>
                <div className="font-medium text-gray-900">{t(`landing.testimonials.${index}.author`)}</div>
                <div className="text-sm text-gray-500">{t(`landing.testimonials.${index}.role`)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 bg-gradient-to-br from-accent-light via-accent to-accent-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900  mb-6">{t('landing.cta.title')}</h2>
          <p className="text-xl text-gray-800 mb-8">
            {t('landing.cta.subtitle')}
          </p>

          {user == null ? (
            <Link to="/register">
              <Button variant="primary" size="lg">
                {t('landing.cta.button')}
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          ) : (
            <Link to={user.role == "restaurant" ? "/restaurant" : "/user"}>
              <Button variant="primary" size="lg">
                {t('landing.hero.goToDashboard')}
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
          )}
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

export default Landing;



// create restaurant details page, which is the same page to visit when  qr code is scanned and the user can order food
// create 
