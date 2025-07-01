from celery import Task


class TaskBase(Task):
    """
    Base class for celery tasks.
    This class provides a structure for tasks that need to manage database sessions.
    It initializes a session before the task starts and closes it after the task completes.
    """
    def __init__(self):
        self.sessions = {}
        self.dic_fns_after_return = {}

    def before_start(self, task_id, args, kwargs):
        from app.modules.db.session_contexts import SyncSessionContextNoPool
        self.sessions[task_id] = SyncSessionContextNoPool()
        self.dic_fns_after_return[task_id] = []
        print("DatabaseTask Create session: " + task_id)
        super().before_start(task_id, args, kwargs)

    def after_return(self, status, retval, task_id, args, kwargs, einfo):
        session = self.sessions.pop(task_id, None)
        if session:
            session.close()
            print("DatabaseTask Close session: " + task_id)
        super().after_return(status, retval, task_id, args, kwargs, einfo)

        fns_after_return = self.dic_fns_after_return.pop(task_id, None)
        if fns_after_return:
            for _fn, _args in fns_after_return:
                _ = _fn(*_args) if _args else _fn()
    
    def on_failure(self, exc, task_id, args, kwargs, einfo):
        session = self.sessions.pop(task_id, None)
        if session:
            session.close()
            print("DatabaseTask Close falied session: " + task_id)
        super().on_failure(exc, task_id, args, kwargs, einfo)
    
    @property
    def session(self):
        return self.sessions[self.request.id] 
    
    def add_fn_after_return(self, fn, *args):
        task_id = self.request.id
        if task_id not in self.dic_fns_after_return:
            self.dic_fns_after_return[task_id] = []

        self.dic_fns_after_return[task_id].append((fn, args))

