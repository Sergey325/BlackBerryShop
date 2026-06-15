import {useState} from "react";

const StarRating = ({ rating, onChange }: { rating: number; onChange?: (rating: number) => void }) => {
    const [hovered, setHovered] = useState<number | null>(null);

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`text-[18px] cursor-pointer transition-colors ${
                        star <= (hovered ?? rating) ? "text-yellow-400" : "text-gray-300"
                    }`}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => onChange?.(star)}
                >
          ★
        </span>
            ))}
        </div>
    );
};
export default StarRating;