import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Leaf, CheckCircle, Phone } from 'lucide-react';

const Demoussage = () => {
  const avantages = [
    "Élimination totale des mousses et lichens",
    "Préservation de l'étanchéité de la toiture",
    "Résultat durable et efficace",
    "Intervention sécurisée et professionnelle",
    "Produits adaptés et respectueux",
    "Garantie satisfaction"
  ];

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Link 
            to="/" 
            className="flex items-center justify-center text-secondary hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour à l'accueil
          </Link>
          
          <div className="chip mb-6">
            <Leaf className="w-5 h-5 text-secondary mr-2" />
            <span className="text-primary font-semibold">Démoussage Toiture</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-primary mb-6">
            Démoussage Toiture
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Élimination complète de la mousse et des algues pour une toiture saine et durable
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image et description */}
          <div className="space-y-8">
            <div className="card">
              <div className="w-full h-64 rounded-lg overflow-hidden mb-6">
                <img 
                  src="/image/demoussage.PNG" 
                  alt="Démoussage de toiture" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h2 className="text-2xl font-bold text-primary mb-4">
                Démoussage Professionnel
              </h2>
              
              <p className="text-gray-600 leading-relaxed mb-6">
                Notre service de démoussage élimine efficacement toutes les mousses, 
                lichens et micro-organismes de votre toiture. Nous utilisons des produits 
                adaptés pour préserver la longévité et l'étanchéité de votre toit.
              </p>
              
              <p className="text-gray-600 leading-relaxed">
                Une toiture propre et bien entretenue garantit une meilleure isolation 
                et prolonge la durée de vie de vos matériaux de couverture.
              </p>
            </div>

            {/* Avantages */}
            <div className="card">
              <h3 className="text-xl font-bold text-primary mb-6">Nos Avantages</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {avantages.map((avantage, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{avantage}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tarifs et CTA */}
          <div className="space-y-8">
            <div className="card bg-primary text-white border-0">
              <h3 className="text-2xl font-bold mb-6">Tarification</h3>
              
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">+ 8 € HT/m²</div>
                  <div className="text-lg opacity-90">
                    Supplément anti-mousse · grille 2026
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Inclus dans le tarif :</h4>
                  <ul className="space-y-2 text-sm opacity-90">
                    <li>• Supplément au nettoyage (pas un forfait toiture)</li>
                    <li>• Traitement anti-mousse / fongicide</li>
                    <li>• Produit compatible avec le support</li>
                    <li>• Pack 16 € HT/m² si combiné à l’hydrofuge</li>
                    <li>• Toiture : 22 € HT/m² en nettoyage, à part</li>
                  </ul>
                </div>

                <div className="pt-6">
                  <Link 
                    to="/devis" 
                    className="btn-invert w-full block text-center"
                  >
                    Demander un Devis
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact direct */}
            <div className="card">
              <h3 className="text-xl font-bold text-primary mb-4">Contact Direct</h3>
              <p className="text-gray-600 mb-6">
                Pour une intervention urgente ou un devis personnalisé, contactez-nous directement :
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Phone className="w-5 h-5 mr-3 text-secondary" />
                  <span className="font-semibold">0752887535</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <span className="w-5 h-5 mr-3">✉️</span>
                  <span>fastand-clean@hotmail.com</span>
                </div>
              </div>

              <div className="mt-6">
                <Link 
                  to="/formulaire" 
                  className="btn-primary w-full flex items-center justify-center"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Prendre Rendez-vous
                </Link>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="card">
              <h3 className="text-xl font-bold text-primary mb-4">Informations Importantes</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Intervention sous 24h</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Devis gratuit et sans engagement</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Équipements professionnels</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Garantie satisfaction</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Image supplémentaire - Placeholder */}
        <div className="mt-16">
          <div className="w-full h-96 rounded-lg overflow-hidden">
            <img 
              src="/image/nettoyage3.png" 
              alt="Démoussage de toiture - Image supplémentaire" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demoussage; 
