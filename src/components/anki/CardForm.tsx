import React, { useState, useEffect } from "react";
import { useAnki } from "@/contexts/AnkiContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface CardFormProps {
  deckId: string;
  cardId?: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const CardForm: React.FC<CardFormProps> = ({
  deckId,
  cardId,
  onCancel,
  onSuccess,
}) => {
  const { createCard, updateCard, cards, getDeckById } = useAnki();
  const { toast } = useToast();
  const isEditing = !!cardId;

  const [formData, setFormData] = useState({
    front: "",
    back: "",
  });

  const [errors, setErrors] = useState({
    front: "",
    back: "",
  });

  const deck = getDeckById(deckId);

  // Carregar dados do cartão se estiver editando
  useEffect(() => {
    if (isEditing && cardId) {
      const card = cards.find((c) => c.id === cardId);
      if (card) {
        setFormData({
          front: card.front,
          back: card.back,
        });
      }
    }
  }, [isEditing, cardId, cards]);

  const validate = (): boolean => {
    const newErrors = {
      front: "",
      back: "",
    };

    if (!formData.front.trim()) {
      newErrors.front = "A frente do cartão é obrigatória";
    }

    if (!formData.back.trim()) {
      newErrors.back = "O verso do cartão é obrigatório";
    }

    setErrors(newErrors);

    return !newErrors.front && !newErrors.back;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      if (isEditing && cardId) {
        updateCard(cardId, {
          front: formData.front,
          back: formData.back,
        });
        toast({
          title: "Cartão atualizado",
          description: "O cartão foi atualizado com sucesso.",
        });
      } else {
        createCard(deckId, formData.front, formData.back);
        toast({
          title: "Cartão criado",
          description: "Seu novo cartão foi criado com sucesso.",
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o cartão.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={onCancel} className="mr-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Editar Cartão" : "Novo Cartão"}
          </h1>
          {deck && (
            <p className="text-sm text-muted-foreground">
              Baralho: {deck.name}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Label htmlFor="front">Frente (Pergunta)</Label>
            <Textarea
              id="front"
              name="front"
              value={formData.front}
              onChange={handleChange}
              placeholder="Digite a pergunta ou conceito"
              className="min-h-[150px]"
            />
            {errors.front && (
              <p className="text-sm text-red-500">{errors.front}</p>
            )}
          </div>

          <div className="space-y-4">
            <Label htmlFor="back">Verso (Resposta)</Label>
            <Textarea
              id="back"
              name="back"
              value={formData.back}
              onChange={handleChange}
              placeholder="Digite a resposta ou explicação"
              className="min-h-[150px]"
            />
            {errors.back && (
              <p className="text-sm text-red-500">{errors.back}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Pré-visualização</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: formData.front || "Frente do cartão",
                  }}
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: formData.back || "Verso do cartão",
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? "Atualizar Cartão" : "Criar Cartão"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CardForm;
