
import React, { useState } from 'react';
import type { PartnerRequest, Booking } from '../types';
import { BuildingStorefrontIcon, CheckCircleIcon, XMarkIcon, ChartBarIcon, PencilSquareIcon, CalendarIcon } from '@heroicons/react/24/outline'; 
import { ChartBarIcon as ChartIcon, CheckCircleIcon as CheckIcon, LocationPinIcon, ClockIcon } from './icons';

interface PartnerDashboardProps {
    partnerRequests: PartnerRequest[];
    bookings: Booking[]; 
    userEmail: string;
    onBackHome: () => void;
    onUpdatePartnerRequest: (req: PartnerRequest) => void;
}

export const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ partnerRequests, bookings, userEmail, onBackHome, onUpdatePartnerRequest }) => {
    const myPoints = partnerRequests.filter(req => req.email === userEmail);
    const approvedPoints = myPoints.filter(p => p.status === 'approved');
    const pendingPoints = myPoints.filter(p => p.status === 'pending');
    
    const [editingPoint, setEditingPoint] = useState<PartnerRequest | null>(null);
    const [editFormData, setEditFormData] = useState<any>(null);

    // Simulated Revenue logic
    const totalRevenue = approvedPoints.length * 1400; 
    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    const formatDate = (date: Date) => new Intl.DateTimeFormat('pt-BR').format(new Date(date));

    // --- Edit Handlers ---
    const openEditModal = (point: PartnerRequest) => {
        setEditingPoint(point);
        setEditFormData({
            description: point.description,
            features: [...point.features],
            prices: { ...point.prices },
            customFeature: ''
        });
    };

    const closeEditModal = () => {
        setEditingPoint(null);
        setEditFormData(null);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handlePriceChange = (period: string, value: string) => {
        setEditFormData((prev: any) => ({
            ...prev,
            prices: { ...prev.prices, [period]: Number(value) }
        }));
    };

    const handleFeatureToggle = (feature: string) => {
        setEditFormData((prev: any) => {
            const newFeatures = prev.features.includes(feature) 
                ? prev.features.filter((f: string) => f !== feature) 
                : [...prev.features, feature];
            return { ...prev, features: newFeatures };
        });
    };

    const saveChanges = () => {
        if (!editingPoint) return;
        
        const updatedPoint = {
            ...editingPoint,
            description: editFormData.description,
            features: editFormData.features,
            prices: editFormData.prices
        };
        
        onUpdatePartnerRequest(updatedPoint);
        closeEditModal();
    };

    const featuresList = [
        "Wi-Fi Gratuito", "Mesa e Cadeiras", "Ar Condicionado", "Permitido Abordagem na Saída", 
        "Estacionamento", "Banheiro", "Copa / Cozinha", "Tomadas Disponíveis"
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12 animate-fade-in">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex justify-between items-end border-b border-gray-200 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-green-900">Meu Painel de Parceiro</h1>
                        <p className="text-gray-600 mt-2">Gerencie seus espaços, reservas e faturamento.</p>
                    </div>
                    <button onClick={onBackHome} className="text-green-800 hover:text-green-600 font-semibold text-sm underline">
                        Voltar para Home
                    </button>
                </div>

                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                        <div className="p-4 rounded-full bg-blue-100 text-blue-600 mr-4">
                            <BuildingStorefrontIcon className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase">Total de Pontos</h3>
                            <p className="text-2xl font-bold text-gray-900">{myPoints.length}</p>
                            <p className="text-xs text-gray-400">{approvedPoints.length} ativos</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                        <div className="p-4 rounded-full bg-green-100 text-green-600 mr-4">
                            <ChartIcon className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase">Receita Estimada</h3>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                            <p className="text-xs text-gray-400">baseada em contratos ativos</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                        <div className="p-4 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                             <ClockIcon className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase">Em Análise</h3>
                            <p className="text-2xl font-bold text-gray-900">{pendingPoints.length}</p>
                            <p className="text-xs text-gray-400">Aguardando aprovação</p>
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <BuildingStorefrontIcon className="h-6 w-6 mr-2 text-green-900"/>
                    Meus Pontos Cadastrados
                </h2>
                
                <div className="grid gap-6">
                    {myPoints.length > 0 ? (
                        myPoints.map((point) => {
                            // Check if booked (Mock logic: check if ANY booking exists for this establishment name or ID for demo purposes)
                            // Real logic would match Point IDs.
                            const activeBooking = bookings.find(b => 
                                b.point.title === point.establishmentName || 
                                b.point.id.toString() === point.id // Hypothetical ID match
                            );
                            
                            return (
                                <div key={point.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col lg:flex-row gap-6 hover:shadow-md transition-shadow">
                                    {/* Left Info */}
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-xl font-bold text-gray-900">{point.establishmentName}</h3>
                                            {point.status === 'pending' && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 uppercase tracking-wide">
                                                    Em Análise
                                                </span>
                                            )}
                                            {point.status === 'approved' && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 uppercase tracking-wide">
                                                    Ativo
                                                </span>
                                            )}
                                            {point.status === 'rejected' && (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 uppercase tracking-wide">
                                                    Rejeitado
                                                </span>
                                            )}
                                        </div>
                                        
                                        <p className="text-sm text-gray-500 mb-4 flex items-center">
                                            <LocationPinIcon className="h-4 w-4 mr-1"/> {point.address}, {point.city}
                                        </p>

                                        {/* Booking Status Block */}
                                        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Status da Locação</h4>
                                            {activeBooking ? (
                                                <div className="flex items-center text-red-600 font-medium">
                                                     <XMarkIcon className="h-5 w-5 mr-2" />
                                                     <span>Reservado ({formatDate(activeBooking.startDate)} até {formatDate(activeBooking.endDate)})</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-green-600 font-medium">
                                                     <CheckCircleIcon className="h-5 w-5 mr-2" />
                                                     <span>Disponível para locação</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {point.features.slice(0, 4).map(f => (
                                                <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">{f}</span>
                                            ))}
                                            {point.features.length > 4 && <span className="text-xs text-gray-400 px-2 py-1">+{point.features.length - 4}</span>}
                                        </div>

                                        <p className="text-sm text-gray-600 line-clamp-2 italic">"{point.description}"</p>
                                    </div>

                                    {/* Right Actions */}
                                    <div className="lg:w-64 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Valor Mensal Sugerido</p>
                                            <p className="text-2xl font-bold text-green-800 mb-4">{formatCurrency(point.prices.mensal)}</p>
                                        </div>
                                        
                                        <button 
                                            onClick={() => openEditModal(point)}
                                            className="w-full flex items-center justify-center bg-white border border-green-600 text-green-700 font-bold py-2 px-4 rounded-lg hover:bg-green-50 transition-colors"
                                        >
                                            <PencilSquareIcon className="h-5 w-5 mr-2" />
                                            Editar Informações
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                <BuildingStorefrontIcon className="h-8 w-8" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Nenhum ponto encontrado</h3>
                            <p className="text-gray-500 mt-1">Você ainda não cadastrou nenhum espaço comercial.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {editingPoint && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 overflow-y-auto backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-green-900">Editar Ponto</h3>
                            <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                             {/* Description Edit */}
                             <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
                                <textarea 
                                    name="description"
                                    value={editFormData.description}
                                    onChange={handleEditChange}
                                    rows={4}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 outline-none"
                                />
                            </div>

                            {/* Features Edit */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Diferenciais</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {featuresList.map(feature => (
                                        <label key={feature} className={`flex items-center p-2 rounded border cursor-pointer ${editFormData.features.includes(feature) ? 'bg-green-50 border-green-500' : 'border-gray-200'}`}>
                                            <input 
                                                type="checkbox" 
                                                checked={editFormData.features.includes(feature)} 
                                                onChange={() => handleFeatureToggle(feature)}
                                                className="mr-2 text-green-600 focus:ring-green-500" 
                                            />
                                            <span className="text-sm text-gray-700">{feature}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Prices Edit */}
                            <div className="grid grid-cols-3 gap-4">
                                {['quinzenal', 'mensal', 'trimestral'].map((period) => (
                                    <div key={period}>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1 capitalize">{period}</label>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">R$</span>
                                            <input 
                                                type="number" 
                                                value={editFormData.prices[period]} 
                                                onChange={(e) => handlePriceChange(period, e.target.value)}
                                                className="w-full pl-6 pr-2 py-2 border border-gray-300 rounded-lg text-sm font-bold focus:ring-green-500 outline-none" 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Photos Placeholder */}
                            <div className="bg-blue-50 border border-dashed border-blue-300 rounded-lg p-4 text-center">
                                <p className="text-sm text-blue-800 font-medium">Gerenciar Fotos</p>
                                <p className="text-xs text-blue-600 mt-1">Funcionalidade simplificada para demonstração</p>
                                <button className="mt-2 text-xs bg-white border border-blue-300 px-3 py-1 rounded text-blue-700 hover:bg-blue-100">
                                    + Adicionar Novas Fotos
                                </button>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                            <button onClick={closeEditModal} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Cancelar</button>
                            <button onClick={saveChanges} className="px-6 py-2 bg-green-900 text-white rounded-lg font-bold hover:bg-green-800 shadow-md">Salvar Alterações</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
