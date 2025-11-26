
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PointCard } from './components/PointCard';
import { PointDetailsModal } from './components/PointDetailsModal';
import { LoginRegisterModal } from './components/LoginRegisterModal';
import { PartnerRegistrationView } from './components/PartnerRegistrationView';
import { CatalogView } from './components/CatalogView';
import { BookingModal } from './components/BookingModal';
import { MyReservationsView } from './components/MyReservationsView';
import { AdminDashboard } from './components/AdminDashboard';
import { PartnerDashboard } from './components/PartnerDashboard';
import { RegistrationSuccessView } from './components/RegistrationSuccessView';
import { CATALOG_POINTS } from './constants';
import type { Point, Booking, User, PartnerRequest } from './types';
import { ChartBarIcon, HandshakeIcon, LocationPinIcon } from './components/icons';

// Chaves para "Banco de Dados" Local
const DB_KEYS = {
    USERS: 'pm_users_v1',
    POINTS: 'pm_points_v1',
    BOOKINGS: 'pm_bookings_v1',
    REQUESTS: 'pm_requests_v1'
};

export default function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState('');
  
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [bookingPoint, setBookingPoint] = useState<Point | null>(null);
  const [pendingBookingPoint, setPendingBookingPoint] = useState<Point | null>(null);
  
  // Auth States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  // Navigation State
  const [view, setView] = useState<'home' | 'catalog' | 'reservations' | 'partner-register' | 'admin' | 'partner-dashboard' | 'registration-success'>('home');
  
  // --- DATA INITIALIZATION (DATABASE SIMULATION) ---

  // 1. Users
  const [users, setUsers] = useState<User[]>(() => {
      const saved = localStorage.getItem(DB_KEYS.USERS);
      if (saved) return JSON.parse(saved);
      return [
          { id: 'adm', name: 'Administrador', email: 'admin@pontomais.com', phone: '', role: 'admin', joinDate: new Date('2023-01-01') }
      ];
  });

  // 2. Points
  const [activePoints, setActivePoints] = useState<Point[]>(() => {
      const saved = localStorage.getItem(DB_KEYS.POINTS);
      if (saved) {
          const parsed = JSON.parse(saved);
          // Basic migration to ensure images array exists if old data is present
          return parsed.map((p: any) => ({
              ...p,
              images: p.images || (p.image ? [p.image] : [])
          }));
      }
      return CATALOG_POINTS;
  });

  // 3. Bookings
  const [bookings, setBookings] = useState<Booking[]>(() => {
      const saved = localStorage.getItem(DB_KEYS.BOOKINGS);
      if (saved) {
          return JSON.parse(saved).map((b: any) => ({
              ...b,
              startDate: new Date(b.startDate),
              endDate: new Date(b.endDate),
              purchaseDate: new Date(b.purchaseDate),
              // Ensure embedded point object also has images array
              point: { ...b.point, images: b.point.images || (b.point.image ? [b.point.image] : []) }
          }));
      }
      return [];
  });

  // 4. Partner Requests
  const [partnerRequests, setPartnerRequests] = useState<PartnerRequest[]>(() => {
      const saved = localStorage.getItem(DB_KEYS.REQUESTS);
      if (saved) {
          return JSON.parse(saved).map((r: any) => ({
              ...r,
              requestDate: new Date(r.requestDate),
              images: r.images || (r.image ? [r.image] : [])
          }));
      }
      return [];
  });

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem(DB_KEYS.POINTS, JSON.stringify(activePoints)), [activePoints]);
  useEffect(() => localStorage.setItem(DB_KEYS.BOOKINGS, JSON.stringify(bookings)), [bookings]);
  useEffect(() => localStorage.setItem(DB_KEYS.REQUESTS, JSON.stringify(partnerRequests)), [partnerRequests]);

  // Check if current user has registered points
  const hasRegisteredPoints = isLoggedIn && partnerRequests.some(req => req.email === currentUserEmail);

  // --- Handlers ---

  const handleLoginSuccess = (email: string, name?: string, phone?: string, profileType?: any, isRegistering: boolean = false) => {
    setAuthError('');
    const normalizedEmail = email.trim().toLowerCase();
    
    if (isRegistering) {
        const userExists = users.find(u => u.email === normalizedEmail);
        if (userExists) {
            setAuthError("Este email já está cadastrado. Por favor, faça login.");
            return;
        }

        const newUser: User = {
            id: `u${Date.now()}`,
            name: name || 'Usuário',
            email: normalizedEmail,
            phone: phone || '',
            role: 'user',
            profileType: profileType || 'corretor_autonomo',
            joinDate: new Date()
        };

        setUsers(prev => [...prev, newUser]);
    } else {
        const existingUser = users.find(u => u.email === normalizedEmail);
        if (!existingUser) {
            setAuthError("Você ainda não possui cadastro. É necessário criar uma conta para acessar o sistema.");
            return;
        }
        profileType = existingUser.profileType;
    }

    setIsLoggedIn(true);
    setCurrentUserEmail(normalizedEmail);
    setShowAuthModal(false);
    setAuthError('');

    if (normalizedEmail === 'admin@pontomais.com') {
        setIsAdmin(true);
        setView('admin');
        return;
    } 

    setIsAdmin(false);
    
    if (pendingBookingPoint) {
        setBookingPoint(pendingBookingPoint);
        setPendingBookingPoint(null);
        return;
    }

    if (profileType === 'estabelecimento') {
        const hasPoints = partnerRequests.some(req => req.email === normalizedEmail);
        if (hasPoints) {
            setView('partner-dashboard');
        } else {
            setView('partner-register');
            window.scrollTo(0, 0);
        }
        return;
    }

    if (isRegistering && ['corretor_autonomo', 'imobiliaria', 'construtora'].includes(profileType)) {
        setView('registration-success');
        window.scrollTo(0, 0);
        return;
    }

    if (['corretor_autonomo', 'imobiliaria', 'construtora'].includes(profileType)) {
        setView('catalog');
        window.scrollTo(0, 0);
        return;
    }
    
    setView('home');
  };

  const handleLogout = () => {
      setIsLoggedIn(false);
      setIsAdmin(false);
      setCurrentUserEmail('');
      setView('home');
      window.scrollTo(0, 0);
  };

  const handlePartnerRegistrationSuccess = (data: any) => {
      const newRequest: PartnerRequest = {
          id: `pr${Date.now()}`,
          ...data,
          // Ensure images is always an array
          images: data.images || [],
          status: 'pending',
          requestDate: new Date()
      };
      setPartnerRequests(prev => [...prev, newRequest]);
  };

  const handleUpdatePartnerRequest = (updatedRequest: PartnerRequest) => {
      setPartnerRequests(prev => prev.map(req => req.id === updatedRequest.id ? updatedRequest : req));
      
      if (updatedRequest.status === 'approved') {
          setActivePoints(prev => prev.map(p => {
              if (p.title === updatedRequest.establishmentName) {
                  return {
                      ...p,
                      title: updatedRequest.establishmentName,
                      location: updatedRequest.address,
                      city: updatedRequest.city,
                      description: updatedRequest.description,
                      features: updatedRequest.features,
                      // Update images from request
                      images: updatedRequest.images && updatedRequest.images.length > 0 ? updatedRequest.images : p.images,
                      rentalOptions: [
                          { period: 'Quinzenal', price: updatedRequest.prices.quinzenal },
                          { period: 'Mensal', price: updatedRequest.prices.mensal },
                          { period: 'Trimestral', price: updatedRequest.prices.trimestral },
                      ]
                  };
              }
              return p;
          }));
      }
  };

  // --- ADMIN HANDLERS (POINTS) ---

  const handleUpdatePoint = (updatedPoint: Point) => {
      setActivePoints(prev => {
          const newPoints = prev.map(p => p.id === updatedPoint.id ? updatedPoint : p);
          localStorage.setItem(DB_KEYS.POINTS, JSON.stringify(newPoints));
          return newPoints;
      });
  };

  const handleDeletePoint = (pointId: number) => {
      // A função "Excluir" na verdade "Oculta" (Soft Delete)
      // Removemos o window.confirm daqui, pois o modal agora está no AdminDashboard
      setActivePoints(prevPoints => {
          const updatedPoints = prevPoints.map(p => {
            if (Number(p.id) === Number(pointId)) {
                return { ...p, isHidden: true }; // Marca como oculto
            }
            return p;
          });
          
          localStorage.setItem(DB_KEYS.POINTS, JSON.stringify(updatedPoints));
          return updatedPoints;
      });
  };

  // --- ADMIN HANDLERS (USERS) ---
  
  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => {
        const newUsers = prev.map(u => u.id === updatedUser.id ? updatedUser : u);
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify(newUsers));
        return newUsers;
    });
  };

  const handleDeleteUser = (userId: string) => {
     if (window.confirm("Tem certeza que deseja excluir este usuário permanentemente?")) {
         setUsers(prev => {
             const newUsers = prev.filter(u => u.id !== userId);
             localStorage.setItem(DB_KEYS.USERS, JSON.stringify(newUsers));
             return newUsers;
         });
     }
  };

  const handleApprovePartner = (id: string) => {
      setPartnerRequests(prev => {
          const requestToApprove = prev.find(p => p.id === id);
          
          if (requestToApprove) {
              // 1. Create the new Point object
              const newPoint: Point = {
                  id: Date.now(),
                  title: requestToApprove.establishmentName,
                  location: requestToApprove.address,
                  neighborhood: requestToApprove.address.split(',')[1]?.trim() || 'Centro', 
                  city: requestToApprove.city,
                  category: 'Comércio',
                  // Use uploaded images explicitly
                  images: requestToApprove.images && requestToApprove.images.length > 0 
                    ? requestToApprove.images 
                    : ['https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1200&auto=format&fit=crop'], 
                  footTraffic: 'Médio', 
                  description: requestToApprove.description,
                  features: requestToApprove.features,
                  rentalOptions: [
                      { period: 'Quinzenal', price: requestToApprove.prices.quinzenal },
                      { period: 'Mensal', price: requestToApprove.prices.mensal },
                      { period: 'Trimestral', price: requestToApprove.prices.trimestral },
                  ],
                  isHidden: false
              };

              // Add to active points immediately (persisted via useEffect)
              setActivePoints(currentPoints => {
                  const updated = [newPoint, ...currentPoints];
                  localStorage.setItem(DB_KEYS.POINTS, JSON.stringify(updated));
                  return updated;
              });
          }

          return prev.map(p => p.id === id ? { ...p, status: 'approved' } : p);
      });
  };

  const handleRejectPartner = (id: string) => {
      setPartnerRequests(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
  };

  const handleShowCatalog = () => {
    if (isLoggedIn) {
        setView('catalog');
        window.scrollTo(0, 0);
    } else {
        setAuthInitialTab('login');
        setShowAuthModal(true);
        setAuthError('');
    }
  };

  const handleShowReservations = () => {
    if (isLoggedIn) {
        setView('reservations');
    }
  }

  const handleStartBooking = (point: Point) => {
    setSelectedPoint(null); 
    if (isLoggedIn) {
      setBookingPoint(point);
    } else {
      setPendingBookingPoint(point);
      setAuthInitialTab('login');
      setShowAuthModal(true);
      setAuthError('');
    }
  };
  
  const handleBookingComplete = (newBooking: Booking) => {
      const bookingWithUser = { ...newBooking, userEmail: currentUserEmail };
      setBookings(prev => [bookingWithUser, ...prev]);
  };

  const handleOpenLogin = () => {
      setAuthInitialTab('login');
      setShowAuthModal(true);
      setAuthError('');
  };

  const handleOpenPartnerRegister = () => {
      if (isLoggedIn) {
           const currentUser = users.find(u => u.email === currentUserEmail);
           if (currentUser?.profileType === 'estabelecimento') {
               setView('partner-register');
               window.scrollTo(0, 0);
           } else {
               setView('partner-register');
               window.scrollTo(0, 0);
           }
      } else {
          setAuthInitialTab('register');
          setShowAuthModal(true);
          setAuthError('');
      }
  };

  const handleFooterNavigation = (sectionId: string) => {
      setView('home');
      setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
          }
      }, 100);
  };

  const renderView = () => {
      if (view === 'admin') return (
        <AdminDashboard 
            bookings={bookings} 
            users={users}
            partnerRequests={partnerRequests}
            points={activePoints} // Admin vê todos (incluindo ocultos)
            onApprovePartner={handleApprovePartner}
            onRejectPartner={handleRejectPartner}
            onUpdatePoint={handleUpdatePoint}
            onDeletePoint={handleDeletePoint}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onLogout={handleLogout}
        />
      );
      
      // Apenas pontos não ocultos no catálogo público
      if (view === 'catalog') return <CatalogView points={activePoints.filter(p => !p.isHidden)} onSelectPoint={setSelectedPoint} />;
      if (view === 'reservations') return <MyReservationsView bookings={bookings} onShowCatalog={handleShowCatalog} />;
      if (view === 'registration-success') return <RegistrationSuccessView onGoToCatalog={handleShowCatalog} />;
      
      if (view === 'partner-register') {
        const currentUser = users.find(u => u.email === currentUserEmail);
        return (
            <PartnerRegistrationView 
                onCancel={() => { setView('partner-dashboard'); }} 
                onSuccess={handlePartnerRegistrationSuccess}
                initialData={{
                    name: currentUser?.name || '',
                    email: currentUserEmail,
                    phone: currentUser?.phone || ''
                }}
            />
        );
      }

      if (view === 'partner-dashboard') return (
        <PartnerDashboard 
            partnerRequests={partnerRequests} 
            bookings={bookings} 
            userEmail={currentUserEmail} 
            onBackHome={() => setView('home')} 
            onUpdatePartnerRequest={handleUpdatePartnerRequest}
        />
      );

      return (
        <main>
            {/* Hero Section */}
            <section className="relative bg-green-900 text-white py-20 md:py-32">
            <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1600&auto=format&fit=crop)' }}></div>
            <div className="container mx-auto px-6 lg:px-8 text-center relative">
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                O <span className="text-yellow-400">Ponto</span> Certo para seu Sucesso Imobiliário.
                </h1>
                <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-green-200">
                Conectamos imobiliárias aos melhores pontos comerciais, transformando espaços ociosos em oportunidades de negócio.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={handleShowCatalog} className="bg-yellow-400 text-green-900 font-bold py-4 px-8 rounded-lg text-lg hover:bg-yellow-500 transition duration-300 transform hover:scale-105 shadow-lg">
                    Ver Pontos Disponíveis
                </button>
                <button onClick={handleOpenPartnerRegister} className="bg-transparent border-2 border-yellow-400 text-yellow-400 font-bold py-4 px-8 rounded-lg text-lg hover:bg-yellow-400 hover:text-green-900 transition duration-300 transform hover:scale-105">
                    Cadastrar meu Espaço
                </button>
                </div>
            </div>
            </section>

            {/* Catalog Section - Apenas pontos visíveis */}
            <section id="catalogo" className="py-20 bg-white">
            <div className="container mx-auto px-6 lg:px-8">
                <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-green-900">Destaques do Catálogo</h2>
                <p className="mt-4 text-lg text-gray-600">Encontre o local ideal para sua equipe de vendas.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6 justify-center">
                {activePoints.filter(p => !p.isHidden).slice(0, 3).map(point => (
                    <div key={point.id} className="max-w-xs mx-auto w-full">
                        <PointCard point={point} onSelectPoint={setSelectedPoint} />
                    </div>
                ))}
                </div>
                <div className="text-center mt-16">
                    <button 
                        onClick={handleShowCatalog}
                        className="bg-yellow-400 text-green-900 font-bold py-4 px-8 rounded-lg text-lg hover:bg-yellow-500 transition duration-300 transform hover:scale-105">
                        Ver catálogo completo
                    </button>
                </div>
            </div>
            </section>

            {/* Advantages Section */}
            <section id="vantagens" className="py-20 bg-gray-50">
            <div className="container mx-auto px-6 lg:px-8">
                <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-green-900">Por que escolher o Ponto Mais +?</h2>
                <p className="mt-4 text-lg text-gray-600">Vantagens que impulsionam seus resultados.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-10">
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group">
                    <div className="flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-green-100 to-green-200 mx-auto mb-6 shadow-inner group-hover:scale-110 transition-transform">
                    <LocationPinIcon className="h-12 w-12 text-green-900" />
                    </div>
                    <h3 className="text-xl font-bold text-green-900 mb-3">Localização Estratégica</h3>
                    <p className="text-gray-600 leading-relaxed">Estamos nos melhores pontos, com alto fluxo de pessoas, garantindo máxima visibilidade para sua imobiliária.</p>
                </div>
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group">
                    <div className="flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-green-100 to-green-200 mx-auto mb-6 shadow-inner group-hover:scale-110 transition-transform">
                    <HandshakeIcon className="h-12 w-12 text-green-900" />
                    </div>
                    <h3 className="text-xl font-bold text-green-900 mb-3">Parceria Ganha-Ganha</h3>
                    <p className="text-gray-600 leading-relaxed">Proprietários geram renda extra com espaços ociosos, enquanto imobiliárias expandem sua presença de forma flexível e econômica.</p>
                </div>
                <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group">
                    <div className="flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-green-100 to-green-200 mx-auto mb-6 shadow-inner group-hover:scale-110 transition-transform">
                    <ChartBarIcon className="h-12 w-12 text-green-900" />
                    </div>
                    <h3 className="text-xl font-bold text-green-900 mb-3">Crescimento Acelerado</h3>
                    <p className="text-gray-600 leading-relaxed">Aproveite o aquecimento do mercado imobiliário em todo o território nacional para fechar mais negócios e crescer.</p>
                </div>
                </div>
            </div>
            </section>

            {/* Mission/Vision Section */}
            <section id="missao" className="py-20 bg-white">
            <div className="container mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
                <div>
                <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop" alt="Mercado Imobiliário" className="rounded-2xl shadow-2xl transform hover:scale-105 transition duration-500 w-full h-[500px] object-cover"/>
                </div>
                <div className="text-left">
                <h3 className="text-yellow-500 font-semibold tracking-wider uppercase text-sm">Nossa Missão</h3>
                <h2 className="text-3xl md:text-4xl font-bold text-green-900 mt-2 leading-tight">Conectar para Crescer</h2>
                <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                    Nossa missão é ser a ponte que conecta imobiliárias a pontos comerciais estratégicos. Transformamos espaços ociosos em oportunidades, impulsionando negócios e gerando crescimento mútuo.
                </p>
                <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                    Em um mercado nacional aquecido, criamos um ecossistema onde todos ganham: corretores, comerciantes e clientes, promovendo inovação e facilidade no acesso a serviços imobiliários.
                </p>
                </div>
            </div>
            </section>

        </main>
      );
  }

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
      {view !== 'admin' && (
          <Header 
            onShowHome={() => setView('home')}
            onShowCatalog={handleShowCatalog}
            onShowRegister={handleOpenPartnerRegister}
            onShowReservations={handleShowReservations}
            onShowLogin={handleOpenLogin}
            onShowAdmin={() => setView('admin')}
            onShowPartnerDashboard={() => setView('partner-dashboard')}
            onLogout={handleLogout}
            isLoggedIn={isLoggedIn}
            isAdmin={isAdmin}
            hasRegisteredPoints={hasRegisteredPoints}
          />
      )}
      
      {showAuthModal && (
        <LoginRegisterModal 
            onClose={() => setShowAuthModal(false)} 
            onSuccess={handleLoginSuccess} 
            initialTab={authInitialTab}
            error={authError}
            onClearError={() => setAuthError('')}
        />
      )}

      {selectedPoint && <PointDetailsModal point={selectedPoint} onClose={() => setSelectedPoint(null)} onReserve={handleStartBooking} />}
      
      {bookingPoint && (
        <BookingModal 
            point={bookingPoint} 
            existingBookings={bookings}
            onClose={() => setBookingPoint(null)} 
            onBookingComplete={handleBookingComplete} 
        />
      )}

      {renderView()}

      {view !== 'admin' && <Footer onNavigate={handleFooterNavigation} />}
    </div>
  );
}