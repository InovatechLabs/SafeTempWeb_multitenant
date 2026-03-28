import { Cpu, Database, Server } from "lucide-react";

export const commandGuide = [
    {
      category: "Hardware",
      icon: Cpu,
      commands: [
        { code: "esp:read_now", desc: "Executa uma leitura no sensor" },
        { code: "esp:wifi_scan", desc: "Varredura de sinais Wi-Fi próximos" },
        { code: "esp:mem_map", desc: "Saúde da RAM e Heap do ESP32" },
        { code: "esp:chip_info", desc: "Exibe informações sobre o chip do ESP" },
        { code: "esp:ping", desc: "Status de conexão e buffer" }
      ]
    },
    {
      category: "Sistema",
      icon: Server,
      commands: [
        { code: "sys:ws_clients", desc: "Contagem de dispositivos conectados ao WebSocket" },
        { code: "sys:clear", desc: "Limpa a visualização do terminal" }
      
      ]
    },
    {
      category: "Banco de Dados",
      icon: Database,
      commands: [
        { code: "db:last_warn", desc: "Busca o último alerta registrado" },
        { code: "db:last_error", desc: "Busca o último erro registrado" },
        { code: "db:log_size", desc: "Total de logs armazenados" }
      ]
    }
  ];