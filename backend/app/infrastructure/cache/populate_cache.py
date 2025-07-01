from .terminal import TerminalCache

async def populate_cache_on_startup():
    """
    Populate the cache on application startup.
    This function initializes the TerminalCache.
    """
    await TerminalCache.update_cache_from_db()
