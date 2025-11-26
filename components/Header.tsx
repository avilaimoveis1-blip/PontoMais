
import React, { useState } from 'react';
import { UserIcon, ChartBarIcon, BuildingStorefrontIcon, SparklesIcon } from './icons';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  onShowRegister: () => void; 
  onShowHome: () => void;
  onShowCatalog: () => void;
  onShowReservations: () => void;
  onShowLogin: () => void;
  onShowAdmin: () => void;
  onShowPartnerDashboard: () => void;
  onLogout: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  hasRegisteredPoints: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
    onShowRegister, 
    onShowHome, 
    onShowCatalog, 
    onShowReservations, 
    onShowLogin, 
    onShowAdmin, 
    onShowPartnerDashboard,
    onLogout,
    isLoggedIn, 
    isAdmin,
    hasRegisteredPoints
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0 hover:opacity-90 transition-opacity">
            <a href="#" onClick={(e) => { e.preventDefault(); onShowHome(); }} className="flex items-center">
              <BrandLogo className="h-12 md:h-14" />
            </a>
          </div>
          <nav className="hidden md:flex md:items-center md:space-x-8">
            {isLoggedIn && hasRegisteredPoints && (
                <button onClick={onShowPartnerDashboard} className="flex items-center text-blue-700 font-bold hover:text-blue-900 transition-colors bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                    <BuildingStorefrontIcon className="h-4 w-4 mr-2" />
                    Meu Ponto
                </button>
            )}
            {isLoggedIn && (
                <button onClick={onShowReservations} className="text-green-900 font-semibold hover:text-green-700 border-b-2 border-yellow-400">
                    Minhas Reservas
                </button>
            )}
            {isLoggedIn && isAdmin && (
                <button onClick={onShowAdmin} className="flex items-center text-purple-700 font-bold hover:text-purple-900 transition-colors bg-purple-50 px-3 py-1 rounded-lg border border-purple-100">
                    <ChartBarIcon className="h-4 w-4 mr-2" />
                    Painel Admin
                </button>
            )}
          </nav>
          <div className="flex items-center space-x-3">
            {/* Botão Reserve seu Ponto */}
            <button
              onClick={onShowCatalog}
              className="hidden md:flex items-center bg-yellow-400 text-green-900 font-bold py-2 px-5 rounded-lg hover:bg-yellow-500 transition duration-300 shadow-sm transform hover:scale-105"
            >
              <SparklesIcon className="h-4 w-4 mr-2" />
              Reserve seu Ponto
            </button>

            <button
              onClick={onShowRegister}
              className="hidden md:inline-block bg-green-900 text-white font-semibold py-2 px-5 rounded-lg hover:bg-green-800 transition duration-300 shadow-sm"
            >
              Cadastre seu Ponto
            </button>
            
            {!isLoggedIn && (
                <button
                onClick={onShowLogin}
                className="inline-block bg-gray-100 text-green-900 font-bold py-2 px-5 rounded-lg hover:bg-gray-200 transition duration-300 shadow-sm border border-gray-200"
                >
                Login
                </button>
            )}

            {isLoggedIn && (
                <div className="relative ml-2">
                    <button 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center justify-center bg-green-100 text-green-900 h-10 w-10 rounded-full border border-green-200 cursor-pointer hover:bg-green-200 transition-colors"
                    >
                        <UserIcon className="h-5 w-5" />
                    </button>

                    {isUserMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsUserMenuOpen(false)}></div>
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 p-2 z-50 animate-fade-in">
                                <p className="text-xs text-gray-500 px-2 pb-2 border-b mb-2">Logado como {isAdmin ? 'Admin' : 'Usuário'}</p>
                                
                                {/* Mobile Only Menu Items */}
                                <div className="md:hidden space-y-1 mb-2 border-b pb-2">
                                    <button 
                                        onClick={() => { onShowCatalog(); setIsUserMenuOpen(false); }}
                                        className="w-full text-left px-2 py-2 text-sm hover:bg-yellow-50 text-green-800 font-bold rounded flex items-center"
                                    >
                                        <SparklesIcon className="h-4 w-4 mr-2 text-yellow-500" />
                                        Reserve seu Ponto
                                    </button>
                                    <button 
                                        onClick={() => { onShowRegister(); setIsUserMenuOpen(false); }}
                                        className="w-full text-left px-2 py-2 text-sm hover:bg-gray-50 text-gray-700 rounded"
                                    >
                                        Cadastrar Ponto
                                    </button>
                                     <button 
                                        onClick={() => { onShowReservations(); setIsUserMenuOpen(false); }}
                                        className="w-full text-left px-2 py-2 text-sm hover:bg-gray-50 text-gray-700 rounded"
                                    >
                                        Minhas Reservas
                                    </button>
                                </div>

                                {hasRegisteredPoints && (
                                     <button 
                                        onClick={() => { onShowPartnerDashboard(); setIsUserMenuOpen(false); }} 
                                        className="w-full text-left px-2 py-2 text-sm hover:bg-blue-50 text-blue-700 rounded mb-1"
                                    >
                                        <BuildingStorefrontIcon className="h-4 w-4 inline mr-2"/>
                                        Meu Ponto (Painel)
                                    </button>
                                )}
                                {isAdmin && (
                                    <button 
                                        onClick={() => { onShowAdmin(); setIsUserMenuOpen(false); }} 
                                        className="w-full text-left px-2 py-2 text-sm hover:bg-purple-50 text-purple-700 rounded mb-1 font-bold"
                                    >
                                        <ChartBarIcon className="h-4 w-4 inline mr-2"/>
                                        Painel Admin
                                    </button>
                                )}
                                <button 
                                    onClick={() => { onLogout(); setIsUserMenuOpen(false); }} 
                                    className="w-full text-left px-2 py-2 text-sm hover:bg-red-50 text-red-600 rounded"
                                >
                                    Sair
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </header>
  );
};