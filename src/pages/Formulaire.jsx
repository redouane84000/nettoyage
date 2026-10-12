import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Send, CheckCircle, MessageCircle } from 'lucide-react';
import { MAIL, PHONE_DISPLAY, WHATSAPP_URL } from '../lib/contact';
import { supabase } from '../lib/supabase';

const Formulaire = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    mobile: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let stop = () => {};
    const start = () => {
      if (cancelled) return;
      import('../lib/glassIntro').then((mod) => {
        if (cancelled || !mod) return;
        stop = mod.playGlassIntro({
          once: 'always',
        }) || (() => {});
      });
    };
    const id = window.setTimeout(() => {
      requestAnimationFrame(() => requestAnimationFrame(start));
    }, 160);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
      stop();
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    if (!supabase) {
      toast.error('Envoi indisponible pour le moment.');
      return;
    }
    setSending(true);
    const payload = {
      nom: formData.nom.trim(),
      prenom: formData.prenom.trim(),
      email: formData.email.trim(),
      mobile: formData.mobile.trim(),
      message: formData.message.trim(),
    };
    const { error } = await supabase.from('fast_clean_messages').insert(payload);
    setSending(false);
    if (error) {
      toast.error("Le message n'a pas pu être envoyé. Réessayez.");
      return;
    }
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div id="contact-page" className="min-h-screen bg-white py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="card">
            <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-primary mb-4">
              Message Envoyé !
            </h1>
            <p className="text-gray-600 mb-8">
              Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
            </p>
            <Link
              to="/"
              className="btn-primary"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="contact-page" className="min-h-screen bg-white py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <Link
            to="/"
            className="flex items-center justify-center text-secondary hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour à l'accueil
          </Link>

          <h1 className="text-4xl lg:text-5xl font-bold text-primary mb-6">
            Contactez-nous
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Prenez rendez-vous ou demandez un devis personnalisé
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="card">
            <h2 className="text-2xl font-bold text-primary mb-6">Formulaire de contact</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    required
                    maxLength={120}
                    className="field"
                    placeholder="Votre prénom"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                    maxLength={120}
                    className="field"
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  maxLength={200}
                  className="field"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  maxLength={40}
                  className="field"
                  placeholder="06 12 34 56 78"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  maxLength={4000}
                  rows="6"
                  className="field resize-none"
                  placeholder="Décrivez votre projet, vos besoins, ou posez vos questions..."
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="btn-primary w-full group disabled:opacity-60"
              >
                <span className="flex items-center justify-center">
                  {sending ? 'Envoi en cours…' : 'Envoyer le message'}
                  <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </form>
          </div>

          <div className="space-y-8">
            <div className="card">
              <h2 className="text-2xl font-bold text-primary mb-6">Nos coordonnées</h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-secondary/10 rounded-md flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="text-secondary font-bold text-lg">FC</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-primary">FAST & CLEAN</h3>
                    <p className="text-gray-600">Nettoyage Haute Pression</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-primary transition-colors"
                  >
                    <MessageCircle className="w-5 h-5 mr-3 text-secondary flex-shrink-0" />
                    <span>{PHONE_DISPLAY} · WhatsApp</span>
                  </a>

                  <a
                    href={`mailto:${MAIL}`}
                    className="flex items-center text-gray-600 hover:text-primary transition-colors"
                  >
                    <span className="w-5 h-5 mr-3">✉️</span>
                    <span>{MAIL}</span>
                  </a>

                  <div className="flex items-start text-gray-600">
                    <span className="w-5 h-5 mr-3 mt-0.5">📍</span>
                    <span>43 Impasse des Alouettes<br />84130 Le Pontet</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <span className="w-5 h-5 mr-3">🏢</span>
                    <span>SIREN : 941 130 072</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold text-primary mb-4">Pourquoi nous choisir ?</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Intervention rapide sous 24h</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Équipements professionnels</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Personnel qualifié et expérimenté</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Garantie satisfaction</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-secondary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Devis gratuit et sans engagement</span>
                </li>
              </ul>
            </div>

            <div className="card bg-primary text-white border-0">
              <h3 className="text-xl font-bold mb-4">Urgence ?</h3>
              <p className="mb-4 opacity-90">
                Pour une intervention urgente, écrivez-nous directement sur WhatsApp :
              </p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-2xl font-bold hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="w-7 h-7" />
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Formulaire;
