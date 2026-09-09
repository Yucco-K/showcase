"""Vercel(@vercel/python)のエントリポイント。

実際のアプリ構築はmain.pyで行い、ここでは`app`を再エクスポートするのみ。
責務ごとに config / schemas / services / repositories / routers へ分割している。

Vercelの実行環境ではこのファイルがリポジトリルート相対のパス
(例: /var/task/api/chat/index.py)に配置され、sys.pathには
リポジトリルートに相当するディレクトリが入る（api/chat自身は
importルートにならない）。そのためmain.py以下の同階層モジュールを
`from main import ...`のように解決するには、このディレクトリ自身を
明示的にsys.pathへ追加する必要がある。
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app  # noqa: E402

__all__ = ["app"]
