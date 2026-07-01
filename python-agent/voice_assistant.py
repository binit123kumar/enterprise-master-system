import speech_recognition as sr
import pyttsx3
import threading
import time
from typing import Optional, Callable
import os
from pathlib import Path
from dotenv import load_dotenv

# Load env
load_dotenv(Path(__file__).parent.parent / ".env")

class VoiceAssistant:
    def __init__(self, wake_word="hey amit"):
        """Initialize Voice Assistant"""
        print("\n🚀 Initializing Voice Assistant...")
        
        # Speech Recognition
        self.recognizer = sr.Recognizer()
        self.recognizer.energy_threshold = 1000
        self.recognizer.dynamic_energy_threshold = True
        
        # Text-to-Speech
        self.engine = pyttsx3.init()
        self.engine.setProperty('rate', 150)
        self.engine.setProperty('volume', 0.9)
        
        # Settings
        self.wake_word = wake_word.lower()
        self.is_listening = False
        self.language = "en-US"
        
        print("✅ Voice Assistant initialized")
    
    # ============ LANGUAGE SUPPORT ============
    
    def set_language(self, language: str):
        """Set language (english, hindi, hinglish)"""
        lang_map = {
            "english": "en-US",
            "hindi": "hi-IN",
            "hinglish": "en-IN"
        }
        
        self.language = lang_map.get(language.lower(), "en-US")
        print(f"✅ Language set to: {language}")
    
    def detect_language(self, text: str) -> str:
        """Detect language from text"""
        hindi_chars = any('\u0900' <= c <= '\u097F' for c in text)
        return "hindi" if hindi_chars else "english"
    
    # ============ TEXT-TO-SPEECH ============
    
    def speak(self, text: str):
        """Convert text to speech"""
        print(f"🎤 Speaking: {text}")
        self.engine.say(text)
        self.engine.runAndWait()
    
    def set_voice_speed(self, speed: int):
        """Set speech speed (50-300)"""
        self.engine.setProperty('rate', speed)
    
    def set_voice_volume(self, volume: float):
        """Set volume (0.0-1.0)"""
        self.engine.setProperty('volume', volume)
    
    # ============ SPEECH-TO-TEXT ============
    
    def listen(self, timeout=15, language_code=None) -> Optional[str]:
        """Convert speech to text"""
        if language_code is None:
            language_code = self.language
        
        try:
            with sr.Microphone() as source:
                print("🎧 Listening...")
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                audio = self.recognizer.listen(source, timeout=timeout, phrase_time_limit=10)
            
            print("🔄 Processing audio...")
            text = self.recognizer.recognize_google(audio, language=language_code)
            print(f"📝 Recognized: {text}")
            return text.lower()
        
        except sr.UnknownValueError:
            print("❌ Could not understand - speak louder")
            return None
        except sr.RequestError as e:
            print(f"❌ API error: {e}")
            return None
        except sr.WaitTimeoutError:
            print("❌ No sound detected")
            return None
        except Exception as e:
            print(f"❌ Error: {e}")
            return None
    
    # ============ WAKE WORD DETECTION ============
    
    def detect_wake_word(self, timeout=15) -> bool:
        """Detect wake word"""
        print(f"🎤 Listening for wake word: '{self.wake_word}'")
        
        try:
            command = self.listen(timeout=timeout)
            
            if command and self.wake_word in command:
                print(f"✅ WAKE WORD DETECTED!")
                self.speak("Yes, I'm listening")
                return True
        except Exception as e:
            print(f"❌ Error: {e}")
        
        return False
    
    # ============ COMMAND LISTENING ============
    
    def get_command(self, timeout=10) -> Optional[str]:
        """Get voice command"""
        print(f"\n📢 Waiting for command...")
        command = self.listen(timeout=timeout)
        return command
    
    # ============ MAIN LOOP ============
    
    def start(self, command_callback: Callable = None):
        """Start voice assistant loop"""
        print("\n" + "="*60)
        print("🚀 EnterpriseOS Voice Assistant - ACTIVE")
        print(f"⏰ Wake Word: '{self.wake_word}'")
        print("="*60 + "\n")
        
        self.speak("EnterpriseOS Voice Assistant ready")
        
        attempt = 0
        
        while True:
            try:
                attempt += 1
                print(f"\n[Attempt {attempt}]")
                
                # Wait for wake word
                if not self.detect_wake_word():
                    print("Retrying...")
                    time.sleep(2)
                    continue
                
                # Get command
                command = self.get_command()
                
                if command:
                    print(f"\n🎯 Command: {command}")
                    
                    # Execute callback
                    if command_callback:
                        command_callback(command)
                    else:
                        print(f"Command received: {command}")
                        self.speak(f"You said: {command}")
                    
                    attempt = 0
                
                time.sleep(1)
            
            except KeyboardInterrupt:
                print("\n\n🛑 Voice Assistant stopped")
                self.speak("Goodbye")
                break
            
            except Exception as e:
                print(f"❌ Error: {e}")
                time.sleep(2)

# ============ TESTS ============

def run_tests():
    """Run all tests"""
    assistant = VoiceAssistant()
    
    print("\n" + "="*60)
    print("📋 PHASE 1 TESTS")
    print("="*60)
    
    # Test 1: Languages
    print("\n[Test 1] Language Support")
    assistant.set_language("english")
    assistant.set_language("hindi")
    assistant.set_language("hinglish")
    
    # Test 2: Voice Output
    print("\n[Test 2] Voice Output")
    assistant.speak("Hello, I am Amit")
    assistant.speak("नमस्ते")
    
    # Test 3: Language Detection
    print("\n[Test 3] Language Detection")
    print(f"Detected: {assistant.detect_language('hello')}")
    print(f"Detected: {assistant.detect_language('नमस्ते')}")
    
    # Test 4: Voice Speed
    print("\n[Test 4] Voice Speed")
    assistant.set_voice_speed(100)
    assistant.speak("This is slow speech")
    
    assistant.set_voice_speed(200)
    assistant.speak("This is fast speech")
    
    print("\n" + "="*60)
    print("✅ ALL TESTS COMPLETED!")
    print("="*60)

if __name__ == "__main__":
    run_tests()