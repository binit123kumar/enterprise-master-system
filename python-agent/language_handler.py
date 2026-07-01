from enum import Enum

class Language(Enum):
    ENGLISH = "en-US"
    HINDI = "hi-IN"
    HINGLISH = "en-IN"  # English with Indian accent

class LanguageHandler:
    def __init__(self):
        self.current_language = Language.ENGLISH
        self.supported_languages = {
            "english": Language.ENGLISH,
            "hindi": Language.HINDI,
            "hinglish": Language.HINGLISH
        }
    
    def get_language_code(self, lang_name: str) -> str:
        """Get language code"""
        lang = self.supported_languages.get(lang_name.lower())
        if lang:
            return lang.value
        return Language.ENGLISH.value
    
    def set_language(self, language: str):
        """Set current language"""
        if language.lower() in self.supported_languages:
            self.current_language = self.supported_languages[language.lower()]
            print(f"✅ Language set to: {language}")
        else:
            print(f"❌ Language not supported: {language}")
    
    def detect_language(self, text: str) -> str:
        """Detect language from text"""
        hindi_chars = any('\u0900' <= c <= '\u097F' for c in text)
        
        if hindi_chars:
            return "hindi"
        else:
            return "english"
    
    def get_current_language(self) -> str:
        """Get current language name"""
        return self.current_language.name.lower()

if __name__ == "__main__":
    handler = LanguageHandler()
    
    # Test
    handler.set_language("english")
    handler.set_language("hindi")
    handler.set_language("hinglish")
    
    # Detect
    print("\nDetection test:")
    print(handler.detect_language("hello world"))
    print(handler.detect_language("नमस्ते"))