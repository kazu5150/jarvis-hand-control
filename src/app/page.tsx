import HandControl from '@/components/HandControl';
import VoiceChat from '@/components/VoiceChat';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-between relative overflow-hidden">
            <HandControl />
            <VoiceChat />
        </main>
    );
}
