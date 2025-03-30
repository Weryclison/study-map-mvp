import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard as CardIcon,
  Clock,
  XCircle,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useAnki } from "@/contexts/AnkiContext";
import type { Card as AnkiCard } from "@/contexts/AnkiContext";
import { useStudy } from "@/contexts/StudyContext";

const CHALLENGE_DURATION = 60; // 60 seconds
const QUESTIONS_COUNT = 10; // Number of questions to include

const Challenge = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { decks, cards } = useAnki();
  const { addStudySession } = useStudy();

  const [challengeCards, setChallengeCards] = useState<AnkiCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(CHALLENGE_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [sessionRegistered, setSessionRegistered] = useState(false);

  // Prepare random cards from all decks
  const prepareChallenge = useCallback(() => {
    if (cards.length === 0) {
      toast({
        title: "Sem cartões",
        description:
          "Você precisa criar cartões nos baralhos para poder realizar o desafio relâmpago.",
        variant: "destructive",
      });
      navigate("/anki");
      return;
    }

    // Get random cards from all decks
    const shuffled = [...cards].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(
      0,
      Math.min(QUESTIONS_COUNT, shuffled.length)
    );
    setChallengeCards(selected);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setTimeLeft(CHALLENGE_DURATION);
    setCorrectAnswers(0);
    setAnsweredQuestions(0);
    setChallengeComplete(false);
    setSessionRegistered(false);
  }, [cards, navigate, toast]);

  // Start timer
  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setChallengeComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  // Log study session when challenge completes
  useEffect(() => {
    if (challengeComplete && !sessionRegistered) {
      addStudySession({
        date: new Date().toISOString(),
        method: "challenge",
        duration: 1,
        topic: "Desafio Relâmpago",
      });
      setSessionRegistered(true);
    }
  }, [challengeComplete, addStudySession, sessionRegistered]);

  const startChallenge = () => {
    prepareChallenge();
    setIsActive(true);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setCorrectAnswers((prev) => prev + 1);
    }

    setAnsweredQuestions((prev) => prev + 1);
    setShowAnswer(false);

    // Move to next card
    if (currentCardIndex < challengeCards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      setChallengeComplete(true);
    }
  };

  const handleExit = () => {
    if (isActive && !challengeComplete && !sessionRegistered) {
      addStudySession({
        date: new Date().toISOString(),
        method: "challenge",
        duration: 1,
        topic: "Desafio Relâmpago (parcial)",
      });
      setSessionRegistered(true);
    }
    navigate("/methods");
  };

  const restartChallenge = () => {
    startChallenge();
  };

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="container max-w-4xl py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <CardIcon className="h-6 w-6 text-pink-500" />
          <h1 className="text-2xl font-bold">Desafio Relâmpago</h1>
        </div>
        <Button variant="outline" size="icon" onClick={handleExit}>
          <XCircle className="h-5 w-5" />
        </Button>
      </div>

      {!isActive && !challengeComplete ? (
        <Card>
          <CardHeader>
            <CardTitle>Desafio Relâmpago</CardTitle>
            <CardDescription>
              Teste seus conhecimentos com perguntas aleatórias de todos os seus
              baralhos. Responda o máximo de perguntas que conseguir em{" "}
              {CHALLENGE_DURATION} segundos!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span>{CHALLENGE_DURATION} segundos</span>
              </div>
              <div className="flex items-center gap-2">
                <CardIcon className="h-5 w-5 text-muted-foreground" />
                <span>
                  ~{Math.min(QUESTIONS_COUNT, cards.length)} perguntas
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={startChallenge} className="w-full">
              Iniciar Desafio
            </Button>
          </CardFooter>
        </Card>
      ) : challengeComplete ? (
        <Card>
          <CardHeader>
            <CardTitle>Desafio Concluído!</CardTitle>
            <CardDescription>
              Você respondeu {answeredQuestions} perguntas em{" "}
              {CHALLENGE_DURATION - timeLeft} segundos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold mb-2">
                {correctAnswers}/{answeredQuestions}
              </div>
              <div className="text-muted-foreground">respostas corretas</div>
            </div>
            <Progress
              value={(correctAnswers / Math.max(answeredQuestions, 1)) * 100}
              className="h-2 mb-4"
            />
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" className="w-1/2" onClick={handleExit}>
              Sair
            </Button>
            <Button className="w-1/2" onClick={restartChallenge}>
              Tentar Novamente
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-pink-500" />
              <span className="font-semibold">{formatTime(timeLeft)}</span>
            </div>
            <div>
              Pergunta {currentCardIndex + 1}/{challengeCards.length}
            </div>
          </div>

          <Progress
            value={(timeLeft / CHALLENGE_DURATION) * 100}
            className="h-2 mb-6"
          />

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Pergunta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="min-h-24 flex items-center justify-center">
                <p className="text-lg text-center">
                  {challengeCards[currentCardIndex]?.front || "Carregando..."}
                </p>
              </div>
              {showAnswer && (
                <div className="mt-4 border-t pt-4">
                  <p className="text-lg text-center">
                    {challengeCards[currentCardIndex]?.back || "Carregando..."}
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter>
              {!showAnswer ? (
                <Button onClick={handleShowAnswer} className="w-full">
                  Mostrar Resposta
                </Button>
              ) : (
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    className="w-1/2"
                    onClick={() => handleAnswer(false)}
                  >
                    <XCircle className="h-5 w-5 mr-2 text-red-500" />
                    Incorreto
                  </Button>
                  <Button className="w-1/2" onClick={() => handleAnswer(true)}>
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    Correto
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  );
};

export default Challenge;
