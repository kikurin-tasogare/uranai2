"""開発用の簡易HTTPサーバー(占蔵プレビュー用)"""
import functools
import os
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

ROOT = os.path.dirname(os.path.abspath(__file__))
try:
    os.chdir(ROOT)
except OSError:
    pass

class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

Handler = functools.partial(NoCacheHandler, directory=ROOT)
print(f"serving {ROOT} on http://127.0.0.1:8907", flush=True)
ThreadingHTTPServer(("127.0.0.1", 8907), Handler).serve_forever()
