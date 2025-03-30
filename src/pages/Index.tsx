
import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Clock, CheckCircle2, Brain } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";

const signupSchema = z.object({
  name: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  goals: z.string().min(10, { message: "Detalhe um pouco mais suas metas" }),
  preferredTopics: z.string(),
});

type SignupFormValues = z.infer<typeof signupSchema>;

const Index = () => {
  const { user, registerUser, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      goals: "",
      preferredTopics: "",
    },
  });

  const onSubmit = (data: SignupFormValues) => {
    const topics = data.preferredTopics
      .split(",")
      .map((topic) => topic.trim())
      .filter((topic) => topic !== "");

    registerUser({
      name: data.name,
      email: data.email,
      goals: data.goals,
      preferredTopics: topics,
    });

    toast({
      title: "Cadastro realizado com sucesso!",
      description: "Agora você pode começar sua jornada de estudos",
    });

    navigate("/methods");
  };

  if (isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">
            Bem-vindo de volta, {user.name.split(" ")[0]}!
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            Continue sua jornada de estudos para concursos
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button 
              className="bg-study-primary hover:bg-study-primary/90"
              onClick={() => navigate("/methods")}
              size="lg"
            >
              Continuar Estudando
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate("/progress")}
              size="lg"
            >
              Ver Progresso
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-16">
          <div className="study-card">
            <div className="flex justify-center mb-4">
              <Clock className="h-12 w-12 text-study-primary" />
            </div>
            <h3 className="text-xl font-bold text-center mb-2">
              Otimize seu tempo
            </h3>
            <p className="text-center text-muted-foreground">
              Use métodos científicos para maximizar a eficiência dos seus estudos e alcançar melhores resultados.
            </p>
          </div>

          <div className="study-card">
            <div className="flex justify-center mb-4">
              <Brain className="h-12 w-12 text-study-primary" />
            </div>
            <h3 className="text-xl font-bold text-center mb-2">
              Melhore sua retenção
            </h3>
            <p className="text-center text-muted-foreground">
              Técnicas baseadas em ciência cognitiva para ajudar você a memorizar e entender melhor os conteúdos.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="h-8 w-8 text-study-primary" />
            <h1 className="text-3xl font-bold">ConcursaApp</h1>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Estude de forma mais inteligente para seus concursos
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Ferramentas científicas que potencializam seus estudos e te ajudam a conquistar sua aprovação.
          </p>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-study-accent" />
              <span>Pomodoro Timer</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-study-accent" />
              <span>Repetição Espaçada</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-study-accent" />
              <span>Leitura Acelerada</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-study-accent" />
              <span>Desafios Relâmpago</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg border shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Comece sua jornada
          </h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="seu.email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="goals"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quais são suas metas de estudo?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva seus objetivos e concursos alvo"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferredTopics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temas preferidos (separados por vírgula)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Português, Matemática, Direito Constitucional"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-study-primary hover:bg-study-primary/90"
              >
                Criar conta
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Index;
