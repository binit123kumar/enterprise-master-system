import speech_recognition as sr
from typing import Optional

class SpeechToText:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 4000
        
    def listen_and_convert(self, timeout=10) -> Optional[str]:
        """Convert speech to text"""
        try:
            with sr.Microphone() as source:
                print("🎧 Listening...")
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                audio = self.recognizer.listen(source, timeout=timeout)
            
            print("🔄 Converting speech to text...")
            text = self.recognizer.recognize_google(audio)
            print(f"✅ Recognized: {text}")
            return text.lower()
        
        except sr.UnknownValueError:
            print("❌ Could not understand audio")
            return None
        except sr.RequestError as e:
            print(f"❌ API error: {e}")
            return None
        except Exception as e:
            print(f"❌ Error: {e}")
            return None
    
    def listen_with_language(self, language_code="en-US") -> Optional[str]:
        """Listen with specific language"""
        try:
            with sr.Microphone() as source:
                print(f"🎧 Listening ({language_code})...")
                audio = self.recognizer.listen(source, timeout=10)
            
            text = self.recognizer.recognize_google(audio, language=language_code)
            return text.lower()
        
        except Exception as e:
            print(f"❌ Error: {e}")
            return None

if __name__ == "__main__":
    stt = SpeechToText()
    text = stt.listen_and_convert()
    
    if text:
        print(f"\n📝 Final text: {text}")