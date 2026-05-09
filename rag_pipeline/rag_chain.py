import time
import os
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, GenerationConfig
import transformers.dynamic_module_utils as dynamic_module_utils

# 모델 설정
MODEL_ID = "LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct"
# Pin a known-good model revision to avoid dynamic code/API mismatch.
MODEL_REVISION = "e949c91dec92095908d34e6b560af77dd0c993f8"
MODEL_CACHE_DIR = os.path.expanduser(
    "~/.cache/huggingface/hub/models--LGAI-EXAONE--EXAONE-3.5-2.4B-Instruct/snapshots/"
    + MODEL_REVISION
)
MODEL_SOURCE = MODEL_CACHE_DIR if os.path.isdir(MODEL_CACHE_DIR) else MODEL_ID
HF_MODULES_CACHE = os.environ.get("HF_MODULES_CACHE", "/tmp/hf_modules_cache")
os.environ["HF_MODULES_CACHE"] = HF_MODULES_CACHE
os.makedirs(HF_MODULES_CACHE, exist_ok=True)
dynamic_module_utils.HF_MODULES_CACHE = HF_MODULES_CACHE

print(f"[INFO] Loading Language Model: {MODEL_ID}")
print(f"[INFO] Model Revision: {MODEL_REVISION}")
print("[INFO] Infrastructure: CPU-Optimized (16 Cores)")
print(f"[INFO] Model Source: {MODEL_SOURCE}")

tokenizer = None
model = None


def _ensure_pipeline():
    global tokenizer, model
    if model is not None and tokenizer is not None:
        return tokenizer, model

    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_SOURCE,
        revision=MODEL_REVISION,
        local_files_only=True,
    )
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_SOURCE,
        revision=MODEL_REVISION,
        code_revision=MODEL_REVISION,
        dtype=torch.bfloat16,
        device_map="cpu",
        trust_remote_code=True,
        local_files_only=True,
    )
    return tokenizer, model


def generate_with_meta(prompt, answer_language="English", debug=False):
    """
    RAG 답변 생성 + 추론 메타데이터 반환
    """
    tokenizer, model = _ensure_pipeline()
    messages = [
        {
            "role": "system",
            "content": (
                "You are a truthful Harry Potter QA assistant. "
                "Answer only from the retrieved context. "
                "Do not use outside knowledge or guess. "
                "If the context is insufficient, reply exactly: "
                "'The provided documents do not contain the answer.' "
                f"Answer in {answer_language}."
            ),
        },
        {"role": "user", "content": prompt}
    ]

    input_text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    encoded_inputs = tokenizer(input_text, return_tensors="pt")
    input_ids = encoded_inputs["input_ids"]
    attention_mask = encoded_inputs.get("attention_mask")
    input_token_count = input_ids.shape[1]

    if debug:
        print("\n" + "-"*60)
        print(f"[DEBUG] Prompt Token Count: {input_token_count}")
        print("[DEBUG] Local Inference in Progress...")
        print("-"*60)

    generation_config = GenerationConfig(
        max_new_tokens=160,
        do_sample=False,
        pad_token_id=tokenizer.eos_token_id,
        eos_token_id=tokenizer.eos_token_id,
    )

    start_time = time.perf_counter()
    output_ids = model.generate(
        input_ids,
        attention_mask=attention_mask,
        generation_config=generation_config,
    )
    end_time = time.perf_counter()
    duration = end_time - start_time

    generated_ids = output_ids[0][input_ids.shape[1]:]
    response = tokenizer.decode(generated_ids, skip_special_tokens=True).strip()
    full_output = tokenizer.decode(output_ids[0], skip_special_tokens=False)
    output_token_count = len(tokenizer.encode(response))
    throughput = 0.0 if duration <= 0 else output_token_count / duration

    if debug:
        print(f"[DEBUG] Latency: {duration:.2f}s")
        print(f"[DEBUG] Throughput: {throughput:.2f} tokens/s")
        print(f"[DEBUG] Response Token Count: {output_token_count}")
        print("-"*60 + "\n")

    return {
        "response": response,
        "full_generated_text": full_output,
        "prompt_token_count": int(input_token_count),
        "response_token_count": int(output_token_count),
        "latency_sec": float(duration),
        "throughput_tokens_per_sec": float(throughput),
        "model_id": MODEL_ID,
        "model_revision": MODEL_REVISION,
    }

def rag_answer(prompt, answer_language="English", debug=False):
    """
    RAG 답변 생성 및 추론 성능 지표 출력
    """
    result = generate_with_meta(prompt, answer_language=answer_language, debug=debug)
    return result["response"]
