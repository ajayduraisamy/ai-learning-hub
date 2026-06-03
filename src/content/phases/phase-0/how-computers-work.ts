import { registerContent } from '@/content/index'

registerContent('p0-how-computers-work', () => ({
  difficulty: 'Beginner',
  estimatedTime: '30 minutes',
  prerequisites: [],
  tags: ['Phase 0', 'Beginner', 'Topic'],
  objectives: [
    'Understand the basic components of a computer',
    'Learn about files, folders, and file extensions',
    'Understand the PATH environment variable',
    'Navigate the file system using command line',
  ],
  theory: `# How Computers Work

## Core Components

A computer consists of several key hardware components that work together:

- **CPU (Central Processing Unit)**: The "brain" of the computer that executes instructions
- **RAM (Random Access Memory)**: Temporary storage for active programs and data
- **Storage (HDD/SSD)**: Permanent storage for files and programs
- **Motherboard**: The main circuit board connecting all components

## Files, Folders, and Extensions

### Files
A file is a collection of data stored on a computer. Every file has:

- **A name**: \`document\`
- **An extension**: \`.txt\`, \`.py\`, \`.csv\`
- **A location**: The folder path where it's stored

### File Extensions
Extensions tell the OS what type of file it is:

| Extension | Type | Program |
|-----------|------|---------|
| \`.txt\` | Text file | Any text editor |
| \`.py\` | Python script | Python interpreter |
| \`.csv\` | Comma-separated values | Excel, Pandas |
| \`.jpg\` | Image | Image viewer |
| \`.json\` | JSON data | Any text editor |

### The PATH Variable

The PATH is an environment variable that tells the operating system where to look for executable programs. When you type \`python\` in the terminal, the OS searches each directory listed in PATH until it finds \`python.exe\`.

## How Programs Run

1. You double-click a file or type a command
2. The OS loads the program from storage into RAM
3. The CPU fetches instructions from RAM one by one
4. The CPU decodes and executes each instruction
5. Results are written back to RAM or storage

## The Boot Process

1. Power-on self-test (POST) checks hardware
2. BIOS/UEFI loads the bootloader from storage
3. Bootloader loads the operating system into RAM
4. OS initializes drivers and services
5. You get the login screen`,
  understanding: {
    analogy: 'Think of a computer like a desk workspace. The CPU is you doing the work, RAM is the top of your desk where you keep things you\'re actively using, storage is the filing cabinet for long-term records, and files are individual documents. The PATH is like a well-organized index that tells you exactly which drawer contains each tool.',
    steps: [
      { title: 'Input', content: 'You provide input through keyboard, mouse, or by running a program. This tells the computer what you want it to do.' },
      { title: 'Processing', content: 'The CPU processes your instructions. It fetches them from RAM, decodes what they mean, executes the operation, and writes back the result.' },
      { title: 'Memory', content: 'Active data is held in RAM for quick access. When you open a file, it\'s loaded from storage into RAM so the CPU can work with it quickly.' },
      { title: 'Storage', content: 'When you save your work, data is written from RAM to your storage drive (HDD or SSD). This is permanent and survives restarts.' },
      { title: 'Output', content: 'Results are displayed on your screen, printed, saved to a file, or sent over a network.' },
    ],
    misconceptions: [
      { misconception: 'More RAM always makes your computer faster', truth: 'While sufficient RAM is essential, adding more beyond what your applications need does not improve performance. The key is having enough, not excess.' },
      { misconception: 'Deleting a file permanently removes it', truth: 'Deleting typically just marks the space as available. The actual data remains until overwritten. Secure deletion tools overwrite the data multiple times.' },
    ],
    comparisons: [
      { label: 'Speed', methodA: 'RAM: Nanoseconds access time', methodB: 'SSD: Microseconds, HDD: Milliseconds' },
      { label: 'Volatility', methodA: 'RAM: Data lost on power off', methodB: 'Storage: Data persists without power' },
      { label: 'Capacity', methodA: 'RAM: Typically 8-64 GB', methodB: 'Storage: Typically 256 GB - 2 TB' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Exploring files and folders with Python
import os

# Get current working directory
current = os.getcwd()
print(f"Current directory: {current}")

# List files in current directory
files = os.listdir('.')
print(f"\\nFiles in current directory:")
for f in files:
    print(f"  - {f}")

# Check if a path is a file or folder
for f in files:
    full_path = os.path.join('.', f)
    if os.path.isfile(full_path):
        print(f"{f} is a FILE")
    elif os.path.isdir(full_path):
        print(f"{f} is a FOLDER")`,
      output: `Current directory: C:\\Users\\Projects\\ai-learning-hub

Files in current directory:
  - README.md
  - src
  - package.json
  - .gitignore
README.md is a FILE
src is a FOLDER
package.json is a FILE
.gitignore is a FILE`,
      explanation: 'This demonstrates basic file system navigation using Python\'s os module. You can see how the computer organizes files into directories and how we can programmatically inspect them.',
    },
    {
      level: 'intermediate',
      code: `# Understanding file extensions and PATH
import os
import sys

# File extension mapping
extension_map = {
    '.py': 'Python Script',
    '.txt': 'Text File',
    '.csv': 'CSV Data',
    '.json': 'JSON Data',
    '.md': 'Markdown Document',
    '.jpg': 'JPEG Image',
    '.png': 'PNG Image',
    '.exe': 'Executable',
}

def analyze_file(filepath):
    """Analyze a file and return its properties."""
    name, ext = os.path.splitext(filepath)
    size = os.path.getsize(filepath)
    file_type = extension_map.get(ext.lower(), 'Unknown')
    return {
        'name': os.path.basename(filepath),
        'type': file_type,
        'size_kb': round(size / 1024, 2),
        'extension': ext,
    }

# Analyze a file
sample = __file__  # This script itself
info = analyze_file(sample)
print(f"File: {info['name']}")
print(f"Type: {info['type']}")
print(f"Size: {info['size_kb']} KB")
print(f"Extension: {info['extension']}")

# Explore PATH directories
print(f"\\nPATH directories ({len(os.environ['PATH'].split(';'))} entries):")
for i, path in enumerate(os.environ['PATH'].split(';')[:5]):
    print(f"  {i+1}. {path}")`,
      output: `File: script.py
Type: Python Script
Size: 0.95 KB
Extension: .py

PATH directories (12 entries):
  1. C:\\Python312\\Scripts
  2. C:\\Python312
  3. C:\\Windows\\system32
  4. C:\\Windows
  5. C:\\Program Files\\Git\\cmd`,
      explanation: 'This shows how to programmatically identify file types by their extensions and explores the PATH environment variable that tells your OS where to find executable programs.',
    },
    {
      level: 'advanced',
      code: `import os
import shutil
from pathlib import Path
from datetime import datetime

class FileSystemExplorer:
    def __init__(self, root_path='.'):
        self.root = Path(root_path)
        self.stats = {'files': 0, 'folders': 0, 'total_size': 0}
    
    def scan(self, path=None, depth=0):
        """Recursively scan the file system."""
        if path is None:
            path = self.root
        
        for item in path.iterdir():
            if item.is_file():
                self.stats['files'] += 1
                size = item.stat().st_size
                self.stats['total_size'] += size
                yield {
                    'type': 'file',
                    'name': item.name,
                    'ext': item.suffix,
                    'size': size,
                    'modified': datetime.fromtimestamp(
                        item.stat().st_mtime
                    ).strftime('%Y-%m-%d %H:%M'),
                    'path': str(item),
                }
            elif item.is_dir():
                self.stats['folders'] += 1
                yield {
                    'type': 'folder',
                    'name': item.name,
                    'path': str(item),
                }
                yield from self.scan(item, depth + 1)
    
    def report(self):
        """Generate a summary report."""
        print(f"=== File System Report ===")
        print(f"Root: {self.root.absolute()}")
        print(f"Files: {self.stats['files']}")
        print(f"Folders: {self.stats['folders']}")
        print(f"Total size: {self.stats['total_size']:,} bytes "
              f"({self.stats['total_size']/1024/1024:.2f} MB)")
        
        # Group by extension
        exts = {}
        for item in self.root.rglob('*'):
            if item.is_file() and item.suffix:
                ext = item.suffix.lower()
                exts[ext] = exts.get(ext, 0) + 1
        
        print(f"\\nFile extensions:")
        for ext, count in sorted(exts.items(), 
                                  key=lambda x: -x[1])[:10]:
            print(f"  {ext}: {count} files")

# Run the explorer
explorer = FileSystemExplorer('.')
print("Scanning file system...\\n")
list(explorer.scan())
explorer.report()`,
      output: `Scanning file system...

=== File System Report ===
Root: C:\\Users\\Projects\\ai-learning-hub
Files: 142
Folders: 23
Total size: 1,234,567 bytes (1.18 MB)

File extensions:
  .ts: 45 files
  .tsx: 32 files
  .json: 12 files
  .css: 8 files
  .py: 6 files
  .md: 5 files
  .html: 2 files`,
      explanation: 'This advanced file system explorer recursively scans directories, categorizes files by extension, and generates a comprehensive report. This is the foundation of tools used for data discovery and file management in ML projects.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Technology', description: 'Cloud storage services like Google Drive and Dropbox manage billions of files using hierarchical file system principles, organizing data for efficient retrieval and backup.' },
      { industry: 'Data Science', description: 'Data scientists organize datasets into structured directory hierarchies, using file naming conventions and extensions (.csv, .json, .parquet) to manage large-scale data pipelines.' },
    ],
    caseStudy: {
      problem: 'A machine learning team had 50,000 unorganized files spread across multiple servers. Team members could not find datasets, models were accidentally overwritten, and experiment tracking was impossible.',
      solution: 'They implemented a standardized file organization system with clear folder hierarchies, consistent naming conventions, and a PATH-based tool that automatically located resources.',
      results: 'File retrieval time dropped from 15 minutes to 30 seconds. Accidental overwrites were eliminated, and the team could reproduce any experiment from the previous 6 months.',
    },
    bestPractices: [
      'Use descriptive, consistent file names with dates (e.g., model_v2_2024_01_15.pkl)',
      'Organize projects into src/, data/, models/, notebooks/, docs/ folders',
      'Keep your PATH clean — remove unused entries to avoid conflicts',
      'Use version control (Git) to track file changes',
      'Document your directory structure in a README.md',
    ],
    tools: ['File Explorer / Finder', 'Command Line (Terminal)', 'Python os & pathlib', 'Git', 'Tree command'],
    jobRoles: ['Software Engineer', 'Data Scientist', 'DevOps Engineer', 'IT Support Specialist'],
    furtherReading: [
      'Original paper and foundational research',
      'Official documentation and tutorials',
      'Community blog posts and case studies',
      'Online courses and certification programs',
    ],
  },
  quiz: [
    {
      id: 'hcw-1', type: 'truefalse',
      question: 'RAM is a type of permanent storage that retains data even when the computer is turned off.',
      correctAnswer: 'False',
      explanation: 'RAM is volatile memory — it loses all data when power is disconnected. Permanent storage (HDD/SSD) retains data without power.',
    },
    {
      id: 'hcw-2', type: 'mcq',
      question: 'What does the PATH environment variable do?',
      options: [
        'Stores the location of your documents folder',
        'Tells the OS where to look for executable programs',
        'Defines the maximum file path length',
        'Controls the speed of file transfers',
      ],
      correctAnswer: 'Tells the OS where to look for executable programs',
      explanation: 'When you type a command like "python", the OS searches each directory listed in PATH until it finds the matching executable file.',
    },
    {
      id: 'hcw-3', type: 'fillblank',
      question: 'The file extension ___ indicates a Python script file.',
      correctAnswer: '.py',
      explanation: 'Files with the .py extension contain Python source code that can be executed by the Python interpreter.',
    },
    {
      id: 'hcw-4', type: 'code',
      question: 'What will the following code output?',
      code: `import os
files = os.listdir('.')
print(len(files))`,
      options: [
        'The number of files in the current directory',
        'The total size of all files',
        'The current directory path',
        'An error because os is not imported',
      ],
      correctAnswer: 'The number of files in the current directory',
      explanation: 'os.listdir(\'.\') returns a list of all entries in the current directory. len() counts how many items are in that list.',
    },
    {
      id: 'hcw-5', type: 'match',
      question: 'Match each computer component with its function:',
      pairs: [
        { left: 'CPU', right: 'Executes instructions and performs calculations' },
        { left: 'RAM', right: 'Temporary storage for active programs' },
        { left: 'SSD', right: 'Permanent storage for files and programs' },
        { left: 'PATH', right: 'Tells OS where to find executables' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each component plays a distinct role: CPU processes, RAM holds active data, SSD stores permanently, and PATH locates programs.',
    },
  ],
}))

export {}
