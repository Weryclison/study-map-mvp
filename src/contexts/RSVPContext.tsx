import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { useStudy } from "@/contexts/StudyContext";

// Tipos para o RSVP
export interface RSVPText {
  id: string;
  title: string;
  content: string;
  color: string;
  wpm: number; // Palavras por minuto (velocidade)
  createdAt: string;
  updatedAt: string;
  lastReadAt: string | null;
}

interface RSVPReaderSettings {
  defaultWPM: number;
  focusPoint: "center" | "left" | "right";
  showProgressBar: boolean;
  colorMode: "normal" | "dark" | "bionic";
  fontSize: number;
}

interface RSVPSession {
  isActive: boolean;
  currentIndex: number;
  words: string[];
  isPaused: boolean;
  currentText: RSVPText | null;
  progress: number;
  startReading: (textId: string) => void;
  endReading: () => void;
  pauseReading: () => void;
  resumeReading: () => void;
  adjustSpeed: (speed: number) => void;
  restart: () => void;
  skipForward: () => void;
  skipBackward: () => void;
}

interface RSVPContextType {
  texts: RSVPText[];
  createText: (
    title: string,
    content: string,
    color: string,
    wpm: number
  ) => RSVPText;
  updateText: (
    textId: string,
    data: Partial<
      Omit<RSVPText, "id" | "createdAt" | "updatedAt" | "lastReadAt">
    >
  ) => void;
  deleteText: (textId: string) => void;
  getTextById: (textId: string) => RSVPText | null;
  getCurrentText: () => RSVPText | null;
  setCurrentText: (textId: string | null) => void;
  settings: RSVPReaderSettings;
  updateSettings: (settings: Partial<RSVPReaderSettings>) => void;
  rsvpSession: RSVPSession;
}

const RSVPContext = createContext<RSVPContextType>({
  texts: [],
  createText: () => ({
    id: "",
    title: "",
    content: "",
    color: "",
    wpm: 300,
    createdAt: "",
    updatedAt: "",
    lastReadAt: null,
  }),
  updateText: () => {},
  deleteText: () => {},
  getTextById: () => null,
  getCurrentText: () => null,
  setCurrentText: () => {},
  settings: {
    defaultWPM: 300,
    focusPoint: "center",
    showProgressBar: true,
    colorMode: "normal",
    fontSize: 32,
  },
  updateSettings: () => {},
  rsvpSession: {
    isActive: false,
    currentIndex: 0,
    words: [],
    isPaused: false,
    currentText: null,
    progress: 0,
    startReading: () => {},
    endReading: () => {},
    pauseReading: () => {},
    resumeReading: () => {},
    adjustSpeed: () => {},
    restart: () => {},
    skipForward: () => {},
    skipBackward: () => {},
  },
});

export const useRSVP = () => useContext(RSVPContext);

export const RSVPProvider = ({ children }: { children: ReactNode }) => {
  const { addStudySession } = useStudy();
  const [texts, setTexts] = useState<RSVPText[]>([]);
  const [currentTextId, setCurrentTextId] = useState<string | null>(null);
  const [settings, setSettings] = useState<RSVPReaderSettings>({
    defaultWPM: 300,
    focusPoint: "center",
    showProgressBar: true,
    colorMode: "normal",
    fontSize: 32,
  });

  // Estado da sessão de leitura RSVP
  const [rsvpSession, setRSVPSession] = useState({
    isActive: false,
    currentIndex: 0,
    words: [] as string[],
    isPaused: false,
    currentText: null as RSVPText | null,
    progress: 0,
  });

  // Referência ao timer
  const timerRef = React.useRef<number | null>(null);
  const currentWPMRef = React.useRef<number>(settings.defaultWPM);

  // Carregar dados do localStorage
  useEffect(() => {
    const savedTexts = localStorage.getItem("rsvpTexts");
    const savedCurrentText = localStorage.getItem("rsvpCurrentText");
    const savedSettings = localStorage.getItem("rsvpSettings");

    if (savedTexts) {
      setTexts(JSON.parse(savedTexts));
    } else {
      // Criar um texto de exemplo se não houver nenhum
      const defaultText = {
        id: generateId(),
        title: "Texto de exemplo",
        content:
          "Este é um texto de exemplo para treinar sua leitura rápida. O RSVP (Rapid Serial Visual Presentation) ajuda você a treinar sua velocidade de leitura mostrando palavras uma a uma em alta velocidade.",
        color: "#3B82F6", // Azul
        wpm: 300,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastReadAt: null,
      };
      setTexts([defaultText]);
    }

    if (savedCurrentText) {
      setCurrentTextId(savedCurrentText);
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Salvar dados no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem("rsvpTexts", JSON.stringify(texts));
  }, [texts]);

  useEffect(() => {
    if (currentTextId) {
      localStorage.setItem("rsvpCurrentText", currentTextId);
    } else {
      localStorage.removeItem("rsvpCurrentText");
    }
  }, [currentTextId]);

  useEffect(() => {
    localStorage.setItem("rsvpSettings", JSON.stringify(settings));
  }, [settings]);

  // Limpar o timer quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Funções auxiliares
  const generateId = (): string => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };

  // Dividir o texto em palavras
  const splitTextIntoWords = (text: string): string[] => {
    return text.split(/\s+/).filter((word) => word.length > 0);
  };

  // Iniciar a leitura RSVP
  const startReading = (textId: string) => {
    const text = getTextById(textId);
    if (text) {
      // Atualizar a data da última leitura
      const updatedText = {
        ...text,
        lastReadAt: new Date().toISOString(),
      };

      // Atualizar o texto no estado
      setTexts((prevTexts) =>
        prevTexts.map((t) => (t.id === textId ? updatedText : t))
      );

      // Preparar as palavras
      const words = splitTextIntoWords(text.content);

      // Configurar a sessão
      setRSVPSession({
        isActive: true,
        currentIndex: 0,
        words,
        isPaused: false,
        currentText: updatedText,
        progress: 0,
      });

      // Iniciar o timer
      currentWPMRef.current = text.wpm;
      startTimer(text.wpm);
    }
  };

  // Encerrar a leitura
  const endReading = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setRSVPSession({
      isActive: false,
      currentIndex: 0,
      words: [],
      isPaused: false,
      currentText: null,
      progress: 0,
    });
  };

  // Pausar a leitura
  const pauseReading = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setRSVPSession((prev) => ({
      ...prev,
      isPaused: true,
    }));
  };

  // Retomar a leitura
  const resumeReading = () => {
    setRSVPSession((prev) => ({
      ...prev,
      isPaused: false,
    }));

    startTimer(currentWPMRef.current);
  };

  // Ajustar a velocidade de leitura durante a leitura
  const adjustSpeed = (speed: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    currentWPMRef.current = speed;

    // Atualizar o texto atual no estado da sessão com a nova velocidade
    if (rsvpSession.currentText) {
      const updatedText = {
        ...rsvpSession.currentText,
        wpm: speed,
      };

      setRSVPSession((prev) => ({
        ...prev,
        currentText: updatedText,
      }));

      // Atualizar o texto na lista de textos
      updateText(rsvpSession.currentText.id, { wpm: speed });
    }

    // Se não estiver pausado, reiniciar o timer com a nova velocidade
    if (rsvpSession.isActive && !rsvpSession.isPaused) {
      startTimer(speed);
    }
  };

  // Reiniciar a leitura
  const restart = () => {
    setRSVPSession((prev) => ({
      ...prev,
      currentIndex: 0,
      isPaused: false,
      progress: 0,
    }));

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    startTimer(currentWPMRef.current);
  };

  // Avançar algumas palavras
  const skipForward = () => {
    setRSVPSession((prev) => {
      const newIndex = Math.min(prev.currentIndex + 10, prev.words.length - 1);
      return {
        ...prev,
        currentIndex: newIndex,
        progress: (newIndex / prev.words.length) * 100,
      };
    });
  };

  // Voltar algumas palavras
  const skipBackward = () => {
    setRSVPSession((prev) => {
      const newIndex = Math.max(prev.currentIndex - 10, 0);
      return {
        ...prev,
        currentIndex: newIndex,
        progress: (newIndex / prev.words.length) * 100,
      };
    });
  };

  // Iniciar o timer para mostrar palavras
  const startTimer = (wpm: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Calcular o intervalo em milissegundos
    const intervalTime = (60 / wpm) * 1000;
    const startTime = Date.now();

    timerRef.current = window.setInterval(() => {
      setRSVPSession((prev) => {
        if (prev.currentIndex >= prev.words.length - 1) {
          // Fim do texto
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }

          // Registrar a leitura de texto concluída
          if (prev.currentText) {
            const timeSpent = Math.max(
              1,
              Math.round((Date.now() - startTime) / (1000 * 60))
            );
            addStudySession({
              date: new Date().toISOString(),
              method: "rsvp",
              duration: timeSpent,
              topic: prev.currentText.title,
            });
          }

          return {
            ...prev,
            isPaused: true,
            progress: 100,
          };
        }

        const newIndex = prev.currentIndex + 1;
        return {
          ...prev,
          currentIndex: newIndex,
          progress: (newIndex / prev.words.length) * 100,
        };
      });
    }, intervalTime);
  };

  // Funções CRUD para textos
  const createText = (
    title: string,
    content: string,
    color: string,
    wpm: number
  ): RSVPText => {
    const newText: RSVPText = {
      id: generateId(),
      title,
      content,
      color,
      wpm: wpm || settings.defaultWPM,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastReadAt: null,
    };

    setTexts((prev) => [...prev, newText]);
    return newText;
  };

  const updateText = (
    textId: string,
    data: Partial<
      Omit<RSVPText, "id" | "createdAt" | "updatedAt" | "lastReadAt">
    >
  ): void => {
    setTexts((prevTexts) =>
      prevTexts.map((text) =>
        text.id === textId
          ? {
              ...text,
              ...data,
              updatedAt: new Date().toISOString(),
            }
          : text
      )
    );
  };

  const deleteText = (textId: string): void => {
    setTexts((prevTexts) => prevTexts.filter((text) => text.id !== textId));
    if (currentTextId === textId) {
      setCurrentTextId(null);
    }
  };

  const getTextById = (textId: string): RSVPText | null => {
    return texts.find((text) => text.id === textId) || null;
  };

  const getCurrentText = (): RSVPText | null => {
    return currentTextId ? getTextById(currentTextId) : null;
  };

  const setCurrentText = (textId: string | null) => {
    setCurrentTextId(textId);
  };

  const updateSettings = (newSettings: Partial<RSVPReaderSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <RSVPContext.Provider
      value={{
        texts,
        createText,
        updateText,
        deleteText,
        getTextById,
        getCurrentText,
        setCurrentText,
        settings,
        updateSettings,
        rsvpSession: {
          ...rsvpSession,
          startReading,
          endReading,
          pauseReading,
          resumeReading,
          adjustSpeed,
          restart,
          skipForward,
          skipBackward,
        },
      }}
    >
      {children}
    </RSVPContext.Provider>
  );
};
