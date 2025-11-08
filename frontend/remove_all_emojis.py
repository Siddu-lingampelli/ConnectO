import os
import re
from pathlib import Path

# Comprehensive emoji pattern - matches all emojis
EMOJI_PATTERN = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F300-\U0001F5FF"  # symbols & pictographs
    "\U0001F680-\U0001F6FF"  # transport & map symbols
    "\U0001F1E0-\U0001F1FF"  # flags
    "\U00002700-\U000027BF"  # dingbats
    "\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
    "\U0001FA70-\U0001FAFF"  # Symbols and Pictographs Extended-A
    "\U00002600-\U000026FF"  # Miscellaneous Symbols
    "\U00002B50"             # star
    "\U0000FE0F"             # Variation Selector
    "]+",
    flags=re.UNICODE
)

def remove_emojis_from_file(file_path):
    """Remove all emojis from a file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Remove standalone emoji spans like <span>💻</span>
        content = re.sub(r'<span[^>]*>[\s]*[🔥⚡📅📍🎤⚙️💻🔧✕👁️⚠️🔄✨📋💼🔒🎯👤💬🔔💳🛡️🗺️📝📊✅❌📨🎉💰🏆🎁➕🔍💼📖✍️★🚀💚❤️✏️↩️⏱️✉️❄️🏗️💳🔄👔✔️ℹ️][\s]*</span>', '', content)
        
        # Remove emojis from text content - replace with empty string or icon text
        content = EMOJI_PATTERN.sub('', content)
        
        # Clean up common emoji patterns in strings
        emoji_replacements = {
            "'🔥 ": "'",
            "'⚡ ": "'",
            "'📅 ": "'",
            "'📍 ": "'",
            "'🎤 ": "'",
            "'⚙️ ": "'",
            "'💻 ": "'",
            "'🔧 ": "'",
            "'✕ ": "'",
            "'👁️ ": "'",
            "'⚠️ ": "'",
            "'🔄 ": "'",
            "'✨ ": "'",
            "'📋 ": "'",
            "'💼 ": "'",
            "'🔒 ": "'",
            "'🎯 ": "'",
            "'👤 ": "'",
            "'💬 ": "'",
            "'🔔 ": "'",
            "'💳 ": "'",
            "'🛡️ ": "'",
            "'🗺️ ": "'",
            "'📝 ": "'",
            "'📊 ": "'",
            "'✅ ": "'",
            "'❌ ": "'",
            "'📨 ": "'",
            "'🎉 ": "'",
            "'💰 ": "'",
            "'🏆 ": "'",
            "'🎁 ": "'",
            "'➕ ": "'",
            "'🔍 ": "'",
            " 💻'": "'",
            " 🔧'": "'",
            " 📍'": "'",
            " ⚙️'": "'",
            " 🔥'": "'",
            " ⚡'": "'",
        }
        
        for old, new in emoji_replacements.items():
            content = content.replace(old, new)
        
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    pages_dir = Path("src/pages")
    modified_count = 0
    
    print("Removing ALL emojis from all TypeScript/TSX files...")
    
    for tsx_file in pages_dir.glob("*.tsx"):
        if remove_emojis_from_file(tsx_file):
            modified_count += 1
            print(f"✓ Cleaned: {tsx_file.name}")
    
    print(f"\n✅ Done! Modified {modified_count} files.")
    print("Press Ctrl+Shift+R in your browser to hard refresh and see changes!")

if __name__ == "__main__":
    main()
