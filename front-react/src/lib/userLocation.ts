import { User } from './types';

export function getUserLocation(usuario: User | null | undefined): string {
  if (!usuario) return 'Localização não informada';

  if (usuario.tipo === 'PROFISSIONAL') {
    const perfil = usuario.perfilProfissional;
    if (perfil?.localizacao) return perfil.localizacao;
    if (perfil?.cidade && usuario.estado) return `${perfil.cidade} - ${usuario.estado}`;
    if (perfil?.cidade) return perfil.cidade;
  }

  if (usuario.cidade && usuario.estado) return `${usuario.cidade} - ${usuario.estado}`;
  if (usuario.cidade) return usuario.cidade;
  if (usuario.estado) return usuario.estado;

  return 'Localização não informada';
}

export function getUserCity(usuario: User | null | undefined): string | null {
  if (!usuario) return null;
  if (usuario.cidade) return usuario.cidade;
  if (usuario.tipo === 'PROFISSIONAL' && usuario.perfilProfissional?.cidade) {
    return usuario.perfilProfissional.cidade;
  }
  return null;
}
