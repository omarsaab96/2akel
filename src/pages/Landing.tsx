import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ArrowRight, Utensils, QrCode, ShoppingBag, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '../components/common/Button';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import PricingSection from '../components/common/Pricing';

const Landing = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

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

      <Footer isHome={true}/>
    </div >
  );
};

export default Landing;
