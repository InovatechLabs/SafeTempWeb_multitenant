import { useState, useEffect } from "react";
import api from "../services/api";
import type { SystemLog } from "../types/systemLogs";

export type ConnectionStatus = 'connecting' | 'connected' | 'error';

export const useSystemLogs = (greenhouseId?: number) => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');

  const clearLogs = () => setLogs([]);

  useEffect(() => {
    clearLogs();
    setStatus('connecting');

    const baseURL = api.defaults.baseURL || 'http://localhost:3000';
    const sseUrl = `${baseURL}data/system-logs/stream?greenhouseId=${greenhouseId}`.replace(/([^:]\/)\/+/g, "$1");

    const eventSource = new EventSource(sseUrl, { withCredentials: true });

    eventSource.onopen = () => {
      console.log("✅ SSE: Conectado à estufa ID:", greenhouseId || "Padrão");
      setStatus('connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const newLog: SystemLog = JSON.parse(event.data);
        setLogs((prev) => [newLog, ...prev].slice(0, 50));
        setStatus('connected'); 
      } catch (error) {
        console.error("❌ SSE: Erro ao processar log", error);
      }
    };

    eventSource.onerror = () => {
      setStatus('error');
      console.error("⚠️ SSE: Erro na conexão. A tentar reconectar...");
    };

    return () => {
      eventSource.close();
    };
  }, [greenhouseId]);

  return { logs, isConnected: status === 'connected', status, clearLogs };
};