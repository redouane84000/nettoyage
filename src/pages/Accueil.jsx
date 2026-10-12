import React from 'react';
import { Link } from 'react-router-dom';
import HouseStage from '../components/HouseStage';
import {
  Clock,
  ArrowRight,
  CheckCircle,
  Phone,
  Award,
  Users,
  Home,
  Building,
  Layers,
  Droplets,
  Leaf,
  Construction,
  Sparkles
} from 'lucide-react';

const Accueil = () => {
  const services = [
    {
      icon: <Home className="w-8 h-8" />,
      title: "Terrasse",
      description: "Nettoyage haute pression de terrasses en pierre, béton ou bois",
      price: "9 € HT/m²",
      link: "/prestation/terrasse"
    },
    {
      icon: <Building className="w-8 h-8" />,
      title: "Façade",
      description: "Nettoyage professionnel de tous types de façades",
      price: "dès 16 € HT/m²",
      link: "/prestation/facade"
    },
    {
      icon: <Layers className="w-8 h-8" />,
      title: "Toiture",
      description: "Nettoyage complet de toitures et chéneaux",
      price: "22 € HT/m²",
      link: "/prestation/toiture"
    },
    {
      icon: <Droplets className="w-8 h-8" />,
      title: "Traitement Hydrofuge",
      description: "Protection durable contre l'humidité, en supplément du nettoyage",
      price: "+ 10 € HT/m²",
      link: "/prestation/hydrofuge"
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Démoussage Toiture",
      description: "Traitement anti-mousse / fongicide, en supplément du nettoyage",
      price: "+ 8 € HT/m²",
      link: "/prestation/demoussage"
    },
    {
      icon: <Construction className="w-8 h-8" />,
      title: "Nettoyage Chantier",
      description: "Nettoyage post-travaux et remise en état",
      price: "Sur devis",
      link: "/prestation/chantier"
    }
  ];

  const stats = [
    { number: "500+", label: "Clients Satisfaits", icon: <Users className="w-6 h-6" /> },
    { number: "1500+", label: "Projets Réalisés", icon: <CheckCircle className="w-6 h-6" /> },
    { number: "5", label: "Années d'Expérience", icon: <Award className="w-6 h-6" /> },
    { number: "24h", label: "Délai d'Intervention", icon: <Clock className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-white relative">
      <section className="px-4 py-8 sm:py-12 lg:py-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-14">
            <div className="w-full lg:w-[46%] text-center lg:text-left">
              <div className="mb-5 sm:mb-8">
                <div className="chip mb-5 sm:mb-8">
                  <Sparkles className="w-4 h-4 text-secondary mr-2" />
                  Nettoyage Haute Pression
                </div>
              </div>

              <h1 className="font-display text-[2rem] leading-tight sm:text-5xl lg:text-6xl font-bold mb-5 sm:mb-8">
                <span className="gradient-text">FAST & CLEAN</span>
                <br />
                <span className="text-primary">Excellence & Qualité</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-600 mb-6 sm:mb-12 max-w-3xl mx-auto lg:mx-0 leading-relaxed">
                Votre partenaire de confiance pour tous vos besoins de nettoyage professionnel.
                <span className="text-secondary font-semibold"> Qualité garantie, résultats exceptionnels.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start items-stretch sm:items-center mb-2 sm:mb-8">
                <Link
                  to="/devis"
                  className="btn-primary group w-full sm:w-auto justify-center"
                >
                  <span className="flex items-center justify-center">
                    Demander un Devis Gratuit
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>

                <Link
                  to="/formulaire"
                  className="btn-secondary group w-full sm:w-auto justify-center"
                >
                  <span className="flex items-center justify-center">
                    Prendre RDV
                    <Phone className="ml-2 w-5 h-5" />
                  </span>
                </Link>
              </div>
            </div>

            <div className="w-full lg:w-[54%]">
              <HouseStage />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto mt-8 sm:mt-16">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="card text-center p-4 sm:p-6"
              >
                <div className="text-secondary mb-3 flex justify-center">
                  {stat.icon}
                </div>
                <div className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-600 font-medium text-xs sm:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:py-20 bg-white relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4 sm:mb-6">
              Nos Services
            </h2>
            <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto">
              Des solutions complètes et professionnelles pour tous vos besoins de nettoyage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.map((service, index) => (
              <Link
                key={index}
                to={service.link}
                className="card group"
              >
                <div className="text-center">
                  <div className="w-14 h-14 bg-primary rounded-md flex items-center justify-center text-white mx-auto mb-6 shadow-sm group-hover:bg-primary-hover transition-colors duration-200">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-4 group-hover:text-secondary transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="text-secondary font-bold text-lg">
                    {service.price}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card bg-primary text-white p-6 sm:p-12 border-0">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Prêt à Transformer Votre Espace ?
            </h2>
            <p className="text-lg sm:text-xl mb-8 text-white/85">
              Contactez-nous dès aujourd'hui pour un devis personnalisé et gratuit
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/devis" className="btn-invert">
                Devis Gratuit
              </Link>
              <div className="flex items-center justify-center space-x-4">
                <Phone className="w-5 h-5" />
                <span className="font-semibold tracking-wide">0752887535</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Accueil;
