import os
from dotenv import load_dotenv
from starkware.crypto.signature.signature import private_to_stark_key

# 加载 .env.local 文件
load_dotenv('.env.local')

# 从环境变量中获取私钥
private_key_hex = os.getenv('PRIVATE_KEY')  # 替换为你的实际大写KEY名称
if private_key_hex is None:
    raise ValueError("PRIVATE_KEY not found in .env.local file. Please add it.")

# 将私钥从字符串（十六进制）转换为整数
try:
    private_key = int(private_key_hex, 16)
except ValueError:
    raise ValueError("Invalid PRIVATE_KEY format. Ensure it's a valid hexadecimal string (e.g., '0x1234').")

# 计算公钥
public_key = private_to_stark_key(private_key)

# 输出公钥
print(f"Public Key: {hex(public_key)}")
