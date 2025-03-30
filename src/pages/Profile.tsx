
import React from "react";
import { useUser } from "@/contexts/UserContext";
import { useStudy } from "@/contexts/StudyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const { user, updateUser } = useUser();
  const { studySessions } = useStudy();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = React.useState({
    name: user.name,
    email: user.email,
    goals: user.goals,
    preferredTopics: user.preferredTopics.join(", "),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const topics = formData.preferredTopics
      .split(",")
      .map((topic) => topic.trim())
      .filter((topic) => topic !== "");

    updateUser({
      name: formData.name,
      email: formData.email,
      goals: formData.goals,
      preferredTopics: topics,
    });

    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram atualizadas com sucesso",
    });
  };

  // Calculate total study time
  const calculateTotalTime = () => {
    return studySessions.reduce((total, session) => total + session.duration, 0);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Seu Perfil</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações e acompanhe seu progresso
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Informações pessoais</CardTitle>
                <CardDescription>
                  Atualize seus dados de perfil e objetivos de estudo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals">Metas de estudo</Label>
                  <Textarea
                    id="goals"
                    name="goals"
                    value={formData.goals}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredTopics">
                    Temas preferidos (separados por vírgula)
                  </Label>
                  <Input
                    id="preferredTopics"
                    name="preferredTopics"
                    value={formData.preferredTopics}
                    onChange={handleChange}
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit"
                    className="bg-study-primary hover:bg-study-primary/90"
                  >
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resumo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Tempo total de estudo</div>
                  <div className="text-2xl font-bold">
                    {Math.floor(calculateTotalTime() / 60)} horas {calculateTotalTime() % 60} min
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Sessões de estudo</div>
                  <div className="text-2xl font-bold">{studySessions.length}</div>
                </div>

                {user.preferredTopics.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-2">Tópicos de interesse</div>
                    <div className="flex flex-wrap gap-2">
                      {user.preferredTopics.map((topic) => (
                        <Badge key={topic} variant="secondary">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t">
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/progress")}
                >
                  Ver Análise Completa
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate("/methods")}
              >
                Escolher método de estudo
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-500 hover:text-red-600"
                onClick={() => {
                  localStorage.clear();
                  toast({
                    title: "Dados apagados",
                    description: "Todos os seus dados foram removidos com sucesso",
                  });
                  navigate("/");
                  window.location.reload();
                }}
              >
                Limpar todos os dados
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
