import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./CustomerList.css";
import logoBase64 from "./logoBase64";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showPassword, setShowPassword] = useState({});
  const [showHistory, setShowHistory] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
  const response = await axios.get("https://micelania-app.onrender.com/customers");
        const customerData = response.data;
        const initialShowPassword = customerData.reduce((acc, customer) => {
          acc[customer._id] = false;
          return acc;
        }, {});
        setShowPassword(initialShowPassword);
        setCustomers(customerData);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        setErrorMessage("Erro ao carregar a lista de clientes.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const toggleShowPassword = (id) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const toggleShowHistory = (id) => {
    setShowHistory((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString("pt-BR") : "Não definida";
  };

  // Filtragem por nome/CPF e por período de data de compra
  const filteredCustomers = customers.filter((customer) => {
    // Filtro por nome ou CPF
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.cpf.includes(searchTerm);

    // Filtro por período de data
    const purchaseDate = new Date(customer.purchaseDate);
    let matchesDate = true;

    if (startDate) {
      const start = new Date(startDate);
      matchesDate = matchesDate && purchaseDate >= start;
    }

    if (endDate) {
      const end = new Date(endDate);
      // Ajusta a data final para incluir o dia inteiro
      end.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && purchaseDate <= end;
    }

    return matchesSearch && matchesDate;
  });

  const getCustomerStatus = (customer) => {
    const today = new Date();
    const returnDate = new Date(customer.returnDate);
    
    if (customer.returnDate && returnDate > today) {
      return { status: 'active', label: 'Ativo' };
    } else if (customer.returnDate && returnDate <= today) {
      return { status: 'pending', label: 'Pendente' };
    }
    return { status: 'active', label: 'Ativo' };
  };

  const SkeletonCard = () => (
    <div className="skeleton-card">
      <div className="skeleton skeleton-header"></div>
      <div className="skeleton skeleton-line medium"></div>
      <div className="skeleton skeleton-line short"></div>
      <div className="skeleton skeleton-line long"></div>
      <div className="skeleton skeleton-line medium"></div>
    </div>
  );

  return (
    <div>
      <div className="app-container">
        <header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <img src={logoBase64} alt="Micelânea" className="logo" />
            <h1 style={{ margin: 0 }}>Lista de Clientes</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/customer-management" className="btn-primary action-btn">
            📋 Gerenciamento
          </Link>
          <button 
            onClick={handleLogout} 
            className="back-to-login-btn action-btn"
            style={{ width: 'auto', padding: '8px 16px', margin: '0' }}
          >
            🚪 Sair
          </button>
        </div>
      </header>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <div className="search-filters">
        <input
          type="text"
          placeholder="🔍 Pesquisar por nome ou CPF..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        
        <div className="date-filters">
          <div className="date-filter">
            <label htmlFor="startDate">📅 Data Inicial:</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
            />
          </div>
          
          <div className="date-filter">
            <label htmlFor="endDate">📅 Data Final:</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
            />
          </div>
        </div>
      </div>

      {filteredCustomers.length > 0 && (
        <div className="customer-count">
          <span className="count-badge">
            📊 {filteredCustomers.length} cliente(s) encontrado(s)
          </span>
          {customers.length !== filteredCustomers.length && (
            <span className="total-count">
              de {customers.length} total
            </span>
          )}
        </div>
      )}

      {loading ? (
        <div className="customers-grid">
          {[...Array(6)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="no-customers">
          <p>🔍 Nenhum cliente encontrado.</p>
          <p>Tente ajustar os filtros de pesquisa.</p>
        </div>
      ) : (
        <div className="customers-grid">
          {filteredCustomers.map((customer) => {
            const customerStatus = getCustomerStatus(customer);
            
            return (
              <div key={customer._id} className="customer-card">
                <div className="customer-header">
                  <h2 className="customer-name">{customer.name}</h2>
                  <span className={`customer-status status-${customerStatus.status}`}>
                    {customerStatus.label}
                  </span>
                </div>

                <div className="customer-info">
                  <div className="info-item">
                    <span className="info-label">📱 Telefone</span>
                    <span className="info-value">{customer.phone || 'Não informado'}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">🆔 CPF</span>
                    <span className="info-value cpf">{customer.cpf}</span>
                  </div>
                  
                  {customer.email && (
                    <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                      <span className="info-label">📧 Email</span>
                      <span className="info-value">{customer.email}</span>
                    </div>
                  )}
                </div>

                <div className="customer-dates">
                  <div className="date-item">
                    <div className="date-label">🛒 Compra</div>
                    <div className="date-value">{formatDate(customer.purchaseDate)}</div>
                  </div>
                  
                  <div className="date-item">
                    <div className="date-label">🔄 Devolução</div>
                    <div className="date-value">{formatDate(customer.returnDate)}</div>
                  </div>
                </div>

                {customer.password && (
                  <div className="password-section">
                    <span className="password-label">🔐 Senha do Cartão:</span>
                    <span className="password-value">
                      {showPassword[customer._id] ? customer.password : "••••••"}
                    </span>
                    <button 
                      onClick={() => toggleShowPassword(customer._id)}
                      className="toggle-password-btn"
                    >
                      {showPassword[customer._id] ? "👁️ Ocultar" : "👁️ Mostrar"}
                    </button>
                  </div>
                )}

                {customer.observation && (
                  <div className="customer-observation">
                    <div className="observation-label">📝 Observações</div>
                    <p className="observation-text">{customer.observation}</p>
                  </div>
                )}

                <div className="signature-section">
                  <div className="observation-label">✍️ Assinatura</div>
                  <div className="signature-container">
                    {customer.signature ? (
                      <img
                        src={customer.signature}
                        alt={`Assinatura de ${customer.name}`}
                        className="signature-image"
                      />
                    ) : (
                      <div className="signature-placeholder">
                        Assinatura não disponível
                      </div>
                    )}
                  </div>
                </div>

                <div className="customer-actions">
                  <button 
                    onClick={() => toggleShowHistory(customer._id)}
                    className="action-btn btn-secondary"
                  >
                    {showHistory[customer._id] ? "📈 Ocultar Histórico" : "📈 Ver Histórico"}
                  </button>
                  
                  <Link 
                    to={`/customers/update/${customer._id}`}
                    className="action-btn btn-success"
                  >
                    ✏️ Atualizar
                  </Link>
                </div>

                {showHistory[customer._id] && (
                  <div className="history-section">
                    <div className="history-title">
                      📊 Histórico de Compras
                    </div>
                    {customer.purchaseHistory && customer.purchaseHistory.length > 0 ? (
                      <div>
                        {customer.purchaseHistory.map((history, index) => (
                          <div key={index} className="history-item">
                            <div className="customer-info">
                              <div className="info-item">
                                <span className="info-label">🛒 Compra</span>
                                <span className="info-value">{formatDate(history.purchaseDate)}</span>
                              </div>
                              
                              <div className="info-item">
                                <span className="info-label">🔄 Devolução</span>
                                <span className="info-value">{formatDate(history.returnDate)}</span>
                              </div>
                            </div>
                            
                            {history.observation && (
                              <div className="customer-observation">
                                <div className="observation-label">📝 Observações</div>
                                <p className="observation-text">{history.observation}</p>
                              </div>
                            )}
                            
                            {history.signature && (
                              <div className="signature-section">
                                <div className="observation-label">✍️ Assinatura</div>
                                <div className="signature-container">
                                  <img
                                    src={history.signature}
                                    alt={`Assinatura histórica de ${customer.name}`}
                                    className="signature-image"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="signature-placeholder">Sem histórico disponível.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          className="scroll-to-top"
          aria-label="Voltar ao topo"
        >
          ⬆️
        </button>
      )}
    </div>
    
    </div>
  );
};

export default CustomerList;