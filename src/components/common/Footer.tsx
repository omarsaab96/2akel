import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface FooterProps {
    isHome?: boolean;
    minimal?: boolean
}


const Footer = ({ isHome = false, minimal = false }: FooterProps) => {
    const { t } = useTranslation();

    return (
        <footer id="app-footer" className={`text-white pb-4 ${minimal ? 'pt-4 bg-primary' : 'bg-gray-800 pt-12'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {!minimal && (
                    <div className="grid md:grid-cols-4 gap-8">
                        {/* Brand Column */}
                        <div>
                            <h3 className="text-lg font-bold mb-4">
                                {isHome ? (
                                    <button
                                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                        className="hover:underline"
                                    >
                                        2akel
                                    </button>
                                ) : (
                                    <Link to="/" className="hover:underline">
                                        2akel
                                    </Link>
                                )}
                            </h3>
                            <p className="text-gray-400">
                                {t('landing.footer.description')}
                            </p>
                        </div>

                        {/* Product Links */}
                        <div>
                            <h4 className="text-md font-bold mb-4">{t('landing.footer.product.title')}</h4>
                            <ul className="space-y-2">
                                {['features', 'pricing', 'testimonials', 'faq'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                            {t(`landing.footer.product.${item}`)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company Links */}
                        <div>
                            <h4 className="text-md font-bold mb-4">{t('landing.footer.company.title')}</h4>
                            <ul className="space-y-2">
                                {['about', 'blog', 'careers', 'contact'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                            {t(`landing.footer.company.${item}`)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Legal Links */}
                        <div>
                            <h4 className="text-md font-bold mb-4">{t('landing.footer.legal.title')}</h4>
                            <ul className="space-y-2">
                                {['privacy', 'terms', 'cookies'].map((item) => (
                                    <li key={item}>
                                        <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                            {t(`landing.footer.legal.${item}`)}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}


                {/* Copyright Section */}
                <div className={`${minimal ? 'text-white' : 'mt-12 border-t border-gray-700 pt-4 text-gray-400'} text-center text-sm`}>
                    <p>{t('landing.footer.copyright', { year: new Date().getFullYear() })}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;