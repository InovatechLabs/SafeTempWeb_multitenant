export interface Alert {
  id: number;
  nome: string | null;
  nota: string | null;
  temperatura_min: number | null;
  temperatura_max: number | null;
  ativo: boolean;
  greenhouse: {
    name: string;
    id: number;
  };
  notificacaoAtiva: boolean;
  hora_inicio: string | null;
  hora_fim: string | null;
}