import { useState, useEffect } from "react";
import api from "../services/api";
import type { SystemLog } from "../types/logs";

export const useSystemLogs = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const baseURL = api.defaults.baseURL || 'http://localhost:3000';
    const sseUrl = `${baseURL}data/system-logs/stream`;

    const eventSource = new EventSource(sseUrl);

      eventSource.onopen = () => {
      console.log("✅ SSE: Conectado ao fluxo de logs.");
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const newLog: SystemLog = JSON.parse(event.data);
        setLogs((prev) => [newLog, ...prev].slice(0, 50));
     
        if (!isConnected) setIsConnected(true); 
      } catch (error) {
        console.error("❌ SSE: Erro ao processar log", error);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      console.error("⚠️ SSE: Erro na conexão. Tentando reconectar...");
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, []);

  return { logs, isConnected };
};
