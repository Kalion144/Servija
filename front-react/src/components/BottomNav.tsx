import { useNavigate } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

interface BottomNavProps {
  active?: string;
  onNavigate?: (id: string) => void;
  userType?: 'CLIENTE' | 'PROFISSIONAL';
}

export function BottomNav({ active, onNavigate, userType }: BottomNavProps) {
  const navigate = useNavigate();

  const clienteItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: 'fa-home', path: '/home-cli' },
    {
      id: 'servicos',
      label: 'Serviços',
      icon: 'fa-clipboard-list',
      path: '/servicos-cli',
    },
    {
      id: 'propostas',
      label: 'Propostas',
      icon: 'fa-file-signature',
      path: '/propostas-cli',
    },
    { id: 'perfil', label: 'Perfil', icon: 'fa-user', path: '/perfil-cli' },
  ];

  const profissionalItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: 'fa-home', path: '/home-sev' },
    {
      id: 'propostas',
      label: 'Propostas',
      icon: 'fa-file-signature',
      path: '/todas-propostas-sev',
    },
    { id: 'perfil', label: 'Perfil', icon: 'fa-user', path: '/perfil-sev' },
  ];

  const items = userType === 'PROFISSIONAL' ? profissionalItems : clienteItems;

  const handleClick = (item: NavItem) => {
    if (onNavigate) onNavigate(item.id);
    navigate(item.path);
  };
  return (
    <div className="bottom-nav">
      {items.map((item) => (
        <div
          key={item.id}
          className={`nav-item ${active === item.id ? 'active' : ''}`}
          onClick={() => handleClick(item)}
        >
          <i className={`fas ${item.icon}`}></i>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
