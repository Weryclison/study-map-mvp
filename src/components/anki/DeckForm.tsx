import React, { useState, useEffect } from "react";
import { useAnki, Deck } from "@/contexts/AnkiContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Save, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeckFormProps {
  deckId?: string;
  onCancel: () => void;
  onSuccess: (deckId: string) => void;
}

const DeckForm: React.FC<DeckFormProps> = ({ deckId, onCancel, onSuccess }) => {
  const { createDeck, updateDeck, getDeckById, deleteDeck } = useAnki();
  const { toast } = useToast();
  const isEditing = !!deckId;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#4F46E5", // Cor padrão - indigo
  });

  const [errors, setErrors] = useState({
    name: "",
    description: "",
  });

  // Carregar dados do baralho se estiver editando
  useEffect(() => {
    if (isEditing && deckId) {
      const deck = getDeckById(deckId);
      if (deck) {
        setFormData({
          name: deck.name,
          description: deck.description,
          color: deck.color,
        });
      }
    }
  }, [isEditing, deckId, getDeckById]);

  const validate = (): boolean => {
    const newErrors = {
      name: "",
      description: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "O nome do baralho é obrigatório";
    }

    if (!formData.description.trim()) {
      newErrors.description = "A descrição do baralho é obrigatória";
    }

    setErrors(newErrors);

    return !newErrors.name && !newErrors.description;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleColorChange = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      color,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      if (isEditing && deckId) {
        updateDeck(deckId, {
          name: formData.name,
          description: formData.description,
          color: formData.color,
        });
        toast({
          title: "Baralho atualizado",
          description: "O baralho foi atualizado com sucesso.",
        });
        onSuccess(deckId);
      } else {
        const newDeck = createDeck(
          formData.name,
          formData.description,
          formData.color
        );
        toast({
          title: "Baralho criado",
          description: "Seu novo baralho foi criado com sucesso.",
        });
        onSuccess(newDeck.id);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o baralho.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDeck = () => {
    if (deckId) {
      deleteDeck(deckId);
      toast({
        title: "Baralho excluído",
        description: "O baralho foi excluído permanentemente.",
      });
      onCancel();
    }
  };

  // Cores disponíveis
  const colorOptions = [
    { value: "#EF4444", name: "Vermelho" },
    { value: "#F59E0B", name: "Laranja" },
    { value: "#10B981", name: "Verde" },
    { value: "#3B82F6", name: "Azul" },
    { value: "#8B5CF6", name: "Roxo" },
    { value: "#EC4899", name: "Rosa" },
    { value: "#6B7280", name: "Cinza" },
    { value: "#4F46E5", name: "Índigo" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button variant="ghost" onClick={onCancel} className="mr-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? "Editar Baralho" : "Novo Baralho"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Baralho</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Matemática Básica"
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descreva o conteúdo deste baralho"
            rows={3}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Cor do Baralho</Label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`h-8 w-8 rounded-full ring-offset-2 transition-all ${
                  formData.color === color.value ? "ring-2 ring-black" : ""
                }`}
                style={{ backgroundColor: color.value }}
                onClick={() => handleColorChange(color.value)}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          {isEditing && (
            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  title="Excluir Baralho"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá
                    permanentemente o baralho e todos os seus cartões.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteDeck}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Excluir Permanentemente
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <div className="flex ml-auto gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Atualizar Baralho" : "Criar Baralho"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DeckForm;
