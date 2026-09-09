"""Vercel(@vercel/python)のエントリポイント。

実際のアプリ構築はmain.pyで行い、ここでは`app`を再エクスポートするのみ。
責務ごとに config / schemas / services / repositories / routers へ分割している。
"""

from main import app

__all__ = ["app"]
