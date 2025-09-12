import os
import datetime

# Your GitHub Pages info
username = "shreyasvengurlekar"
repo_name = "sample-product-website"
base_url = f"https://{username}.github.io/{repo_name}/"

today = datetime.date.today().isoformat()

# Scan for .html files
html_files = []
for root, dirs, files in os.walk("."):
    for file in files:
        if file.endswith(".html"):
            rel_path = os.path.relpath(os.path.join(root, file), ".")
            url = base_url + rel_path.replace("\\", "/")
            if file == "index.html" and rel_path == "index.html":
                url = base_url  # root index page
            html_files.append(url)

# --- Generate sitemap.xml ---
sitemap_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
sitemap_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

for url in html_files:
    sitemap_content += f"""  <url>
    <loc>{url}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n"""

sitemap_content += "</urlset>"

with open("sitemap.xml", "w", encoding="utf-8") as f:
    f.write(sitemap_content)

# --- Generate robots.txt ---
robots_content = f"""User-agent: *
Allow: /

Sitemap: {base_url}sitemap.xml
"""

with open("robots.txt", "w", encoding="utf-8") as f:
    f.write(robots_content)

print("✅ sitemap.xml and robots.txt generated successfully!")
