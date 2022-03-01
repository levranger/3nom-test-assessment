export interface SpeakerInterface {
    id: number;
    firstName: string;
    lastName: string;
    title: string;
    speaker: string;
    picUrl: string;
    gender: 'F' | 'M';
    language: string;
    listenFree: boolean;
    isMainSpeaker: boolean;
    isMySpeaker: boolean;
    totalShiurim: boolean;
    relatedShiurim: null;
}
