import React from "react";
import { useNavigate } from "react-router-dom";
import { useStudy } from "@/contexts/StudyContext";
import { Clock, BookOpen, BookMarked, Zap } from "lucide-react";
import StudyMethodCard from "@/components/StudyMethodCard";

const MethodSelection = () => {
  const { selectMethod } = useStudy();
  const navigate = useNavigate();

  const handleMethodSelect = (
    method: "pomodoro" | "anki" | "rsvp" | "challenge"
  ) => {
    selectMethod(method);

    switch (method) {
      case "pomodoro":
        navigate("/pomodoro");
        break;
      case "anki":
        navigate("/anki");
        break;
      case "rsvp":
        navigate("/rsvp");
        break;
      case "challenge":
        navigate("/challenge");
        break;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">
          Escolha seu método de estudo
        </h1>
        <p className="text-muted-foreground">
          Cada método possui vantagens específicas. Escolha o que mais se adapta
          à sua necessidade atual.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StudyMethodCard
          title="Pomodoro"
          description="Estude com intervalos definidos para maximizar seu foco e produtividade"
          icon={<Clock className="h-12 w-12" />}
          onClick={() => handleMethodSelect("pomodoro")}
        />

        <StudyMethodCard
          title="Anki (Flashcards)"
          description="Use repetição espaçada para memorizar informações de forma eficiente"
          icon={<BookOpen className="h-12 w-12" />}
          onClick={() => handleMethodSelect("anki")}
        />

        <StudyMethodCard
          title="RSVP"
          description="Leitura rápida para absorver mais conteúdo em menos tempo"
          icon={<BookMarked className="h-12 w-12" />}
          onClick={() => handleMethodSelect("rsvp")}
        />

        <StudyMethodCard
          title="Desafio Relâmpago"
          description="Teste seus conhecimentos com questões rápidas e cronometradas"
          icon={<Zap className="h-12 w-12" />}
          onClick={() => handleMethodSelect("challenge")}
        />
      </div>

      <div className="mt-12 bg-muted/50 p-6 rounded-lg border border-border">
        <h3 className="text-xl font-bold mb-4">Dica de estudo</h3>
        <p className="mb-4">
          Para resultados ideais, combine diferentes métodos de estudo:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Use <strong>Pomodoro</strong> para sessões focadas de aprendizado.
          </li>
          <li>
            Reforce com <strong>Anki</strong> para memorização de conceitos
            importantes.
          </li>
          <li>
            Pratique leitura rápida com <strong>RSVP</strong> para revisões.
          </li>
          <li>
            Verifique seu entendimento com <strong>Desafios Relâmpago</strong>.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MethodSelection;
