import pyaudio
import speech_recognition as sr

class MicrophoneManager:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.microphone = None
        
    def check_microphone(self):
        """Check if microphone is available"""
        try:
            with sr.Microphone() as source:
                print("✅ Microphone found!")
                print(f"   Device: {source.device_index}")
                return True
        except Exception as e:
            print(f"❌ Microphone error: {e}")
            return False
    
    def list_microphones(self):
        """List all available microphones"""
        p = pyaudio.PyAudio()
        print("\n🎤 Available Microphones:")
        
        for i in range(p.get_device_count()):
            info = p.get_device_info_by_index(i)
            if info['maxInputChannels'] > 0:
                print(f"   [{i}] {info['name']}")
        
        p.terminate()
    
    def test_audio_levels(self):
        """Test microphone audio levels"""
        try:
            with sr.Microphone() as source:
                print("\n🎤 Testing audio levels...")
                print("   Say something...")
                
                self.recognizer.adjust_for_ambient_noise(source, duration=2)
                audio = self.recognizer.listen(source, timeout=5)
                
                print("✅ Audio captured successfully!")
                return True
        except Exception as e:
            print(f"❌ Audio test failed: {e}")
            return False

if __name__ == "__main__":
    manager = MicrophoneManager()
    manager.check_microphone()
    manager.list_microphones()
    manager.test_audio_levels()