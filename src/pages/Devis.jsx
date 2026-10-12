import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ArrowLeft, CheckCircle } from 'lucide-react';
import RestoStage from '../components/RestoStage';
import {
  EXTERIEUR,
  SUPPLEMENTS,
  INTERIEUR,
  PACK_PROTECT,
  MIN_EXTERIEUR_HT,
  MIN_INTERIEUR_TTC,
  estimateQuote,
  formatEuro,
} from '../lib/tarifs';

const Devis = () => {
  const [selectedServices, setSelectedServices] = useState({});
  const [surface, setSurface] = useState('');

  const handleServiceToggle = (serviceId, exclusive) => {
    setSelectedServices((prev) => {
      const next = { ...prev, [serviceId]: !prev[serviceId] };
      if (next[serviceId] && exclusive) next[exclusive] = false;
      return next;
    });
  };

  const quote = estimateQuote(surface, selectedServices);
  const hasSelection = Object.values(selectedServices).some(Boolean);
  const ready = Number(surface) > 0 && hasSelection;

  const ServiceList = ({ items, pricePrefix = '', unitSuffix }) => (
    <div className="space-y-3">
      {items.map((service) => (
        <label
          key={service.id}
          className="flex items-center p-4 border border-slate-200 rounded-md cursor-pointer hover:border-secondary transition-colors"
        >
          <input
            type="checkbox"
            checked={selectedServices[service.id] || false}
            onChange={() => handleServiceToggle(service.id, service.exclusive)}
            className="w-5 h-5 text-secondary border-gray-300 rounded focus:ring-secondary"
          />
          <div className="ml-4 flex-1">
            <div className="font-semibold text-primary">{service.name}</div>
            <div className="text-sm text-gray-600">
              {pricePrefix}{formatEuro(service.price)} € {service.tax}/{unitSuffix || service.unit || 'm²'}
              {service.hint ? ` · ${service.hint}` : ''}
            </div>
          </div>
          {selectedServices[service.id] && (
            <CheckCircle className="w-5 h-5 text-secondary" />
          )}
        </label>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <Link
            to="/"
            className="flex items-center justify-center text-secondary hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour à l'accueil
          </Link>

          <div className="chip mb-5 sm:mb-6">
            <Calculator className="w-4 h-4 text-secondary mr-2" />
            Simulateur de Devis · Grille octobre 2026
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4 sm:mb-6">
            Devis Gratuit
          </h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Estimation indicative selon la grille Fast &amp; Clean. Confirmée après visite.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12">
          <div className="w-full lg:w-[48%] space-y-8">
            <div className="card">
              <h3 className="text-2xl font-bold text-primary mb-6">Surface à traiter</h3>
              <div className="space-y-4">
                <label className="block text-gray-700 font-medium">
                  Surface en m²
                </label>
                <input
                  type="number"
                  value={surface}
                  onChange={(e) => setSurface(e.target.value)}
                  placeholder="Ex: 100"
                  className="field"
                  min="1"
                />
                <p className="text-sm text-slate-500">
                  Un même métrage est appliqué aux prestations cochées. Pour des surfaces différentes, demandez un devis détaillé.
                </p>
              </div>
            </div>

            <div className="card">
              <h3 className="text-2xl font-bold text-primary mb-2">Nettoyage extérieur</h3>
              <p className="text-sm text-slate-500 mb-6">Tarifs HT · minimum {MIN_EXTERIEUR_HT} € HT / chantier</p>
              <ServiceList items={EXTERIEUR} />
            </div>

            <div className="card">
              <h3 className="text-2xl font-bold text-primary mb-2">Traitements complémentaires</h3>
              <p className="text-sm text-slate-500 mb-6">
                Suppléments HT, en plus du nettoyage. Les deux ensemble = pack {formatEuro(PACK_PROTECT.price)} € HT/m² (au lieu de 18 €).
              </p>
              <ServiceList items={SUPPLEMENTS} pricePrefix="+ " />
            </div>

            <div className="card">
              <h3 className="text-2xl font-bold text-primary mb-2">Nettoyage intérieur</h3>
              <p className="text-sm text-slate-500 mb-6">Tarifs TTC · minimum {MIN_INTERIEUR_TTC} € TTC / passage</p>
              <ServiceList items={INTERIEUR} />
            </div>
          </div>

          <div className="w-full lg:w-[52%] space-y-8 lg:sticky lg:top-24">
            <RestoStage />
            <div className="card bg-primary text-white border-0">
              <h3 className="text-2xl font-bold mb-6">Estimation du devis</h3>

              {ready ? (
                <div className="space-y-6">
                  {quote.ext > 0 && (
                    <div>
                      <div className="text-sm uppercase tracking-wide opacity-80 mb-1">Extérieur</div>
                      <div className="text-4xl font-bold">{formatEuro(quote.ext)} € HT</div>
                      <div className="text-sm opacity-85 mt-1">
                        pour {surface} m²
                        {quote.minExt ? ` · plancher ${MIN_EXTERIEUR_HT} € HT appliqué` : ''}
                      </div>
                    </div>
                  )}

                  {quote.intTotal > 0 && (
                    <div>
                      <div className="text-sm uppercase tracking-wide opacity-80 mb-1">Intérieur</div>
                      <div className="text-4xl font-bold">{formatEuro(quote.intTotal)} € TTC</div>
                      <div className="text-sm opacity-85 mt-1">
                        pour {surface} m²
                        {quote.minInt ? ` · minimum ${MIN_INTERIEUR_TTC} € TTC / passage` : ''}
                      </div>
                    </div>
                  )}

                  {(quote.extLines.length > 0 || quote.intLines.length > 0) && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Détail :</h4>
                      {[...quote.extLines, ...quote.intLines].map((line) => (
                        <div key={line.name} className="flex justify-between items-center py-2 border-b border-white/20 gap-4">
                          <span>{line.name} · {formatEuro(line.price)} € {line.tax}/m²</span>
                          <span className="font-semibold whitespace-nowrap">{formatEuro(line.total)} € {line.tax}</span>
                        </div>
                      ))}
                      {quote.minExt && (
                        <div className="flex justify-between items-center py-2 border-b border-white/20 text-sm opacity-90">
                          <span>Minimum chantier extérieur</span>
                          <span>{MIN_EXTERIEUR_HT} € HT</span>
                        </div>
                      )}
                      {quote.minInt && (
                        <div className="flex justify-between items-center py-2 border-b border-white/20 text-sm opacity-90">
                          <span>Minimum passage intérieur</span>
                          <span>{MIN_INTERIEUR_TTC} € TTC</span>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-sm opacity-85">
                    HT et TTC ne sont pas additionnés : ce sont deux régimes distincts. Hors déplacement. Bardage, parkings, nettoyage de chantier : sur devis.
                  </p>

                  <div className="pt-2">
                    <Link
                      to="/formulaire"
                      className="btn-invert w-full block text-center"
                    >
                      Demander un Devis Détaillé
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-2xl font-bold mb-2">—</div>
                  <div className="text-lg opacity-90">
                    Entrez une surface et sélectionnez des services
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-primary mb-4">Informations importantes</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Devis gratuit, sous réserve de visite</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Extérieur : {MIN_EXTERIEUR_HT} € HT minimum / chantier, hors déplacement</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Intérieur : {MIN_INTERIEUR_TTC} € TTC minimum / passage</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Anti-mousse et hydrofuge : suppléments, pack 16 € HT/m² si les deux</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Devis;
