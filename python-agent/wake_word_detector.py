import speech_recognition as sr
import threading
import time

class WakeWordDetector:
    def __init__(self, wake_word="hey amit"):
        self.recognizer = sr.Recognizer()
        self.wake_word = wake_word.lower()
        self.is_running = False
        self.wake_word_detected = False
        
        # Adjust sensitivity
        self.recognizer.energy_threshold = 1000  # Lower = more sensitive
        self.recognizer.dynamic_energy_threshold = True
        
    def detect_wake_word(self):
        """Continuously listen for wake word"""
        print(f"🎤 Listening for wake word: '{self.wake_word}'")
        print("📢 Speak clearly...")
        
        try:
            with sr.Microphone() as source:
                # More aggressive noise adjustment
                print("🔊 Adjusting for ambient noise (3 seconds)...")
                self.recognizer.adjust_for_ambient_noise(source, duration=3)
                
                print("✅ Ready! Listening now...")
                
                # Longer timeout (15 seconds instead of 5)
                audio = self.recognizer.listen(source, timeout=15, phrase_time_limit=10)
            
            print("🔄 Processing audio...")
            text = self.recognizer.recognize_google(audio).lower()
            print(f"📝 Detected: {text}")
            
            if self.wake_word in text:
                print(f"✅ WAKE WORD DETECTED!")
                self.wake_word_detected = True
                return True
            else:
                print(f"❌ Wake word not found in: '{text}'")
                return False
            
        except sr.UnknownValueError:
            print("❌ Could not understand audio - speak louder")
            return False
        except sr.RequestError as e:
            print(f"❌ API Error: {e}")
            print("   Check internet connection")
            return False
        except sr.WaitTimeoutError:
            print("❌ No sound detected - check microphone volume")
            return False
        except Exception as e:
            print(f"❌ Error: {e}")
            return False

if __name__ == "__main__":
    detector = WakeWordDetector()
    
    # Test 3 times
    for i in range(3):
        print(f"\n--- Attempt {i+1} ---")
        if detector.detect_wake_word():
            print("🎉 Success!")
            break
        print("Retrying...")
        time.sleep(2)