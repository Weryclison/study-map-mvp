import React, { useEffect, useState } from "react";
import { useRSVP } from "@/contexts/RSVPContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Settings,
} from "lucide-react";
import { useStudy } from "@/contexts/StudyContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RSVPSettings from "./RSVPSettings";

interface RSVPReaderProps {
  onFinish: () => void;
}

const RSVPReader: React.FC<RSVPReaderProps> = ({ onFinish }) => {
  const { rsvpSession, settings } = useRSVP();
  const { addStudySession } = useStudy();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState(
    rsvpSession.currentText?.wpm || settings.defaultWPM
  );

  // Registrar o tempo de início da leitura
  useEffect(() => {
    if (rsvpSession.isActive && !startTime) {
      setStartTime(Date.now());
    }

    // Atualizar a velocidade atual quando o texto mudar
    if (rsvpSession.currentText) {
      setCurrentSpeed(rsvpSession.currentText.wpm);
    }
  }, [rsvpSession.isActive, startTime, rsvpSession.currentText]);

  // Registrar a sessão de estudo quando finalizar a leitura
  const handleFinish = () => {
    if (startTime) {
      const duration = Math.max(
        1,
        Math.round((Date.now() - startTime) / (1000 * 60))
      );

      // Adicionar a sessão de estudo
      addStudySession({
        date: new Date().toISOString(),
        method: "rsvp",
        duration: duration,
        topic: rsvpSession.currentText?.title || "Leitura RSVP",
      });

      setStartTime(null);
    }

    onFinish();
  };

  // Lidar com mudanças de velocidade
  const handleSpeedChange = (value: number[]) => {
    const newSpeed = value[0];
    setCurrentSpeed(newSpeed);
    rsvpSession.adjustSpeed(newSpeed);
  };

  if (!rsvpSession.isActive || !rsvpSession.currentText) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-xl font-semibold">Nenhuma leitura ativa</h2>
        <Button variant="secondary" onClick={onFinish} className="mt-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  const { currentText, words, currentIndex, isPaused, progress } = rsvpSession;

  // Obter a palavra atual
  const currentWord = words[currentIndex] || "";

  // Encontrar o "ponto focal" da palavra
  const getFocalPoint = (
    word: string
  ): { before: string; focus: string; after: string } => {
    if (!word) return { before: "", focus: "", after: "" };

    // Lógica para encontrar o ponto ideal (ORP - Optimal Recognition Point)
    // Simplificado: 1/3 da palavra para palavras curtas, 2/5 para palavras longas
    const focalIndex =
      word.length <= 5
        ? Math.floor(word.length / 3)
        : Math.floor(word.length * 0.4);

    return {
      before: word.substring(0, focalIndex),
      focus: word.substring(focalIndex, focalIndex + 1),
      after: word.substring(focalIndex + 1),
    };
  };

  const { before, focus, after } = getFocalPoint(currentWord);

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleFinish}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Sair da leitura
        </Button>

        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} de {words.length} palavras
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-6">{currentText.title}</h2>

        <div className="h-48 w-full flex items-center justify-center bg-card rounded-lg border mb-6 relative">
          {/* Mostrar uma mensagem quando o texto terminar */}
          {currentIndex >= words.length - 1 && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/90 rounded-lg">
              <div className="text-center">
                <h3 className="text-xl font-bold">Leitura concluída!</h3>
                <Button onClick={rsvpSession.restart} className="mt-4">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Recomeçar
                </Button>
              </div>
            </div>
          )}

          {/* Área de exibição da palavra */}
          <div className="text-4xl font-medium text-center select-none">
            <span className="text-muted-foreground">{before}</span>
            <span className="text-primary">{focus}</span>
            <span className="text-muted-foreground">{after}</span>
          </div>
        </div>

        <Progress value={progress} className="w-full mb-4" />

        <div className="flex flex-col w-full space-y-4">
          {/* Controles de leitura */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={rsvpSession.skipBackward}
              disabled={currentIndex === 0}
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            {isPaused ? (
              <Button size="lg" onClick={rsvpSession.resumeReading}>
                <Play className="h-5 w-5 mr-2" />
                Continuar
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                onClick={rsvpSession.pauseReading}
              >
                <Pause className="h-5 w-5 mr-2" />
                Pausar
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={rsvpSession.skipForward}
              disabled={currentIndex >= words.length - 1}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          {/* Controle de velocidade */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Velocidade</span>
              <span className="text-sm font-medium">{currentSpeed} WPM</span>
            </div>
            <Slider
              value={[currentSpeed]}
              min={100}
              max={1000}
              step={10}
              onValueChange={handleSpeedChange}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Lento</span>
              <span>Rápido</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de configurações */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configurações RSVP</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <RSVPSettings onClose={() => setIsSettingsOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RSVPReader;
