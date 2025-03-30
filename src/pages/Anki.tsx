import React, { useState } from "react";
import { useAnki } from "@/contexts/AnkiContext";
import {
  BookOpen,
  Plus,
  Settings,
  Edit,
  Trash2,
  ChevronRight,
  RotateCcw,
  Clock,
  LayoutGrid,
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { useStudy } from "@/contexts/StudyContext";

import DeckView from "@/components/anki/DeckView";
import StudySession from "@/components/anki/StudySession";
import DeckForm from "@/components/anki/DeckForm";
import CardForm from "@/components/anki/CardForm";

type AnkiView =
  | "decks"
  | "deck"
  | "study"
  | "newDeck"
  | "editDeck"
  | "newCard"
  | "editCard";

const Anki = () => {
  const { decks, getDueCards, getCurrentDeck, setCurrentDeck, studySession } =
    useAnki();
  const { toast } = useToast();
  const { selectMethod } = useStudy();

  // Ativar o método Anki no StudyContext
  React.useEffect(() => {
    selectMethod("anki");
  }, [selectMethod]);

  const [currentView, setCurrentView] = useState<AnkiView>("decks");
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const currentDeck = getCurrentDeck();

  const handleDeckSelect = (deckId: string) => {
    setSelectedDeckId(deckId);
    setCurrentDeck(deckId);
    setCurrentView("deck");
  };

  const handleStartStudy = (deckId: string) => {
    const dueCards = getDueCards(deckId);

    if (dueCards.length === 0) {
      toast({
        title: "Sem cartões para estudar",
        description: "Não há cartões pendentes para revisão neste baralho.",
      });
      return;
    }

    setSelectedDeckId(deckId);
    setCurrentDeck(deckId);
    studySession.startStudySession(deckId);
    setCurrentView("study");
  };

  const handleEditCard = (cardId: string) => {
    setSelectedCardId(cardId);
    setCurrentView("editCard");
  };

  const handleBackToDeck = () => {
    setCurrentView("deck");
    setSelectedCardId(null);
  };

  const handleBackToDecks = () => {
    setCurrentView("decks");
    setSelectedDeckId(null);
  };

  const renderView = () => {
    switch (currentView) {
      case "decks":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Meus Baralhos</h1>
              <Button
                onClick={() => setCurrentView("newDeck")}
                variant="default"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Baralho
              </Button>
            </div>

            {decks.length === 0 ? (
              <Card className="border-dashed border-2 p-6">
                <div className="text-center space-y-4">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground" />
                  <h3 className="text-xl font-medium">Sem Baralhos</h3>
                  <p className="text-muted-foreground">
                    Você ainda não criou nenhum baralho. Comece criando seu
                    primeiro baralho.
                  </p>
                  <Button onClick={() => setCurrentView("newDeck")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Baralho
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {decks.map((deck) => (
                  <Card
                    key={deck.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleDeckSelect(deck.id)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{deck.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {deck.description}
                          </CardDescription>
                        </div>
                        <div
                          className="h-5 w-5 rounded-full"
                          style={{ backgroundColor: deck.color }}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <LayoutGrid className="h-4 w-4 mr-1" />
                          <span>{deck.totalCards} cartões</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{deck.dueCards} pendentes</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDeckId(deck.id);
                          setCurrentView("editDeck");
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
                          handleStartStudy(deck.id);
                        }}
                        disabled={deck.dueCards === 0}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        <span className="text-xs">Estudar</span>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case "deck":
        return (
          <DeckView
            deckId={selectedDeckId!}
            onBack={handleBackToDecks}
            onEdit={() => setCurrentView("editDeck")}
            onNewCard={() => setCurrentView("newCard")}
            onEditCard={handleEditCard}
            onStudy={() => handleStartStudy(selectedDeckId!)}
          />
        );

      case "study":
        return <StudySession onFinish={handleBackToDeck} />;

      case "newDeck":
        return (
          <DeckForm
            onCancel={handleBackToDecks}
            onSuccess={(deckId) => {
              setSelectedDeckId(deckId);
              setCurrentView("deck");
            }}
          />
        );

      case "editDeck":
        return (
          <DeckForm
            deckId={selectedDeckId!}
            onCancel={handleBackToDeck}
            onSuccess={() => setCurrentView("deck")}
          />
        );

      case "newCard":
        return (
          <CardForm
            deckId={selectedDeckId!}
            onCancel={handleBackToDeck}
            onSuccess={handleBackToDeck}
          />
        );

      case "editCard":
        return (
          <CardForm
            deckId={selectedDeckId!}
            cardId={selectedCardId!}
            onCancel={handleBackToDeck}
            onSuccess={handleBackToDeck}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">{renderView()}</div>
  );
};

export default Anki;
