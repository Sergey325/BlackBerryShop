import { create } from "zustand";

interface MobileSearchModalStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

const useMobileSearchModal = create<MobileSearchModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));

export default useMobileSearchModal;