import pyttsx3
from typing import Optional

class VoiceSynthesis:
    def __init__(self):
        self.engine = pyttsx3.init()
        self.engine.setProperty('rate', 150)  # Speed
        self.engine.setProperty('volume', 0.9)  # Volume
        
        # Set voice
        voices = self.engine.getProperty('voices')
        self.engine.setProperty('voice', voices[0].id)  # Default voice
    
    def speak(self, text: str):
        """Convert text to speech"""
        print(f"🎤 Speaking: {text}")
        self.engine.say(text)
        self.engine.runAndWait()
    
    def speak_async(self, text: str):
        """Speak without blocking"""
        self.engine.say(text)
        self.engine.startLoop(False)
    
    def set_voice_speed(self, speed: int):
        """Set speech speed (50-300)"""
        self.engine.setProperty('rate', speed)
    
    def set_voice_volume(self, volume: float):
        """Set volume (0.0-1.0)"""
        self.engine.setProperty('volume', volume)
    
    def list_available_voices(self):
        """List available voices"""
        voices = self.engine.getProperty('voices')
        print("\n🎤 Available voices:")
        for i, voice in enumerate(voices):
            print(f"   [{i}] {voice.name}")
    
    def set_voice_by_index(self, index: int):
        """Set voice by index"""
        voices = self.engine.getProperty('voices')
        if 0 <= index < len(voices):
            self.engine.setProperty('voice', voices[index].id)
            print(f"✅ Voice set to: {voices[index].name}")

if __name__ == "__main__":
    synthesizer = VoiceSynthesis()
    
    # Test
    synthesizer.list_available_voices()
    
    print("\n--- Speaking Test ---")
    synthesizer.speak("Hello, I am Amit, your voice assistant")
    synthesizer.speak("नमस्ते, मैं अमित हूं")
    
    # Speed test
    print("\n--- Speed Test ---")
    synthesizer.set_voice_speed(100)
    synthesizer.speak("This is slow speech")
    
    synthesizer.set_voice_speed(200)
    synthesizer.speak("This is fast speech")