
import React, { useState } from 'react';
import { XMarkIcon, EnvelopeIcon, LockClosedIcon } from './icons';
import { BrandLogo } from './BrandLogo';

interface LoginRegisterModalProps {
  onClose: () => void;
  onSuccess: (email: string, name?: string, phone?: string, profileType?: any, isRegistering?: boolean) => void;
  initialTab?: 'login' | 'register';
  error?: string;
  onClearError?: () => void;
}

export const LoginRegisterModal: React.FC<LoginRegisterModalProps> = ({ onClose, onSuccess, initialTab = 'register', error, onClearError }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  
  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    profileType: 'corretor_autonomo'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailInput = (document.getElementById('login-email') as HTMLInputElement).value;
    // Passa isRegistering = false para indicar login
    onSuccess(emailInput.trim().toLowerCase(), undefined, undefined, undefined, false);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Passa isRegistering = true para indicar tentativa de novo cadastro
    onSuccess(formData.email.trim().toLowerCase(), formData.name, formData.phone, formData.profileType, true);
  };

  const switchTab = (tab: 'login' | 'register') => {
      setActiveTab(tab);
      if(onClearError) onClearError();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-fade-in-up my-8 overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 bg-gray-100 rounded-full p-1">
          <XMarkIcon className="h-6 w-6" />
        </button>
        
        <div className="p-8 pt-10">
          <div className="flex justify-center mb-6">
            <BrandLogo className="h-12" />
          </div>

          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-green-900">
                {activeTab === 'login' ? 'Bem-vindo de volta!' : 'Crie sua Conta'}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
                {activeTab === 'login' 
                    ? 'Acesse para gerenciar suas reservas ou pontos.' 
                    : 'Escolha seu perfil e comece agora.'}
            </p>
          </div>

          {/* Error Message Display */}
          {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start animate-fade-in">
                  <div className="flex-shrink-0 mt-0.5">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                  </div>
                  <div className="ml-3">
                      <p className="text-sm font-medium text-red-700">{error}</p>
                  </div>
              </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
            onClick={() => switchTab('register')}
            className={`w-1/2 py-3 text-center font-semibold transition-colors duration-300 ${activeTab === 'register' ? 'text-green-800 border-b-2 border-green-800' : 'text-gray-400 hover:text-gray-600'}`}
            >
            Cadastre-se
            </button>
            <button
            onClick={() => switchTab('login')}
            className={`w-1/2 py-3 text-center font-semibold transition-colors duration-300 ${activeTab === 'login' ? 'text-green-800 border-b-2 border-green-800' : 'text-gray-400 hover:text-gray-600'}`}
            >
            Login
            </button>
          </div>

          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
                <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                    <EnvelopeIcon className="pointer-events-none w-5 h-5 text-gray-400 absolute top-1/2 transform -translate-y-1/2 left-3" />
                    <input type="email" id="login-email" required className="mt-1 block w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow" placeholder="seu@email.com" />
                </div>
                </div>
                
                <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">Senha</label>
                <div className="relative">
                    <LockClosedIcon className="pointer-events-none w-5 h-5 text-gray-400 absolute top-1/2 transform -translate-y-1/2 left-3" />
                    <input type="password" id="login-password" required className="mt-1 block w-full pl-10 pr-3 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow" placeholder="••••••••" />
                </div>
                </div>

                <button type="submit" className="w-full bg-green-900 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-800 transition duration-300 shadow-lg mt-2">
                Entrar
                </button>
            </form>
          )}

          {activeTab === 'register' && (
             <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fade-in">
                <div>
                    <label htmlFor="profileType" className="block text-sm font-medium text-gray-700 mb-1">Qual é o seu objetivo?</label>
                    <select id="profileType" value={formData.profileType} onChange={handleInputChange} className="mt-1 block w-full px-3 py-3 bg-green-50 border border-green-200 text-green-900 font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                        <optgroup label="Quero alugar espaços (Procurar Pontos)">
                            <option value="corretor_autonomo">Sou Corretor Autônomo</option>
                            <option value="imobiliaria">Sou Imobiliária</option>
                            <option value="construtora">Sou Construtora</option>
                        </optgroup>
                        <optgroup label="Tenho um espaço (Anunciar Ponto)">
                            <option value="estabelecimento">Sou Dono de Estabelecimento</option>
                        </optgroup>
                    </select>
                </div>

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                    <input type="text" id="name" required value={formData.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                        <input type="tel" id="phone" required placeholder="(00) 0..." value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">Cidade</label>
                        <input type="text" id="city" required value={formData.city} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                </div>
                
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <div className="relative">
                        <EnvelopeIcon className="pointer-events-none w-5 h-5 text-gray-400 absolute top-1/2 transform -translate-y-1/2 left-3" />
                        <input type="email" id="email" required value={formData.email} onChange={handleInputChange} className="mt-1 block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                </div>
                
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Crie uma Senha</label>
                    <div className="relative">
                        <LockClosedIcon className="pointer-events-none w-5 h-5 text-gray-400 absolute top-1/2 transform -translate-y-1/2 left-3" />
                        <input type="password" id="password" required value={formData.password} onChange={handleInputChange} className="mt-1 block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                </div>

                <button type="submit" className="w-full bg-green-900 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-800 transition duration-300 shadow-lg mt-2">
                    Confirmar Cadastro
                </button>
            </form>
          )}
        </div>
      </div>
       <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};
