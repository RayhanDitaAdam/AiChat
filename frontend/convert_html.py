import re

html_file = 'dashboardforadmin.html'

with open(html_file, 'r') as f:
    lines = f.readlines()

content = "".join(lines[1446:2334]) # to the end of main-content

# Basic HTML to JSX
content = content.replace('class=', 'className=')
content = content.replace('for=', 'htmlFor=')
content = content.replace('<!--', '{/*')
content = content.replace('-->', '*/}')
content = re.sub(r'style="([^"]*)"', lambda m: "style={{" + ",".join([f"'{k.strip()}':'{v.strip()}'" for k, v in [x.split(':') for x in m.group(1).split(';') if x.strip()]]) + "}}", content)

# Remove svg tag closures since they can be problematic, better yet just use a proper parser
# for now replace <br> with <br/>, <input ...> with <input ... />
content = re.sub(r'<input([^>]+)>', r'<input\1 />', content)
content = re.sub(r'<img([^>]+)>', r'<img\1 />', content)
content = re.sub(r'<hr([^>]+)>', r'<hr\1 />', content)
content = content.replace('<br>', '<br />')

with open('dashboard_content.jsx', 'w') as f:
    f.write(content)
