from celery import Task
from app.database.conn import get_db


# TODO: investigate what solution is better (_DatabaseTask, DatabaseTask)
# http://www.prschmid.com/2013/04/using-sqlalchemy-with-celery-tasks.html
# https://celery.school/sqlalchemy-session-celery-tasks


class DatabaseTask(Task):
    def __init__(self):
        self.sessions = {}
        self.dic_fns_after_return = {}

    def before_start(self, task_id, args, kwargs):
        from osfc.modules.db.SessionContext import SessionContextNoPool
        self.sessions[task_id] = SessionContextNoPool()
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

