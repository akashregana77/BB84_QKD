from flask import Flask, request, jsonify
from flask_cors import CORS
import random
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ----------- BB84 FUNCTIONS -----------
def generate_bases(n):
    return [random.choice(['Z', 'X']) for _ in range(n)]

def generate_bits(n):
    return [random.randint(0, 1) for _ in range(n)]

def encode_qubits(bits, bases):
    circuits = []
    for bit, base in zip(bits, bases):
        qc = QuantumCircuit(1, 1)
        if bit == 1:
            qc.x(0)
        if base == 'X':
            qc.h(0)
        circuits.append(qc)
    return circuits

def measure_qubits(circuits, bases):
    backend = AerSimulator()
    results = []
    for qc, base in zip(circuits, bases):
        qc_copy = qc.copy()
        if base == 'X':
            qc_copy.h(0)
        qc_copy.measure(0, 0)
        compiled = transpile(qc_copy, backend)
        job = backend.run(compiled, shots=1)
        counts = job.result().get_counts()
        bit = int(list(counts.keys())[0])
        results.append(bit)
    return results

def sift_key(a_bits, a_bases, b_bits, b_bases):
    sifted_a, sifted_b = [], []
    for a_bit, a_base, b_bit, b_base in zip(a_bits, a_bases, b_bits, b_bases):
        if a_base == b_base:
            sifted_a.append(a_bit)
            sifted_b.append(b_bit)
    return sifted_a, sifted_b

def qber(a_key, b_key):
    if len(a_key) == 0:
        return 0
    errors = sum(ai != bi for ai, bi in zip(a_key, b_key))
    return errors / len(a_key)

# ----------- ENCRYPTION HELPERS (OTP) -----------
def str_to_bits(s):
    bits = []
    for c in s:
        bits.extend([int(b) for b in format(ord(c), '08b')])
    return bits

def bits_to_str(bits):
    chars = []
    for i in range(0, len(bits), 8):
        byte = bits[i:i + 8]
        if len(byte) < 8:
            break
        chars.append(chr(int("".join(str(b) for b in byte), 2)))
    return "".join(chars)

def xor_encrypt_decrypt(message_bits, key_bits):
    return [mb ^ kb for mb, kb in zip(message_bits, key_bits)]

# ----------- ROUTES -----------

@app.route("/bb84", methods=["POST"])
def run_bb84():
    data = request.get_json()
    with_eve = data.get("eve", False)
    n = data.get("n", 100)

    alice_bits = generate_bits(n)
    alice_bases = generate_bases(n)
    qubits = encode_qubits(alice_bits, alice_bases)

    eve_results, eve_bases = None, None
    if with_eve:
        eve_bases = generate_bases(n)
        eve_results = measure_qubits(qubits, eve_bases)
        qubits = encode_qubits(eve_results, eve_bases)

    bob_bases = generate_bases(n)
    bob_results = measure_qubits(qubits, bob_bases)
    alice_key, bob_key = sift_key(alice_bits, alice_bases, bob_results, bob_bases)
    current_qber = qber(alice_key, bob_key)
    aborted = with_eve and current_qber > 0.15

    return jsonify({
        "alice_bits": alice_bits,
        "alice_bases": alice_bases,
        "bob_bases": bob_bases,
        "bob_results": bob_results,
        "alice_key": alice_key,
        "bob_key": bob_key,
        "qber": current_qber,
        "aborted": aborted,
        "eve_results": eve_results,
        "eve_bases": eve_bases
    })

@app.route("/encrypt", methods=["POST"])
def encrypt_message():
    data = request.get_json()
    message = data.get("message", "")
    key_bits = data.get("key", [])

    if not key_bits:
        return jsonify({"error": "No key provided"}), 400

    message_bits = str_to_bits(message)
    if len(key_bits) < len(message_bits):
        message_bits = message_bits[:len(key_bits)]

    encrypted_bits = xor_encrypt_decrypt(message_bits, key_bits[:len(message_bits)])
    encrypted_message = bits_to_str(encrypted_bits)

    return jsonify({
        "encrypted_bits": encrypted_bits,
        "encrypted_message": encrypted_message
    })

@app.route("/decrypt", methods=["POST"])
def decrypt_message():
    data = request.get_json()
    encrypted_bits = data.get("encrypted_bits", [])
    key_bits = data.get("key", [])

    if not key_bits:
        return jsonify({"error": "No key provided"}), 400

    decrypted_bits = xor_encrypt_decrypt(encrypted_bits, key_bits[:len(encrypted_bits)])
    decrypted_message = bits_to_str(decrypted_bits)

    return jsonify({
        "decrypted_bits": decrypted_bits,
        "decrypted_message": decrypted_message
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)
