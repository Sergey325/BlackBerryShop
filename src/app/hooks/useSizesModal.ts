import { create } from "zustand";

interface SizesModalStore {
    isOpen: boolean;
    imageUrl: string | null;
    onOpen: (imageUrl?: string) => void;
    onClose: () => void;
}

const useSizesModal = create<SizesModalStore>((set) => ({
    isOpen: false,
    imageUrl: null,
    onOpen: (imageUrl) => set({
        isOpen: true,
        imageUrl: imageUrl ?? null,
    }),
    onClose: () => set({
        isOpen: false,
        imageUrl: null,
    }),
}));

export default useSizesModal;