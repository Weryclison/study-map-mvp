import React, { useState, useEffect } from "react";
import { useRSVP } from "@/contexts/RSVPContext";
import {
  BookOpen,
  Plus,
  Settings,
  Edit,
  Trash2,
  ChevronRight,
  Clock,
  Play,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { useStudy } from "@/contexts/StudyContext";

import TextForm from "@/components/rsvp/TextForm";
import TextView from "@/components/rsvp/TextView";
import RSVPReader from "@/components/rsvp/RSVPReader";
import RSVPSettings from "@/components/rsvp/RSVPSettings";

type RSVPView =
  | "texts"
  | "text"
  | "reading"
  | "newText"
  | "editText"
  | "settings";

const RSVP = () => {
  const { texts, getCurrentText, setCurrentText, rsvpSession, settings } =
    useRSVP();
  const { toast } = useToast();
  const { selectMethod } = useStudy();

  // Ativar o método RSVP no StudyContext
  useEffect(() => {
    selectMethod("rsvp");
  }, [selectMethod]);

  const [currentView, setCurrentView] = useState<RSVPView>("texts");
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const currentText = getCurrentText();

  const handleTextSelect = (textId: string) => {
    setSelectedTextId(textId);
    setCurrentText(textId);
    setCurrentView("text");
  };

  const handleStartReading = (textId: string) => {
    setSelectedTextId(textId);
    setCurrentText(textId);
    rsvpSession.startReading(textId);
    setCurrentView("reading");
  };

  const handleBackToTexts = () => {
    setCurrentView("texts");
    setSelectedTextId(null);
  };

  const handleBackToText = () => {
    if (rsvpSession.isActive) {
      rsvpSession.endReading();
    }
    setCurrentView("text");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const renderView = () => {
    switch (currentView) {
      case "texts":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Meus Textos</h1>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setIsSettingsOpen(true)}
                  variant="outline"
                  size="icon"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setCurrentView("newText")}
                  variant="default"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Texto
                </Button>
              </div>
            </div>

            {texts.length === 0 ? (
              <Card className="border-dashed border-2 p-6">
                <div className="text-center space-y-4">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground" />
                  <h3 className="text-xl font-medium">Sem Textos</h3>
                  <p className="text-muted-foreground">
                    Você ainda não criou nenhum texto para leitura RSVP. Comece
                    criando seu primeiro texto.
                  </p>
                  <Button onClick={() => setCurrentView("newText")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Texto
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {texts.map((text) => (
                  <Card
                    key={text.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleTextSelect(text.id)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{text.title}</CardTitle>
                          <CardDescription className="mt-1 line-clamp-2">
                            {text.content.substring(0, 100)}
                            {text.content.length > 100 ? "..." : ""}
                          </CardDescription>
                        </div>
                        <div
                          className="h-5 w-5 rounded-full"
                          style={{ backgroundColor: text.color }}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{text.wpm} WPM</span>
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Última leitura: {formatDate(text.lastReadAt)}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTextId(text.id);
                          setCurrentView("editText");
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        <span className="text-xs">Editar</span>
                      </Button>

                      <Button
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartReading(text.id);
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        <span className="text-xs">Ler</span>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

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

      case "text":
        return (
          <TextView
            textId={selectedTextId!}
            onBack={handleBackToTexts}
            onEdit={() => setCurrentView("editText")}
            onRead={() => handleStartReading(selectedTextId!)}
          />
        );

      case "reading":
        return <RSVPReader onFinish={handleBackToText} />;

      case "newText":
        return (
          <TextForm
            onCancel={handleBackToTexts}
            onSuccess={(textId) => {
              setSelectedTextId(textId);
              setCurrentView("text");
            }}
          />
        );

      case "editText":
        return (
          <TextForm
            textId={selectedTextId!}
            onCancel={() => setCurrentView("text")}
            onSuccess={() => setCurrentView("text")}
          />
        );

      default:
        return null;
    }
  };

  return <div className="container py-6">{renderView()}</div>;
};

export default RSVP;
