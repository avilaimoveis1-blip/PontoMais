
import React from 'react';
import { CheckCircleIcon, BuildingStorefrontIcon } from './icons';

interface RegistrationSuccessViewProps {
  onGoToCatalog: () => void;
}

export const RegistrationSuccessView: React.FC<RegistrationSuccessViewProps> = ({ onGoToCatalog }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-lg w-full space-y-8 text-center bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
            <CheckCircleIcon className="h-16 w-16 text-green-600" />
        </div>

        <div>
          <h2 className="text-3xl font-extrabold text-green-900">Cadastro Realizado!</h2>
          <p className="mt-4 text-lg text-gray-600">
            Seja muito bem-vindo(a) ao Ponto Mais +.
          </p>
          <p className="mt-2 text-gray-500">
            Sua conta foi criada com sucesso. Agora você tem acesso exclusivo aos melhores pontos comerciais do Brasil para alavancar suas vendas.
          </p>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100">
          <button
            onClick={onGoToCatalog}
            className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-green-900 bg-yellow-400 hover:bg-yellow-500 shadow-lg transform transition hover:-translate-y-1 hover:shadow-xl"
          >
            <BuildingStorefrontIcon className="h-6 w-6 mr-2" />
            Ver Pontos Disponíveis
          </button>
          <p className="mt-4 text-xs text-gray-400">
            Explore nosso catálogo e reserve seu espaço em poucos cliques.
          </p>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
