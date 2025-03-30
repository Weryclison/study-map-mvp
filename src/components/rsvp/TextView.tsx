import React from "react";
import { useRSVP } from "@/contexts/RSVPContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronLeft, Edit, Play, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TextViewProps {
  textId: string;
  onBack: () => void;
  onEdit: () => void;
  onRead: () => void;
}

const TextView: React.FC<TextViewProps> = ({
  textId,
  onBack,
  onEdit,
  onRead,
}) => {
  const { getTextById } = useRSVP();
  const text = getTextById(textId);

  if (!text) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-xl font-semibold">Texto não encontrado</h2>
        <Button variant="secondary" onClick={onBack} className="mt-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar para textos
        </Button>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Calcular tempo estimado de leitura
  const calculateReadingTime = (content: string, wpm: number): string => {
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const minutes = Math.ceil(wordCount / wpm);

    if (minutes < 1) {
      return "menos de 1 minuto";
    } else if (minutes === 1) {
      return "1 minuto";
    } else {
      return `${minutes} minutos`;
    }
  };

  const readingTime = calculateReadingTime(text.content, text.wpm);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">{text.title}</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button onClick={onRead}>
            <Play className="h-4 w-4 mr-2" />
            Ler agora
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo</CardTitle>
              <CardDescription>Texto completo para RSVP</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="whitespace-pre-wrap">{text.content}</div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Velocidade</h3>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{text.wpm} palavras por minuto</span>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-1">Tempo estimado de leitura</h3>
                <p className="text-muted-foreground">{readingTime}</p>
              </div>

              <div>
                <h3 className="font-medium mb-1">Última leitura</h3>
                <p className="text-muted-foreground">
                  {formatDate(text.lastReadAt)}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-1">Criado em</h3>
                <p className="text-muted-foreground">
                  {formatDate(text.createdAt)}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-1">Cor</h3>
                <div className="flex items-center">
                  <div
                    className="h-4 w-4 rounded-full mr-2"
                    style={{ backgroundColor: text.color }}
                  />
                  <span className="text-muted-foreground">{text.color}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TextView;
