
import React, { useState, useMemo, useRef } from 'react';
import { BrandLogo } from './BrandLogo';
import { ChartBarIcon, UsersIcon, HandshakeIcon, XMarkIcon, CreditCardIcon, LocationPinIcon, BuildingStorefrontIcon, PencilIcon, TrashIcon, EyeSlashIcon } from './icons';
import type { Booking, User, PartnerRequest, Point } from '../types';

interface AdminDashboardProps {
    bookings: Booking[];
    users: User[];
    partnerRequests: PartnerRequest[];
    points: Point[];
    onApprovePartner: (id: string) => void;
    onRejectPartner: (id: string) => void;
    onUpdatePoint: (point: Point) => void;
    onDeletePoint: (pointId: number) => void;
    onUpdateUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    onLogout: () => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatDate = (date: Date) => new Intl.DateTimeFormat('pt-BR').format(new Date(date));

// Função para calcular a diferença de dias entre duas datas
const daysBetween = (date1: Date, date2: Date) => {
    const oneDay = 24 * 60 * 60 * 1000; 
    return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
};

// Helper para converter imagem
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ bookings, users, partnerRequests, points, onApprovePartner, onRejectPartner, onUpdatePoint, onDeletePoint, onUpdateUser, onDeleteUser, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'partners' | 'financial' | 'users' | 'establishments'>('overview');

    // Estado para edição de Pontos
    const [editingPoint, setEditingPoint] = useState<Point | null>(null);
    const [editPointForm, setEditPointForm] = useState<any>({});
    const [customFeature, setCustomFeature] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estado para Confirmação de Ocultar Ponto
    const [pointToHide, setPointToHide] = useState<Point | null>(null);

    // Estado para edição de Usuários
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editUserForm, setEditUserForm] = useState<any>({});

    // Cálculos Financeiros Gerais
    const totalRevenue = useMemo(() => bookings.reduce((acc, curr) => acc + curr.plan.price, 0), [bookings]);
    const companyProfit = totalRevenue * 0.25; // 25% de comissão
    const partnerRevenue = totalRevenue * 0.75;

    const pendingRequests = partnerRequests.filter(p => p.status === 'pending');

    const StatCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className={`p-4 rounded-full mr-4 ${colorClass}`}>
                <Icon className="h-8 w-8" />
            </div>
            <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
        </div>
    );

    // Preparar dados de usuários com métricas extras
    const usersWithMetrics = useMemo(() => {
        return users.map(user => {
            const userBookings = bookings.filter(b => b.userEmail === user.email);
            const totalInvested = userBookings.reduce((sum, b) => sum + b.plan.price, 0);
            const hasActiveBooking = userBookings.some(b => b.status === 'active');
            const isOwner = partnerRequests.some(req => req.email === user.email);
            
            return { ...user, totalInvested, hasActiveBooking, isOwner };
        });
    }, [users, bookings, partnerRequests]);

    // Preparar dados de estabelecimentos
    const establishmentsMetrics = useMemo(() => {
        return points.map(point => {
            const pointBookings = bookings.filter(b => b.point.id === point.id);
            const totalRevenue = pointBookings.reduce((sum, b) => sum + b.plan.price, 0);
            const isActive = pointBookings.some(b => b.status === 'active');
            const totalDaysRented = pointBookings.reduce((days, b) => {
                 const duration = daysBetween(new Date(b.startDate), new Date(b.endDate));
                 return days + duration;
            }, 0);
            const lastPaymentDate = pointBookings.length > 0 
                ? new Date(Math.max(...pointBookings.map(b => new Date(b.purchaseDate).getTime()))) 
                : null;

            return {
                ...point,
                totalRevenue,
                isActive,
                totalDaysRented,
                lastPaymentDate
            };
        });
    }, [points, bookings]);

    // --- Handlers de Edição de Pontos ---
    const handleEditPointClick = (point: Point) => {
        setEditingPoint(point);
        const quinzenal = point.rentalOptions.find(r => r.period === 'Quinzenal')?.price || 0;
        const mensal = point.rentalOptions.find(r => r.period === 'Mensal')?.price || 0;
        const trimestral = point.rentalOptions.find(r => r.period === 'Trimestral')?.price || 0;

        setEditPointForm({
            title: point.title,
            location: point.location,
            neighborhood: point.neighborhood,
            city: point.city,
            description: point.description,
            features: [...point.features],
            images: [...(point.images || [])], 
            prices: { quinzenal, mensal, trimestral }
        });
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditPointForm((prev: any) => ({ ...prev, [name]: value }));
    };

    const handlePriceChange = (period: string, value: string) => {
        setEditPointForm((prev: any) => ({
            ...prev,
            prices: { ...prev.prices, [period]: Number(value) }
        }));
    };

    const handleFeatureToggle = (feature: string) => {
        setEditPointForm((prev: any) => {
            const newFeatures = prev.features.includes(feature)
                ? prev.features.filter((f: string) => f !== feature)
                : [...prev.features, feature];
            return { ...prev, features: newFeatures };
        });
    };
    
    const handleAddCustomFeature = () => {
        if (customFeature && !editPointForm.features.includes(customFeature)) {
            setEditPointForm((prev: any) => ({
                ...prev,
                features: [...prev.features, customFeature]
            }));
            setCustomFeature('');
        }
    };

    // --- Handlers de Imagem ---
    const handleRemoveImage = (index: number) => {
        setEditPointForm((prev: any) => ({
            ...prev,
            images: prev.images.filter((_: string, i: number) => i !== index)
        }));
    };

    const handleAddPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            try {
                const files = Array.from(e.target.files);
                const promises = files.map(file => fileToBase64(file));
                const newBase64Images = await Promise.all(promises);
                
                setEditPointForm((prev: any) => ({
                    ...prev,
                    images: [...(prev.images || []), ...newBase64Images]
                }));
            } catch (error) {
                console.error("Erro ao processar imagens", error);
                alert("Erro ao adicionar fotos. Tente arquivos menores.");
            }
        }
    };

    const handleSavePoint = () => {
        if (!editingPoint) return;
        
        const updatedPoint: Point = {
            ...editingPoint,
            title: editPointForm.title,
            location: editPointForm.location,
            neighborhood: editPointForm.neighborhood,
            city: editPointForm.city,
            description: editPointForm.description,
            features: editPointForm.features,
            images: editPointForm.images,
            rentalOptions: [
                { period: 'Quinzenal', price: Number(editPointForm.prices.quinzenal) },
                { period: 'Mensal', price: Number(editPointForm.prices.mensal) },
                { period: 'Trimestral', price: Number(editPointForm.prices.trimestral) }
            ]
        };

        onUpdatePoint(updatedPoint);
        setEditingPoint(null);
    };

    // --- Handlers de Edição de Usuários ---
    const handleEditUserClick = (user: User) => {
        setEditingUser(user);
        setEditUserForm({
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            profileType: user.profileType
        });
    };
    
    const handleUserEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditUserForm((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSaveUser = () => {
        if(!editingUser) return;
        const updatedUser: User = {
            ...editingUser,
            name: editUserForm.name,
            email: editUserForm.email,
            phone: editUserForm.phone,
            role: editUserForm.role,
            profileType: editUserForm.profileType
        };
        onUpdateUser(updatedUser);
        setEditingUser(null);
    }

    const featuresList = [
        "Wi-Fi Gratuito", "Mesa e Cadeiras", "Ar Condicionado", "Permitido Abordagem na Saída", 
        "Estacionamento", "Banheiro", "Copa / Cozinha", "Tomadas Disponíveis", "Segurança 24h"
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans animate-fade-in">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-green-900 text-white flex-shrink-0 md:min-h-screen">
                <div className="p-6 border-b border-green-800">
                    <div className="bg-white p-2 rounded-lg inline-block mb-2">
                        <BrandLogo className="h-8" />
                    </div>
                    <p className="text-green-200 text-xs uppercase tracking-widest mt-2">Administrador</p>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-yellow-400 text-green-900 font-bold' : 'text-green-100 hover:bg-green-800'}`}>
                        <ChartBarIcon className="h-5 w-5 mr-3" /> Visão Geral
                    </button>
                    <button onClick={() => setActiveTab('establishments')} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'establishments' ? 'bg-yellow-400 text-green-900 font-bold' : 'text-green-100 hover:bg-green-800'}`}>
                        <BuildingStorefrontIcon className="h-5 w-5 mr-3" /> Estabelecimentos
                    </button>
                    <button onClick={() => setActiveTab('partners')} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'partners' ? 'bg-yellow-400 text-green-900 font-bold' : 'text-green-100 hover:bg-green-800'}`}>
                        <HandshakeIcon className="h-5 w-5 mr-3" /> Aprovações {pendingRequests.length > 0 && <span className="ml-auto bg-red-500 text-white text-xs py-0.5 px-2 rounded-full">{pendingRequests.length}</span>}
                    </button>
                    <button onClick={() => setActiveTab('financial')} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'financial' ? 'bg-yellow-400 text-green-900 font-bold' : 'text-green-100 hover:bg-green-800'}`}>
                        <CreditCardIcon className="h-5 w-5 mr-3" /> Financeiro
                    </button>
                    <button onClick={() => setActiveTab('users')} className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-yellow-400 text-green-900 font-bold' : 'text-green-100 hover:bg-green-800'}`}>
                        <UsersIcon className="h-5 w-5 mr-3" /> Usuários
                    </button>
                </nav>
                <div className="absolute bottom-0 w-full md:w-64 p-4 border-t border-green-800">
                    <button onClick={onLogout} className="w-full text-left text-green-300 hover:text-white text-sm flex items-center">
                        <XMarkIcon className="h-4 w-4 mr-2" /> Sair do Painel
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
                
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fade-in">
                        <h2 className="text-3xl font-bold text-gray-800">Painel de Controle</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title="Faturamento Total" value={formatCurrency(totalRevenue)} subtext="Volume Bruto de Reservas" icon={ChartBarIcon} colorClass="bg-blue-100 text-blue-600" />
                            <StatCard title="Lucro Ponto+" value={formatCurrency(companyProfit)} subtext="25% de Comissão" icon={CreditCardIcon} colorClass="bg-green-100 text-green-600" />
                            <StatCard title="Usuários Ativos" value={users.length} subtext="Total de cadastros" icon={UsersIcon} colorClass="bg-purple-100 text-purple-600" />
                            <StatCard title="Novos Parceiros" value={pendingRequests.length} subtext="Aguardando Aprovação" icon={HandshakeIcon} colorClass="bg-yellow-100 text-yellow-600" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Últimas Reservas</h3>
                                {bookings.length > 0 ? (
                                    <div className="space-y-4">
                                        {bookings.slice(0, 5).map((booking, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 bg-green-200 rounded-full flex items-center justify-center text-green-800 font-bold mr-3">
                                                        {booking.point.title.substring(0,1)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{booking.point.title}</p>
                                                        <p className="text-xs text-gray-500">{booking.plan.period}</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-bold text-green-700">{formatCurrency(booking.plan.price)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">Nenhuma reserva registrada.</p>
                                )}
                            </div>

                             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Novos Usuários</h3>
                                <div className="space-y-4">
                                    {users.slice(0, 5).map((user, i) => (
                                        <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{user.role === 'admin' ? 'Admin' : 'User'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'establishments' && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-800">Estabelecimentos Cadastrados</h2>
                        <p className="text-gray-600">Visão completa dos pontos comerciais ativos na plataforma.</p>
                        
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                             <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Estabelecimento</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Localização</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status Atual</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Tempo Atividade</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Faturamento Total</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {establishmentsMetrics.map((est) => (
                                            <tr key={est.id} className={`hover:bg-gray-50 transition-colors group ${est.isHidden ? 'bg-gray-50' : ''}`}>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-gray-900">{est.title}</p>
                                                        {est.isHidden && (
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-800 text-white">
                                                                Oculto
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500">{est.category}</p>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">
                                                    {est.city}
                                                </td>
                                                <td className="p-4">
                                                    {est.isHidden ? (
                                                         <span className="px-2 py-1 rounded-full text-xs font-bold border bg-gray-200 text-gray-700 border-gray-300">
                                                            Indisponível (Oculto)
                                                        </span>
                                                    ) : (
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${est.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-blue-100 text-blue-800 border-blue-200'}`}>
                                                            {est.isActive ? 'Ocupado (Ativo)' : 'Disponível (Vitrine)'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-sm text-center text-gray-600">
                                                    {est.totalDaysRented} dias locado
                                                </td>
                                                <td className="p-4 text-sm font-bold text-green-700 text-right">
                                                    {formatCurrency(est.totalRevenue)}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleEditPointClick(est); }}
                                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                                                            title="Editar Ponto"
                                                        >
                                                            <PencilIcon className="h-5 w-5" />
                                                        </button>
                                                        {!est.isHidden && (
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => { 
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
                                                                    setPointToHide(est);
                                                                }}
                                                                className="p-2 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors border border-transparent hover:border-orange-200 z-50 relative cursor-pointer"
                                                                title="Ocultar do Catálogo"
                                                                style={{ pointerEvents: 'auto' }}
                                                            >
                                                                <EyeSlashIcon className="h-5 w-5" />
                                                            </button>
                                                        )}
                                                        {est.isHidden && (
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => { 
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
                                                                    setPointToHide(est);
                                                                }}
                                                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors border border-transparent hover:border-green-200 z-50 relative cursor-pointer"
                                                                title="Tornar Visível"
                                                                style={{ pointerEvents: 'auto' }}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ... (Abas Partners, Financial, Users mantidas iguais) ... */}
                {activeTab === 'partners' && (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-800">Aprovação de Estabelecimentos</h2>
                        <div className="space-y-4">
                            {partnerRequests.map((req) => (
                                <div key={req.id} className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col lg:flex-row justify-between gap-6 transition-colors ${req.status === 'approved' ? 'border-green-200 bg-green-50' : (req.status === 'rejected' ? 'border-red-100 bg-red-50 opacity-75' : 'border-gray-200')}`}>
                                    <div className="flex-grow">
                                        <div className="flex items-center mb-2">
                                            <h3 className="text-xl font-bold text-gray-900 mr-3">{req.establishmentName}</h3>
                                            {req.status === 'pending' && <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded uppercase">Pendente</span>}
                                            {req.status === 'approved' && <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded uppercase">Aprovado</span>}
                                            {req.status === 'rejected' && <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded uppercase">Rejeitado</span>}
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                                            <p><span className="font-semibold">Responsável:</span> {req.ownerName}</p>
                                            <p><span className="font-semibold">CNPJ:</span> {req.cnpj}</p>
                                            <p className="flex items-center"><LocationPinIcon className="h-4 w-4 mr-1"/> {req.address}, {req.city}</p>
                                            <p><span className="font-semibold">Contato:</span> {req.phone} | {req.email}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg text-sm mb-4">
                                            <p className="font-semibold text-gray-700 mb-1">Descrição:</p>
                                            <p className="text-gray-600 italic">"{req.description}"</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-3 min-w-[200px] border-l border-gray-100 pl-0 lg:pl-6 pt-4 lg:pt-0">
                                        <div className="text-sm text-gray-600 mb-2">
                                            <p className="font-semibold">Valores Sugeridos:</p>
                                            <p>Quinzenal: <span className="text-green-700 font-bold">{formatCurrency(req.prices.quinzenal)}</span></p>
                                            <p>Mensal: <span className="text-green-700 font-bold">{formatCurrency(req.prices.mensal)}</span></p>
                                        </div>
                                        {req.status === 'pending' && (
                                            <div className="mt-auto flex gap-2">
                                                <button onClick={() => onRejectPartner(req.id)} className="flex-1 bg-white border border-red-300 text-red-600 font-bold py-2 rounded hover:bg-red-50 transition-colors">Rejeitar</button>
                                                <button onClick={() => onApprovePartner(req.id)} className="flex-1 bg-green-900 text-white font-bold py-2 rounded hover:bg-green-800 transition-colors shadow-sm">Aprovar</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'financial' && (
                    <div className="space-y-6 animate-fade-in">
                         <h2 className="text-2xl font-bold text-gray-800">Relatório Financeiro</h2>
                         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">ID Reserva</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Estabelecimento</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Plano</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Data</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Valor Total</th>
                                        <th className="p-4 text-xs font-bold text-green-600 uppercase text-right">Lucro (25%)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {bookings.map((booking, i) => (
                                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-sm font-mono text-gray-600">{booking.id}</td>
                                            <td className="p-4 text-sm text-gray-900 font-medium">{booking.point.title}</td>
                                            <td className="p-4 text-sm text-gray-600">{booking.plan.period}</td>
                                            <td className="p-4 text-sm text-gray-600">{formatDate(booking.purchaseDate)}</td>
                                            <td className="p-4 text-sm font-bold text-gray-900 text-right">{formatCurrency(booking.plan.price)}</td>
                                            <td className="p-4 text-sm font-bold text-green-600 text-right bg-green-50/50">{formatCurrency(booking.plan.price * 0.25)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    </div>
                )}

                {activeTab === 'users' && (
                     <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-gray-800">Usuários Cadastrados</h2>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                           <div className="overflow-x-auto">
                               <table className="w-full text-left border-collapse">
                                   <thead className="bg-gray-50">
                                       <tr>
                                           <th className="p-4 text-xs font-bold text-gray-500 uppercase">Nome / Perfil</th>
                                           <th className="p-4 text-xs font-bold text-gray-500 uppercase">Contato</th>
                                           <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                                           <th className="p-4 text-xs font-bold text-gray-500 uppercase">Data Cadastro</th>
                                           <th className="p-4 text-xs font-bold text-gray-500 uppercase text-center">Ações</th>
                                       </tr>
                                   </thead>
                                   <tbody className="divide-y divide-gray-100">
                                       {usersWithMetrics.map((user) => (
                                           <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                               <td className="p-4">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                                        {user.isOwner && (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                                Proprietário
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-700'}`}>
                                                            {user.role}
                                                        </span>
                                                        {user.profileType && (
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                                                                {user.profileType.replace('_', ' ')}
                                                            </span>
                                                        )}
                                                    </div>
                                               </td>
                                               <td className="p-4 text-sm text-gray-600">
                                                   <p>{user.email}</p>
                                                   <p className="text-xs text-gray-500">{user.phone}</p>
                                               </td>
                                               <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.hasActiveBooking ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {user.hasActiveBooking ? 'Ativo' : 'Inativo'}
                                                    </span>
                                               </td>
                                               <td className="p-4 text-sm text-gray-600">{formatDate(user.joinDate)}</td>
                                               <td className="p-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleEditUserClick(user); }}
                                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                                                            title="Editar Usuário"
                                                        >
                                                            <PencilIcon className="h-5 w-5" />
                                                        </button>
                                                        {user.id !== 'adm' && (
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); onDeleteUser(user.id); }}
                                                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                                                title="Excluir Usuário"
                                                            >
                                                                <TrashIcon className="h-5 w-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                           </div>
                        </div>
                   </div>
                )}

            </main>

            {/* Confirmation Modal for Hiding/Unhiding Point */}
            {pointToHide && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                         <div className="p-6 text-center">
                            <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${pointToHide.isHidden ? 'bg-green-100' : 'bg-orange-100'}`}>
                                {pointToHide.isHidden ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-green-600">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                ) : (
                                    <EyeSlashIcon className="h-8 w-8 text-orange-600" />
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{pointToHide.isHidden ? 'Tornar Visível?' : 'Ocultar Estabelecimento?'}</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                {pointToHide.isHidden 
                                    ? `Você deseja mostrar ${pointToHide.title} novamente no catálogo?`
                                    : `Você está prestes a ocultar ${pointToHide.title} do catálogo. Ele deixará de aparecer para os usuários.`
                                }
                            </p>
                            <div className="flex justify-center gap-3">
                                <button 
                                    onClick={() => setPointToHide(null)} 
                                    className="px-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={() => {
                                        onDeletePoint(pointToHide.id);
                                        setPointToHide(null);
                                    }} 
                                    className={`px-5 py-2.5 text-white font-bold rounded-lg shadow-lg transition-colors ${pointToHide.isHidden ? 'bg-green-900 hover:bg-green-800' : 'bg-orange-600 hover:bg-orange-700'}`}
                                >
                                    {pointToHide.isHidden ? 'Sim, Mostrar' : 'Sim, Ocultar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Point Modal */}
            {editingPoint && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 overflow-y-auto backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
                         <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-green-900">Editar Estabelecimento</h3>
                            <button onClick={() => setEditingPoint(null)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Nome do Estabelecimento</label>
                                    <input type="text" name="title" value={editPointForm.title} onChange={handleEditChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Cidade</label>
                                    <input type="text" name="city" value={editPointForm.city} onChange={handleEditChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Bairro</label>
                                    <input type="text" name="neighborhood" value={editPointForm.neighborhood} onChange={handleEditChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 outline-none" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Endereço</label>
                                    <input type="text" name="location" value={editPointForm.location} onChange={handleEditChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Descrição</label>
                                <textarea name="description" value={editPointForm.description} onChange={handleEditChange} rows={4} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 outline-none" />
                            </div>

                            {/* Photos Management */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Fotos do Estabelecimento</label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
                                    {editPointForm.images && editPointForm.images.map((img: string, idx: number) => (
                                        <div key={idx} className="relative group aspect-square">
                                            <img src={img} alt={`Foto ${idx}`} className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                            <button 
                                                onClick={() => handleRemoveImage(idx)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 cursor-pointer"
                                                title="Excluir foto"
                                            >
                                                <XMarkIcon className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {/* Add Photo Button */}
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-green-500 transition-colors aspect-square"
                                    >
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            accept="image/*" 
                                            multiple 
                                            onChange={handleAddPhotos} 
                                        />
                                        <span className="text-2xl text-gray-400 mb-1">+</span>
                                        <span className="text-xs text-gray-500 font-medium">Adicionar</span>
                                    </div>
                                </div>
                            </div>

                            {/* Prices Edit */}
                            <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                {['quinzenal', 'mensal', 'trimestral'].map((period) => (
                                    <div key={period}>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1 capitalize">{period}</label>
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">R$</span>
                                            <input 
                                                type="number" 
                                                value={editPointForm.prices[period]} 
                                                onChange={(e) => handlePriceChange(period, e.target.value)}
                                                className="w-full pl-6 pr-2 py-2 border border-gray-300 rounded-lg text-sm font-bold focus:ring-green-500 outline-none" 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Features Edit */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Diferenciais</label>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    {featuresList.map(feature => (
                                        <label key={feature} className={`flex items-center p-2 rounded border cursor-pointer ${editPointForm.features.includes(feature) ? 'bg-green-50 border-green-500' : 'border-gray-200'}`}>
                                            <input 
                                                type="checkbox" 
                                                checked={editPointForm.features.includes(feature)} 
                                                onChange={() => handleFeatureToggle(feature)}
                                                className="mr-2 text-green-600 focus:ring-green-500" 
                                            />
                                            <span className="text-sm text-gray-700">{feature}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={customFeature} 
                                        onChange={(e) => setCustomFeature(e.target.value)}
                                        placeholder="Adicionar diferencial customizado" 
                                        className="flex-grow p-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 outline-none"
                                    />
                                    <button 
                                        onClick={handleAddCustomFeature}
                                        type="button"
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg text-sm"
                                    >
                                        Adicionar
                                    </button>
                                </div>
                                {/* Display existing custom features that are not in the main list */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {editPointForm.features.filter((f: string) => !featuresList.includes(f)).map((f: string) => (
                                        <span key={f} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                            {f}
                                            <button onClick={() => handleFeatureToggle(f)} className="ml-1 text-blue-600 hover:text-blue-800"><XMarkIcon className="h-3 w-3"/></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                         <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                            <button onClick={() => setEditingPoint(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Cancelar</button>
                            <button onClick={handleSavePoint} className="px-6 py-2 bg-green-900 text-white rounded-lg font-bold hover:bg-green-800 shadow-md">Salvar Alterações</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                 <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 overflow-y-auto backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative animate-fade-in">
                         <div className="bg-white z-10 px-6 py-4 border-b border-gray-100 flex justify-between items-center rounded-t-xl">
                            <h3 className="text-xl font-bold text-green-900">Editar Usuário</h3>
                            <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nome</label>
                                <input type="text" name="name" value={editUserForm.name} onChange={handleUserEditChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                <input type="email" name="email" value={editUserForm.email} onChange={handleUserEditChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Telefone</label>
                                <input type="tel" name="phone" value={editUserForm.phone} onChange={handleUserEditChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                                    <select name="role" value={editUserForm.role} onChange={handleUserEditChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 outline-none">
                                        <option value="user">Usuário</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Perfil</label>
                                    <select name="profileType" value={editUserForm.profileType} onChange={handleUserEditChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-green-500 outline-none">
                                        <option value="corretor_autonomo">Corretor Autônomo</option>
                                        <option value="imobiliaria">Imobiliária</option>
                                        <option value="construtora">Construtora</option>
                                        <option value="estabelecimento">Estabelecimento</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3 rounded-b-xl">
                            <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium">Cancelar</button>
                            <button onClick={handleSaveUser} className="px-6 py-2 bg-green-900 text-white rounded-lg font-bold hover:bg-green-800 shadow-md">Salvar Alterações</button>
                        </div>
                    </div>
                 </div>
            )}

            <style>{`
                @keyframes fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
};
