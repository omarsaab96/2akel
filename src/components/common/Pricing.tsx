import React, { useState } from 'react';
import Button from './Button';
import { useTranslation } from 'react-i18next';


const PricingSection = () => {
    const { t } = useTranslation();

    const [activeTab, setActiveTab] = useState('restaurants');

    const plans = {
        restaurants: [
            { title: 'Free', price: '$0.00', period: '', features: ['Max. 3 categories', 'Max. 10 items in total','No QR code']},
            { title: 'Monthly', price: '$19.99', period: '/mo', features: ['Unlimited categories', 'Unlimited items', 'Free QR code'], flag:'Most popular' },
            { title: 'Annually', price: '$199.99', period: '/yr', features: ['Unlimited categories', 'Unlimited items', 'Free QR code'], flag:'Save 40$' },
        ],
        customers: [
            { title: 'Basic', price: '$100', period: '/yr', features: ['1 Website', '10GB Storage', 'Email Support'] },
            { title: 'Pro', price: '$300', period: '/yr', features: ['5 Websites', '50GB Storage', 'Priority Support'] },
            { title: 'Enterprise', price: '$600', period: '/yr', features: ['Unlimited Websites', '200GB Storage', '24/7 Support'] },
        ],
    };

    return (
        <section>
            <div className="max-w-4xl mx-auto p-6 text-center">
                <div className="inline-flex p-0.5 justify-center mb-6 border-2 rounded-full">
                    <button
                        onClick={() => setActiveTab('restaurants')}
                        className={`px-4 py-2 font-semibold text-sm rounded-[30px] ${activeTab === 'restaurants' ? 'bg-primary text-white' : 'hover:text-primary'
                            }`}
                    >
                        {t('landing.pricing.restaurants')}
                    </button>
                    <button
                        onClick={() => setActiveTab('customers')}
                        className={`px-4 py-2 font-semibold text-sm rounded-[30px] ${activeTab === 'customers' ? 'bg-primary text-white' : 'hover:text-primary'
                            }`}
                    >
                        {t('landing.pricing.customers')}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans[activeTab].map((plan, index) => (
                        <div
                            key={index}
                            className={`p-6 border rounded-lg text-center shadow hover:shadow-lg relative ${plan.flag && plan.flag === 'Most popular' ? 'border-primary' : ''}`}
                            >
                            {plan.flag && (
                                <div className={`absolute top-0 left-[50%]  text-xs px-2 py-1 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${plan.flag && plan.flag === 'Most popular' ? 'bg-white border-2 border-primary text-primary' : 'text-primary bg-accent'}`}>
                                    {plan.flag}
                                </div>
                            )}
                            <h3 className="text-xl font-semibold mb-4">{plan.title}</h3>
                            <p className="text-4xl font-bold mb-4">
                                {plan.price}
                                <span className="text-sm font-normal">{plan.period}</span>
                            </p>
                            <ul className="mb-6 text-gray-600 space-y-2">
                                {plan.features.map((feature, i) => (
                                    <li key={i}>{feature}</li>
                                ))}
                            </ul>
                            <Button variant={`${plan.flag && plan.flag === 'Save 40$' ? 'accent' : 'primary'}`} size="sm">
                                {t('landing.pricing.choosePlan')}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;
