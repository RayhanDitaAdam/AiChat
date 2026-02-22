import re

with open('dashboard_content.jsx', 'r') as f:
    content = f.read()

# Remove all <svg>...</svg>
content = re.sub(r'<svg.*?</svg>', '<svg />', content, flags=re.DOTALL)
# Remove all <path>...</path>
content = re.sub(r'<path.*?</path>', '', content, flags=re.DOTALL)
content = re.sub(r'<path(.*?)>', '', content, flags=re.DOTALL)
content = re.sub(r'<g.*?</g>', '', content, flags=re.DOTALL)
content = re.sub(r'<g(.*?)>', '', content, flags=re.DOTALL)
content = re.sub(r'<rect.*?</rect>', '', content, flags=re.DOTALL)
content = re.sub(r'<rect(.*?)>', '', content, flags=re.DOTALL)
content = re.sub(r'<line.*?</line>', '', content, flags=re.DOTALL)
content = re.sub(r'<line(.*?)>', '', content, flags=re.DOTALL)
content = re.sub(r'<text.*?</text>', '', content, flags=re.DOTALL)
content = re.sub(r'<foreignObject.*?</foreignObject>', '', content, flags=re.DOTALL)
content = re.sub(r'<defs.*?</defs>', '', content, flags=re.DOTALL)

with open('dashboard_content_clean.jsx', 'w') as f:
    f.write(content)
