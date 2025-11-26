
import React, { useState, useRef } from 'react';
import { XMarkIcon, LocationPinIcon, CheckIcon, EnvelopeIcon, CreditCardIcon } from './icons';

interface PartnerRegistrationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const PartnerRegistrationModal: React.FC<PartnerRegistrationModalProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Estado do Formulário
  const [formData, setFormData] = useState({
    // Dados Pessoais
    ownerName: '',
    email: '',
    phone: '',
    
    // Estabelecimento
    establishmentName: '',
    cnpj: '',
    address: '',
    city: '',
    
    // Detalhes
    description: '',
    features: [] as string[],
    
    // Preços
    priceQuinzenal: 800,
    priceMensal: 1400,
    priceTrimestral: 3800
  });

  const featuresList = [
    "Wi-Fi Gratuito",
    "Mesa e Cadeiras",
    "Ar Condicionado",
    "Permitido Abordagem na Saída",
    "Estacionamento",
    "Segurança no Local",
    "Banheiro Exclusivo",
    "Copa / Cozinha"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => {
      const newFeatures = prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature];
      return { ...prev, features: newFeatures };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulação de envio
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
    }, 2000);
  };

  const nextStep = () => setStep(prev => (prev < 3 ? prev + 1 : prev) as any);
  const prevStep = () => setStep(prev => (prev > 1 ? prev - 1 : prev) as any);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 overflow-y-auto backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl relative my-8 animate-fade-in-up flex flex-col max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 bg-gray-100 rounded-full p-2 transition-colors">
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Cabeçalho com Progresso */}
        <div className="bg-green-900 p-8 rounded-t-2xl text-white">
          <h2 className="text-2xl font-bold mb-2">Cadastre seu Espaço</h2>
          <p className="text-green-100 text-sm mb-6">Rentabilize seu estabelecimento com o Ponto Mais +</p>
          
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-green-800 -z-0"></div>
            
            <div className={`relative z-10 flex flex-col items-center ${step >= 1 ? 'text-yellow-400' : 'text-green-700'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-all ${step >= 1 ? 'bg-green-900 border-yellow-400' : 'bg-green-800 border-green-800'}`}>1</div>
              <span className="text-xs mt-2 font-semibold">Dados</span>
            </div>
            
            <div className={`relative z-10 flex flex-col items-center ${step >= 2 ? 'text-yellow-400' : 'text-green-600'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-all ${step >= 2 ? 'bg-green-900 border-yellow-400' : 'bg-green-800 border-green-800'}`}>2</div>
              <span className="text-xs mt-2 font-semibold">Detalhes</span>
            </div>
            
            <div className={`relative z-10 flex flex-col items-center ${step >= 3 ? 'text-yellow-400' : 'text-green-600'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-all ${step >= 3 ? 'bg-green-900 border-yellow-400' : 'bg-green-800 border-green-800'}`}>3</div>
              <span className="text-xs mt-2 font-semibold">Valores</span>
            </div>
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-grow">
          <form onSubmit={handleSubmit}>
            
            {/* ETAPA 1: Dados Cadastrais */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <h3 className="font-bold text-green-900 mb-4 flex items-center">
                    <span className="bg-green-200 p-1 rounded mr-2"><EnvelopeIcon className="h-4 w-4"/></span> 
                    Responsável
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nome Completo</label>
                      <input required type="text" name="ownerName" value={formData.ownerName} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 outline-none" placeholder="Seu nome" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email</label>
                      <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 outline-none" placeholder="email@exemplo.com" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Telefone / WhatsApp</label>
                      <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 outline-none" placeholder="(00) 00000-0000" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-green-900 mb-4 flex items-center">
                    <span className="bg-green-200 p-1 rounded mr-2"><LocationPinIcon className="h-4 w-4"/></span>
                    Estabelecimento
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nome do Local</label>
                        <input required type="text" name="establishmentName" value={formData.establishmentName} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 outline-none" placeholder="Ex: Padaria Central" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">CNPJ</label>
                        <input required type="text" name="cnpj" value={formData.cnpj} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 outline-none" placeholder="00.000.000/0000-00" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Endereço Completo</label>
                      <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 outline-none" placeholder="Rua, Número, Bairro" />
                    </div>
                     <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Cidade / Estado</label>
                      <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 outline-none" placeholder="Goiânia - GO" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 2: Fotos e Diferenciais */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Upload Simulado */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Fotos do Espaço</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer bg-gray-50">
                    <div className="mx-auto h-12 w-12 text-gray-400 mb-2">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <p className="text-gray-600 font-medium">Clique para adicionar fotos</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG (Máx 5MB)</p>
                  </div>
                </div>

                {/* Diferenciais */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">Diferenciais e Estrutura</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {featuresList.map(feature => (
                      <label key={feature} className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${formData.features.includes(feature) ? 'bg-green-100 border-green-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <input 
                          type="checkbox" 
                          checked={formData.features.includes(feature)}
                          onChange={() => handleFeatureToggle(feature)}
                          className="w-5 h-5 text-green-900 rounded focus:ring-green-500 border-gray-300 mr-3"
                        />
                        <span className="text-sm font-medium text-gray-700">{feature}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">Descrição Adicional</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 outline-none"
                    placeholder="Descreva o fluxo de pessoas, melhores horários, etc..."
                  />
                </div>
              </div>
            )}

            {/* ETAPA 3: Precificação */}
            {step === 3 && (
              <div className="space-y-8 animate-fade-in">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-green-900">Defina seus Valores</h3>
                  <p className="text-gray-600">Configure o preço do aluguel para cada período.</p>
                </div>

                <div className="grid gap-6">
                  {/* Quinzenal */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-yellow-400 transition-colors relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-yellow-400"></div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-lg text-gray-800">Plano Quinzenal</h4>
                      <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-500">Mínimo sugerido: R$ 800</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">R$</span>
                      <input 
                        type="number" 
                        name="priceQuinzenal"
                        min={800}
                        value={formData.priceQuinzenal}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 text-xl font-bold text-green-900 border border-gray-300 rounded-lg focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                      />
                    </div>
                    {Number(formData.priceQuinzenal) < 800 && <p className="text-red-500 text-xs mt-1 font-medium">O valor mínimo para este plano é R$ 800,00</p>}
                  </div>

                  {/* Mensal */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-green-600 transition-colors relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-green-600"></div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-lg text-gray-800">Plano Mensal</h4>
                      <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-500">Mínimo sugerido: R$ 1.400</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">R$</span>
                      <input 
                        type="number" 
                        name="priceMensal"
                        min={1400}
                        value={formData.priceMensal}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 text-xl font-bold text-green-900 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
                      />
                    </div>
                    {Number(formData.priceMensal) < 1400 && <p className="text-red-500 text-xs mt-1 font-medium">O valor mínimo para este plano é R$ 1.400,00</p>}
                  </div>

                  {/* Trimestral */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-green-900 transition-colors relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-green-900"></div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-lg text-gray-800">Plano Trimestral</h4>
                      <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-500">Mínimo sugerido: R$ 3.800</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">R$</span>
                      <input 
                        type="number" 
                        name="priceTrimestral"
                        min={3800}
                        value={formData.priceTrimestral}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 text-xl font-bold text-green-900 border border-gray-300 rounded-lg focus:ring-green-900 focus:border-green-900 outline-none"
                      />
                    </div>
                    {Number(formData.priceTrimestral) < 3800 && <p className="text-red-500 text-xs mt-1 font-medium">O valor mínimo para este plano é R$ 3.800,00</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="mt-8 flex justify-between pt-6 border-t border-gray-100">
              {step > 1 ? (
                <button type="button" onClick={prevStep} className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors">
                  Voltar
                </button>
              ) : (
                <button type="button" onClick={onClose} className="px-6 py-3 text-gray-500 hover:text-gray-700 font-medium">
                  Cancelar
                </button>
              )}

              {step < 3 ? (
                <button type="button" onClick={nextStep} className="bg-green-900 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-800 shadow-lg transition-all transform hover:translate-x-1">
                  Próximo Passo
                </button>
              ) : (
                <button 
                  type="submit" 
                  disabled={isLoading || Number(formData.priceQuinzenal) < 800 || Number(formData.priceMensal) < 1400 || Number(formData.priceTrimestral) < 3800}
                  className="bg-yellow-400 text-green-900 font-bold py-3 px-8 rounded-lg hover:bg-yellow-500 shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-900 mr-2"></div> : <CheckIcon className="h-5 w-5 mr-2"/>}
                  Finalizar Cadastro
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
       <style>{`
        @keyframes fade-in-up {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
        .animate-fade-in {
            animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
