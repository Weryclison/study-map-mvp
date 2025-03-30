import React from "react";
import { useUser } from "@/contexts/UserContext";
import { useStudy } from "@/contexts/StudyContext";
import { BookOpen, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const Header = () => {
  const { user, isAuthenticated } = useUser();
  const { selectedMethod } = useStudy();
  const navigate = useNavigate();

  return (
    <header className="border-b py-4 px-6 bg-background">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-study-primary" />
          <h1
            className="text-xl font-bold text-foreground cursor-pointer"
            onClick={() => navigate("/")}
          >
            ConcursaApp
          </h1>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated && (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate("/methods")}
                className={selectedMethod ? "text-study-primary" : ""}
              >
                Métodos de Estudo
              </Button>
              <Button variant="ghost" onClick={() => navigate("/progress")}>
                <BarChart className="h-5 w-5 mr-2" />
                Progresso
              </Button>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium hidden md:inline-block">
                Olá, {user.name.split(" ")[0]}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/profile")}
              >
                Perfil
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => navigate("/")}
              className="bg-study-primary hover:bg-study-primary/90"
            >
              Começar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
