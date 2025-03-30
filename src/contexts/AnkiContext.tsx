import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";

// Tipos para o Anki
export interface Card {
  id: string;
  front: string; // Frente do cartão (pergunta)
  back: string; // Verso do cartão (resposta)
  deckId: string;
  dueDate: string; // Data em que o cartão deve ser revisado novamente
  interval: number; // Intervalo em dias para a próxima revisão
  ease: number; // Fator de facilidade (multiplicador para o próximo intervalo)
  repetitions: number; // Número de repetições bem-sucedidas consecutivas
  createdAt: string;
  updatedAt: string;
  lastReviewedAt: string | null;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  color: string; // Cor para identificação visual
  createdAt: string;
  updatedAt: string;
  totalCards: number; // Total de cartões no baralho
  dueCards: number; // Cartões que devem ser estudados hoje
}

export type ReviewResult = "again" | "hard" | "good" | "easy";

interface AnkiContextType {
  decks: Deck[];
  cards: Card[];
  createDeck: (name: string, description: string, color: string) => Deck;
  updateDeck: (
    deckId: string,
    data: Partial<
      Omit<Deck, "id" | "createdAt" | "updatedAt" | "totalCards" | "dueCards">
    >
  ) => void;
  deleteDeck: (deckId: string) => void;
  createCard: (deckId: string, front: string, back: string) => Card;
  updateCard: (
    cardId: string,
    data: Partial<
      Omit<
        Card,
        | "id"
        | "createdAt"
        | "updatedAt"
        | "dueDate"
        | "interval"
        | "ease"
        | "repetitions"
        | "lastReviewedAt"
      >
    >
  ) => void;
  deleteCard: (cardId: string) => void;
  reviewCard: (cardId: string, result: ReviewResult) => void;
  getDueCards: (deckId: string) => Card[];
  getCardsForDeck: (deckId: string) => Card[];
  getCurrentDeck: () => Deck | null;
  setCurrentDeck: (deckId: string | null) => void;
  getDeckById: (deckId: string) => Deck | null;
  studySession: {
    isActive: boolean;
    currentCardIndex: number;
    dueCards: Card[];
    revealedAnswer: boolean;
    startStudySession: (deckId: string) => void;
    endStudySession: () => void;
    nextCard: () => void;
    revealAnswer: () => void;
    submitAnswer: (result: ReviewResult) => void;
  };
}

const AnkiContext = createContext<AnkiContextType>({
  decks: [],
  cards: [],
  createDeck: () => ({
    id: "",
    name: "",
    description: "",
    color: "",
    createdAt: "",
    updatedAt: "",
    totalCards: 0,
    dueCards: 0,
  }),
  updateDeck: () => {},
  deleteDeck: () => {},
  createCard: () => ({
    id: "",
    front: "",
    back: "",
    deckId: "",
    dueDate: "",
    interval: 0,
    ease: 0,
    repetitions: 0,
    createdAt: "",
    updatedAt: "",
    lastReviewedAt: null,
  }),
  updateCard: () => {},
  deleteCard: () => {},
  reviewCard: () => {},
  getDueCards: () => [],
  getCardsForDeck: () => [],
  getCurrentDeck: () => null,
  setCurrentDeck: () => {},
  getDeckById: () => null,
  studySession: {
    isActive: false,
    currentCardIndex: 0,
    dueCards: [],
    revealedAnswer: false,
    startStudySession: () => {},
    endStudySession: () => {},
    nextCard: () => {},
    revealAnswer: () => {},
    submitAnswer: () => {},
  },
});

export const useAnki = () => useContext(AnkiContext);

export const AnkiProvider = ({ children }: { children: ReactNode }) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentDeckId, setCurrentDeckId] = useState<string | null>(null);

  // Estado da sessão de estudo
  const [studySession, setStudySession] = useState({
    isActive: false,
    currentCardIndex: 0,
    dueCards: [] as Card[],
    revealedAnswer: false,
  });

  // Carregar dados do localStorage
  useEffect(() => {
    const savedDecks = localStorage.getItem("ankiDecks");
    const savedCards = localStorage.getItem("ankiCards");
    const savedCurrentDeck = localStorage.getItem("ankiCurrentDeck");

    if (savedDecks) {
      setDecks(JSON.parse(savedDecks));
    } else {
      // Criar um baralho padrão se não houver nenhum
      const defaultDeck = {
        id: generateId(),
        name: "Meu primeiro baralho",
        description: "Um baralho para começar seus estudos",
        color: "#4F46E5", // Indigo
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        totalCards: 0,
        dueCards: 0,
      };
      setDecks([defaultDeck]);
    }

    if (savedCards) {
      setCards(JSON.parse(savedCards));
    }

    if (savedCurrentDeck) {
      setCurrentDeckId(savedCurrentDeck);
    }
  }, []);

  // Salvar dados no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem("ankiDecks", JSON.stringify(decks));
  }, [decks]);

  useEffect(() => {
    localStorage.setItem("ankiCards", JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    if (currentDeckId) {
      localStorage.setItem("ankiCurrentDeck", currentDeckId);
    } else {
      localStorage.removeItem("ankiCurrentDeck");
    }
  }, [currentDeckId]);

  // Atualizar contadores de cartões nos baralhos quando os cartões mudam
  useEffect(() => {
    if (decks.length > 0) {
      const now = new Date().toISOString();
      const updatedDecks = decks.map((deck) => {
        const deckCards = cards.filter((card) => card.deckId === deck.id);
        const dueCards = deckCards.filter((card) => card.dueDate <= now);

        return {
          ...deck,
          totalCards: deckCards.length,
          dueCards: dueCards.length,
        };
      });

      setDecks(updatedDecks);
    }
  }, [cards]);

  // Funções auxiliares
  const generateId = (): string => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };

  // Calcula o próximo intervalo com base no algoritmo SM-2 (SuperMemo 2)
  const calculateNextInterval = (
    card: Card,
    result: ReviewResult
  ): {
    interval: number;
    ease: number;
    repetitions: number;
    dueDate: string;
  } => {
    let { interval, ease, repetitions } = card;

    // Valores padrão iniciais
    if (!interval) interval = 0;
    if (!ease) ease = 2.5;
    if (!repetitions) repetitions = 0;

    const now = new Date();

    // Ajustar com base na resposta
    switch (result) {
      case "again": // Resposta incorreta - resetar
        repetitions = 0;
        interval = 1;
        ease = Math.max(1.3, ease - 0.2);
        break;

      case "hard": // Difícil
        if (repetitions === 0) {
          interval = 1;
        } else {
          interval = Math.ceil(interval * 1.2);
        }
        ease = Math.max(1.3, ease - 0.15);
        repetitions += 1;
        break;

      case "good": // Correta
        if (repetitions === 0) {
          interval = 1;
        } else if (repetitions === 1) {
          interval = 6;
        } else {
          interval = Math.ceil(interval * ease);
        }
        repetitions += 1;
        break;

      case "easy": // Fácil
        if (repetitions === 0) {
          interval = 4;
        } else if (repetitions === 1) {
          interval = 7;
        } else {
          interval = Math.ceil(interval * ease * 1.3);
        }
        ease += 0.15;
        repetitions += 1;
        break;
    }

    // Limitar o intervalo máximo a 365 dias
    interval = Math.min(interval, 365);

    // Calcular a próxima data de revisão
    const dueDate = new Date();
    dueDate.setDate(now.getDate() + interval);

    return {
      interval,
      ease,
      repetitions,
      dueDate: dueDate.toISOString(),
    };
  };

  // Funções CRUD para Decks
  const createDeck = (
    name: string,
    description: string,
    color: string
  ): Deck => {
    const newDeck: Deck = {
      id: generateId(),
      name,
      description,
      color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalCards: 0,
      dueCards: 0,
    };

    setDecks((prevDecks) => [...prevDecks, newDeck]);

    // Se este for o primeiro baralho, defini-lo como atual
    if (decks.length === 0) {
      setCurrentDeckId(newDeck.id);
    }

    return newDeck;
  };

  const updateDeck = (
    deckId: string,
    data: Partial<
      Omit<Deck, "id" | "createdAt" | "updatedAt" | "totalCards" | "dueCards">
    >
  ): void => {
    setDecks((prevDecks) =>
      prevDecks.map((deck) =>
        deck.id === deckId
          ? {
              ...deck,
              ...data,
              updatedAt: new Date().toISOString(),
            }
          : deck
      )
    );
  };

  const deleteDeck = (deckId: string): void => {
    // Remover todos os cartões deste baralho
    setCards((prevCards) => prevCards.filter((card) => card.deckId !== deckId));

    // Remover o baralho
    setDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== deckId));

    // Se o baralho atual foi excluído, definir como null
    if (currentDeckId === deckId) {
      setCurrentDeckId(null);
    }
  };

  // Funções CRUD para Cards
  const createCard = (deckId: string, front: string, back: string): Card => {
    const now = new Date();
    const newCard: Card = {
      id: generateId(),
      front,
      back,
      deckId,
      dueDate: now.toISOString(), // Disponível para estudo imediatamente
      interval: 0,
      ease: 2.5, // Valor inicial padrão
      repetitions: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      lastReviewedAt: null,
    };

    setCards((prevCards) => [...prevCards, newCard]);

    return newCard;
  };

  const updateCard = (
    cardId: string,
    data: Partial<
      Omit<
        Card,
        | "id"
        | "createdAt"
        | "updatedAt"
        | "dueDate"
        | "interval"
        | "ease"
        | "repetitions"
        | "lastReviewedAt"
      >
    >
  ): void => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === cardId
          ? {
              ...card,
              ...data,
              updatedAt: new Date().toISOString(),
            }
          : card
      )
    );
  };

  const deleteCard = (cardId: string): void => {
    setCards((prevCards) => prevCards.filter((card) => card.id !== cardId));
  };

  const reviewCard = (cardId: string, result: ReviewResult): void => {
    const now = new Date().toISOString();

    setCards((prevCards) =>
      prevCards.map((card) => {
        if (card.id === cardId) {
          const nextReview = calculateNextInterval(card, result);

          return {
            ...card,
            ...nextReview,
            lastReviewedAt: now,
            updatedAt: now,
          };
        }
        return card;
      })
    );

    // Adicionar ao histórico de estudo no StudyContext
    // (Implementar integração com StudyContext se necessário)
  };

  // Funções para obter cartões e baralhos
  const getDueCards = (deckId: string): Card[] => {
    const now = new Date().toISOString();
    return cards
      .filter((card) => card.deckId === deckId && card.dueDate <= now)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  };

  const getCardsForDeck = (deckId: string): Card[] => {
    return cards.filter((card) => card.deckId === deckId);
  };

  const getCurrentDeck = (): Deck | null => {
    if (!currentDeckId) return null;
    return decks.find((deck) => deck.id === currentDeckId) || null;
  };

  const setCurrentDeck = (deckId: string | null): void => {
    setCurrentDeckId(deckId);
  };

  const getDeckById = (deckId: string): Deck | null => {
    return decks.find((deck) => deck.id === deckId) || null;
  };

  // Funções para sessão de estudo
  const startStudySession = (deckId: string): void => {
    const dueCards = getDueCards(deckId);

    // Embaralhar os cartões
    const shuffledCards = [...dueCards].sort(() => Math.random() - 0.5);

    setStudySession({
      isActive: true,
      currentCardIndex: 0,
      dueCards: shuffledCards,
      revealedAnswer: false,
    });
  };

  const endStudySession = (): void => {
    setStudySession({
      isActive: false,
      currentCardIndex: 0,
      dueCards: [],
      revealedAnswer: false,
    });
  };

  const nextCard = (): void => {
    if (studySession.currentCardIndex < studySession.dueCards.length - 1) {
      setStudySession({
        ...studySession,
        currentCardIndex: studySession.currentCardIndex + 1,
        revealedAnswer: false,
      });
    } else {
      // Fim da sessão
      endStudySession();
    }
  };

  const revealAnswer = (): void => {
    setStudySession({
      ...studySession,
      revealedAnswer: true,
    });
  };

  const submitAnswer = (result: ReviewResult): void => {
    const currentCard = studySession.dueCards[studySession.currentCardIndex];
    if (currentCard) {
      reviewCard(currentCard.id, result);
      nextCard();
    }
  };

  return (
    <AnkiContext.Provider
      value={{
        decks,
        cards,
        createDeck,
        updateDeck,
        deleteDeck,
        createCard,
        updateCard,
        deleteCard,
        reviewCard,
        getDueCards,
        getCardsForDeck,
        getCurrentDeck,
        setCurrentDeck,
        getDeckById,
        studySession: {
          isActive: studySession.isActive,
          currentCardIndex: studySession.currentCardIndex,
          dueCards: studySession.dueCards,
          revealedAnswer: studySession.revealedAnswer,
          startStudySession,
          endStudySession,
          nextCard,
          revealAnswer,
          submitAnswer,
        },
      }}
    >
      {children}
    </AnkiContext.Provider>
  );
};
