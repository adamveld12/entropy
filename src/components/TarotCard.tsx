import type { DrawnCard } from "@/lib/types";

interface TarotCardProps {
  card: DrawnCard;
  className?: string;
}

export function TarotCard({ card, className = "" }: TarotCardProps) {
  return (
    <div className={`bg-slate-800 rounded-lg p-4 space-y-2 w-48 ${className}`}>
      <img
        src={card.image}
        alt={card.name}
        className={`w-full h-auto rounded ${card.reversed ? "transform rotate-180" : ""}`}
      />
      <div className="text-center">
        <p className="text-amber-500 font-semibold text-sm">{card.name}</p>
        {card.reversed && (
          <p className="text-slate-400 text-xs italic">Reversed</p>
        )}
        <p className="text-slate-300 text-xs mt-1">{card.meaning}</p>
      </div>
    </div>
  );
}
