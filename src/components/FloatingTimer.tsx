import React from "react";
import { useStudy } from "@/contexts/StudyContext";
import {
  Play,
  Pause,
  SkipForward,
  Minimize2,
  Maximize2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Coffee } from "lucide-react";
import { useLocation } from "react-router-dom";

const FloatingTimer = () => {
  const {
    isTimerActive,
    isTimerRunning,
    setIsTimerRunning,
    timeLeft,
    currentTimerMode,
    formatTime,
    skipTimer,
    isFloatingTimerMinimized,
    setIsFloatingTimerMinimized,
    setIsTimerActive,
  } = useStudy();

  // Get current location to check if we're on the Pomodoro page
  const location = useLocation();
  const isPomodoroPage = location.pathname === "/pomodoro";

  // Don't show the floating timer on the Pomodoro page or if timer isn't truly active
  if (isPomodoroPage || !isTimerActive || (!isTimerRunning && timeLeft === 0))
    return null;

  const handleClose = () => {
    setIsTimerActive(false);
    setIsTimerRunning(false);
  };

  return (
    <div
      className={`fixed bottom-4 right-4 bg-background border border-border rounded-lg shadow-lg z-50 transition-all duration-200 ${
        isFloatingTimerMinimized ? "w-20 h-20" : "w-48 p-3"
      }`}
    >
      {isFloatingTimerMinimized ? (
        <button
          className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
          onClick={() => setIsFloatingTimerMinimized(false)}
        >
          <div
            className={`text-lg font-mono font-bold ${
              currentTimerMode === "study"
                ? "text-study-primary"
                : "text-study-accent"
            }`}
          >
            {formatTime(timeLeft)}
          </div>
          <Maximize2 className="h-4 w-4 mt-1 text-muted-foreground" />
        </button>
      ) : (
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => setIsFloatingTimerMinimized(true)}
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
              {currentTimerMode !== "study" && (
                <>
                  <Coffee className="h-4 w-4 text-study-accent ml-1" />
                  <span className="text-xs font-medium ml-1">
                    {currentTimerMode === "break" ? "Pausa" : "Pausa Longa"}
                  </span>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={handleClose}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="text-xl font-mono font-bold text-center mb-2">
            {formatTime(timeLeft)}
          </div>

          <div className="flex justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
            >
              {isTimerRunning ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={skipTimer}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingTimer;
