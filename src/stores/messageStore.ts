import { create } from 'zustand';

export type MessageType = 'INFO' | 'ERROR' | 'SUCCESS';

export type Message = { id: number; text: string; type: MessageType };

export type MessageState = {
    messages: Message[];
    errorMessage: string;
};

export type MessageActions  = {
    addNewMessage: (msg: string, type?: MessageType) => void;
}

export type MessageStore = MessageState & MessageActions;

export const useMessageStore = create<MessageStore>((set) => ({
    messages: [],
    errorMessage: '',

    addNewMessage: (text, type = 'INFO') => {
        set((state) => ({
            messages: [
                ...state.messages,
                {
                    id: Date.now(),
                    text: text,
                    type,
                },
            ],
        }));
    },
}));
