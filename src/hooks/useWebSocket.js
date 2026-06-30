import { useState, useEffect, useRef, useCallback } from "react";

export function useWebSocket(url) {
  const [messages, setMessages]   = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError]         = useState(null);
  const ws = useRef(null);

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        setConnected(true);
        setError(null);
      };

      ws.current.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          setMessages(prev => [msg, ...prev].slice(0, 100));
        } catch {
          setMessages(prev => [{
            time: new Date().toLocaleTimeString("en-IN"),
            level: "INFO",
            message: e.data,
            service: "System"
          }, ...prev].slice(0, 100));
        }
      };

      ws.current.onclose = () => {
        setConnected(false);
        // Auto-reconnect after 3s
        setTimeout(connect, 3000);
      };

      ws.current.onerror = () => {
        setError("WebSocket connection failed");
        setConnected(false);
      };
    } catch {
      setError("WebSocket not available");
      // Fallback: simulate live logs
      simulateLogs();
    }
  }, [url]);

  const simulateLogs = () => {
    const logTemplates = [
      { level:"INFO",  message:"Health check passed — all services UP",       service:"Monitor"     },
      { level:"INFO",  message:"Git pull completed — branch: main",            service:"GitAgent"    },
      { level:"WARN",  message:"Memory usage at 78% — monitoring",            service:"Monitor"     },
      { level:"INFO",  message:"API request processed in 42ms",               service:"Backend"     },
      { level:"INFO",  message:"Security scan complete — 0 vulnerabilities",  service:"SecAgent"    },
      { level:"ERROR", message:"Python ML API timeout — retrying in 5s",      service:"Monitor"     },
      { level:"INFO",  message:"Deployment pipeline triggered",                service:"DeployAgent" },
      { level:"INFO",  message:"Database backup completed successfully",       service:"Database"    },
    ];

    const interval = setInterval(() => {
      const tpl = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      setMessages(prev => [{
        ...tpl,
        time: new Date().toLocaleTimeString("en-IN"),
        id: Date.now()
      }, ...prev].slice(0, 100));
    }, 3000);

    return () => clearInterval(interval);
  };

  useEffect(() => {
    const cleanup = connect();
    return () => {
      ws.current?.close();
      cleanup?.();
    };
  }, []);

  const send = (data) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  };

  return { messages, connected, error, send };
}
