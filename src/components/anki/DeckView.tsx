import React, { useState } from "react";
import { useAnki } from "@/contexts/AnkiContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  ChevronLeft,
  Edit,
  Trash2,
  Plus,
  Play,
  Search,
  Clock,
  RotateCcw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useToast } from "@/components/ui/use-toast";

interface DeckViewProps {
  deckId: string;
  onBack: () => void;
  onEdit: () => void;
  onNewCard: () => void;
  onEditCard: (cardId: string) => void;
  onStudy: () => void;
}

const DeckView: React.FC<DeckViewProps> = ({
  deckId,
  onBack,
  onEdit,
  onNewCard,
  onEditCard,
  onStudy,
}) => {
  const { getDeckById, getCardsForDeck, getDueCards, deleteCard } = useAnki();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  const deck = getDeckById(deckId);
  const cards = getCardsForDeck(deckId);
  const dueCards = getDueCards(deckId);

  if (!deck) {
    return (
      <div className="text-center py-12">
        <p>Baralho não encontrado.</p>
        <Button onClick={onBack} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  const filteredCards = searchTerm
    ? cards.filter(
        (card) =>
          card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.back.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : cards;

  const handleDeleteCard = () => {
    if (cardToDelete) {
      deleteCard(cardToDelete);
      setCardToDelete(null);
      toast({
        title: "Cartão excluído",
        description: "O cartão foi removido com sucesso.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center">
          <Button variant="ghost" onClick={onBack} className="mr-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {deck.name}
              <div
                className="h-3 w-3 rounded-full inline-block"
                style={{ backgroundColor: deck.color }}
              />
            </h1>
            <p className="text-sm text-muted-foreground">{deck.description}</p>
          </div>
        </div>
        <div className="flex gap-2 self-end sm:self-auto">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button size="sm" onClick={onStudy} disabled={dueCards.length === 0}>
            <Play className="h-4 w-4 mr-1" />
            Estudar ({dueCards.length})
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground mr-1">Total:</span>
            <span className="font-medium">{cards.length}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
            <span className="text-sm text-muted-foreground mr-1">
              Pendentes:
            </span>
            <span className="font-medium">{dueCards.length}</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onNewCard}>
          <Plus className="h-4 w-4 mr-1" />
          Novo Cartão
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cartões..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredCards.length === 0 ? (
        <div className="text-center py-8">
          {cards.length === 0 ? (
            <>
              <p className="text-muted-foreground mb-4">
                Este baralho ainda não tem cartões. Comece a adicionar cartões
                agora!
              </p>
              <Button onClick={onNewCard}>
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Cartão
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">
              Nenhum cartão encontrado para "{searchTerm}"
            </p>
          )}
        </div>
      ) : (
        <ScrollArea className="h-[400px] rounded-md border p-4">
          <div className="space-y-4">
            {filteredCards.map((card) => (
              <Card key={card.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                    <div className="p-4">
                      <div className="font-medium mb-1 text-sm text-muted-foreground">
                        Pergunta
                      </div>
                      <div
                        className="prose max-w-none prose-sm"
                        dangerouslySetInnerHTML={{ __html: card.front }}
                      />
                    </div>
                    <div className="p-4">
                      <div className="font-medium mb-1 text-sm text-muted-foreground">
                        Resposta
                      </div>
                      <div
                        className="prose max-w-none prose-sm"
                        dangerouslySetInnerHTML={{ __html: card.back }}
                      />
                    </div>
                  </div>
                  <div className="bg-muted/50 px-4 py-2 flex justify-between items-center text-xs text-muted-foreground">
                    <div className="flex gap-4">
                      <div>
                        Próxima revisão:{" "}
                        <span className="font-medium">
                          {formatDate(card.dueDate)}
                        </span>
                      </div>
                      <div>
                        Intervalo:{" "}
                        <span className="font-medium">
                          {card.interval} {card.interval === 1 ? "dia" : "dias"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onEditCard(card.id)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500 hover:text-red-600"
                            onClick={() => setCardToDelete(card.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Excluir cartão</DialogTitle>
                            <DialogDescription>
                              Tem certeza que deseja excluir este cartão? Esta
                              ação não pode ser desfeita.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button
                                variant="destructive"
                                onClick={handleDeleteCard}
                              >
                                Excluir
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default DeckView;
