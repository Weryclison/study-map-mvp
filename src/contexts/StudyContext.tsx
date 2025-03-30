import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useRef,
} from "react";

export type StudyMethod = "pomodoro" | "anki" | "rsvp" | "challenge" | null;

interface StudySession {
  date: string;
  method: StudyMethod;
  duration: number; // in minutes
  topic?: string;
}

interface StudyContextType {
  selectedMethod: StudyMethod;
  selectMethod: (method: StudyMethod) => void;
  studySessions: StudySession[];
  addStudySession: (session: StudySession) => void;
  pomodoroSettings: {
    studyTime: number; // in minutes
    breakTime: number; // in minutes
    longBreakTime: number; // in minutes
    sessionsBeforeLongBreak: number;
  };
  updatePomodoroSettings: (
    settings: Partial<StudyContextType["pomodoroSettings"]>
  ) => void;

  // Timer states
  isTimerRunning: boolean;
  setIsTimerRunning: (isRunning: boolean) => void;
  currentTimerMode: "study" | "break" | "longBreak";
  setCurrentTimerMode: (mode: "study" | "break" | "longBreak") => void;
  timeLeft: number;
  setTimeLeft: (seconds: number) => void;
  timerSessions: number;
  setTimerSessions: (sessions: number) => void;
  isTimerActive: boolean;
  setIsTimerActive: (isActive: boolean) => void;
  startTimer: () => void;
  stopTimer: () => void;
  skipTimer: () => void;
  isFloatingTimerMinimized: boolean;
  setIsFloatingTimerMinimized: (isMinimized: boolean) => void;
  formatTime: (seconds: number) => string;
}

const initialPomodoroSettings = {
  studyTime: 25,
  breakTime: 5,
  longBreakTime: 15,
  sessionsBeforeLongBreak: 4,
};

const StudyContext = createContext<StudyContextType>({
  selectedMethod: null,
  selectMethod: () => {},
  studySessions: [],
  addStudySession: () => {},
  pomodoroSettings: initialPomodoroSettings,
  updatePomodoroSettings: () => {},

  // Timer states
  isTimerRunning: false,
  setIsTimerRunning: () => {},
  currentTimerMode: "study",
  setCurrentTimerMode: () => {},
  timeLeft: 0,
  setTimeLeft: () => {},
  timerSessions: 0,
  setTimerSessions: () => {},
  isTimerActive: false,
  setIsTimerActive: () => {},
  startTimer: () => {},
  stopTimer: () => {},
  skipTimer: () => {},
  isFloatingTimerMinimized: true,
  setIsFloatingTimerMinimized: () => {},
  formatTime: () => "",
});

export const useStudy = () => useContext(StudyContext);

export const StudyProvider = ({ children }: { children: ReactNode }) => {
  const [selectedMethod, setSelectedMethod] = useState<StudyMethod>(null);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [pomodoroSettings, setPomodoroSettings] = useState(
    initialPomodoroSettings
  );

  // Timer states
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentTimerMode, setCurrentTimerMode] = useState<
    "study" | "break" | "longBreak"
  >("study");
  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.studyTime * 60);
  const [timerSessions, setTimerSessions] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isFloatingTimerMinimized, setIsFloatingTimerMinimized] =
    useState(true);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Load study data from localStorage on mount
  useEffect(() => {
    const savedMethod = localStorage.getItem("selectedStudyMethod");
    const savedSessions = localStorage.getItem("studySessions");
    const savedSettings = localStorage.getItem("pomodoroSettings");
    const savedTimerState = localStorage.getItem("timerState");

    // Verificar se já realizamos a limpeza dos dados incorretos
    const challengeDataCleaned = localStorage.getItem("challengeDataCleaned");

    if (savedMethod) {
      setSelectedMethod(savedMethod as StudyMethod);
    }

    if (savedSessions) {
      let parsedSessions = JSON.parse(savedSessions);

      // Limpar os dados incorretos do desafio relâmpago, apenas se não tiver sido limpo antes
      if (!challengeDataCleaned) {
        // Filtrar para remover todas as sessões de desafio relâmpago
        parsedSessions = parsedSessions.filter(
          (session: StudySession) => session.method !== "challenge"
        );

        // Marcar que já limpamos os dados
        localStorage.setItem("challengeDataCleaned", "true");

        // Salvar as sessões atualizadas no localStorage
        localStorage.setItem("studySessions", JSON.stringify(parsedSessions));
      }

      setStudySessions(parsedSessions);
    }

    if (savedSettings) {
      setPomodoroSettings(JSON.parse(savedSettings));
    }
    if (savedTimerState) {
      const timerState = JSON.parse(savedTimerState);

      // Only activate the timer if it was previously running
      if (timerState.isRunning) {
        setIsTimerActive(timerState.isActive);
        setCurrentTimerMode(timerState.mode);
        setTimerSessions(timerState.sessions);

        // Calculate remaining time based on saved end time
        if (timerState.endTime) {
          const now = Date.now();
          const endTime = timerState.endTime;
          if (endTime > now) {
            setTimeLeft(Math.floor((endTime - now) / 1000));
            setIsTimerRunning(true);
          } else {
            // Timer would have ended
            setIsTimerActive(false);
            setIsTimerRunning(false);
          }
        } else if (!timerState.isRunning && timerState.remainingTime) {
          setTimeLeft(timerState.remainingTime);
        }
      }
    }
  }, []);

  // Reset timer when mode changes
  useEffect(() => {
    if (currentTimerMode === "study") {
      setTimeLeft(pomodoroSettings.studyTime * 60);
    } else if (currentTimerMode === "break") {
      setTimeLeft(pomodoroSettings.breakTime * 60);
    } else if (currentTimerMode === "longBreak") {
      setTimeLeft(pomodoroSettings.longBreakTime * 60);
    }
  }, [currentTimerMode, pomodoroSettings]);

  // Save timer state to localStorage
  useEffect(() => {
    if (isTimerActive) {
      let endTime = null;
      if (isTimerRunning) {
        endTime = Date.now() + timeLeft * 1000;
      }

      const timerState = {
        isActive: isTimerActive,
        isRunning: isTimerRunning,
        mode: currentTimerMode,
        sessions: timerSessions,
        remainingTime: timeLeft,
        endTime: endTime,
      };

      localStorage.setItem("timerState", JSON.stringify(timerState));
    } else {
      localStorage.removeItem("timerState");
    }
  }, [
    isTimerActive,
    isTimerRunning,
    currentTimerMode,
    timerSessions,
    timeLeft,
  ]);

  // Save study data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("selectedStudyMethod", selectedMethod || "");
    localStorage.setItem("studySessions", JSON.stringify(studySessions));
    localStorage.setItem("pomodoroSettings", JSON.stringify(pomodoroSettings));
  }, [selectedMethod, studySessions, pomodoroSettings]);

  // Timer effect
  useEffect(() => {
    if (isTimerRunning) {
      startTimer();
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;

      // Save the session if we were in study mode and stopped
      if (currentTimerMode === "study" && startTimeRef.current) {
        const timeSpent = Math.floor(
          (Date.now() - startTimeRef.current) / (1000 * 60)
        );
        if (timeSpent > 0) {
          addStudySession({
            date: new Date().toISOString(),
            method: "pomodoro",
            duration: timeSpent,
            topic: "Estudo Geral",
          });
        }
        startTimeRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setIsTimerActive(true);
    setIsTimerRunning(true);

    // Record start time for study mode
    if (currentTimerMode === "study" && !startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Time's up!
          setIsTimerRunning(false);
          clearInterval(timerRef.current!);
          timerRef.current = null;

          if (currentTimerMode === "study") {
            // Save the completed study session
            const timeSpent = pomodoroSettings.studyTime;
            addStudySession({
              date: new Date().toISOString(),
              method: "pomodoro",
              duration: timeSpent,
              topic: "Estudo Geral",
            });
            startTimeRef.current = null;

            // Update sessions count
            setTimerSessions((prev) => {
              const newCount = prev + 1;

              // Check if it's time for a long break
              if (newCount % pomodoroSettings.sessionsBeforeLongBreak === 0) {
                setCurrentTimerMode("longBreak");
              } else {
                setCurrentTimerMode("break");
              }

              return newCount;
            });
          } else {
            // Break is over, back to study
            setCurrentTimerMode("study");
          }

          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
  };

  const skipTimer = () => {
    // Save current session if in study mode
    if (currentTimerMode === "study") {
      // Save session regardless of running state or time spent
      startTimeRef.current = null;

      // Add study session with the full pomodoro duration
      addStudySession({
        date: new Date().toISOString(),
        method: "pomodoro",
        duration: pomodoroSettings.studyTime,
        topic: "Estudo Geral",
      });

      // Update sessions count
      setTimerSessions((prev) => {
        const newCount = prev + 1;

        // Check if it's time for a long break
        if (newCount % pomodoroSettings.sessionsBeforeLongBreak === 0) {
          setCurrentTimerMode("longBreak");
        } else {
          setCurrentTimerMode("break");
        }

        return newCount;
      });
    } else {
      // If in break mode, go back to study
      setCurrentTimerMode("study");
    }

    setIsTimerRunning(false);
  };

  const selectMethod = (method: StudyMethod) => {
    setSelectedMethod(method);
  };

  const addStudySession = (session: StudySession) => {
    setStudySessions((prev) => [...prev, session]);
  };

  const updatePomodoroSettings = (
    settings: Partial<typeof pomodoroSettings>
  ) => {
    setPomodoroSettings((prev) => ({ ...prev, ...settings }));
  };

  return (
    <StudyContext.Provider
      value={{
        selectedMethod,
        selectMethod,
        studySessions,
        addStudySession,
        pomodoroSettings,
        updatePomodoroSettings,
        isTimerRunning,
        setIsTimerRunning,
        currentTimerMode,
        setCurrentTimerMode,
        timeLeft,
        setTimeLeft,
        timerSessions,
        setTimerSessions,
        isTimerActive,
        setIsTimerActive,
        startTimer,
        stopTimer,
        skipTimer,
        isFloatingTimerMinimized,
        setIsFloatingTimerMinimized,
        formatTime,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};
