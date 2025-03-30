import React, { useState, useEffect } from "react";
import { useStudy } from "@/contexts/StudyContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  SkipForward,
  Settings,
  Save,
  Coffee,
  BookOpen,
  Maximize2,
  X,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";

const PomodoroTimer = () => {
  const {
    pomodoroSettings,
    updatePomodoroSettings,
    isTimerRunning,
    setIsTimerRunning,
    currentTimerMode,
    timeLeft,
    skipTimer,
    startTimer,
    stopTimer,
    formatTime,
    setIsTimerActive,
    timerSessions,
  } = useStudy();

  const { toast } = useToast();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Settings form state
  const [tempSettings, setTempSettings] = useState({
    studyTime: pomodoroSettings.studyTime,
    breakTime: pomodoroSettings.breakTime,
    longBreakTime: pomodoroSettings.longBreakTime,
    sessionsBeforeLongBreak: pomodoroSettings.sessionsBeforeLongBreak,
  });

  // Activate timer when entering the page
  useEffect(() => {
    setIsTimerActive(true);

    return () => {
      // Do not deactivate timer when leaving the page
      // This allows the floating timer to stay active
    };
  }, []);

  const handleSaveSettings = () => {
    updatePomodoroSettings(tempSettings);
    setIsSettingsOpen(false);
  };

  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
  };

  const handleButtonClick = () => {
    if (isTimerRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  };

  if (isFocusMode) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="max-w-2xl w-full px-6 py-12 flex flex-col items-center">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">
              {currentTimerMode === "study"
                ? "Tempo de Estudo"
                : currentTimerMode === "break"
                ? "Pausa Curta"
                : "Pausa Longa"}
            </h1>
          </div>

          <div className="flex items-center justify-center mb-12">
            {currentTimerMode === "study" ? (
              <BookOpen className="h-24 w-24 text-study-primary mr-6" />
            ) : (
              <Coffee className="h-24 w-24 text-study-accent mr-6" />
            )}
            <div className="text-8xl font-mono font-bold">
              {formatTime(timeLeft)}
            </div>
          </div>

          <div className="flex gap-6">
            <Button
              size="lg"
              className={
                isTimerRunning
                  ? "bg-red-500 hover:bg-red-600 h-14 px-6 text-lg"
                  : "bg-study-primary hover:bg-study-primary/90 h-14 px-6 text-lg"
              }
              onClick={handleButtonClick}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="mr-2 h-6 w-6" /> Pausar
                </>
              ) : (
                <>
                  <Play className="mr-2 h-6 w-6" /> Iniciar
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-14 px-6 text-lg"
              onClick={skipTimer}
            >
              <SkipForward className="mr-2 h-6 w-6" />
              Pular
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-14 w-14 absolute top-4 right-4"
              onClick={toggleFocusMode}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Pomodoro Timer</h1>
        <p className="text-muted-foreground">
          Alterne entre períodos focados de estudo e pausas para maximizar sua
          produtividade
        </p>
      </div>

      <div className="grid">
        <Card className="shadow-md relative">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {currentTimerMode === "study"
                ? "Tempo de Estudo"
                : currentTimerMode === "break"
                ? "Pausa Curta"
                : "Pausa Longa"}
            </CardTitle>
            <CardDescription>
              {currentTimerMode === "study"
                ? "Mantenha o foco na sua tarefa"
                : "Relaxe e descanse a mente"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="flex items-center justify-center mb-6">
              {currentTimerMode === "study" ? (
                <BookOpen className="h-16 w-16 text-study-primary mr-4" />
              ) : (
                <Coffee className="h-16 w-16 text-study-accent mr-4" />
              )}
              <div className="timer-display">{formatTime(timeLeft)}</div>
            </div>

            <div className="flex gap-4 mt-4">
              <Button
                size="lg"
                className={
                  isTimerRunning
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-study-primary hover:bg-study-primary/90"
                }
                onClick={handleButtonClick}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="mr-2 h-5 w-5" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" /> Iniciar
                  </>
                )}
              </Button>

              <Button variant="outline" size="lg" onClick={skipTimer}>
                <SkipForward className="mr-2 h-5 w-5" />
                Pular
              </Button>

              <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Configurações do Pomodoro</SheetTitle>
                    <SheetDescription>
                      Personalize seus intervalos de tempo
                    </SheetDescription>
                  </SheetHeader>

                  <div className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <Label>
                        Tempo de estudo: {tempSettings.studyTime} minutos
                      </Label>
                      <Slider
                        value={[tempSettings.studyTime]}
                        min={5}
                        max={60}
                        step={5}
                        onValueChange={(value) =>
                          setTempSettings({
                            ...tempSettings,
                            studyTime: value[0],
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Tempo de pausa: {tempSettings.breakTime} minutos
                      </Label>
                      <Slider
                        value={[tempSettings.breakTime]}
                        min={1}
                        max={15}
                        step={1}
                        onValueChange={(value) =>
                          setTempSettings({
                            ...tempSettings,
                            breakTime: value[0],
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Tempo de pausa longa: {tempSettings.longBreakTime}{" "}
                        minutos
                      </Label>
                      <Slider
                        value={[tempSettings.longBreakTime]}
                        min={5}
                        max={30}
                        step={5}
                        onValueChange={(value) =>
                          setTempSettings({
                            ...tempSettings,
                            longBreakTime: value[0],
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Sessões antes da pausa longa:{" "}
                        {tempSettings.sessionsBeforeLongBreak}
                      </Label>
                      <Slider
                        value={[tempSettings.sessionsBeforeLongBreak]}
                        min={2}
                        max={8}
                        step={1}
                        onValueChange={(value) =>
                          setTempSettings({
                            ...tempSettings,
                            sessionsBeforeLongBreak: value[0],
                          })
                        }
                      />
                    </div>

                    <Button
                      className="w-full bg-study-primary hover:bg-study-primary/90"
                      onClick={handleSaveSettings}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Configurações
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="absolute bottom-4 left-4"
              onClick={toggleFocusMode}
            >
              <Maximize2 className="h-4 w-4 mr-1" />
              <span className="text-xs">Modo Foco</span>
            </Button>

            <div className="mt-6 text-sm text-muted-foreground">
              Sessões completadas:{" "}
              <span className="font-medium">{timerSessions}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PomodoroTimer;
