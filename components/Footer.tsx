
import React from 'react';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-green-900 text-white">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            {/* Logo Container - White background for contrast */}
            <div className="bg-white px-4 py-2 rounded-xl shadow-lg inline-block">
                <BrandLogo className="h-10" />
            </div>
            <p className="text-green-200 mt-2">Conectando oportunidades, gerando resultados.</p>
            <p className="text-sm text-green-300">&copy; {new Date().getFullYear()} Ponto Mais +. Todos os direitos reservados.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-yellow-400">Navegação</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <button 
                  onClick={() => onNavigate('vantagens')} 
                  className="text-green-200 hover:text-white transition-colors text-left"
                >
                  Vantagens
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('missao')} 
                  className="text-green-200 hover:text-white transition-colors text-left"
                >
                  Nossa Missão
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-yellow-400">Contato</h3>
            <ul className="mt-4 space-y-2">
              <li className="text-green-200">pontomais62@gmail.com</li>
              <li className="text-green-200">(62) 99253-8295</li>
              <li className="text-green-200">Goiânia, GO - Brasil</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};
