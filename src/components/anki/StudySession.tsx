import React, { useEffect } from "react";
import { useAnki, ReviewResult } from "@/contexts/AnkiContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  ChevronLeft,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Check,
  Clock,
  Keyboard,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface StudySessionProps {
  onFinish: () => void;
}

const StudySession: React.FC<StudySessionProps> = ({ onFinish }) => {
  const { studySession, getDeckById } = useAnki();
  const { toast } = useToast();

  const {
    isActive,
    currentCardIndex,
    dueCards,
    revealedAnswer,
    endStudySession,
    revealAnswer,
    submitAnswer,
  } = studySession;

  // Adicionar atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive || dueCards.length === 0) return;

      // Espaço para revelar resposta
      if (e.code === "Space" && !revealedAnswer) {
        e.preventDefault();
        revealAnswer();
        return;
      }

      // Teclas 1-4 para as respostas quando a resposta está revelada
      if (revealedAnswer) {
        switch (e.code) {
          case "Digit1":
          case "Numpad1":
            submitAnswer("again");
            break;
          case "Digit2":
          case "Numpad2":
            submitAnswer("hard");
            break;
          case "Digit3":
          case "Numpad3":
            submitAnswer("good");
            break;
          case "Digit4":
          case "Numpad4":
            submitAnswer("easy");
            break;
          case "Escape":
            handleEndSession();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isActive,
    dueCards.length,
    revealedAnswer,
    revealAnswer,
    submitAnswer,
    endStudySession,
  ]);

  if (!isActive || dueCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <div className="text-center space-y-2">
          <Check className="h-16 w-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold">Parabéns!</h2>
          <p className="text-muted-foreground">
            Você concluiu todos os cartões para revisão neste baralho.
          </p>
        </div>
        <Button onClick={onFinish}>Voltar ao Baralho</Button>
      </div>
    );
  }

  const currentCard = dueCards[currentCardIndex];
  const currentDeck = currentCard ? getDeckById(currentCard.deckId) : null;
  const progress = Math.round(((currentCardIndex + 1) / dueCards.length) * 100);

  const handleSubmit = (result: ReviewResult) => {
    submitAnswer(result);
  };

  const handleEndSession = () => {
    endStudySession();
    onFinish();
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={handleEndSession}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Sair da Sessão
        </Button>
        <div className="text-center">
          <h1 className="text-xl font-bold">Revisão de Cartões</h1>
          {currentDeck && (
            <p className="text-sm text-muted-foreground">{currentDeck.name}</p>
          )}
        </div>
        <div className="w-24" /> {/* Spacer para balancear o layout */}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            Cartão {currentCardIndex + 1} de {dueCards.length}
          </span>
          <span>{progress}% concluído</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="shadow-lg border-2">
        <CardContent className="p-6 min-h-[250px] flex flex-col justify-center">
          {!revealedAnswer ? (
            // Frente do cartão (pergunta)
            <div className="prose max-w-none">
              <div
                className="text-center text-lg"
                dangerouslySetInnerHTML={{ __html: currentCard.front }}
              />
            </div>
          ) : (
            // Verso do cartão (resposta)
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Pergunta:
                </div>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentCard.front }}
                />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Resposta:
                </div>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentCard.back }}
                />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 bg-muted/30 flex flex-col sm:flex-row justify-center gap-4">
          {!revealedAnswer ? (
            <Button
              onClick={revealAnswer}
              variant="outline"
              className="px-8"
              size="lg"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Mostrar Resposta
              <span className="ml-2 opacity-70 text-xs">(Espaço)</span>
            </Button>
          ) : (
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 justify-center w-full">
              <Button
                onClick={() => handleSubmit("again")}
                variant="outline"
                className={cn(
                  "border-red-200 hover:bg-red-50 hover:text-red-600",
                  "transition-all duration-200"
                )}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                <div className="flex flex-col items-start">
                  <span>
                    Novamente <span className="text-xs opacity-70">(1)</span>
                  </span>
                  <span className="text-xs opacity-70">&lt;1 dia</span>
                </div>
              </Button>
              <Button
                onClick={() => handleSubmit("hard")}
                variant="outline"
                className={cn(
                  "border-orange-200 hover:bg-orange-50 hover:text-orange-600",
                  "transition-all duration-200"
                )}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                <div className="flex flex-col items-start">
                  <span>
                    Difícil <span className="text-xs opacity-70">(2)</span>
                  </span>
                  <span className="text-xs opacity-70">~1 dia</span>
                </div>
              </Button>
              <Button
                onClick={() => handleSubmit("good")}
                variant="outline"
                className={cn(
                  "border-green-200 hover:bg-green-50 hover:text-green-600",
                  "transition-all duration-200"
                )}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                <div className="flex flex-col items-start">
                  <span>
                    Bom <span className="text-xs opacity-70">(3)</span>
                  </span>
                  <span className="text-xs opacity-70">~3 dias</span>
                </div>
              </Button>
              <Button
                onClick={() => handleSubmit("easy")}
                variant="outline"
                className={cn(
                  "border-blue-200 hover:bg-blue-50 hover:text-blue-600",
                  "transition-all duration-200"
                )}
              >
                <Check className="h-4 w-4 mr-1" />
                <div className="flex flex-col items-start">
                  <span>
                    Fácil <span className="text-xs opacity-70">(4)</span>
                  </span>
                  <span className="text-xs opacity-70">~7 dias</span>
                </div>
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>
            Intervalo atual: {currentCard.interval}{" "}
            {currentCard.interval === 1 ? "dia" : "dias"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Keyboard className="h-3 w-3" />
          <span>Use teclas 1-4 para avaliar</span>
        </div>
      </div>
    </div>
  );
};

export default StudySession;
