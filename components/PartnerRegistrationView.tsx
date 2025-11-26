
import React, { useState, useRef } from 'react';
import { LocationPinIcon, CheckIcon, EnvelopeIcon, ChevronLeftIcon, SparklesIcon, XMarkIcon, CheckCircleIcon } from './icons';
import { BrandLogo } from './BrandLogo';
import type { PartnerRequest } from '../types';
import { GoogleGenAI } from "@google/genai";

interface PartnerRegistrationViewProps {
  onCancel: () => void;
  onSuccess: (data: Omit<PartnerRequest, 'id' | 'status' | 'requestDate'>) => void;
  initialData?: {
      name: string;
      email: string;
      phone: string;
  }
}

// Helper para converter File para Base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const PartnerRegistrationView: React.FC<PartnerRegistrationViewProps> = ({ onCancel, onSuccess, initialData }) => {
  // Steps: 1=Dados, 2=Detalhes, 3=Valores, 4=Sucesso
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  const [customFeature, setCustomFeature] = useState('');
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    ownerName: initialData?.name || '', 
    email: initialData?.email || '', 
    phone: initialData?.phone || '', 
    establishmentName: '', 
    cnpj: '', 
    cep: '',
    address: '', 
    city: '', 
    description: '', 
    features: [] as string[], 
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
      "Banheiro", 
      "Copa / Cozinha",
      "Próximo a Transporte Público",
      "Área de Espera",
      "Tomadas Disponíveis",
      "Alto Fluxo de Pedestres",
      "Vitrine Disponível"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: false }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => {
      const newFeatures = prev.features.includes(feature) ? prev.features.filter(f => f !== feature) : [...prev.features, feature];
      return { ...prev, features: newFeatures };
    });
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
        setIsLoadingAddress(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    address: `${data.logradouro}, ${data.bairro}`,
                    city: `${data.localidade} - ${data.uf}`
                }));
                setErrors(prev => ({ ...prev, address: false, city: false }));
            }
        } catch (error) {
            console.error("Erro ao buscar CEP", error);
        } finally {
            setIsLoadingAddress(false);
        }
    }
  };

  const handleGenerateDescription = async () => {
    if (!process.env.API_KEY) {
        alert("API Key não configurada. Não é possível gerar descrição com IA.");
        return;
    }
    if (!formData.establishmentName || !formData.city) {
        alert("Por favor, preencha o nome do estabelecimento e a cidade na etapa anterior.");
        return;
    }
    setIsGeneratingAI(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const featuresStr = [...formData.features, customFeature].filter(Boolean).join(', ');
        
        // Prompt atualizado para ser mais humanizado e sem markdown
        const prompt = `Aja como um copywriter amigável e persuasivo. Escreva uma descrição curta (máximo 280 caracteres) convidando um corretor ou vendedor a alugar um espaço comercial dentro do estabelecimento "${formData.establishmentName}" localizado em "${formData.city}".
        
        Use os seguintes diferenciais no texto: ${featuresStr}.
        
        Regras importantes:
        1. Escreva de forma simples, direta e humanizada, como se estivesse conversando.
        2. NÃO use negrito, itálico ou asteriscos (markdown).
        3. NÃO use tópicos ou listas.
        4. Foque em como o espaço ajuda a vender mais.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        if (response.text) {
            // Limpeza extra de segurança para remover markdown caso a IA ignore
            const cleanText = response.text.replace(/\*\*/g, '').replace(/\*/g, '').trim();
            setFormData(prev => ({ ...prev, description: cleanText }));
            setErrors(prev => ({ ...prev, description: false }));
        }
    } catch (e) {
        console.error(e);
        alert("Ocorreu um erro ao gerar a descrição.");
    } finally {
        setIsGeneratingAI(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        setSelectedImages(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault(); setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          setSelectedImages(prev => [...prev, ...Array.from(e.dataTransfer.files).filter((f: File) => f.type.startsWith('image/'))]);
      }
  };
  const removeImage = (index: number) => setSelectedImages(prev => prev.filter((_, i) => i !== index));

  const validateStep1 = () => {
      const newErrors: Record<string, boolean> = {};
      if (!formData.ownerName) newErrors.ownerName = true;
      if (!formData.email) newErrors.email = true;
      if (!formData.phone) newErrors.phone = true;
      if (!formData.establishmentName) newErrors.establishmentName = true;
      if (!formData.cnpj) newErrors.cnpj = true;
      if (!formData.cep) newErrors.cep = true;
      if (!formData.address) newErrors.address = true;
      if (!formData.city) newErrors.city = true;
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) { alert("Por favor, preencha todos os campos obrigatórios."); return false; }
      return true;
  };

  const validateStep2 = () => {
      const newErrors: Record<string, boolean> = {};
      if (!formData.description) newErrors.description = true;
      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) { alert("Por favor, adicione uma descrição."); return false; }
      return true;
  };

  const handleNext = () => {
      if (step === 1 && !validateStep1()) return;
      if (step === 2 && !validateStep2()) return;
      window.scrollTo(0, 0);
      setStep(prev => (prev < 3 ? prev + 1 : prev) as any);
  };

  const handlePrev = () => {
      window.scrollTo(0, 0);
      setStep(prev => (prev > 1 ? prev - 1 : prev) as any);
  };

  const handleFinish = () => {
    if (Number(formData.priceQuinzenal) < 800 || Number(formData.priceMensal) < 1400 || Number(formData.priceTrimestral) < 3800) {
        alert("Verifique os valores mínimos."); return;
    }
    setIsLoading(true);

    // Process Images Asynchronously
    const processImages = async () => {
        try {
             // Convert all selected File objects to Base64 strings
             const imagePromises = selectedImages.map(file => fileToBase64(file));
             const base64Images = await Promise.all(imagePromises);
             
             const finalFeatures = [...formData.features];
             if (customFeature.trim()) finalFeatures.push(customFeature.trim());

             const requestData = {
                ownerName: formData.ownerName,
                email: formData.email,
                phone: formData.phone,
                establishmentName: formData.establishmentName,
                cnpj: formData.cnpj,
                address: formData.address,
                city: formData.city,
                description: formData.description,
                features: finalFeatures,
                images: base64Images, // Send the actual image data
                prices: {
                    quinzenal: Number(formData.priceQuinzenal),
                    mensal: Number(formData.priceMensal),
                    trimestral: Number(formData.priceTrimestral)
                }
            };
            
            // Envia dados para o App
            onSuccess(requestData); 
            // Avança para a tela de sucesso
            setStep(4);

        } catch (error) {
            console.error("Error processing images:", error);
            alert("Erro ao processar imagens. Tente novamente com arquivos menores.");
        } finally {
            setIsLoading(false);
        }
    };

    processImages();
  };

  const handleGoToDashboard = () => {
      onCancel(); // No App.tsx, isso vai verificar se o usuário tem pontos e redirecionar para dashboard
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Enter') {
          e.preventDefault(); 
          const form = (e.currentTarget as HTMLElement).closest('form');
          if (form) {
              const inputs = Array.from(form.querySelectorAll('input, textarea, select')) as HTMLElement[];
              const index = inputs.indexOf(e.currentTarget as HTMLElement);
              if (index === inputs.length - 1) handleNext();
              else if (index > -1 && index < inputs.length - 1) (inputs[index + 1] as HTMLElement).focus();
          }
      }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const getInputClass = (fieldName: string) => `w-full p-4 border rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition-colors ${errors[fieldName] ? "border-red-500 bg-red-50 ring-1 ring-red-500 placeholder-red-300" : "bg-white border-gray-200"}`;

  return (
    <div className="min-h-screen bg-gray-50 py-12 animate-fade-in relative">
      {/* Background neutro e sutil */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
        
        <button onClick={onCancel} className="mb-6 flex items-center text-gray-600 hover:text-green-900 font-medium transition-colors">
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Voltar para Home
        </button>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white">
            {/* Cabeçalho com Logo e Progresso */}
            <div className="bg-green-900 p-8 md:p-10 text-white">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm mb-4 md:mb-0">
                       <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
                         <BrandLogo className="h-10" />
                       </div>
                    </div>
                </div>

                <div className="text-center md:text-left mb-8">
                    <h2 className="text-3xl font-bold mb-2">Cadastre seu Espaço</h2>
                    <p className="text-green-100">Rentabilize seu estabelecimento de forma simples.</p>
                </div>
                    
                {/* Stepper */}
                <div className="flex items-center relative w-full justify-center md:justify-start max-w-2xl mx-auto md:mx-0">
                    <div className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-green-800 -z-0"></div>
                    <div className="flex gap-8 md:gap-20 relative z-10 w-full justify-between md:justify-start">
                        {[1, 2, 3].map(num => (
                            <div key={num} className={`flex flex-col items-center ${step >= num ? 'text-yellow-400' : 'text-green-700'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-all bg-green-900 ${step >= num ? 'border-yellow-400' : 'border-green-800'}`}>
                                    {num}
                                </div>
                                <span className="text-xs mt-2 font-semibold uppercase tracking-wider">
                                    {num === 1 ? 'Dados' : num === 2 ? 'Detalhes' : 'Valores'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-8 md:p-10">
                {step === 4 ? (
                    <div className="text-center py-8 animate-fade-in">
                        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
                            <CheckCircleIcon className="h-16 w-16 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-green-900 mb-4">Bem-vindo(a), parceiro!</h2>
                        <p className="text-lg text-gray-600 mb-2">Seu ponto foi cadastrado e já está <strong>em análise</strong>.</p>
                        <p className="text-gray-500 max-w-md mx-auto mb-8">
                            Nossa equipe entrará em contato em breve para confirmar os detalhes e ativar seu anúncio.
                        </p>

                        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 max-w-md mx-auto mb-8 text-left">
                            <h4 className="font-bold text-yellow-800 mb-2 flex items-center">
                                <SparklesIcon className="h-5 w-5 mr-2" /> Próximos Passos:
                            </h4>
                            <ul className="list-disc list-inside text-sm text-yellow-900 space-y-1 ml-2">
                                <li>Aguarde o contato do suporte Ponto Mais+.</li>
                                <li>Acesse "Meu Ponto" para acompanhar o status.</li>
                                <li>Mantenha seus dados de contato atualizados.</li>
                            </ul>
                        </div>

                        <button 
                            onClick={handleGoToDashboard}
                            className="bg-green-900 text-white font-bold py-3 px-10 rounded-xl hover:bg-green-800 shadow-lg transition-transform transform hover:scale-105"
                        >
                            Continuar para Meu Painel
                        </button>
                    </div>
                ) : (
                <form onSubmit={(e) => e.preventDefault()}>
                    {/* ETAPA 1: Dados Cadastrais */}
                    {step === 1 && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                        <h3 className="text-lg font-bold text-green-900 mb-6 flex items-center border-b border-green-200 pb-2">
                            <span className="bg-green-200 p-1.5 rounded-lg mr-3"><EnvelopeIcon className="h-5 w-5 text-green-800"/></span> 
                            Responsável
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label htmlFor="ownerName" className="block text-xs font-bold text-gray-700 uppercase mb-2 cursor-pointer">Nome Completo</label>
                                <input id="ownerName" onKeyDown={handleKeyDown} required type="text" name="ownerName" value={formData.ownerName} onChange={handleInputChange} className={getInputClass('ownerName')} placeholder="Seu nome completo" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase mb-2 cursor-pointer">Email</label>
                                <input id="email" onKeyDown={handleKeyDown} required type="email" name="email" value={formData.email} onChange={handleInputChange} className={getInputClass('email')} readOnly={!!initialData?.email} title={initialData?.email ? "Email da conta de usuário" : ""} />
                            </div>
                            <div>
                                <label htmlFor="phone" className="block text-xs font-bold text-gray-700 uppercase mb-2 cursor-pointer">Telefone</label>
                                <input id="phone" onKeyDown={handleKeyDown} required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={getInputClass('phone')} />
                            </div>
                        </div>
                        </div>
                        
                        <div>
                             <h3 className="text-lg font-bold text-green-900 mb-6 flex items-center border-b border-gray-100 pb-2">
                                <span className="bg-green-100 p-1.5 rounded-lg mr-3"><LocationPinIcon className="h-5 w-5 text-green-800"/></span>
                                Estabelecimento
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label htmlFor="establishmentName" className="block text-xs font-bold text-gray-700 uppercase mb-2 cursor-pointer">Nome</label><input id="establishmentName" onKeyDown={handleKeyDown} required name="establishmentName" value={formData.establishmentName} onChange={handleInputChange} className={getInputClass('establishmentName')} /></div>
                                <div><label htmlFor="cnpj" className="block text-xs font-bold text-gray-700 uppercase mb-2 cursor-pointer">CNPJ</label><input id="cnpj" onKeyDown={handleKeyDown} required name="cnpj" value={formData.cnpj} onChange={handleInputChange} className={getInputClass('cnpj')} /></div>
                                
                                {/* CEP e Endereço */}
                                <div>
                                    <label htmlFor="cep" className="block text-xs font-bold text-gray-700 uppercase mb-2 cursor-pointer">CEP</label>
                                    <div className="relative">
                                        <input 
                                            id="cep"
                                            onKeyDown={handleKeyDown}
                                            type="text" 
                                            name="cep" 
                                            value={formData.cep} 
                                            onChange={handleInputChange} 
                                            onBlur={handleCepBlur}
                                            placeholder="00000-000"
                                            maxLength={9}
                                            className={getInputClass('cep')} 
                                        />
                                        {isLoadingAddress && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <svg className="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div><label htmlFor="city" className="block text-xs font-bold text-gray-700 uppercase mb-2 cursor-pointer">Cidade</label><input id="city" onKeyDown={handleKeyDown} required name="city" value={formData.city} onChange={handleInputChange} className={`${getInputClass('city')} bg-gray-50`} /></div>
                                <div className="md:col-span-2"><label htmlFor="address" className="block text-xs font-bold text-gray-700 uppercase mb-2 cursor-pointer">Endereço</label><input id="address" onKeyDown={handleKeyDown} required name="address" value={formData.address} onChange={handleInputChange} className={`${getInputClass('address')} bg-gray-50`} /></div>
                            </div>
                        </div>
                    </div>
                    )}

                    {step === 2 && (
                    <div className="space-y-8 animate-fade-in">
                         <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                                Fotos do Espaço
                            </h3>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-800 mb-2">Upload de Imagens</label>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-100' : 'border-blue-300 bg-white hover:bg-blue-50'}`}
                                >
                                    <div className="mx-auto h-12 w-12 text-blue-400 mb-2">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                    <p className="text-gray-600 font-medium">Clique para tirar foto ou selecionar</p>
                                </div>

                                {selectedImages.length > 0 && (
                                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                        {selectedImages.map((file, index) => (
                                            <div key={index} className="relative group aspect-square">
                                                <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} className="w-full h-full object-cover rounded-lg shadow-sm" />
                                                <button onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                                    <XMarkIcon className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                         </div>

                         <div>
                            <label className="block text-sm font-bold text-gray-800 mb-4">Diferenciais</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                {featuresList.map(feature => (
                                <label key={feature} className={`flex items-center p-3 sm:p-4 rounded-xl border cursor-pointer transition-all ${formData.features.includes(feature) ? 'bg-green-50 border-green-500' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <div className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center mr-3 ${formData.features.includes(feature) ? 'bg-green-500 text-white' : 'bg-gray-200'}`}><CheckIcon className="w-3 h-3 sm:w-4 sm:h-4" /></div>
                                    <input type="checkbox" checked={formData.features.includes(feature)} onChange={() => handleFeatureToggle(feature)} className="hidden" />
                                    <span className="text-xs sm:text-sm font-medium text-gray-700">{feature}</span>
                                </label>
                                ))}
                            </div>
                            
                            <div>
                                <label htmlFor="customFeature" className="block text-xs font-bold text-gray-700 uppercase mb-2 cursor-pointer">Outros (Opcional)</label>
                                <input id="customFeature" onKeyDown={handleKeyDown} type="text" value={customFeature} onChange={(e) => setCustomFeature(e.target.value)} placeholder="Digite outro diferencial" className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500" />
                            </div>
                        </div>
                        
                        <div className="border-t border-gray-100 pt-6">
                            <div className="flex justify-between items-end mb-2">
                                <label htmlFor="description" className="block text-sm font-bold text-gray-800 cursor-pointer">Descrição do Espaço</label>
                                <button type="button" onClick={handleGenerateDescription} disabled={isGeneratingAI} className="flex items-center gap-2 text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50">
                                    {isGeneratingAI ? <>Gerando...</> : <><SparklesIcon className="h-4 w-4" /> Gerar com IA</>}
                                </button>
                            </div>
                            <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} placeholder="Descreva detalhes sobre o fluxo de pessoas..." className={getInputClass('description')} />
                        </div>
                    </div>
                    )}

                    {step === 3 && (
                    <div className="space-y-8 animate-fade-in">
                        <p className="text-center text-xs text-gray-400 mb-4">* A taxa de serviço da Ponto Mais + é de 25% sobre o valor do aluguel.</p>
                         <div className="grid md:grid-cols-3 gap-6">
                            {['Quinzenal', 'Mensal', 'Trimestral'].map((plan, idx) => {
                                const key = `price${plan}` as keyof typeof formData;
                                const min = idx === 0 ? 800 : idx === 1 ? 1400 : 3800;
                                const currentValue = Number(formData[key]);
                                const netValue = currentValue * 0.75; 

                                return (
                                    <div key={plan} className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex flex-col justify-between h-full group hover:border-green-400 transition-colors">
                                        <div>
                                            <div className="flex flex-col mb-4">
                                                <h4 className="font-bold text-xl text-gray-800">{plan}</h4>
                                                <p className="text-xs font-medium text-gray-500 mt-1 whitespace-nowrap">Mínimo: {formatCurrency(min)}</p>
                                            </div>
                                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2 border border-gray-200 mb-2">
                                                <button type="button" onClick={() => { const newValue = currentValue - 100; if (newValue >= min) setFormData(prev => ({...prev, [key]: newValue})); }} className="w-8 h-8 flex items-center justify-center bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 font-bold text-lg shadow-sm transition-colors">-</button>
                                                <div className="flex-1 mx-1 relative h-8 min-w-0">
                                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"><span className="text-gray-500 font-bold text-xs">R$</span></div>
                                                    <input id={key} onKeyDown={handleKeyDown} type="number" step={100} name={key} min={min} value={formData[key]} onChange={handleInputChange} className="block w-full h-full pl-7 pr-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-green-900 focus:ring-2 focus:ring-green-500 outline-none appearance-none" />
                                                </div>
                                                <button type="button" onClick={() => setFormData(prev => ({...prev, [key]: currentValue + 100}))} className="w-8 h-8 flex items-center justify-center bg-green-100 border border-green-300 rounded-lg text-green-800 hover:bg-green-200 font-bold text-lg shadow-sm transition-colors">+</button>
                                            </div>
                                            {currentValue < min && <p className="text-red-500 text--[10px] font-medium text-center mb-2">Abaixo do mínimo</p>}
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <div className="flex justify-between items-center text-green-800 bg-green-50 px-4 py-3 rounded-lg">
                                                <span className="text-sm font-medium">Você recebe:</span>
                                                <span className="text-lg font-extrabold">{formatCurrency(netValue)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    )}

                    <div className="mt-10 flex items-center justify-between pt-8 border-t border-gray-100">
                    {step > 1 ? (
                        <button type="button" onClick={handlePrev} className="px-8 py-4 text-gray-600 font-bold hover:bg-gray-100 rounded-xl">Voltar</button>
                    ) : <div className="w-24"></div>}
                    
                    {step < 3 ? (
                        <button type="button" onClick={handleNext} className="bg-green-900 text-white font-bold py-4 px-10 rounded-xl hover:bg-green-800 shadow-lg">Próximo</button>
                    ) : (
                        <button type="button" onClick={handleFinish} disabled={isLoading} className="bg-yellow-400 text-green-900 font-bold py-4 px-12 rounded-xl hover:bg-yellow-500 shadow-lg flex items-center disabled:opacity-70 disabled:cursor-wait">
                            {isLoading ? <span className="flex items-center"><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processando...</span> : 'Finalizar'}
                        </button>
                    )}
                    </div>
                </form>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};