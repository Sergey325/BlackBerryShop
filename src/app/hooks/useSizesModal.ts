import { create } from "zustand"

interface SizesModalStore{
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
}
const useSizesModal = create<SizesModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({isOpen: true}),
    onClose: () => set({isOpen: false}),
}))

export default useSizesModal;