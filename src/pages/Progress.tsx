import React, { useState } from "react";
import { useStudy } from "@/contexts/StudyContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, BookOpen, BookMarked, Zap } from "lucide-react";
import ProgressChart from "@/components/ProgressChart";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const Progress = () => {
  const { studySessions } = useStudy();
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">(
    "daily"
  );
  const { toast } = useToast();

  // Calculate total study time
  const calculateTotalTime = () => {
    return studySessions.reduce(
      (total, session) => total + session.duration,
      0
    );
  };

  // Calculate time per method
  const calculateMethodTime = (
    method: "pomodoro" | "anki" | "rsvp" | "challenge" | null
  ) => {
    return studySessions
      .filter((session) => session.method === method)
      .reduce((total, session) => total + session.duration, 0);
  };

  // Get most used study method
  const getMostUsedMethod = () => {
    const methods = ["pomodoro", "anki", "rsvp", "challenge"] as const;
    let maxTime = 0;
    let mostUsed: (typeof methods)[number] | null = null;

    methods.forEach((method) => {
      const time = calculateMethodTime(method);
      if (time > maxTime) {
        maxTime = time;
        mostUsed = method;
      }
    });

    return mostUsed;
  };

  const mostUsedMethod = getMostUsedMethod();
  const totalTime = calculateTotalTime();

  // Method icons and names
  const methodInfo = {
    pomodoro: { name: "Pomodoro", icon: <Clock className="h-5 w-5" /> },
    anki: { name: "Anki (Flashcards)", icon: <BookOpen className="h-5 w-5" /> },
    rsvp: { name: "RSVP", icon: <BookMarked className="h-5 w-5" /> },
    challenge: { name: "Desafio Relâmpago", icon: <Zap className="h-5 w-5" /> },
  };

  // Function to format minutes into hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins} minutos`;
    } else if (mins === 0) {
      return `${hours} horas`;
    } else {
      return `${hours}h ${mins}min`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Seu Progresso</h1>
        <p className="text-muted-foreground">
          Acompanhe seu desempenho e visualize seu histórico de estudos
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Tempo total de estudo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(totalTime)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Em {studySessions.length} sessões
            </p>
          </CardContent>
        </Card>

        {(["pomodoro", "anki", "rsvp", "challenge"] as const).map((method) => (
          <Card key={method}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">
                {methodInfo[method].name}
              </CardTitle>
              <div className="text-muted-foreground">
                {methodInfo[method].icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatTime(calculateMethodTime(method))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(
                  (calculateMethodTime(method) / totalTime) * 100 || 0
                )}
                % do total
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Distribuição de tempo de estudo</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="daily"
            onValueChange={(v) => setTimeframe(v as any)}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="daily">Diário</TabsTrigger>
              <TabsTrigger value="weekly">Semanal</TabsTrigger>
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
            </TabsList>
            <TabsContent value="daily">
              <ProgressChart timeframe="daily" />
            </TabsContent>
            <TabsContent value="weekly">
              <ProgressChart timeframe="weekly" />
            </TabsContent>
            <TabsContent value="monthly">
              <ProgressChart timeframe="monthly" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {studySessions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Análise de desempenho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Método preferido</h3>
                {mostUsedMethod ? (
                  <div className="flex items-center gap-2 mt-1">
                    {methodInfo[mostUsedMethod].icon}
                    <span>{methodInfo[mostUsedMethod].name}</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Você ainda não tem um método preferido
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-medium">Recomendações</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                  {studySessions.length < 10 && (
                    <li>
                      Continue usando a aplicação para obter análises mais
                      precisas
                    </li>
                  )}
                  {calculateMethodTime("pomodoro") === 0 && (
                    <li>
                      Experimente o método Pomodoro para melhorar seu foco
                    </li>
                  )}
                  {calculateMethodTime("anki") === 0 && (
                    <li>
                      Use flashcards para melhorar sua memorização a longo prazo
                    </li>
                  )}
                  {calculateMethodTime("rsvp") === 0 && (
                    <li>
                      Teste o RSVP para aumentar sua velocidade de leitura
                    </li>
                  )}
                  {calculateMethodTime("challenge") === 0 && (
                    <li>
                      Faça desafios relâmpago para testar seu conhecimento
                    </li>
                  )}
                  {studySessions.length > 0 && (
                    <li>
                      Tente estudar em horários consistentes para criar um
                      hábito
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">
                Nenhum dado de estudo ainda!
              </h3>
              <p className="text-muted-foreground">
                Comece a usar os métodos de estudo para visualizar seu progresso
                aqui.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Progress;
