import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Toast } from '../../components/Toast';
import { UploadedFile, ToastState } from '../../lib/types';
import { criarProposta } from '../../services/api';

interface FormData {
  titulo: string;
  descricao: string;
  categoria: string;
  preco: number;
  urgente: boolean;
  contato: string;
  localizacao: string;
}

const PostService: React.FC = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descricao: '',
    categoria: '',
    preco: 0,
    urgente: false,
    contato: '',
    localizacao: '',
  });

  const [fotos, setFotos] = useState<UploadedFile[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categorias: string[] = [
    'Elétrica',
    'Hidráulica',
    'Pintura',
    'Limpeza',
    'Construção',
    'Outros',
  ];

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const base64 = await fileToBase64(file);
      setFotos((prev) => [...prev, { base64, name: file.name }]);
    }
  };

  const removerFoto = (index: number) => {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  };

  const validarFormulario = (): boolean => {
    if (!formData.titulo.trim()) {
      mostrarToast('Informe o título', true);
      return false;
    }
    if (!formData.descricao.trim()) {
      mostrarToast('Informe a descrição', true);
      return false;
    }
    if (!formData.categoria) {
      mostrarToast('Selecione uma categoria', true);
      return false;
    }
    if (!formData.preco || isNaN(Number(formData.preco))) {
      mostrarToast('Informe um valor válido', true);
      return false;
    }
    if (!formData.contato.trim()) {
      mostrarToast('Informe um contato', true);
      return false;
    }
    if (!formData.localizacao.trim()) {
      mostrarToast('Informe sua localização', true);
      return false;
    }
    return true;
  };

  const mostrarToast = (msg: string, isError: boolean = false) => {
    setToast({ message: msg, isError });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validarFormulario()) {
      try {
        const dadosServico = {
          titulo: formData.titulo,
          descricao: formData.descricao,
          categoria: formData.categoria,
          preco: formData.preco,
          urgente: formData.urgente,
          contato: formData.contato,
          localizacao: formData.localizacao,
          fotos: fotos.map((f) => f.base64),
        };
        await criarProposta(dadosServico);
        mostrarToast('✅ Serviço publicado com sucesso!');
        setTimeout(() => navigate('/client/services'), 1500);
      } catch (error) {
        console.error(error);
        mostrarToast('Erro ao publicar serviço', true);
      }
    }
  };

  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #f5f7fb; color: #1e293b; padding: 20px; min-height: 100vh; }
    .publish-container { max-width: 900px; margin: auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
    .form-header { background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 35px; }
    .form-header h1 { font-size: 28px; display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .subhead { opacity: 0.95; font-size: 15px; }
    .form-content { padding: 30px; }
    .field-group { margin-bottom: 25px; }
    .field-label { font-weight: 600; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
    .required-star { color: #dc2626; }
    input, textarea { width: 100%; padding: 14px; border: 1px solid #dbe2ea; border-radius: 12px; font-size: 15px; transition: 0.3s; background: #fff; }
    input:focus, textarea:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 4px rgba(249,115,22,0.15); }
    textarea { min-height: 140px; resize: vertical; }
    .hint-text { margin-top: 8px; font-size: 13px; color: #64748b; }
    .upload-area { border: 2px dashed #cbd5e1; border-radius: 14px; padding: 35px; text-align: center; cursor: pointer; transition: 0.3s; background: #fafcff; }
    .upload-area:hover { border-color: #f97316; background: #fff7ed; }
    .upload-area i { font-size: 40px; color: #f97316; margin-bottom: 12px; }
    .file-list { margin-top: 15px; display: flex; flex-wrap: wrap; gap: 10px; }
    .file-tag { background: #fff7ed; color: #ea580c; padding: 10px 14px; border-radius: 30px; font-size: 13px; display: flex; align-items: center; gap: 8px; }
    .checkbox-group, .radio-group { display: flex; flex-wrap: wrap; gap: 12px; }
    .checkbox-item, .radio-item { background: #f8fafc; border: 1px solid #dbe2ea; border-radius: 12px; padding: 12px 16px; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 8px; }
    .checkbox-item.selected, .radio-item.selected { border-color: #f97316; background: #fff7ed; }
    .double-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .publish-btn { width: 100%; border: none; background: linear-gradient(135deg, #f97316, #ea580c); color: white; padding: 18px; border-radius: 14px; font-size: 17px; font-weight: 600; cursor: pointer; transition: 0.3s; }
    .publish-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(249,115,22,0.25); }
    .success-toast { position: fixed; top: 20px; right: 20px; color: white; padding: 16px 20px; border-radius: 12px; z-index: 9999; box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
    @media (max-width: 768px) { .double-row { grid-template-columns: 1fr; } .form-header h1 { font-size: 22px; } .form-content { padding: 20px; } }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="publish-container">
        <div className="form-header">
          <h1>
            <i className="fas fa-plus-circle"></i> Publicar novo serviço
          </h1>
          <div className="subhead">
            Preencha os dados abaixo para divulgar seu serviço para milhares de
            clientes
          </div>
        </div>
        <form onSubmit={handleSubmit} className="form-content">
          <div className="field-group">
            <div className="field-label">
              <i className="fas fa-heading"></i> Título do serviço{' '}
              <span className="required-star">*</span>
            </div>
            <input
              type="text"
              name="titulo"
              placeholder="Ex: Instalação elétrica residencial"
              value={formData.titulo}
              onChange={handleChange}
            />
          </div>

          <div className="field-group">
            <div className="field-label">
              <i className="fas fa-align-left"></i> Descrição detalhada{' '}
              <span className="required-star">*</span>
            </div>
            <textarea
              name="descricao"
              placeholder="Descreva o serviço, materiais inclusos, garantia, etc."
              value={formData.descricao}
              onChange={handleChange}
            />
            <div className="hint-text">
              Seja o mais claro possível para atrair clientes qualificados.
            </div>
          </div>

          <div className="field-group">
            <div className="field-label">
              <i className="fas fa-camera"></i> Fotos do serviço
            </div>
            <div className="upload-area" onClick={handleUploadClick}>
              <i className="fas fa-cloud-upload-alt"></i>
              <div>Clique ou arraste imagens aqui</div>
              <div className="hint-text">JPG, PNG até 5MB cada</div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
            {fotos.length > 0 && (
              <div className="file-list">
                {fotos.map((foto, idx) => (
                  <div key={idx} className="file-tag">
                    <img
                      src={foto.base64}
                      alt={foto.name}
                      style={{
                        width: '30px',
                        height: '30px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                      }}
                    />
                    {foto.name.length > 20
                      ? foto.name.substring(0, 17) + '...'
                      : foto.name}
                    <i
                      className="fas fa-times-circle"
                      style={{ cursor: 'pointer', color: '#dc2626' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        removerFoto(idx);
                      }}
                    ></i>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="field-group">
            <div className="field-label">
              <i className="fas fa-tags"></i> Categoria{' '}
              <span className="required-star">*</span>
            </div>
            <div className="radio-group">
              {categorias.map((cat) => (
                <label
                  key={cat}
                  className={`radio-item ${formData.categoria === cat ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="categoria"
                    value={cat}
                    checked={formData.categoria === cat}
                    onChange={handleChange}
                    style={{ display: 'none' }}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          <div className="double-row">
            <div className="field-group">
              <div className="field-label">
                <i className="fas fa-dollar-sign"></i> Preço sugerido (R$){' '}
                <span className="required-star">*</span>
              </div>
              <input
                type="number"
                name="preco"
                placeholder="Ex: 150"
                value={formData.preco}
                onChange={handleChange}
                step="0.01"
              />
            </div>

            <div className="field-group">
              <div className="field-label">
                <i className="fas fa-bolt"></i> Urgência
              </div>
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  name="urgente"
                  checked={formData.urgente}
                  onChange={handleChange}
                />
                Este serviço é urgente (precisa de atendimento rápido)
              </label>
            </div>
          </div>

          <div className="double-row">
            <div className="field-group">
              <div className="field-label">
                <i className="fas fa-phone-alt"></i> Contato{' '}
                <span className="required-star">*</span>
              </div>
              <input
                type="text"
                name="contato"
                placeholder="Telefone ou e-mail"
                value={formData.contato}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <div className="field-label">
                <i className="fas fa-map-marker-alt"></i> Localização{' '}
                <span className="required-star">*</span>
              </div>
              <input
                type="text"
                name="localizacao"
                placeholder="Cidade, bairro ou região"
                value={formData.localizacao}
                onChange={handleChange}
              />
              <div className="hint-text">O cliente verá essa informação</div>
            </div>
          </div>

          <button type="submit" className="publish-btn">
            <i className="fas fa-paper-plane"></i> Publicar serviço
          </button>
        </form>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.isError ? 'error' : 'success'}
          onClose={() => setToast(null)}
        />
      )}

      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
    </>
  );
};

export default PostService;
