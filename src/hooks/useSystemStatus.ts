import { useState, useEffect } from "react";
import api from "../services/api";
import type { SystemLog } from "../types/logs";

export type ConnectionStatus = 'connecting' | 'connected' | 'error';

export const useSystemLogs = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');

  const clearLogs = () => setLogs([]);

  useEffect(() => {
    const baseURL = api.defaults.baseURL || 'http://localhost:3000';
    const sseUrl = `${baseURL}data/system-logs/stream`.replace(/([^:]\/)\/+/g, "$1");

    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      console.log("✅ SSE: Conectado.");
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
      console.error("⚠️ SSE: Erro na conexão. Tentando reconectar...");
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { logs, isConnected: status === 'connected', status, clearLogs };
};