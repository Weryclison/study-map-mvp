
import React from "react";
import { Card } from "@/components/ui/card";

interface StudyMethodCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const StudyMethodCard: React.FC<StudyMethodCardProps> = ({
  title,
  description,
  icon,
  onClick,
}) => {
  return (
    <Card 
      className="method-card group" 
      onClick={onClick}
    >
      <div className="mb-4 text-study-primary group-hover:text-study-accent transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground text-center">{description}</p>
    </Card>
  );
};

export default StudyMethodCard;
