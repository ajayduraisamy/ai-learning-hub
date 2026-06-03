import { registerContent } from '@/content/index'

registerContent('p0-binary-logic', () => ({
  difficulty: 'Beginner',
  estimatedTime: '30 minutes',
  prerequisites: ['p0-how-computers-work'],
  tags: ['Phase 0', 'Beginner', 'Topic'],
  objectives: [
    'Understand binary number system and why computers use it',
    'Learn about logic gates (AND, OR, NOT, XOR)',
    'Combine gates to create simple circuits',
    'Understand how binary represents data',
  ],
  theory: `# Binary & Logic Gates

## Why Binary?

Computers use **binary** (base-2) because transistors have two natural states: **on** (1) and **off** (0). This makes binary the most reliable and energy-efficient way to represent data electronically.

### Binary vs Decimal

| Decimal (Base-10) | Binary (Base-2) |
|------------------|-----------------|
| 0 | 0 |
| 1 | 1 |
| 2 | 10 |
| 3 | 11 |
| 4 | 100 |
| 5 | 101 |
| 6 | 110 |
| 7 | 111 |
| 8 | 1000 |

## Logic Gates

Logic gates are the building blocks of digital circuits. They perform boolean operations on one or more binary inputs.

### AND Gate
Output is 1 only when **both** inputs are 1.

$$A \\cdot B = \\text{OUT}$$

| A | B | OUT |
|---|---|-----|
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |

### OR Gate
Output is 1 when **at least one** input is 1.

$$A + B = \\text{OUT}$$

| A | B | OUT |
|---|---|-----|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 1 |

### NOT Gate
Output is the **inverse** of the input.

$$\\overline{A} = \\text{OUT}$$

| A | OUT |
|---|-----|
| 0 | 1 |
| 1 | 0 |

### XOR Gate
Output is 1 when inputs are **different**.

$$A \\oplus B = \\text{OUT}$$

| A | B | OUT |
|---|---|-----|
| 0 | 0 | 0 |
| 0 | 1 | 1 |
| 1 | 0 | 1 |
| 1 | 1 | 0 |

## Representing Data with Binary

- **Numbers**: Standard binary counting
- **Text**: ASCII maps characters to 7-bit binary (e.g., \`A\` = 01000001)
- **Images**: Each pixel's color is RGB values (0-255 per channel)
- **Sound**: Amplitude sampled thousands of times per second`,
  understanding: {
    analogy: 'Think of binary like a light switch — it\'s either on or off, nothing in between. Logic gates are like combination locks: an AND gate requires both switches to be on (both conditions met), while an OR gate only needs one. Binary is the vocabulary, and logic gates are the grammar rules that let us build meaningful sentences (computations).',
    steps: [
      { title: 'Convert Decimal to Binary', content: 'Divide the decimal number by 2 repeatedly. The remainders (reading bottom to top) give you the binary number. For example, 13 ÷ 2 = 6 remainder 1, 6 ÷ 2 = 3 remainder 0, 3 ÷ 2 = 1 remainder 1, 1 ÷ 2 = 0 remainder 1 → 1101.' },
      { title: 'AND Gate Operation', content: 'Both inputs must be 1 for the output to be 1. Think of two switches in series — both must be closed for the circuit to complete.' },
      { title: 'OR Gate Operation', content: 'At least one input must be 1 for the output to be 1. Think of two switches in parallel — closing either one completes the circuit.' },
      { title: 'Build a Half-Adder', content: 'Combine an XOR gate (for the sum bit) and an AND gate (for the carry bit) to create a circuit that adds two binary digits.' },
      { title: 'Scale to Full Computation', content: 'Combine thousands of logic gates to create adders, multiplexers, memory cells, and ultimately a complete CPU.' },
    ],
    misconceptions: [
      { misconception: 'Binary is the only number system computers can use', truth: 'While binary is fundamental at the hardware level, computers can be designed to use other bases. Ternary computers (base-3) have been built experimentally, though binary dominates due to simplicity and reliability.' },
      { misconception: 'Logic gates are physical switches', truth: 'Modern logic gates are implemented using transistors on integrated circuits. A single modern chip contains billions of transistors acting as microscopic switches.' },
    ],
    comparisons: [
      { label: 'State Count', methodA: 'Binary: 2 states (0, 1)', methodB: 'Ternary: 3 states (-1, 0, +1)' },
      { label: 'Reliability', methodA: 'Binary: Very high — clear distinction between on/off', methodB: 'Ternary: Lower — harder to distinguish intermediate states' },
      { label: 'Circuit Complexity', methodA: 'Binary: Simple transistor circuits', methodB: 'Ternary: More complex but potentially fewer gates' },
    ],
  },
  codeExamples: [
    {
      level: 'basic',
      code: `# Binary operations in Python

# Convert decimal to binary
decimal = 42
binary = bin(decimal)
print(f"{decimal} in binary: {binary}")

# Convert binary to decimal
binary_str = "101010"
decimal_val = int(binary_str, 2)
print(f"{binary_str} in decimal: {decimal_val}")

# Bitwise AND, OR, XOR
a = 5   # 0101
b = 3   # 0011

print(f"\\na = {a} ({bin(a)})")
print(f"b = {b} ({bin(b)})")
print(f"a & b (AND) = {a & b} ({bin(a & b)})")
print(f"a | b (OR)  = {a | b} ({bin(a | b)})")
print(f"a ^ b (XOR) = {a ^ b} ({bin(a ^ b)})")
print(f"~a   (NOT)  = {~a} ({bin(~a)})")`,
      output: `42 in binary: 0b101010
101010 in decimal: 42

a = 5 (0b101)
b = 3 (0b011)
a & b (AND) = 1 (0b1)
a | b (OR)  = 7 (0b111)
a ^ b (XOR) = 6 (0b110)
~a   (NOT)  = -6 (-0b110)`,
      explanation: 'Python\'s bitwise operators (&, |, ^, ~) directly implement logic gate operations on binary representations of integers. This is the software equivalent of hardware logic gates.',
    },
    {
      level: 'intermediate',
      code: `# Implementing logic gates as Python functions
from typing import List

def AND(a: int, b: int) -> int:
    return a & b

def OR(a: int, b: int) -> int:
    return a | b

def NOT(a: int) -> int:
    return ~a & 1  # Keep only the LSB

def XOR(a: int, b: int) -> int:
    return a ^ b

def NAND(a: int, b: int) -> int:
    return NOT(AND(a, b))

# Build a half-adder using gates
def half_adder(a: int, b: int):
    """Adds two binary digits. Returns (sum, carry)."""
    sum_bit = XOR(a, b)
    carry = AND(a, b)
    return sum_bit, carry

# Build a full-adder using two half-adders
def full_adder(a: int, b: int, carry_in: int):
    """Adds three binary digits. Returns (sum, carry_out)."""
    s1, c1 = half_adder(a, b)
    s2, c2 = half_adder(s1, carry_in)
    carry_out = OR(c1, c2)
    return s2, carry_out

# Test the full adder
print("Full Adder Test: A + B + CarryIn = Sum, CarryOut")
for a in [0, 1]:
    for b in [0, 1]:
        for ci in [0, 1]:
            s, co = full_adder(a, b, ci)
            print(f"  {a} + {b} + {ci} = {s}, carry={co}")`,
      output: `Full Adder Test: A + B + CarryIn = Sum, CarryOut
  0 + 0 + 0 = 0, carry=0
  0 + 0 + 1 = 1, carry=0
  0 + 1 + 0 = 1, carry=0
  0 + 1 + 1 = 0, carry=1
  1 + 0 + 0 = 1, carry=0
  1 + 0 + 1 = 0, carry=1
  1 + 1 + 0 = 0, carry=1
  1 + 1 + 1 = 1, carry=1`,
      explanation: 'By combining basic logic gates, we build increasingly complex circuits. A half-adder adds two bits, and a full-adder adds three. Chaining 8 full-adders creates an 8-bit adder — the foundation of arithmetic in CPUs.',
    },
    {
      level: 'advanced',
      code: `# Simulating binary representation of different data types
import struct

def float_to_binary(num: float) -> str:
    """Convert a float to its IEEE 754 binary representation."""
    # Pack as 32-bit float, unpack as 32-bit integer
    packed = struct.pack('>f', num)
    bits = struct.unpack('>I', packed)[0]
    binary = format(bits, '032b')
    # Extract sign, exponent, mantissa
    sign = binary[0]
    exponent = binary[1:9]
    mantissa = binary[9:]
    return f"{sign} {exponent} {mantissa}"

def char_to_binary(char: str) -> str:
    """Convert a character to its ASCII binary."""
    code = ord(char)
    return format(code, '08b')

# Demonstrate data representation
print("=== Binary Representation of Data ===\\n")

# Integers
print(f"Integer 42:    {42:08b}")
print(f"Integer 255:   {255:08b}")
print(f"Integer -1:    {(-1 & 0xFF):08b} (two's complement)\\n")

# Floating point
print(f"Float 3.14:    {float_to_binary(3.14)}")
print(f"Float 0.5:     {float_to_binary(0.5)}")
print(f"Float -2.0:    {float_to_binary(-2.0)}\\n")

# Text
text = "Hi!"
print(f"Text '{text}':")
for c in text:
    print(f"  '{c}': {char_to_binary(c)} (ASCII {ord(c)})")

# Compute bits needed
def bits_needed(value: int) -> int:
    return value.bit_length()

print(f"\\nBits needed for 1000: {bits_needed(1000)}")
print(f"Max value with 8 bits: {(2**8)-1}")
print(f"Max value with 32 bits: {(2**32)-1:,}")`,
      output: `=== Binary Representation of Data ===

Integer 42:    00101010
Integer 255:   11111111
Integer -1:    11111111 (two's complement)

Float 3.14:    0 10000000 10010001111010111000011
Float 0.5:     0 01111110 00000000000000000000000
Float -2.0:    1 10000000 00000000000000000000000

Text 'Hi!':
  'H': 01001000 (ASCII 72)
  'i': 01101001 (ASCII 105)
  '!': 00100001 (ASCII 33)

Bits needed for 1000: 10
Max value with 8 bits: 255
Max value with 32 bits: 4,294,967,295`,
      explanation: 'All data in a computer is ultimately binary. Different encoding schemes (ASCII for text, IEEE 754 for floats, two\'s complement for integers) define how binary patterns are interpreted. Understanding this is crucial for debugging and performance optimization.',
    },
  ],
  realWorld: {
    useCases: [
      { industry: 'Computer Hardware', description: 'CPU designers use logic gates to build arithmetic logic units (ALUs), memory controllers, and cache systems. Modern CPUs contain billions of transistors organized into complex gate networks.' },
      { industry: 'Cryptography', description: 'XOR gates are fundamental to encryption algorithms. XOR\'s property of being reversible with the same key makes it essential in symmetric encryption (AES) and one-time pads.' },
    ],
    caseStudy: {
      problem: 'A team designing a low-power IoT sensor needed to perform basic arithmetic using minimal energy. Standard 32-bit processors consumed too much power for battery-operated devices.',
      solution: 'They designed a custom application-specific integrated circuit (ASIC) using only essential logic gates — a 4-bit binary processor that could handle the sensor\'s specific computation needs.',
      results: 'Power consumption dropped from 50mW to 0.5mW. The device could run for 2 years on a single coin cell battery instead of 3 months. The simple binary design was also more reliable in high-temperature environments.',
    },
    bestPractices: [
      'Use bitwise operations for performance-critical code (they\'re much faster than arithmetic)',
      'Understand two\'s complement to avoid integer overflow bugs',
      'Use AND masking to extract specific bits from a value',
      'Use XOR swapping for in-place variable exchange without temporary variables',
      'Prefer left-shift (<< n) over multiplication by 2^n',
    ],
    tools: ['Python bitwise operators', 'Binary/Hex calculators', 'Logic gate simulators', 'Digital logic analyzers'],
    jobRoles: ['Computer Engineer', 'Embedded Systems Developer', 'Hardware Designer', 'Systems Programmer'],
    furtherReading: [
      'Original paper and foundational research',
      'Official documentation and tutorials',
      'Community blog posts and case studies',
      'Online courses and certification programs',
    ],
  },
  quiz: [
    {
      id: 'bl-1', type: 'truefalse',
      question: 'An OR gate outputs 1 only when both inputs are 1.',
      correctAnswer: 'False',
      explanation: 'An OR gate outputs 1 when at least one input is 1. An AND gate requires both inputs to be 1.',
    },
    {
      id: 'bl-2', type: 'mcq',
      question: 'What is the binary representation of decimal 13?',
      options: ['1011', '1101', '1110', '1001'],
      correctAnswer: '1101',
      explanation: '13 = 8 + 4 + 1 = 1101 in binary. Reading from right: 1×1 + 0×2 + 1×4 + 1×8 = 13.',
    },
    {
      id: 'bl-3', type: 'fillblank',
      question: 'A logic gate that outputs the inverse of its input is called a ___ gate.',
      correctAnswer: 'NOT',
      explanation: 'The NOT gate (or inverter) flips the input: 0 becomes 1, 1 becomes 0.',
    },
    {
      id: 'bl-4', type: 'code',
      question: 'What will the expression 6 ^ 3 (XOR) evaluate to?',
      code: 'result = 6 ^ 3  # XOR operation',
      options: ['3 (binary 0011)', '5 (binary 0101)', '7 (binary 0111)', '2 (binary 0010)'],
      correctAnswer: '5 (binary 0101)',
      explanation: '6 = 110, 3 = 011. XOR produces 101 = 5, because bits differ at positions 2^2 and 2^0.',
    },
    {
      id: 'bl-5', type: 'match',
      question: 'Match each logic gate with its operation:',
      pairs: [
        { left: 'AND', right: 'Outputs 1 only when both inputs are 1' },
        { left: 'OR', right: 'Outputs 1 when at least one input is 1' },
        { left: 'XOR', right: 'Outputs 1 when inputs are different' },
        { left: 'NOT', right: 'Outputs the inverse of the input' },
      ],
      correctAnswer: 'All matched correctly',
      explanation: 'Each gate has a unique truth table. Understanding these is essential for digital logic design and low-level programming.',
    },
  ],
}))

export {}
