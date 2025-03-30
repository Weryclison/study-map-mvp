import React, { useState } from "react";
import { useRSVP } from "@/contexts/RSVPContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface RSVPSettingsProps {
  onClose?: () => void;
}

const RSVPSettings: React.FC<RSVPSettingsProps> = ({ onClose }) => {
  const { settings, updateSettings } = useRSVP();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    if (onClose) {
      onClose();
    }
  };

  const handleWPMChange = (value: number[]) => {
    setLocalSettings((prev) => ({
      ...prev,
      defaultWPM: value[0],
    }));
  };

  const handleFontSizeChange = (value: number[]) => {
    setLocalSettings((prev) => ({
      ...prev,
      fontSize: value[0],
    }));
  };

  const handleFocusPointChange = (value: "center" | "left" | "right") => {
    setLocalSettings((prev) => ({
      ...prev,
      focusPoint: value,
    }));
  };

  const handleColorModeChange = (value: "normal" | "dark" | "bionic") => {
    setLocalSettings((prev) => ({
      ...prev,
      colorMode: value,
    }));
  };

  const handleProgressBarChange = (checked: boolean) => {
    setLocalSettings((prev) => ({
      ...prev,
      showProgressBar: checked,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="defaultWPM">Velocidade padrão (WPM)</Label>
            <span className="text-sm font-medium">
              {localSettings.defaultWPM} palavras/min
            </span>
          </div>
          <Slider
            id="defaultWPM"
            min={100}
            max={1000}
            step={10}
            value={[localSettings.defaultWPM]}
            onValueChange={handleWPMChange}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Lento (100)</span>
            <span>Rápido (1000)</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="fontSize">Tamanho da fonte</Label>
            <span className="text-sm font-medium">
              {localSettings.fontSize}px
            </span>
          </div>
          <Slider
            id="fontSize"
            min={16}
            max={72}
            step={2}
            value={[localSettings.fontSize]}
            onValueChange={handleFontSizeChange}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Pequeno</span>
            <span>Grande</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="focusPoint">Ponto de foco</Label>
          <Select
            value={localSettings.focusPoint}
            onValueChange={(value) => handleFocusPointChange(value as any)}
          >
            <SelectTrigger id="focusPoint">
              <SelectValue placeholder="Selecione a posição do ponto de foco" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Esquerda</SelectItem>
              <SelectItem value="center">Centro</SelectItem>
              <SelectItem value="right">Direita</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="colorMode">Modo de cor</Label>
          <Select
            value={localSettings.colorMode}
            onValueChange={(value) => handleColorModeChange(value as any)}
          >
            <SelectTrigger id="colorMode">
              <SelectValue placeholder="Selecione o modo de cor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="dark">Escuro</SelectItem>
              <SelectItem value="bionic">Biônico</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            O modo Biônico realça as primeiras letras de cada palavra para
            facilitar a leitura.
          </p>
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="progressBar">Mostrar barra de progresso</Label>
          <Switch
            id="progressBar"
            checked={localSettings.showProgressBar}
            onCheckedChange={handleProgressBarChange}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        )}
        <Button onClick={handleSave}>Salvar configurações</Button>
      </div>
    </div>
  );
};

export default RSVPSettings;
