import React from 'react';

const MentionLegale = () => (
  <div className="min-h-screen bg-background px-4 py-12 sm:py-16">
    <div className="card max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-6">Mentions légales</h1>
      <ul className="text-slate-700 text-sm sm:text-base space-y-3">
        <li><strong>Dénomination :</strong> FAST & CLEAN</li>
        <li><strong>Adresse :</strong> 43 impasse des alouettes, 84130 Le Pontet</li>
        <li><strong>SIREN :</strong> 941 130 072</li>
        <li><strong>Email :</strong> fastand-clean@hotmail.com</li>
        <li><strong>Téléphone :</strong> 0752887535</li>
      </ul>
      <p className="text-xs text-slate-400 mt-8">Ce site est la propriété de FAST & CLEAN. Toute reproduction, même partielle, est interdite sans autorisation.</p>
    </div>
  </div>
);

export default MentionLegale;
