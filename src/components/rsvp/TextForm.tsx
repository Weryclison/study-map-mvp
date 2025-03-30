import React, { useState, useEffect } from "react";
import { useRSVP, RSVPText } from "@/contexts/RSVPContext";
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
import { Slider } from "@/components/ui/slider";

interface TextFormProps {
  textId?: string;
  onCancel: () => void;
  onSuccess: (textId: string) => void;
}

const TextForm: React.FC<TextFormProps> = ({ textId, onCancel, onSuccess }) => {
  const { createText, updateText, getTextById, deleteText, settings } =
    useRSVP();
  const { toast } = useToast();
  const isEditing = !!textId;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    color: "#3B82F6", // Azul por padrão
    wpm: 300, // Palavras por minuto padrão
  });

  const [errors, setErrors] = useState({
    title: "",
    content: "",
  });

  // Carregar dados do texto se estiver editando
  useEffect(() => {
    if (isEditing && textId) {
      const text = getTextById(textId);
      if (text) {
        setFormData({
          title: text.title,
          content: text.content,
          color: text.color,
          wpm: text.wpm,
        });
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        wpm: settings.defaultWPM,
      }));
    }
  }, [isEditing, textId, getTextById, settings.defaultWPM]);

  const validate = (): boolean => {
    const newErrors = {
      title: "",
      content: "",
    };

    if (!formData.title.trim()) {
      newErrors.title = "O título do texto é obrigatório";
    }

    if (!formData.content.trim()) {
      newErrors.content = "O conteúdo do texto é obrigatório";
    }

    setErrors(newErrors);

    return !newErrors.title && !newErrors.content;
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

  const handleWPMChange = (value: number[]) => {
    setFormData((prev) => ({
      ...prev,
      wpm: value[0],
    }));
  };

  const handleDeleteText = () => {
    if (textId) {
      deleteText(textId);
      toast({
        title: "Texto excluído",
        description: "O texto foi excluído permanentemente.",
      });
      onCancel();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      if (isEditing && textId) {
        updateText(textId, {
          title: formData.title,
          content: formData.content,
          color: formData.color,
          wpm: formData.wpm,
        });
        toast({
          title: "Texto atualizado",
          description: "O texto foi atualizado com sucesso.",
        });
        onSuccess(textId);
      } else {
        const newText = createText(
          formData.title,
          formData.content,
          formData.color,
          formData.wpm
        );
        toast({
          title: "Texto criado",
          description: "Seu novo texto foi criado com sucesso.",
        });
        onSuccess(newText.id);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o texto.",
        variant: "destructive",
      });
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
          {isEditing ? "Editar Texto" : "Novo Texto"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Ex: Artigo sobre produtividade"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Conteúdo</Label>
          <Textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Cole ou digite o texto que deseja ler com RSVP"
            rows={10}
          />
          {errors.content && (
            <p className="text-sm text-red-500">{errors.content}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Cor</Label>
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

        <div className="space-y-3">
          <div className="flex justify-between">
            <Label htmlFor="wpm">Velocidade (WPM)</Label>
            <span className="text-sm font-medium">
              {formData.wpm} palavras/min
            </span>
          </div>
          <Slider
            id="wpm"
            min={100}
            max={1000}
            step={10}
            value={[formData.wpm]}
            onValueChange={handleWPMChange}
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Lento (100)</span>
            <span>Rápido (1000)</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          {isEditing && (
            <AlertDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" title="Excluir Texto">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá
                    permanentemente este texto.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteText}
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
              {isEditing ? "Atualizar Texto" : "Criar Texto"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TextForm;
