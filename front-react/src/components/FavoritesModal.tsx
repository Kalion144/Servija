import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  listFavoriteUsers,
  listFavoriteServices,
  toggleFavoriteUser,
  toggleFavoriteService,
} from '../services/api';
import { getUserCity } from '../lib/userLocation';
import CitySearchBar from './CitySearchBar';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'CLIENTE' | 'PROFISSIONAL';
  onFavoritesUpdated?: () => void;
}

function getProfLocation(
  profile?: { localizacao?: string | null; cidade?: string | null } | null,
  user?: { cidade?: string | null; estado?: string | null } | null,
): string {
  if (profile?.localizacao) return profile.localizacao;
  if (profile?.cidade && user?.estado) return `${profile.cidade} - ${user.estado}`;
  if (profile?.cidade) return profile.cidade;
  if (user?.cidade && user?.estado) return `${user.cidade} - ${user.estado}`;
  if (user?.cidade) return user.cidade;
  return 'Local não informado';
}

export default function FavoritesModal({
  isOpen,
  onClose,
  userType,
  onFavoritesUpdated,
}: FavoritesModalProps) {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const isProfessional = userType === 'PROFISSIONAL';
  const accent = isProfessional ? '#f97316' : '#2563eb';

  const [favoriteUsers, setFavoriteUsers] = useState<any[]>([]);
  const [favoriteServices, setFavoriteServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'services' | 'users'>('services');
  const [cidadeInput, setCidadeInput] = useState('');
  const [cidadeFiltro, setCidadeFiltro] = useState('');

  const minhaCidade = getUserCity(usuario);

  const loadFavorites = async (search?: string) => {
    setLoading(true);
    try {
      const params = { search, limit: '50' };
      if (isProfessional) {
        const [usersData, servicesData] = await Promise.all([
          listFavoriteUsers(true, params),
          listFavoriteServices(true, params),
        ]);
        setFavoriteUsers(usersData.data || []);
        setFavoriteServices(servicesData.data || []);
      } else {
        const data = await listFavoriteUsers(false, params);
        setFavoriteUsers(data.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCidadeInput('');
      setCidadeFiltro('');
      setActiveTab('services');
      loadFavorites();
    }
  }, [isOpen, userType]);

  const handleBuscarCidade = () => {
    const filtro = cidadeInput.trim();
    setCidadeFiltro(filtro);
    loadFavorites(filtro || undefined);
  };

  const handleLimparCidade = () => {
    setCidadeInput('');
    setCidadeFiltro('');
    loadFavorites();
  };

  const handleUsarMinhaCidade = () => {
    if (!minhaCidade) return;
    setCidadeInput(minhaCidade);
    setCidadeFiltro(minhaCidade);
    loadFavorites(minhaCidade);
  };

  const notifyUpdate = () => {
    onFavoritesUpdated?.();
  };

  const handleRemoveUser = async (id: number) => {
    try {
      await toggleFavoriteUser(id, isProfessional);
      setFavoriteUsers((prev) =>
        prev.filter((fav) => fav.favorite_user_id !== id),
      );
      notifyUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveService = async (id: number) => {
    try {
      await toggleFavoriteService(id, isProfessional);
      setFavoriteServices((prev) =>
        prev.filter((fav) => fav.favorite_service_id !== id),
      );
      notifyUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  const handleServiceClick = (fav: any) => {
    const service = fav.service;
    if (!service?.id) return;
    onClose();
    navigate(`/professional/service-details/${service.id}`, {
      state: {
        servico: {
          ...service,
          cliente_nome: fav.cliente_nome,
          cliente_cidade: fav.cliente_cidade,
        },
      },
    });
  };

  if (!isOpen) return null;

  const title = isProfessional ? 'Meus Favoritos' : 'Profissionais Favoritos';

  return (
    <div className="favorites-modal-overlay" onClick={onClose}>
      <div
        className="favorites-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="favorites-modal-header"
          style={{
            background: isProfessional
              ? 'linear-gradient(135deg, #f97316, #ea580c)'
              : 'linear-gradient(135deg, #3b82f6, #2563eb)',
          }}
        >
          <h3>
            <i className="fas fa-heart"></i> {title}
          </h3>
          <button type="button" className="favorites-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="favorites-modal-body">
          <CitySearchBar
            value={cidadeInput}
            onChange={setCidadeInput}
            onSearch={handleBuscarCidade}
            onClear={handleLimparCidade}
            onUseMyCity={minhaCidade ? handleUsarMinhaCidade : undefined}
            myCityLabel={minhaCidade ? `Minha cidade (${minhaCidade})` : undefined}
            accentColor={accent}
            placeholder="Filtrar por cidade..."
          />

          {cidadeFiltro && (
            <p className="city-filter-active">
              Filtrando por: <strong>{cidadeFiltro}</strong>
            </p>
          )}

          {isProfessional && (
            <div className="favorites-modal-tabs">
              <button
                type="button"
                className={`favorites-tab ${activeTab === 'services' ? 'active' : ''}`}
                style={
                  activeTab === 'services'
                    ? { color: accent, borderColor: accent }
                    : undefined
                }
                onClick={() => setActiveTab('services')}
              >
                <i className="fas fa-tools"></i> Serviços ({favoriteServices.length})
              </button>
              <button
                type="button"
                className={`favorites-tab ${activeTab === 'users' ? 'active' : ''}`}
                style={
                  activeTab === 'users'
                    ? { color: accent, borderColor: accent }
                    : undefined
                }
                onClick={() => setActiveTab('users')}
              >
                <i className="fas fa-users"></i> Clientes ({favoriteUsers.length})
              </button>
            </div>
          )}

          {loading ? (
            <div className="favorites-modal-loading">
              <i className="fas fa-spinner fa-spin"></i> Carregando...
            </div>
          ) : isProfessional ? (
            activeTab === 'services' ? (
              favoriteServices.length > 0 ? (
                <div className="favorites-modal-grid">
                  {favoriteServices.map((fav) => {
                    const service = fav.service;
                    const desc = service?.descricao;
                    return (
                      <div
                        key={fav.id}
                        className="favorites-card favorites-card-clickable"
                        onClick={() => handleServiceClick(fav)}
                      >
                        <div className="favorites-card-header">
                          <div className="favorites-card-info">
                            <div
                              className="favorites-avatar"
                              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                            >
                              <i className="fas fa-wrench"></i>
                            </div>
                            <div>
                              <div className="favorites-card-title">{service?.titulo}</div>
                              <div className="favorites-card-subtitle">{fav.cliente_nome}</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="favorites-remove-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveService(service.id);
                            }}
                            title="Remover dos favoritos"
                          >
                            <i className="fas fa-heart-broken"></i>
                          </button>
                        </div>
                        <p className="favorites-card-desc">
                          {desc
                            ? desc.length > 100
                              ? `${desc.substring(0, 100)}...`
                              : desc
                            : 'Sem descrição.'}
                        </p>
                        <div className="favorites-card-meta">
                          <span>
                            <i className="fas fa-map-marker-alt"></i>{' '}
                            {service?.localizacao || fav.cliente_cidade || 'Não informado'}
                          </span>
                          {service?.urgente === 1 && (
                            <span className="favorites-urgent">
                              <i className="fas fa-bolt"></i> Urgente
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="favorites-empty">
                  <i className="far fa-heart"></i>
                  <h4>Nenhum serviço favorito</h4>
                  <p>Os serviços que você favoritar aparecerão aqui.</p>
                </div>
              )
            ) : favoriteUsers.length > 0 ? (
              <div className="favorites-modal-grid">
                {favoriteUsers.map((fav) => {
                  const client = fav.favoriteUser;
                  return (
                    <div key={fav.id} className="favorites-card">
                      <div className="favorites-card-header">
                        <div className="favorites-card-info">
                          <div
                            className="favorites-avatar"
                            style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
                          >
                            {client?.nome?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="favorites-card-title">{client?.nome}</div>
                            <div className="favorites-card-subtitle">
                              <i className="fas fa-map-marker-alt"></i>{' '}
                              {getProfLocation(null, client)}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="favorites-remove-btn"
                          onClick={() => handleRemoveUser(client.id)}
                          title="Remover dos favoritos"
                        >
                          <i className="fas fa-heart-broken"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="favorites-empty">
                <i className="far fa-heart"></i>
                <h4>Nenhum cliente favorito</h4>
                <p>Os clientes que você favoritar aparecerão aqui.</p>
              </div>
            )
          ) : favoriteUsers.length > 0 ? (
            <div className="favorites-modal-grid">
              {favoriteUsers.map((fav) => {
                const prof = fav.favoriteUser;
                const details = fav.professionalProfile;
                return (
                  <div key={fav.id} className="favorites-card">
                    <div className="favorites-card-header">
                      <div className="favorites-card-info">
                        <div
                          className="favorites-avatar"
                          style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
                        >
                          {prof?.nome?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="favorites-card-title">{prof?.nome}</div>
                          <div className="favorites-card-subtitle" style={{ color: accent }}>
                            {details?.profissao || 'Profissional'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="favorites-remove-btn"
                        onClick={() => handleRemoveUser(prof.id)}
                        title="Remover dos favoritos"
                      >
                        <i className="fas fa-heart-broken"></i>
                      </button>
                    </div>
                    <p className="favorites-card-desc">
                      {details?.bio || details?.descricao || prof?.bio || 'Sem descrição.'}
                    </p>
                    <div className="favorites-card-meta">
                      <span>
                        <i className="fas fa-map-marker-alt"></i>{' '}
                        {getProfLocation(details, prof)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="favorites-empty">
              <i className="far fa-heart"></i>
              <h4>Nenhum favorito ainda</h4>
              <p>Os profissionais que você favoritar aparecerão aqui.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
