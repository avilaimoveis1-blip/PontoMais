

import React, { useState, useMemo, useEffect } from 'react';
import type { Point, RentalOption, Booking } from '../types';
import { LocationPinIcon, XMarkIcon, CalendarIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, CreditCardIcon, QrCodeIcon, CheckCircleIcon } from './icons';

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
};

const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};

const getDurationInDays = (period: RentalOption['period']): number => {
    switch (period) {
        case 'Quinzenal': return 15;
        case 'Mensal': return 30;
        case 'Trimestral': return 90;
        default: return 0;
    }
};

interface BookingModalProps {
    point: Point;
    existingBookings: Booking[];
    onClose: () => void;
    onBookingComplete: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ point, existingBookings, onClose, onBookingComplete }) => {
    // Steps: 1 = Details, 2 = Payment, 3 = Success
    const [step, setStep] = useState<1 | 2 | 3>(1);
    
    // Sub-state for Step 1: Is the user looking at the calendar view?
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    
    const [selectedPlan, setSelectedPlan] = useState<RentalOption | null>(point.rentalOptions[0] || null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    
    // Payment Method State
    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit' | 'debit'>('pix');
    
    // Date Picker State
    const [dateInputValue, setDateInputValue] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [viewDate, setViewDate] = useState(new Date()); 
    const [dateError, setDateError] = useState<string | null>(null);

    // Generated Booking ID for display
    const [bookingId] = useState(`#PM${Math.floor(Math.random() * 100000)}`);

    const perDayCosts = useMemo(() => {
        return point.rentalOptions.map(opt => ({
            ...opt,
            perDay: opt.price / getDurationInDays(opt.period)
        }));
    }, [point.rentalOptions]);

    const baselinePerDayCost = useMemo(() => {
        if (perDayCosts.length === 0) return 0;
        return Math.max(...perDayCosts.map(p => p.perDay));
    }, [perDayCosts]);


    const endDateCalculated = useMemo(() => {
        if (!selectedDate || !selectedPlan) return null;
        const start = new Date(selectedDate);
        const duration = getDurationInDays(selectedPlan.period);
        const end = new Date(start.getTime());
        end.setDate(end.getDate() + duration);
        return end;
    }, [selectedDate, selectedPlan]);

    const endDateString = useMemo(() => {
        return endDateCalculated ? formatDate(endDateCalculated) : null;
    }, [endDateCalculated]);

    // --- Occupied Dates Logic ---
    const occupiedDates = useMemo(() => {
        const dates = new Set<string>();
        // Filter bookings for THIS point that are active or upcoming
        const relevantBookings = existingBookings.filter(b => 
            b.point.id === point.id && 
            (b.status === 'active' || b.status === 'upcoming')
        );

        relevantBookings.forEach(booking => {
            const start = new Date(booking.startDate);
            const end = new Date(booking.endDate);
            // Normalize time to start of day for accurate comparison
            start.setHours(0,0,0,0);
            end.setHours(0,0,0,0);

            const current = new Date(start);
            while (current <= end) {
                dates.add(current.toDateString());
                current.setDate(current.getDate() + 1);
            }
        });

        return dates;
    }, [existingBookings, point.id]);

    // Função para verificar se um intervalo está livre
    const checkRangeAvailability = (start: Date, plan: RentalOption): boolean => {
        const duration = getDurationInDays(plan.period);
        const check = new Date(start);
        check.setHours(0,0,0,0);
        
        for(let i = 0; i < duration; i++) {
            if (occupiedDates.has(check.toDateString())) {
                return false; // Colisão detectada
            }
            check.setDate(check.getDate() + 1);
        }
        return true;
    };

    // Revalidar quando o plano muda
    useEffect(() => {
        if (selectedDate && selectedPlan) {
            if (!checkRangeAvailability(selectedDate, selectedPlan)) {
                setDateError("O período deste plano conflita com uma reserva existente.");
            } else {
                setDateError(null);
            }
        }
    }, [selectedPlan]);


    // --- Custom Calendar Logic ---

    const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, ''); 
        if (value.length > 8) value = value.slice(0, 8);
        
        // Mask: DD/MM/YYYY
        if (value.length >= 5) {
            value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
        } else if (value.length >= 3) {
            value = `${value.slice(0, 2)}/${value.slice(2)}`;
        }
        
        setDateInputValue(value);
        setDateError(null);

        if (value.length === 10) {
            const [day, month, year] = value.split('/').map(Number);
            const date = new Date(year, month - 1, day);
            
            if (date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (date < today) {
                     setDateError("A data não pode ser no passado.");
                     setSelectedDate(null);
                     return;
                }

                // Check strict start date availability
                if (occupiedDates.has(date.toDateString())) {
                    setDateError("Esta data já está ocupada.");
                    setSelectedDate(null);
                    return;
                }

                // Check full range availability
                if (selectedPlan && !checkRangeAvailability(date, selectedPlan)) {
                    setDateError("O período selecionado conflita com outra reserva.");
                    setSelectedDate(null); // Don't select if range is invalid
                    return;
                }

                setSelectedDate(date);
                setViewDate(date);
            }
        } else {
            setSelectedDate(null);
        }
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setViewDate(newDate);
    };

    const handleDayClick = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        
        if (occupiedDates.has(newDate.toDateString())) return;
        
        if (selectedPlan && !checkRangeAvailability(newDate, selectedPlan)) {
            setDateError("O período escolhido conflita com uma reserva já existente.");
            // Ainda seleciona para o usuário ver, mas o erro impede o prosseguimento
        } else {
            setDateError(null);
        }

        setSelectedDate(newDate);
        setDateInputValue(formatDate(newDate));
        setIsCalendarOpen(false); 
    };

    const renderCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const days = [];
        
        // Empty slots
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="h-10 w-full"></div>);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDayDate = new Date(year, month, day);
            const isPast = currentDayDate < today;
            const isOccupied = occupiedDates.has(currentDayDate.toDateString());
            const isSelected = selectedDate && 
                               selectedDate.getDate() === day && 
                               selectedDate.getMonth() === month && 
                               selectedDate.getFullYear() === year;
            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

            days.push(
                <button
                    key={day}
                    onClick={(e) => { e.preventDefault(); !isPast && !isOccupied && handleDayClick(day); }}
                    disabled={isPast || isOccupied}
                    className={`
                        h-10 w-full rounded-lg flex items-center justify-center text-base transition-colors relative
                        ${isPast ? 'text-gray-300 cursor-not-allowed' : ''}
                        ${isOccupied ? 'bg-red-100 text-red-400 cursor-not-allowed decoration-line-through' : ''}
                        ${!isPast && !isOccupied ? 'hover:bg-green-100 text-gray-700 font-medium' : ''}
                        ${isSelected ? '!bg-green-900 text-white hover:!bg-green-800 font-bold shadow-md' : ''}
                        ${isToday && !isSelected && !isOccupied ? 'border-2 border-yellow-400 text-green-900 font-bold' : ''}
                    `}
                    title={isOccupied ? 'Data indisponível (Locado)' : ''}
                >
                    {day}
                </button>
            );
        }

        return days;
    };
    
    // --- End Custom Calendar Logic ---


    const handleGoToPayment = () => {
        if (selectedPlan && selectedDate) {
            if (!checkRangeAvailability(selectedDate, selectedPlan)) {
                setDateError("O período selecionado conflita com uma reserva existente. Por favor, escolha outra data ou plano.");
                return;
            }
            setStep(2);
        }
    };

    const handleConfirmPayment = () => {
        setIsProcessingPayment(true);
        // Simulate API call
        setTimeout(() => {
            setIsProcessingPayment(false);
            setStep(3);
            
            // Create booking object
            if (selectedPlan && selectedDate && endDateCalculated) {
                const newBooking: Booking = {
                    id: bookingId,
                    point: point,
                    plan: selectedPlan,
                    startDate: selectedDate,
                    endDate: endDateCalculated,
                    purchaseDate: new Date(),
                    status: 'upcoming' 
                };
                onBookingComplete(newBooking);
            }

        }, 2000);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative my-8 animate-fade-in-up overflow-hidden flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 bg-white rounded-full p-1">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                
                {/* Header */}
                <div className="bg-green-900 px-8 py-6 text-white flex-shrink-0">
                    <h2 className="text-2xl font-bold mb-1">
                        {step === 1 
                            ? (isCalendarOpen ? 'Selecione a Data' : 'Agendar Reserva')
                            : step === 2 ? 'Pagamento Seguro' : 'Reserva Confirmada'}
                    </h2>
                    <div className="flex items-center text-green-100 text-sm">
                        <LocationPinIcon className="h-4 w-4 mr-1" />
                        <span>{point.title}</span>
                    </div>
                </div>

                <div className="p-8 overflow-y-auto flex-grow">

                    {/* Step 1: Details */}
                    {step === 1 && (
                        <>
                            {/* Calendar View (Sub-screen) */}
                            {isCalendarOpen ? (
                                <div className="animate-fade-in h-full flex flex-col">
                                    <div className="flex justify-between items-center mb-6 bg-gray-50 p-4 rounded-lg">
                                        <button 
                                            onClick={() => changeMonth(-1)} 
                                            className="hover:bg-gray-200 rounded-full p-2 text-green-900"
                                        >
                                            <ChevronLeftIcon className="h-6 w-6"/>
                                        </button>
                                        <span className="font-bold text-xl capitalize text-green-900">
                                            {viewDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                                        </span>
                                        <button 
                                            onClick={() => changeMonth(1)} 
                                            className="hover:bg-gray-200 rounded-full p-2 text-green-900"
                                        >
                                            <ChevronRightIcon className="h-6 w-6"/>
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-7 text-center mb-4">
                                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, i) => (
                                            <span key={i} className="text-sm font-bold text-gray-500 uppercase">{day}</span>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-2 mb-8">
                                        {renderCalendarDays()}
                                    </div>
                                    
                                    <div className="flex justify-center items-center space-x-6 mb-4 text-xs">
                                        <div className="flex items-center"><div className="w-3 h-3 bg-green-900 rounded mr-2"></div> Selecionado</div>
                                        <div className="flex items-center"><div className="w-3 h-3 border-2 border-yellow-400 rounded mr-2"></div> Hoje</div>
                                        <div className="flex items-center"><div className="w-3 h-3 bg-red-100 rounded mr-2"></div> Indisponível</div>
                                    </div>

                                    <button 
                                        onClick={() => setIsCalendarOpen(false)}
                                        className="mt-auto w-full border border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-50 transition duration-300"
                                    >
                                        Confirmar Seleção
                                    </button>
                                </div>
                            ) : (
                                /* Standard Form View */
                                <div className="space-y-6 animate-fade-in">
                                    {/* Step 1: Select Plan */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-green-800 mb-3">1. Escolha o Plano</h3>
                                        <div className="space-y-2">
                                            {point.rentalOptions.map(opt => {
                                                const cost = perDayCosts.find(c => c.period === opt.period);
                                                let savings = 0;
                                                if (cost && baselinePerDayCost > 0 && cost.perDay < baselinePerDayCost) {
                                                    savings = Math.round((1 - (cost.perDay / baselinePerDayCost)) * 100);
                                                }

                                                return (
                                                    <label key={opt.period} className={`flex justify-between items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedPlan?.period === opt.period ? 'border-green-600 bg-green-50 shadow-md' : 'border-gray-300 hover:bg-gray-50'}`}>
                                                        <div className="flex items-center">
                                                            <input type="radio" name="rental-plan" value={opt.period} checked={selectedPlan?.period === opt.period} onChange={() => setSelectedPlan(opt)} className="hidden"/>
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 ${selectedPlan?.period === opt.period ? 'border-green-600 bg-green-600' : 'border-gray-400'}`}>
                                                                {selectedPlan?.period === opt.period && <CheckIcon className="w-3 h-3 text-white" />}
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-800">{opt.period}</span>
                                                                {savings > 0 && (
                                                                    <span className="ml-2 text-xs font-bold text-green-700 bg-green-200 rounded-full px-2 py-0.5">
                                                                        Economia de {savings}%
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="font-semibold text-lg text-green-900">{formatPrice(opt.price)}</span>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Step 2: Select Date */}
                                    <div className="relative">
                                        <h3 className="text-lg font-semibold text-green-800 mb-3">2. Data de Início</h3>
                                        
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                value={dateInputValue}
                                                onChange={handleDateInputChange}
                                                placeholder="DD/MM/AAAA"
                                                maxLength={10}
                                                className={`w-full pl-4 pr-12 py-4 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-lg ${dateError ? 'border-red-500 text-red-900' : 'border-gray-300'}`}
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => setIsCalendarOpen(true)}
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-900 hover:text-green-700 bg-green-100 hover:bg-green-200 p-2 rounded-lg transition-colors"
                                                title="Abrir Calendário"
                                            >
                                                <CalendarIcon className="h-6 w-6" />
                                            </button>
                                        </div>
                                        {dateError ? (
                                            <p className="text-sm text-red-500 mt-2 font-medium">{dateError}</p>
                                        ) : (
                                            <p className="text-sm text-gray-500 mt-2">
                                                Digite a data ou clique no ícone para ver a disponibilidade.
                                            </p>
                                        )}
                                    </div>

                                    {/* Summary Box */}
                                    {selectedPlan && selectedDate && !dateError && (
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fade-in">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Total a pagar:</span>
                                                <span className="text-2xl font-bold text-green-900">{formatPrice(selectedPlan.price)}</span>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-500 text-right">
                                                Vigência até {endDateString}
                                            </div>
                                        </div>
                                    )}

                                    <button 
                                        onClick={handleGoToPayment}
                                        disabled={!selectedPlan || !selectedDate || !!dateError}
                                        className="w-full bg-yellow-400 text-green-900 font-bold py-4 px-6 rounded-lg hover:bg-yellow-500 transition duration-300 text-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 shadow-lg mt-4"
                                    >
                                        Ir para Pagamento
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {/* Step 2: Payment (Mercado Pago Simulation) */}
                    {step === 2 && selectedPlan && (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-start bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                                <div>
                                    <p className="text-sm text-gray-600">Resumo do Pedido</p>
                                    <p className="font-bold text-gray-800">{selectedPlan.period} - {point.title}</p>
                                    <p className="text-sm text-gray-500">{dateInputValue} até {endDateString}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-green-900">{formatPrice(selectedPlan.price)}</p>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Como você prefere pagar?</h3>

                            {/* Payment Tabs */}
                            <div className="flex space-x-2 mb-6">
                                <button 
                                    onClick={() => setPaymentMethod('pix')}
                                    className={`flex-1 py-3 px-2 rounded-lg border text-sm font-medium flex flex-col items-center justify-center transition-all ${paymentMethod === 'pix' ? 'border-[#009EE3] bg-blue-50 text-[#009EE3]' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                                >
                                    <QrCodeIcon className="h-6 w-6 mb-1" />
                                    Pix
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod('credit')}
                                    className={`flex-1 py-3 px-2 rounded-lg border text-sm font-medium flex flex-col items-center justify-center transition-all ${paymentMethod === 'credit' ? 'border-[#009EE3] bg-blue-50 text-[#009EE3]' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                                >
                                    <CreditCardIcon className="h-6 w-6 mb-1" />
                                    Crédito
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod('debit')}
                                    className={`flex-1 py-3 px-2 rounded-lg border text-sm font-medium flex flex-col items-center justify-center transition-all ${paymentMethod === 'debit' ? 'border-[#009EE3] bg-blue-50 text-[#009EE3]' : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                                >
                                    <CreditCardIcon className="h-6 w-6 mb-1" />
                                    Débito
                                </button>
                            </div>

                            {/* Payment Forms */}
                            <div className="mb-8 min-h-[200px]">
                                {paymentMethod === 'pix' && (
                                    <div className="text-center animate-fade-in">
                                        <p className="text-sm text-gray-600 mb-4">Escaneie o QR Code ou copie a chave Pix para pagar.</p>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-48 h-48 mx-auto flex items-center justify-center bg-gray-50 mb-4">
                                            <QrCodeIcon className="h-32 w-32 text-gray-400" />
                                        </div>
                                        <button className="text-[#009EE3] font-semibold hover:underline text-sm">Copiar código Pix</button>
                                        <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
                                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                            Aguardando pagamento...
                                        </div>
                                    </div>
                                )}

                                {(paymentMethod === 'credit' || paymentMethod === 'debit') && (
                                    <div className="space-y-4 animate-fade-in">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Número do cartão</label>
                                            <input type="text" placeholder="0000 0000 0000 0000" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Validade</label>
                                                <input type="text" placeholder="MM/AA" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">CVV</label>
                                                <input type="text" placeholder="123" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Nome impresso no cartão</label>
                                            <input type="text" placeholder="Como no cartão" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setStep(1)}
                                    className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-300"
                                >
                                    Voltar
                                </button>
                                <button 
                                    onClick={handleConfirmPayment}
                                    disabled={isProcessingPayment}
                                    className={`flex-[2] bg-[#009EE3] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#008bc7] transition duration-300 flex justify-center items-center ${isProcessingPayment ? 'opacity-75 cursor-wait' : ''}`}
                                >
                                    {isProcessingPayment ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processando...
                                        </>
                                    ) : (
                                        'Pagar'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Success */}
                    {step === 3 && (
                        <div className="text-center py-8 animate-fade-in">
                            <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-green-100 mb-6">
                                <CheckCircleIcon className="h-16 w-16 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-green-900 mb-2">Reserva Confirmada!</h2>
                            <p className="text-gray-600 mb-8">O pagamento foi processado com sucesso e seu ponto já está reservado.</p>
                            
                            <div className="bg-gray-50 p-6 rounded-lg text-left mb-8 max-w-sm mx-auto border border-gray-200">
                                <h4 className="font-semibold text-green-900 border-b border-gray-200 pb-2 mb-3">Detalhes da Transação</h4>
                                <p className="text-sm text-gray-600 flex justify-between mb-2"><span>Código:</span> <span className="font-mono font-medium">{bookingId}</span></p>
                                <p className="text-sm text-gray-600 flex justify-between mb-2"><span>Data:</span> <span className="font-medium">{formatDate(new Date())}</span></p>
                                <p className="text-sm text-gray-600 flex justify-between"><span>Valor:</span> <span className="font-bold text-green-900">{selectedPlan && formatPrice(selectedPlan.price)}</span></p>
                            </div>

                            <button 
                                onClick={onClose}
                                className="bg-green-900 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-800 transition duration-300 shadow-lg"
                            >
                                Fechar e Voltar
                            </button>
                        </div>
                    )}

                </div>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.4s ease-out forwards;
                }
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
            `}</style>
        </div>
    );
};
